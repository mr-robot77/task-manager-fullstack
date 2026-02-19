# Hugging Face Live Dashboard (Gradio)

This folder contains a lightweight public dashboard for live project metrics.

It fetches data from these public backend endpoints:

- `/api/tasks/statistics`
- `/api/equipment/statistics`

## Run Locally

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
3. In Space settings, set variable:
   - `BACKEND_API_BASE=https://YOUR_ORACLE_PUBLIC_HOST/api`
4. Restart the Space.

After deployment, your Space URL becomes the public live dashboard link.
