import json
import os
import queue
import sys
import threading
import uuid

# Disable telemetry for instant startup and prevent network hangs
os.environ["CREWAI_DISABLE_TELEMETRY"] = "true"
os.environ["OTEL_SDK_DISABLED"] = "true"
os.environ["PYTHONIOENCODING"] = "utf-8"

# Windows console charmap codec fix for CrewAI unicode outputs
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

import litellm
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from crew import build_crew, AGENT_SEQUENCE

app = FastAPI(title="Software House Crew API")

# ---------------------------------------------------------------------
# Intake (Account Manager) chat
# ---------------------------------------------------------------------
# Client seedhe 8-agent pipeline ko requirements nahi dete — pehle ek
# "Account Manager" LLM unse baat karke requirement confirm karta hai
# (jaise real software house mein pehla client call hota hai), phir
# jab requirement clear ho jaye to ek structured brief finalize karke
# engineering pipeline (8 agents) ko handover karta hai.
#
# `enable_key_rotation` already CrewAI ke `from crew import ...` chain
# (crew -> agents) se patch ho chuka hai, is liye litellm.completion
# yahan bhi automatically rotating keys use karega.

INTAKE_SYSTEM_PROMPT = """You are Nex, the Account Manager at Nexbuild, a boutique \
software house. A prospective client is describing a project they want built. \
Your job is to run a short, friendly intake consultation before engineering \
picks it up.

Rules:
- Ask about ONE or TWO things at a time — never a giant questionnaire.
- Focus only on what actually changes engineering scope: core features, \
who the users are, any hard constraints (platform, integrations, data), \
and what's explicitly out of scope. Don't ask about budget or timeline.
- Keep messages short (2-5 sentences), warm, and professional — like a real \
account manager, not a form.
- Once you have enough to brief engineering (usually after 1-3 exchanges — \
don't drag it out), STOP asking questions. Instead write a clean, structured \
requirements document (numbered list, like a real spec) that captures \
everything discussed, set ready=true, AND in your "reply" explicitly summarize \
the key points back to the client and ask them to confirm — e.g. "Here's what \
I've got: ... Does that look right, or is there anything to add or change before \
I send this to engineering?" Never silently finalize without asking this.
- If the client responds after ready=true with a correction, addition, or "actually...", \
treat it as still refining — update the requirements document accordingly, keep \
ready=true, and again summarize + ask for confirmation in your reply.
- If the client's very first message is already a clear, sufficiently \
detailed spec, you may finalize immediately without extra questions, but still \
summarize it back and ask for confirmation as above.

You must respond with ONLY a JSON object, no markdown fences, no prose \
outside the JSON, in exactly this shape:
{"reply": "<what you say to the client — a question, or a short confirmation \
if you're finalizing>", "ready": <true or false>, "requirements_doc": \
"<the full structured requirements document — ONLY when ready is true, \
otherwise empty string>"}"""

# session_id -> list of {"role": "user"|"assistant", "content": str}
_intake_sessions: dict[str, list] = {}


class IntakeMessageRequest(BaseModel):
    session_id: str
    message: str


def _call_account_manager(history: list) -> dict:
    messages = [{"role": "system", "content": INTAKE_SYSTEM_PROMPT}] + history
    response = litellm.completion(
        model="groq/openai/gpt-oss-120b",
        messages=messages,
        temperature=0.4,
        response_format={"type": "json_object"},
    )
    raw = response.choices[0].message.content
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        
        parsed = {"reply": raw, "ready": False, "requirements_doc": ""}
    return {
        "reply": parsed.get("reply", ""),
        "ready": bool(parsed.get("ready", False)),
        "requirements_doc": parsed.get("requirements_doc", "") or "",
    }


