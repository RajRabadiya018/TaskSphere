"use client";

import { cn } from "@/lib/utils";

interface TaskStatusBadgeProps {
  columnName: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function getColumnStyle(name: string) {
  const lower = name.toLowerCase();
  if (lower === "done" || lower === "completed")
    return {
      bg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      dot: "bg-emerald-400",
      pulse: false,
    };
  if (lower === "in progress" || lower === "in-progress")
    return {
      bg: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      dot: "bg-blue-400",
      pulse: true,
    };
  if (lower === "todo" || lower === "to do")
    return {
      bg: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
      dot: "bg-zinc-400",
      pulse: false,
    };
  return {
    bg: "bg-violet-500/20 text-violet-400 border-violet-500/30",
    dot: "bg-violet-400",
    pulse: false,
  };
}

const sizeClasses = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm",
};

export default function TaskStatusBadge({
  columnName,
  size = "md",
  className,
}: TaskStatusBadgeProps) {
  const style = getColumnStyle(columnName);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        style.bg,
        sizeClasses[size],
        style.pulse && "animate-pulse",
        className,
      )}
    >
      <span
        className={cn(
          "mr-1.5 inline-block h-1.5 w-1.5 rounded-full",
          style.dot,
        )}
      />
      {columnName}
    </span>
  );
}
