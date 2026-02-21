import os
from datetime import datetime, timezone

import gradio as gr
import pandas as pd
import requests


DEFAULT_API_BASE = os.getenv("BACKEND_API_BASE", "http://localhost:8000/api").rstrip("/")
REQUEST_TIMEOUT_SECONDS = float(os.getenv("REQUEST_TIMEOUT_SECONDS", "10"))

# Fallback demo data when API is unavailable or returns empty
DEMO_TASKS_STATS = {
    "total": 9,
    "byStatus": [
        {"status": "todo", "count": 3},
        {"status": "in_progress", "count": 2},
        {"status": "review", "count": 2},
        {"status": "done", "count": 2},
    ],
    "byPriority": [
        {"priority": "critical", "count": 2},
        {"priority": "high", "count": 2},
        {"priority": "medium", "count": 4},
        {"priority": "low", "count": 1},
    ],
    "byProductionLine": [
        {"production_line": "Line A", "count": 4},
        {"production_line": "Line B", "count": 2},
        {"production_line": "Line C", "count": 2},
        {"production_line": "General", "count": 1},
    ],
}
DEMO_EQUIPMENT_STATS = {
    "total": 7,
    "byStatus": [
        {"status": "available", "count": 3},
        {"status": "in_use", "count": 2},
        {"status": "maintenance", "count": 1},
        {"status": "offline", "count": 1},
    ],
    "byType": [
        {"type": "robot", "count": 2},
        {"type": "machine", "count": 2},
        {"type": "conveyor", "count": 1},
        {"type": "sensor", "count": 1},
        {"type": "tooling", "count": 1},
    ],
    "byProductionLine": [
        {"production_line": "Line A", "count": 3},
        {"production_line": "Line B", "count": 2},
        {"production_line": "Line C", "count": 2},
    ],
}


def _fetch_json(url: str) -> dict:
    response = requests.get(url, timeout=REQUEST_TIMEOUT_SECONDS)
    response.raise_for_status()
    return response.json()


def _to_dataframe(rows: list[dict], key_col: str) -> pd.DataFrame:
    """Build a DataFrame for display. API returns {key_col: val, count: n}."""
    if not rows:
        return pd.DataFrame(columns=["Metric", "Count"])

    data = []
    for r in rows:
        row = dict(r)
        key_val = row.get(key_col, row.get(key_col.replace("_", ""), ""))
        cnt = row.get("count", 0)
        try:
            cnt = int(float(cnt)) if cnt is not None else 0
        except (TypeError, ValueError):
            cnt = 0
        data.append({"Metric": str(key_val).replace("_", " ").title(), "Count": cnt})
    frame = pd.DataFrame(data)
    return frame.sort_values("Count", ascending=False)


def _use_demo(data: dict | None, demo: dict) -> dict:
    """Use demo data when API returns empty or fails."""
    if not data:
        return demo
    total = int(data.get("total", 0))
    by_status = data.get("byStatus", data.get("by_status", []))
    if total == 0 and not by_status:
        return demo
    return data


def _format_status(s: str) -> str:
    return s.replace("_", " ").title()


def _build_summary_md(
    tasks_stats: dict, equipment_stats: dict, api_base: str, errors: list[str]
) -> str:
    """Build a clean markdown summary with KPI cards."""
    tasks_total = int(tasks_stats.get("total", 0))
    equipment_total = int(equipment_stats.get("total", 0))
    timestamp = datetime.now(timezone.utc).astimezone().strftime("%Y-%m-%d %H:%M %Z")

    # Task status line
    by_status = tasks_stats.get("byStatus", [])
    status_parts = [f"{_format_status(s.get('status', ''))}: **{int(s.get('count', 0))}**" for s in by_status]
    status_line = " | ".join(status_parts) if status_parts else "—"

    # Equipment status line
    eq_by_status = equipment_stats.get("byStatus", [])
    eq_parts = [f"{_format_status(e.get('status', ''))}: **{int(e.get('count', 0))}**" for e in eq_by_status]
    eq_line = " | ".join(eq_parts) if eq_parts else "—"

    md = (
        f"## Summary\n\n"
        f"| **Tasks** | **Equipment** |\n"
        f"|----------|---------------|\n"
        f"| **{tasks_total}** total | **{equipment_total}** total |\n\n"
        f"**Tasks by status:** {status_line}\n\n"
        f"**Equipment by status:** {eq_line}\n\n"
        f"*API: `{api_base}` · Updated: {timestamp}*"
    )
    if errors:
        md += "\n\n---\n**Warnings:**\n" + "\n".join(errors)
    return md


