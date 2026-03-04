"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTaskForm } from "@/hooks/useTaskForm";
import { AppDispatch, RootState } from "@/store";
import { fetchTaskById, updateTaskFromList } from "@/store/taskListSlice";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function EditTaskPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const id = params.id as string;

  const { selectedTask } = useSelector((state: RootState) => state.taskList);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchTaskById(id)).finally(() => setLoading(false));
  }, [id, dispatch]);

  const task = selectedTask && selectedTask._id === id ? selectedTask : null;

  const { values, handleChange, handleSubmit, errors, reset } = useTaskForm(
    task || undefined,
  );

  const onSubmit = async (formValues: typeof values) => {
    setSubmitting(true);
    setFormError(null);
    try {
      await dispatch(
        updateTaskFromList({
          id,
          updates: {
            title: formValues.title.trim(),
            description: formValues.description.trim(),
            priority: formValues.priority,
            dueDate: formValues.dueDate,
            tags: formValues.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
            assignedTo: formValues.assignedTo.trim(),
          },
        }),
      ).unwrap();

      router.push(`/tasks/${id}`);
    } catch (err: unknown) {
      setFormError(
        typeof err === "string"
          ? err
          : "Failed to update task. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !task) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" label="Loading task..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href={`/tasks/${id}`}
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
        Back to Task
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Task</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update the task details below.
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

          {/* Current column/dashboard info */}
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs text-muted-foreground">
              <strong>Dashboard:</strong> {task.dashboardId?.name || "Unknown"}{" "}
              &middot; <strong>Column:</strong>{" "}
              {task.columnId?.name || "Unknown"}
            </p>
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
              placeholder="Describe the task..."
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
              onClick={reset}
              disabled={submitting}
            >
              Reset
            </Button>
            <Link href={`/tasks/${id}`}>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </Link>
            <Button
              onClick={() => handleSubmit(onSubmit)}
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
