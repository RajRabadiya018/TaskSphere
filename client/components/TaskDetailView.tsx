"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppDispatch } from "@/store";
import { deleteTaskFromList } from "@/store/taskListSlice";
import { TaskListItem } from "@/types/task";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import ConfirmDialog from "./ConfirmDialog";
import TaskStatusBadge from "./TaskStatusBadge";

const priorityStyles = {
  low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  high: "bg-red-500/20 text-red-400 border-red-500/30",
};
const priorityLabels = { low: "Low", medium: "Medium", high: "High" };

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

interface TaskDetailViewProps {
  task: TaskListItem;
}

export default function TaskDetailView({ task }: TaskDetailViewProps) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const columnName = task.columnId?.name || "Unknown";
  const dashboardName = task.dashboardId?.name || "Unknown";

  const isOverdue =
    task.dueDate &&
    columnName.toLowerCase() !== "done" &&
    columnName.toLowerCase() !== "completed" &&
    new Date(task.dueDate) < new Date(new Date().toDateString());

  const handleDelete = async () => {
    await dispatch(deleteTaskFromList(task._id)).unwrap();
    router.push("/tasks");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
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
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TaskStatusBadge columnName={columnName} size="lg" />
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${priorityStyles[task.priority]}`}
            >
              {priorityLabels[task.priority]} Priority
            </span>
            {isOverdue && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-1 text-xs font-medium">
                ⚠ Overdue
              </span>
            )}
            {task.starred && (
              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2.5 py-1 text-xs font-medium">
                ★ Starred
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Link href={`/tasks/${task._id}/edit`}>
              <Button variant="ghost" size="sm">
                <svg
                  className="mr-1 h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300"
              onClick={() => setShowDeleteDialog(true)}
            >
              <svg
                className="mr-1 h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete
            </Button>
          </div>
        </div>

        <h1 className="mb-4 text-2xl font-bold text-foreground">
          {task.title}
        </h1>

        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          {task.description || "No description provided."}
        </p>

        <div className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-background p-4">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Due Date
            </span>
            <p
              className={`mt-1 text-sm font-medium ${isOverdue ? "text-red-400" : "text-foreground"}`}
            >
              {task.dueDate ? formatDate(task.dueDate) : "Not set"}
            </p>
          </div>
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Created
            </span>
            <p className="mt-1 text-sm font-medium text-foreground">
              {formatDate(task.createdAt)}
            </p>
          </div>
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Assigned To
            </span>
            <p className="mt-1 text-sm font-medium text-foreground">
              {task.assignedTo || "Unassigned"}
            </p>
          </div>
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Dashboard
            </span>
            <p className="mt-1 text-sm font-medium text-foreground">
              {dashboardName}
            </p>
          </div>
          <div className="col-span-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Tags
            </span>
            <div className="mt-1 flex flex-wrap gap-1">
              {task.tags.length > 0 ? (
                task.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px]">
                    {tag}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No tags</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete Task"
        description={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}
