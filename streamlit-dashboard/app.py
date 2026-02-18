import os
from datetime import datetime, timezone

import altair as alt
import pandas as pd
import requests
import streamlit as st


DEFAULT_API_BASE = os.getenv("BACKEND_API_URL", "http://backend:8000/api").rstrip("/")
DEFAULT_REFRESH_SECONDS = int(os.getenv("STREAMLIT_REFRESH_SECONDS", "5"))


def _to_dataframe(rows: list[dict], key_col: str, value_col: str) -> pd.DataFrame:
    if not rows:
        return pd.DataFrame(columns=[key_col, value_col])

    frame = pd.DataFrame(rows)
    frame[value_col] = pd.to_numeric(frame[value_col], errors="coerce").fillna(0).astype(int)
    frame = frame.sort_values(by=value_col, ascending=False)
    return frame


def fetch_statistics(api_base_url: str) -> dict:
    response = requests.get(f"{api_base_url}/tasks/statistics", timeout=8)
    response.raise_for_status()
    return response.json()


def render_bar_chart(frame: pd.DataFrame, category_col: str, count_col: str, title: str) -> None:
    if frame.empty:
        st.info(f"No data available for {title.lower()}.")
        return

    chart = (
        alt.Chart(frame)
        .mark_bar(cornerRadiusTopLeft=4, cornerRadiusTopRight=4)
        .encode(
            x=alt.X(f"{category_col}:N", title=title),
            y=alt.Y(f"{count_col}:Q", title="Count"),
            tooltip=[category_col, count_col],
            color=alt.Color(f"{category_col}:N", legend=None),
        )
        .properties(height=320)
    )
    st.altair_chart(chart, use_container_width=True)


def main() -> None:
    st.set_page_config(page_title="Production Line Live Dashboard", page_icon=":factory:", layout="wide")
    st.title("Production Line Task Manager - Realtime Dashboard")
    st.caption("Live metrics from Symfony API endpoint `/api/tasks/statistics`.")

    with st.sidebar:
        st.header("Settings")
        api_base = st.text_input("Backend API base URL", value=DEFAULT_API_BASE, help="Example: http://backend:8000/api")
        refresh_seconds = st.slider("Refresh interval (seconds)", min_value=2, max_value=60, value=max(2, DEFAULT_REFRESH_SECONDS))
        manual_refresh = st.button("Refresh now")

    if manual_refresh:
        st.rerun()

    @st.fragment(run_every=f"{refresh_seconds}s")
    def realtime_fragment() -> None:
        try:
            stats = fetch_statistics(api_base)
        except requests.RequestException as exc:
            st.error(f"Failed to fetch realtime data from backend: {exc}")
            return

        status_df = _to_dataframe(stats.get("byStatus", []), "status", "count")
        priority_df = _to_dataframe(stats.get("byPriority", []), "priority", "count")
        line_df = _to_dataframe(stats.get("byProductionLine", []), "production_line", "count")
        total_tasks = int(stats.get("total", 0))

        metric_cols = st.columns(4)
        metric_cols[0].metric("Total Tasks", total_tasks)
        metric_cols[1].metric("Todo", int(status_df.loc[status_df["status"] == "todo", "count"].sum()) if not status_df.empty else 0)
        metric_cols[2].metric(
            "In Progress",
            int(status_df.loc[status_df["status"] == "in_progress", "count"].sum()) if not status_df.empty else 0,
        )
        metric_cols[3].metric("Done", int(status_df.loc[status_df["status"] == "done", "count"].sum()) if not status_df.empty else 0)

        left, right = st.columns(2)
        with left:
            st.subheader("Tasks by Status")
            render_bar_chart(status_df, "status", "count", "Status")
        with right:
            st.subheader("Tasks by Priority")
            render_bar_chart(priority_df, "priority", "count", "Priority")

        st.subheader("Tasks by Production Line")
        render_bar_chart(line_df, "production_line", "count", "Production Line")

        now = datetime.now(timezone.utc).astimezone().strftime("%Y-%m-%d %H:%M:%S %Z")
        st.caption(f"Auto refresh every {refresh_seconds}s | Last update: {now}")

    realtime_fragment()


if __name__ == "__main__":
    main()
