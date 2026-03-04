"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Task } from "@/types/task";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface KanbanTaskCardProps {
  task: Task;
  onOpen: (task: Task) => void;
  onStar: (id: string) => void;
  isDragOverlay?: boolean;
}

const priorityStyles: Record<string, string> = {
  low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  high: "bg-red-500/20 text-red-400 border-red-500/30",
};

const priorityBorder: Record<string, string> = {
  low: "border-emerald-500/40 hover:border-emerald-500/60",
  medium: "border-amber-500/40 hover:border-amber-500/60",
  high: "border-red-500/40 hover:border-red-500/60",
};

const priorityLabels: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function isOverdue(task: Task): boolean {
  if (!task.dueDate) return false;
  const due = new Date(task.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

export default function KanbanTaskCard({
  task,
  onOpen,
  onStar,
  isDragOverlay = false,
}: KanbanTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task._id,
    data: { type: "task", task },
    disabled: isDragOverlay,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const overdue = isOverdue(task);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative cursor-grab active:cursor-grabbing rounded-xl border bg-card p-4 transition-all duration-150 hover:shadow-md hover:shadow-black/5",
        priorityBorder[task.priority],
        isDragging && "opacity-40",
        isDragOverlay && "shadow-xl border-foreground/30",
        overdue && "border-l-[3px] border-l-red-500",
      )}
      onClick={() => {
        if (!isDragging) onOpen(task);
      }}
    >
      <div className="mb-2.5 flex items-center justify-between">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
            priorityStyles[task.priority],
          )}
        >
          {priorityLabels[task.priority]}
        </span>

        <Button
          variant="ghost"
          size="icon-xs"
          className="text-muted-foreground hover:text-yellow-500"
          onClick={(e) => {
            e.stopPropagation();
            onStar(task._id);
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {task.starred ? (
            <svg
              className="h-4 w-4 text-yellow-500"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ) : (
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          )}
        </Button>
      </div>

      <h4 className="mb-2 text-[15px] font-semibold leading-snug text-foreground line-clamp-2">
        {task.title}
      </h4>
   
      {task.description && (
        <p className="mb-3 text-[13px] leading-relaxed text-muted-foreground line-clamp-2">
          {task.description}
        </p>
      )}

      {task.tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {task.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-[11px] px-2 py-0.5"
            >
              {tag}
            </Badge>
          ))}
          {task.tags.length > 3 && (
            <span className="text-[11px] text-muted-foreground">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
        {task.dueDate ? (
          <span
            className={cn(
              "flex items-center gap-1",
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
            {overdue && " !"}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-muted-foreground/50">
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
            No due date
          </span>
        )}
        {task.assignedTo && (
          <span className="flex items-center gap-1">
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
            <span className="truncate max-w-20">{task.assignedTo}</span>
          </span>
        )}
      </div>
    </div>
  );
}
