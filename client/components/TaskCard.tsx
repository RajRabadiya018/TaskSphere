"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TaskListItem } from "@/types/task";
import Link from "next/link";
import TaskStatusBadge from "./TaskStatusBadge";

interface TaskCardProps {
  task: TaskListItem;
  onEdit: (task: TaskListItem) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
  className?: string;
}

const priorityStyles = {
  low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30",
  medium:
    "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30",
  high: "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30",
};

const priorityBorder: Record<string, string> = {
  low: "border-emerald-500/40 hover:border-emerald-500/60",
  medium: "border-amber-500/40 hover:border-amber-500/60",
  high: "border-red-500/40 hover:border-red-500/60",
};

const priorityLabels = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

function isOverdue(task: TaskListItem): boolean {
  if (!task.dueDate) return false;
  const colName = task.columnId?.name?.toLowerCase() || "";
  if (colName === "done" || colName === "completed") return false;
  const due = new Date(task.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  compact = false,
  className,
}: TaskCardProps) {
  const overdue = isOverdue(task);
  const columnName = task.columnId?.name || "Unknown";

  return (
    <div
      className={cn(
        "group relative rounded-xl border bg-card px-4 py-3.5 transition-all duration-200",
        "hover:shadow-lg hover:shadow-black/5",
        priorityBorder[task.priority],
        overdue && "border-l-[3px] border-l-red-500",
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <TaskStatusBadge columnName={columnName} size="sm" />
        <div className="flex items-center gap-1.5">
          {/* Action buttons — visible on hover */}
          <div className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.preventDefault();
                onEdit(task);
              }}
            >
              <svg
                className="h-3.5 w-3.5"
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
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400"
              onClick={(e) => {
                e.preventDefault();
                onDelete(task._id);
              }}
            >
              <svg
                className="h-3.5 w-3.5"
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
            </Button>
          </div>
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
              priorityStyles[task.priority],
            )}
          >
            {priorityLabels[task.priority]}
          </span>
        </div>
      </div>

      <Link href={`/tasks/${task._id}`}>
        <h3 className="mb-1 text-sm font-semibold leading-snug text-foreground transition-colors hover:text-foreground/80">
          {task.title}
        </h3>
      </Link>

      {!compact && (
        <p className="mb-2.5 line-clamp-1 text-xs leading-relaxed text-muted-foreground">
          {task.description}
        </p>
      )}

      {task.tags.length > 0 && !compact && (
        <div className="mb-2.5 flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-[10px] px-2 py-0"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40">
        {task.dueDate ? (
          <span
            className={cn(
              "flex items-center gap-1.5",
              overdue && "text-red-400 font-medium",
            )}
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {formatDate(task.dueDate)}
            {overdue && " (Overdue)"}
          </span>
        ) : (
          <span className="text-muted-foreground/50">No due date</span>
        )}
        {task.assignedTo && (
          <span className="flex items-center gap-1.5">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            {task.assignedTo}
          </span>
        )}
      </div>

      {/* Dashboard label */}
      {task.dashboardId?.name && (
        <div className="mt-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
          {task.dashboardId.name}
        </div>
      )}
    </div>
  );
}
