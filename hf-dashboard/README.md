---
title: Task Manager Live Dashboard
emoji: 📊
colorFrom: blue
colorTo: indigo
sdk: gradio
sdk_version: "4.44.0"
app_file: app.py
pinned: false
---

# Task Manager Live Dashboard

A lightweight public dashboard for live task and equipment metrics. It fetches data from these backend endpoints:

- `/api/tasks/statistics`
- `/api/equipment/statistics`

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

## Backend configuration

In **Settings → Variables and secrets**, add:

- **Key:** `BACKEND_API_BASE`
- **Value:** `http://YOUR_ORACLE_VM_IP:8000/api`  
  Example: `http://152.70.53.27:8000/api`

> Use `http://` (not `https://`) if your backend has no TLS. Ensure the backend is reachable from the public internet and that firewall rules allow port 8000.
