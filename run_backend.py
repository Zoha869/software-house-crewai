import sys
import os

print("1. Starting run_backend.py...", flush=True)

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

print("2. Importing uvicorn...", flush=True)
import uvicorn

print("3. Importing app from api.py...", flush=True)
from api import app

print("4. Launching uvicorn on port 8000...", flush=True)
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
