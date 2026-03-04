"use client";

import ConfirmDialog from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppDispatch } from "@/store";
import { deleteColumn, renameColumn } from "@/store/taskSlice";
import { Column } from "@/types/column";
import { Task } from "@/types/task";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import KanbanTaskCard from "./KanbanTaskCard";

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onAddTask: (columnId: string) => void;
  onOpenTask: (task: Task) => void;
  onStarTask: (taskId: string) => void;
}

export default function KanbanColumn({
  column,
  tasks,
  onAddTask,
  onOpenTask,
  onStarTask,
}: KanbanColumnProps) {
  const dispatch = useDispatch<AppDispatch>();

  // Local state for column rename, delete confirmation, and menu dropdown
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(column.name);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Make the column itself sortable (for column drag-and-drop reordering)
  const {
    attributes: colAttributes,
    listeners: colListeners,
    setNodeRef: setColNodeRef,
    transform: colTransform,
    transition: colTransition,
    isDragging: isColDragging,
  } = useSortable({
    id: column._id,
    data: { type: "column" },
  });

  const colStyle = {
    transform: CSS.Transform.toString(colTransform),
    transition: colTransition,
  };

  // Also make the column a droppable zone so tasks can be dropped into it
  const { setNodeRef: setDropRef } = useDroppable({
    id: column._id,
    data: { type: "column" },
  });

  const taskIds = useMemo(() => tasks.map((t) => t._id), [tasks]);


  const handleRename = async () => {
    if (!renameValue.trim() || renameValue.trim() === column.name) {
      setIsRenaming(false);
      setRenameValue(column.name);
      return;
    }
    try {
      await dispatch(
        renameColumn({ id: column._id, name: renameValue.trim() }),
      ).unwrap();
    } catch {
      // Error flows to Redux state → displayed by board ErrorBanner
    }
    setIsRenaming(false);
  };

  const handleDelete = async () => {
    try {
      await dispatch(
        deleteColumn({
          id: column._id,
          dashboardId: column.dashboardId,
        }),
      ).unwrap();
    } catch {
      // Error flows to Redux state → displayed by board ErrorBanner
    }
    setDeleteConfirm(false);
  };

  return (
    <>
      <div
        ref={setColNodeRef}
        style={colStyle}
        className={`flex w-75 min-w-67.5 flex-1 shrink-0 flex-col rounded-xl bg-muted/30 border border-border/40 transition-all duration-200 overflow-hidden hover:border-border/60 ${isColDragging ? "opacity-40 scale-[0.98]" : ""
          }`}
      >
        {/* Column header — drag handle for column reorder */}
        <div
          className="flex items-center justify-between px-4 py-3.5 cursor-grab active:cursor-grabbing border-b border-border/30"
          {...colAttributes}
          {...colListeners}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {isRenaming ? (
              <Input
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Enter") handleRename();
                  if (e.key === "Escape") {
                    setIsRenaming(false);
                    setRenameValue(column.name);
                  }
                }}
                onBlur={handleRename}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                className="h-8 text-[15px] font-semibold"
                maxLength={50}
                autoFocus
              />
            ) : (
              <h3 className="text-[15px] font-semibold text-foreground truncate">
                {column.name}
              </h3>
            )}
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-foreground/10 px-1.5 text-xs font-medium text-muted-foreground shrink-0">
              {tasks.length}
            </span>
          </div>

          {/* Column actions */}
          <div
            className="flex items-center gap-0.5 shrink-0"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* Add task */}
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onAddTask(column._id);
              }}
            >
              <svg
                className="h-4.5 w-4.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </Button>

            {/* Column menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
              >
                <svg
                  className="h-4.5 w-4.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </Button>

              {menuOpen && (
                <div
                  className="absolute right-0 top-full z-50 mt-1 w-44 rounded-lg border border-border bg-popover p-1.5 shadow-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-accent"
                    onClick={() => {
                      setIsRenaming(true);
                      setRenameValue(column.name);
                      setMenuOpen(false);
                    }}
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Rename
                  </button>
                  {column.type === "custom" && (
                    <button
                      className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm text-red-400 transition-colors hover:bg-accent"
                      onClick={() => {
                        setDeleteConfirm(true);
                        setMenuOpen(false);
                      }}
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Task list — droppable zone */}
        <div
          ref={setDropRef}
          className="flex flex-1 flex-col gap-3 overflow-y-auto px-3 pb-3 scrollbar-none min-h-15"
        >
          <SortableContext
            items={taskIds}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <KanbanTaskCard
                key={task._id}
                task={task}
                onOpen={onOpenTask}
                onStar={onStarTask}
              />
            ))}
          </SortableContext>

          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-foreground/5">
                <svg
                  className="h-6 w-6 text-muted-foreground/40"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-muted-foreground/60 mb-1">
                No tasks yet
              </p>
              <p className="text-xs text-muted-foreground/40 mb-3">
                Get started by adding your first task
              </p>
              <button
                className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-primary/40 hover:text-primary hover:bg-primary/5"
                onClick={() => onAddTask(column._id)}
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add a task
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete column confirm */}
      <ConfirmDialog
        open={deleteConfirm}
        title="Delete Column"
        description={`Are you sure you want to delete "${column.name}"? Tasks in this column will be moved to ToDo.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(false)}
        confirmLabel="Delete"
        destructive
      />
    </>
  );
}
