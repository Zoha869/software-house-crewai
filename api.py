"""
api.py
------
FastAPI backend jo CrewAI multi-agent pipeline ko frontend ke liye
expose karta hai.

Do endpoints:
  POST /api/run            -> naya run shuru karta hai, run_id deta hai
  GET  /api/stream/{run_id} -> Server-Sent Events (SSE) se live progress
                                stream karta hai (agent-by-agent status)

Kaam kaise karta hai:
- crew.kickoff() ek blocking call hai (poora pipeline chalne tak rukta
  hai), isliye isko ek background thread mein chalate hain taake
  server responsive rahe.
- Har run ke liye ek queue.Queue banate hain. task_callback (crew.py
  mein wire kiya hua) har agent ka task complete hone par is queue
  mein event daal deta hai. SSE endpoint is queue ko poll karke
  browser tak events pahonchata hai.
"""

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

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from crew import build_crew, AGENT_SEQUENCE

app = FastAPI(title="Software House Crew API")

# Local dev ke liye — frontend (Vite, usually localhost:5173) se
# requests allow karne ke liye CORS khol rahe hain.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# run_id -> queue.Queue() mapping, har active run ke events yahan jaate hain.
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
        # Pehle agent ka "start" event turant bhej dete hain.
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
            event = q.get()  # blocking — thread se aane wale event ka wait
            if event["type"] == "_end_":
                break
            yield f"data: {json.dumps(event)}\n\n"
        # Run khatam hone ke baad memory se hata dete hain.
        _runs.pop(run_id, None)

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.get("/api/health")
def health():
    return {"status": "ok"}