@app.post("/api/intake/start")
def start_intake():
    session_id = str(uuid.uuid4())
    opening = (
        "Hi, I'm Nex from Nexbuild — thanks for reaching out! "
        "Tell me a bit about what you're looking to build, and who it's for."
    )
    _intake_sessions[session_id] = [{"role": "assistant", "content": opening}]
    return {"session_id": session_id, "reply": opening, "ready": False}


@app.post("/api/intake/message")
def intake_message(req: IntakeMessageRequest):
    history = _intake_sessions.get(req.session_id)
    if history is None:
        raise HTTPException(status_code=404, detail="unknown session_id")

    history.append({"role": "user", "content": req.message})
    try:
        result = _call_account_manager(history)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    history.append({"role": "assistant", "content": result["reply"]})
    return {"session_id": req.session_id, **result}


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# run_id -> queue.Queue() mapping,
_runs: dict[str, "queue.Queue"] = {}


class RunRequest(BaseModel):
    requirements: str


def _run_crew_job(run_id: str, requirements: str):
    """Background thread mein chalta hai — pura pipeline run karta hai."""
    q = _runs[run_id]
    completed_count = 0

    def on_task_done(task_output):
        nonlocal completed_count
        agent_name = AGENT_SEQUENCE[completed_count]
        q.put({
            "type": "agent_done",
            "index": completed_count,
            "agent": agent_name,
            "output": str(getattr(task_output, "raw", task_output)),
        })
        completed_count += 1
        if completed_count < len(AGENT_SEQUENCE):
            q.put({
                "type": "agent_start",
                "index": completed_count,
                "agent": AGENT_SEQUENCE[completed_count],
            })

    try:
        
        q.put({"type": "agent_start", "index": 0, "agent": AGENT_SEQUENCE[0]})

        crew = build_crew(requirements, task_callback=on_task_done)
        result = crew.kickoff()

        q.put({"type": "done", "final_output": str(result)})
    except Exception as exc:  # noqa: BLE001 — user-facing error surface karna hai
        q.put({"type": "error", "message": str(exc)})
    finally:
        q.put({"type": "_end_"})


@app.post("/api/run")
def start_run(req: RunRequest):
    run_id = str(uuid.uuid4())
    _runs[run_id] = queue.Queue()
    thread = threading.Thread(
        target=_run_crew_job, args=(run_id, req.requirements), daemon=True
    )
    thread.start()
    return {"run_id": run_id, "agents": AGENT_SEQUENCE}


@app.get("/api/stream/{run_id}")
def stream_run(run_id: str):
    def event_generator():
        q = _runs.get(run_id)
        if q is None:
            yield f"data: {json.dumps({'type': 'error', 'message': 'unknown run_id'})}\n\n"
            return
        while True:
            event = q.get()  # blocking 
            if event["type"] == "_end_":
                break
            yield f"data: {json.dumps(event)}\n\n"
        # Run 
        _runs.pop(run_id, None)

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.get("/api/health")
def health():
    return {"status": "ok"}


# ---------------------------------------------------------------------
# Push generated code to GitHub (via the github_server MCP tools)
# ---------------------------------------------------------------------
class GithubFile(BaseModel):
    path: str
    code: str


class GithubPushRequest(BaseModel):
    github_token: str
    repo_name: str
    private: bool = False
    files: list[GithubFile]


@app.post("/api/push-to-github")
def push_to_github(req: GithubPushRequest):
    from github_push_client import push_project_to_github
    files_dict = {f.path: f.code for f in req.files if f.path and f.code is not None}
    if not files_dict:
        raise HTTPException(status_code=400, detail="No files to push.")

    try:
        result = push_project_to_github(
            github_token=req.github_token,
            repo_name=req.repo_name,
            files=files_dict,
            private=req.private,
        )
    except Exception as exc:  # noqa: BLE001 — user-facing error dikhana hai
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    if not result.get("ok"):
        detail = result.get("error") or f"Push failed at step: {result.get('step', '?')}"
        raise HTTPException(status_code=502, detail=detail)

    return result