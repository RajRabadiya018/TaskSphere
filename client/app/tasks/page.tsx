"use client";

import ErrorBanner from "@/components/ErrorBanner";
import TaskList from "@/components/TaskList";
import { AppDispatch, RootState } from "@/store";
import { fetchDashboards } from "@/store/dashboardSlice";
import {
  clearTaskListError,
  fetchAllTasks,
  fetchTaskStats,
} from "@/store/taskListSlice";
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function TasksPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { filters, stats, status, error } = useSelector(
    (state: RootState) => state.taskList,
  );

  useEffect(() => {
    dispatch(fetchAllTasks(filters));
    dispatch(fetchTaskStats(undefined));
    dispatch(fetchDashboards());
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDismissError = useCallback(() => {
    dispatch(clearTaskListError());
  }, [dispatch]);

  return (
    <div className="space-y-4">
      {/* Non-fatal error banner */}
      {error && status !== "failed" && (
        <ErrorBanner message={error} onDismiss={handleDismissError} />
      )}
      {/* Summary Cards */}
      {stats && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Total Tasks"
            value={stats.total}
            icon={
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            }
            color="text-foreground"
          />
          <SummaryCard
            label="In Progress"
            value={stats.byColumn["In Progress"] || 0}
            icon={
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            }
            color="text-blue-400"
          />
          <SummaryCard
            label="Completed"
            value={stats.byColumn["Done"] || 0}
            icon={
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            color="text-emerald-400"
          />
          <SummaryCard
            label="Overdue"
            value={stats.overdue}
            icon={
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            color="text-red-400"
          />
        </div>
      )}

      <div>
        <h1 className="text-xl font-bold tracking-tight">Tasks</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Manage and track all your tasks across dashboards.
        </p>
      </div>
      <TaskList />
    </div>
  );
}

/* ---------- Summary Card ---------- */
function SummaryCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
        <span className={color}>{icon}</span>
      </div>
      <p className="mt-1.5 text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}
