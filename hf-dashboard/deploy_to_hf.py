#!/usr/bin/env python3
"""Upload hf-dashboard to Hugging Face Space and configure it.

Usage:
  pip install huggingface_hub
  # Windows PowerShell:
  $env:HF_TOKEN = "hf_xxxxxxxx"
  python hf-dashboard/deploy_to_hf.py

  # Or: huggingface-cli login  (then run without HF_TOKEN)
"""
import os
import sys
from pathlib import Path

from huggingface_hub import HfApi

SPACE_ID = "mrrobot777/task-manager-live-dashboard"
BACKEND_URL = "http://152.70.53.27:8000/api"
SCRIPT_DIR = Path(__file__).resolve().parent

FILES = ["README.md", "app.py", "requirements.txt"]


def main():
    token = os.environ.get("HF_TOKEN") or os.environ.get("HUGGING_FACE_HUB_TOKEN")
    if not token:
        print("HF_TOKEN not set. Either:", file=sys.stderr)
        print("  1. Run: huggingface-cli login", file=sys.stderr)
        print("  2. Or: $env:HF_TOKEN = 'hf_xxx'  (Windows)", file=sys.stderr)
        print("Get token: https://huggingface.co/settings/tokens", file=sys.stderr)
        return 1
    api = HfApi(token=token)

    print("Uploading files to Space...")
    for fname in FILES:
        path = SCRIPT_DIR / fname
        if not path.exists():
            print(f"  SKIP {fname} (not found)")
            continue
        api.upload_file(
            path_or_fileobj=str(path),
            path_in_repo=fname,
            repo_id=SPACE_ID,
            repo_type="space",
        )
        print(f"  OK {fname}")

    print("Setting BACKEND_API_BASE variable...")
    try:
        api.add_space_variable(
            repo_id=SPACE_ID,
            key="BACKEND_API_BASE",
            value=BACKEND_URL,
        )
        print("  OK BACKEND_API_BASE set")
    except Exception as e:
        print(f"  Note: {e} (variable may already exist)")

    print("Restarting Space...")
    api.restart_space(repo_id=SPACE_ID)
    print("  OK Space restart requested")

    print("\nDone. Your Space: https://huggingface.co/spaces/" + SPACE_ID)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
