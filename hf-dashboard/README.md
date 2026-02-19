# Hugging Face Live Dashboard (Gradio)

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

## Deploy on Hugging Face Spaces

1. Create a new **Gradio** Space.
2. Upload these files to the Space root:
   - `app.py`
   - `requirements.txt`
3. In **Settings → Variables and secrets**, add:
   - **Key:** `BACKEND_API_BASE`
   - **Value:** `http://YOUR_ORACLE_VM_IP:8000/api`  
     Example: `http://152.70.53.27:8000/api`
4. Restart the Space.

> **Note:** Use `http://` (not `https://`) if your backend has no TLS. Hugging Face Spaces may restrict outbound requests; if the dashboard shows errors, ensure the backend is reachable from the public internet and that firewall rules allow port 8000.

After deployment, your Space URL becomes the public live dashboard link.
