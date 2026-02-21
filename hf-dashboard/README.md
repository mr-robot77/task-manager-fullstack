---
title: Task Manager Live Dashboard
emoji: 📊
colorFrom: blue
colorTo: indigo
sdk: gradio
sdk_version: "4.44.0"
python_version: "3.11"
app_file: app.py
pinned: false
---

# Task Manager Live Dashboard

**Live URL:** [https://huggingface.co/spaces/mrrobot777/task-manager-live-dashboard](https://huggingface.co/spaces/mrrobot777/task-manager-live-dashboard)

A lightweight public dashboard for live task and equipment metrics. It fetches data from these backend endpoints:

- `/api/tasks/statistics`
- `/api/equipment/statistics`

**Demo fallback:** When the backend is unreachable or returns empty data, built-in demo statistics are displayed. Statistics are shown in readable tables (Tasks: by status, priority, production line; Equipment: by status, type, production line)—no charts, for reliable display across platforms.

## Run locally

```bash
cd hf-dashboard
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:BACKEND_API_BASE="http://localhost:8000/api"
python app.py
```

Then open: <http://localhost:7860>

## Deploy to Hugging Face (push latest app to Space)

**After making changes to `app.py` or other files, run this to update the live Space:**

From the project root. Token can be provided via:

1. **Environment:** `$env:HF_TOKEN = "hf_xxx"`
2. **Project `.env`:** Create `.env` in project root with `HF_TOKEN=hf_xxx` (file is gitignored)
3. **Login:** `huggingface-cli login` (then run without HF_TOKEN)

```powershell
pip install huggingface_hub
python hf-dashboard/deploy_to_hf.py
```

This uploads `README.md`, `app.py`, `requirements.txt`, resolves any variable/secret name collision, sets `BACKEND_API_BASE`, and restarts the Space. Requires `python_version: "3.11"` and `huggingface_hub<1.0` (see `requirements.txt`) for compatibility with Gradio.

## Backend configuration (manual)

In **Settings → Variables and secrets**, add:

- **Key:** `BACKEND_API_BASE`
- **Value:** `http://YOUR_ORACLE_VM_IP:8000/api`  
  Example: `http://152.70.53.27:8000/api`

> Use `http://` (not `https://`) if your backend has no TLS. Ensure the backend is reachable from the public internet and that firewall rules allow port 8000.
