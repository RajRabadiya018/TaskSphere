"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTaskForm } from "@/hooks/useTaskForm";
import api from "@/lib/api";
import { AppDispatch, RootState } from "@/store";
import { fetchDashboards } from "@/store/dashboardSlice";
import { createTaskFromList } from "@/store/taskListSlice";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

interface ColumnOption {
  _id: string;
  name: string;
}

export default function CreateTaskPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { dashboards } = useSelector((state: RootState) => state.dashboards);

  const [selectedDashboardId, setSelectedDashboardId] = useState("");
  const [selectedColumnId, setSelectedColumnId] = useState("");
  const [columns, setColumns] = useState<ColumnOption[]>([]);
  const [loadingColumns, setLoadingColumns] = useState(false);

  // Fetch dashboards on mount
  useEffect(() => {
    if (dashboards.length === 0) dispatch(fetchDashboards());
  }, [dispatch, dashboards.length]);

  // Fetch columns when dashboard changes
  useEffect(() => {
    if (!selectedDashboardId) {
      setColumns([]);
      setSelectedColumnId("");
      return;
    }
    setLoadingColumns(true);
    api
      .get(`/dashboards/${selectedDashboardId}/board`)
      .then((res) => {
        const cols = (res.data.columns || []) as ColumnOption[];
        setColumns(cols);
        // Auto-select the first column (usually ToDo)
        if (cols.length > 0) setSelectedColumnId(cols[0]._id);
        else setSelectedColumnId("");
      })
      .catch(() => {
        setColumns([]);
        setSelectedColumnId("");
      })
      .finally(() => setLoadingColumns(false));
  }, [selectedDashboardId]);

  const { values, handleChange, handleSubmit, errors, reset } = useTaskForm();

  const onSubmit = async (formValues: typeof values) => {
    if (!selectedDashboardId || !selectedColumnId) return;

    setSubmitting(true);
    try {
      await dispatch(
        createTaskFromList({
          columnId: selectedColumnId,
          dashboardId: selectedDashboardId,
          title: formValues.title.trim(),
          description: formValues.description.trim(),
          priority: formValues.priority,
          dueDate: formValues.dueDate,
          tags: formValues.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          assignedTo: formValues.assignedTo.trim(),
        }),
      ).unwrap();

      router.push("/tasks");
    } catch (err: unknown) {
      setFormError(
        typeof err === "string"
          ? err
          : "Failed to create task. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/tasks"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Tasks
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create New Task</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fill in the details below to create a new task.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="space-y-5">
          {/* Error banner */}
          {formError && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </div>
          )}

          {/* Dashboard + Column selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dashboard">Dashboard *</Label>
              <select
                id="dashboard"
                value={selectedDashboardId}
                onChange={(e) => setSelectedDashboardId(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select a dashboard</option>
                {dashboards.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="column">Column *</Label>
              {loadingColumns ? (
                <div className="flex h-9 items-center px-3">
                  <LoadingSpinner size="sm" />
                </div>
              ) : (
                <select
                  id="column"
                  value={selectedColumnId}
                  onChange={(e) => setSelectedColumnId(e.target.value)}
                  disabled={columns.length === 0}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                >
                  {columns.length === 0 ? (
                    <option value="">
                      {selectedDashboardId
                        ? "No columns"
                        : "Select dashboard first"}
                    </option>
                  ) : (
                    columns.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))
                  )}
                </select>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={values.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Enter task title"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-xs text-red-400">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={values.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe the task in detail..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                value={values.priority}
                onChange={(e) => handleChange("priority", e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={values.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
                className={errors.dueDate ? "border-red-500" : ""}
              />
              {errors.dueDate && (
                <p className="text-xs text-red-400">{errors.dueDate}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Input
                id="assignedTo"
                value={values.assignedTo}
                onChange={(e) => handleChange("assignedTo", e.target.value)}
                placeholder="e.g., Raj"
              />
            </div>
            <div />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={values.tags}
              onChange={(e) => handleChange("tags", e.target.value)}
              placeholder="Comma-separated, e.g., bug, frontend, urgent"
            />
            <p className="text-[11px] text-muted-foreground">
              Separate tags with commas
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                reset();
                setSelectedDashboardId("");
                setSelectedColumnId("");
                setColumns([]);
              }}
              disabled={submitting}
            >
              Reset
            </Button>
            <Link href="/tasks">
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </Link>
            <Button
              onClick={() => handleSubmit(onSubmit)}
              disabled={submitting || !selectedDashboardId || !selectedColumnId}
            >
              {submitting ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
