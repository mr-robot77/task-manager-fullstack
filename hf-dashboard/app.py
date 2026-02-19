import os
from datetime import datetime, timezone

import gradio as gr
import pandas as pd
import plotly.express as px
import requests


DEFAULT_API_BASE = os.getenv("BACKEND_API_BASE", "http://localhost:8000/api").rstrip("/")
REQUEST_TIMEOUT_SECONDS = float(os.getenv("REQUEST_TIMEOUT_SECONDS", "10"))


def _fetch_json(url: str) -> dict:
    response = requests.get(url, timeout=REQUEST_TIMEOUT_SECONDS)
    response.raise_for_status()
    return response.json()


def _to_dataframe(rows: list[dict], key_column: str) -> pd.DataFrame:
    if not rows:
        return pd.DataFrame(columns=[key_column, "count"])

    frame = pd.DataFrame(rows)
    if "count" not in frame.columns:
        frame["count"] = 0

    frame["count"] = pd.to_numeric(frame["count"], errors="coerce").fillna(0).astype(int)
    frame = frame.sort_values("count", ascending=False)
    return frame


def _bar_figure(frame: pd.DataFrame, x_col: str, title: str):
    if frame.empty:
        return None

    return px.bar(
        frame,
        x=x_col,
        y="count",
        title=title,
        color=x_col,
    )


def load_dashboard(api_base: str):
    api_base = (api_base or DEFAULT_API_BASE).rstrip("/")
    errors: list[str] = []

    tasks_stats: dict = {}
    equipment_stats: dict = {}

    try:
        tasks_stats = _fetch_json(f"{api_base}/tasks/statistics")
    except requests.RequestException as exc:
        errors.append(f"- Failed to load tasks statistics: `{exc}`")

    try:
        equipment_stats = _fetch_json(f"{api_base}/equipment/statistics")
    except requests.RequestException as exc:
        errors.append(f"- Failed to load equipment statistics: `{exc}`")

    tasks_total = int(tasks_stats.get("total", 0)) if tasks_stats else 0
    equipment_total = int(equipment_stats.get("total", 0)) if equipment_stats else 0
    timestamp = datetime.now(timezone.utc).astimezone().strftime("%Y-%m-%d %H:%M:%S %Z")

    summary_md = (
        f"### Live Summary\n"
        f"- Backend API base: `{api_base}`\n"
        f"- Total tasks: **{tasks_total}**\n"
        f"- Total equipment: **{equipment_total}**\n"
        f"- Last refresh: `{timestamp}`"
    )

    task_status_df = _to_dataframe(tasks_stats.get("byStatus", []), "status") if tasks_stats else _to_dataframe([], "status")
    equipment_status_df = (
        _to_dataframe(equipment_stats.get("byStatus", []), "status")
        if equipment_stats
        else _to_dataframe([], "status")
    )
    task_priority_df = (
        _to_dataframe(tasks_stats.get("byPriority", []), "priority")
        if tasks_stats
        else _to_dataframe([], "priority")
    )
    equipment_type_df = (
        _to_dataframe(equipment_stats.get("byType", []), "type")
        if equipment_stats
        else _to_dataframe([], "type")
    )

    task_fig = _bar_figure(task_status_df, "status", "Tasks by Status")
    equipment_fig = _bar_figure(equipment_status_df, "status", "Equipment by Status")

    errors_md = "### Warnings\n" + "\n".join(errors) if errors else ""

    return summary_md, errors_md, task_fig, equipment_fig, task_priority_df, equipment_type_df


with gr.Blocks(title="Task Manager Live Dashboard") as demo:
    gr.Markdown("# Production Line Task and Equipment Dashboard")
    gr.Markdown(
        "This dashboard is designed for Hugging Face Spaces. "
        "It reads live metrics from your Symfony backend public API."
    )

    api_base_input = gr.Textbox(
        label="Backend API base URL",
        value=DEFAULT_API_BASE,
        placeholder="https://your-oracle-vm-domain/api",
    )
    refresh_button = gr.Button("Refresh")

    summary_output = gr.Markdown()
    warning_output = gr.Markdown()

    with gr.Row():
        tasks_plot = gr.Plot(label="Tasks")
        equipment_plot = gr.Plot(label="Equipment")

    with gr.Row():
        task_priority_table = gr.Dataframe(label="Tasks by Priority")
        equipment_type_table = gr.Dataframe(label="Equipment by Type")

    refresh_button.click(
        fn=load_dashboard,
        inputs=[api_base_input],
        outputs=[
            summary_output,
            warning_output,
            tasks_plot,
            equipment_plot,
            task_priority_table,
            equipment_type_table,
        ],
    )

    demo.load(
        fn=load_dashboard,
        inputs=[api_base_input],
        outputs=[
            summary_output,
            warning_output,
            tasks_plot,
            equipment_plot,
            task_priority_table,
            equipment_type_table,
        ],
    )


if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=int(os.getenv("PORT", "7860")))
