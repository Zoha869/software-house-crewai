import json
import sys
import time
import requests

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

BACKEND_URL = "https://projects-phentermine-okay-cookbook.trycloudflare.com"
FRONTEND_URL = "https://software-house-crewai-nwbf.vercel.app"

def test_health():
    print("1. Checking Backend Health (/api/health)...")
    r = requests.get(f"{BACKEND_URL}/api/health", timeout=5)
    print(f"   Backend Status: {r.status_code}, Response: {r.text}")
    assert r.status_code == 200, "Backend health check failed"

def test_frontend():
    print("2. Checking Frontend HTTP Server (https://software-house-crewai-nwbf.vercel.app)...")
    r = requests.get(FRONTEND_URL, timeout=5)
    print(f"   Frontend Status: {r.status_code}, Length: {len(r.text)} bytes")
    assert r.status_code == 200, "Frontend server failed"

def test_end_to_end():
    print("3. Reading sample requirements...")
    with open("sample_requirements.txt", "r", encoding="utf-8") as f:
        req_text = f.read()

    print(f"   Requirements length: {len(req_text)} characters")
    print("4. Triggering POST /api/run...")
    start_resp = requests.post(
        f"{BACKEND_URL}/api/run",
        json={"requirements": req_text},
        timeout=10
    )
    print(f"   POST Response: {start_resp.status_code}, Data: {start_resp.json()}")
    assert start_resp.status_code == 200, "POST /api/run failed"
    
    run_id = start_resp.json()["run_id"]
    agents = start_resp.json()["agents"]
    print(f"   Run ID: {run_id}")
    print(f"   Agents sequence ({len(agents)} agents): {agents}")

    print(f"5. Listening to SSE stream (/api/stream/{run_id})...")
    stream_url = f"{BACKEND_URL}/api/stream/{run_id}"
    
    events_received = []
    agent_outputs = {}

    with requests.get(stream_url, stream=True, timeout=300) as stream_resp:
        assert stream_resp.status_code == 200, "SSE connection failed"
        print("   SSE stream connected successfully (HTTP 200 text/event-stream).")

        buffer = ""
        for chunk in stream_resp.iter_content(chunk_size=1024, decode_unicode=True):
            if not chunk:
                continue
            buffer += chunk
            while "\n\n" in buffer:
                event_str, buffer = buffer.split("\n\n", 1)
                event_str = event_str.strip()
                if not event_str:
                    continue
                if event_str.startswith("data:"):
                    raw_json = event_str[5:].strip()
                    try:
                        data = json.loads(raw_json)
                        events_received.append(data)
                        ev_type = data.get("type")
                        
                        if ev_type == "agent_start":
                            print(f"   [EVENT: agent_start] Agent {data.get('index') + 1}: {data.get('agent')}")
                        elif ev_type == "agent_done":
                            agent_name = data.get('agent')
                            output_preview = data.get('output', '')[:80].replace('\n', ' ')
                            agent_outputs[agent_name] = data.get('output')
                            print(f"   [EVENT: agent_done]  Agent {data.get('index') + 1}: {agent_name} -> Output ({len(data.get('output', ''))} chars): {output_preview}...")
                        elif ev_type == "done":
                            print(f"   [EVENT: done] Pipeline finished! Final output length: {len(data.get('final_output', ''))} chars")
                        elif ev_type == "error":
                            print(f"   [EVENT: error] Error message: {data.get('message')}")
                    except Exception as e:
                        print(f"   [PARSE ERROR] {e} on raw data: {raw_json[:100]}")

    print(f"6. Summary: Total SSE events received: {len(events_received)}")
    print(f"   Agents completed: {len(agent_outputs)} / {len(agents)}")
    return len(agent_outputs) == len(agents)

if __name__ == "__main__":
    test_health()
    test_frontend()
    success = test_end_to_end()
    print("E2E Test Result:", "PASSED" if success else "FAILED")