def load_dashboard(api_base: str):
    api_base = (api_base or DEFAULT_API_BASE).rstrip("/")
    errors: list[str] = []

    tasks_stats: dict = {}
    equipment_stats: dict = {}

    try:
        tasks_stats = _fetch_json(f"{api_base}/tasks/statistics")
    except requests.RequestException as exc:
        errors.append(f"- Tasks stats: `{exc}`")
        tasks_stats = DEMO_TASKS_STATS

    try:
        equipment_stats = _fetch_json(f"{api_base}/equipment/statistics")
    except requests.RequestException as exc:
        errors.append(f"- Equipment stats: `{exc}`")
        equipment_stats = DEMO_EQUIPMENT_STATS

    tasks_stats = _use_demo(tasks_stats, DEMO_TASKS_STATS)
    equipment_stats = _use_demo(equipment_stats, DEMO_EQUIPMENT_STATS)

    summary_md = _build_summary_md(tasks_stats, equipment_stats, api_base, errors)

    # DataFrames for tables (reliable, no chart rendering issues)
    task_status_df = _to_dataframe(tasks_stats.get("byStatus", []), "status")
    task_priority_df = _to_dataframe(tasks_stats.get("byPriority", []), "priority")
    task_line_df = _to_dataframe(
        tasks_stats.get("byProductionLine", []), "production_line"
    )
    equipment_status_df = _to_dataframe(equipment_stats.get("byStatus", []), "status")
    equipment_type_df = _to_dataframe(equipment_stats.get("byType", []), "type")
    equipment_line_df = _to_dataframe(
        equipment_stats.get("byProductionLine", []), "production_line"
    )

    return (
        summary_md,
        task_status_df,
        task_priority_df,
        task_line_df,
        equipment_status_df,
        equipment_type_df,
        equipment_line_df,
    )


# Custom CSS for cleaner look
custom_css = """
.navbar { padding: 12px 20px !important; }
.gradio-container { max-width: 980px !important; margin: 0 auto !important; }
.markdown table { width: 100% !important; }
"""

with gr.Blocks(
    title="Task Manager Live Dashboard",
    css=custom_css,
    theme=gr.themes.Soft(
        primary_hue="indigo",
        secondary_hue="slate",
    ),
) as demo:
    gr.Markdown(
        "# Production Line Task & Equipment Dashboard\n\n"
        "Live metrics from your Symfony backend API. "
        "Configure the API URL below and click **Refresh**."
    )

    with gr.Row():
        api_base_input = gr.Textbox(
            label="Backend API base URL",
            value=DEFAULT_API_BASE,
            placeholder="https://your-domain:8000/api",
            scale=4,
        )
        refresh_button = gr.Button("Refresh", variant="primary", scale=1)

    summary_output = gr.Markdown()

    gr.Markdown("### Tasks")
    with gr.Row():
        task_status_table = gr.Dataframe(label="By Status")
        task_priority_table = gr.Dataframe(label="By Priority")
        task_line_table = gr.Dataframe(label="By Production Line")

    gr.Markdown("### Equipment")
    with gr.Row():
        equipment_status_table = gr.Dataframe(label="By Status")
        equipment_type_table = gr.Dataframe(label="By Type")
        equipment_line_table = gr.Dataframe(label="By Production Line")

    refresh_button.click(
        fn=load_dashboard,
        inputs=[api_base_input],
        outputs=[
            summary_output,
            task_status_table,
            task_priority_table,
            task_line_table,
            equipment_status_table,
            equipment_type_table,
            equipment_line_table,
        ],
    )

    demo.load(
        fn=load_dashboard,
        inputs=[api_base_input],
        outputs=[
            summary_output,
            task_status_table,
            task_priority_table,
            task_line_table,
            equipment_status_table,
            equipment_type_table,
            equipment_line_table,
        ],
    )


if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=int(os.getenv("PORT", "7860")))
