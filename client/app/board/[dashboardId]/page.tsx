"use client";

import AddTaskDialog from "@/components/AddTaskDialog";
import AnimatedSearchInput from "@/components/AnimatedSearchInput";
import ErrorBanner from "@/components/ErrorBanner";
import KanbanBoard from "@/components/KanbanBoard";
import TaskDetailModal from "@/components/TaskDetailModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppDispatch, RootState } from "@/store";
import { fetchDashboards, setActiveDashboard } from "@/store/dashboardSlice";
import { clearBoardError, createColumn, fetchBoard } from "@/store/taskSlice";
import { Task } from "@/types/task";
import { use, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

interface PageProps {
  params: Promise<{ dashboardId: string }>;
}

export default function BoardPage({ params }: PageProps) {
  const { dashboardId } = use(params);
  const dispatch = useDispatch<AppDispatch>();
  const { columns, status, error } = useSelector(
    (state: RootState) => state.board,
  );
  const { dashboards, activeDashboard: active } = useSelector(
    (state: RootState) => state.dashboards,
  );

  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [addTaskColumnId, setAddTaskColumnId] = useState("");

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  useEffect(() => {
    if (dashboards.length === 0) {
      dispatch(fetchDashboards());
    }
  }, [dispatch, dashboards.length]);

  useEffect(() => {
    if (dashboards.length > 0) {
      const found = dashboards.find((d) => d._id === dashboardId);
      if (found && active?._id !== dashboardId) {
        dispatch(setActiveDashboard(found));
      }
    }
  }, [dashboards, dashboardId, dispatch, active]);

  useEffect(() => {
    dispatch(fetchBoard(dashboardId));
  }, [dispatch, dashboardId]);

  const handleAddTask = (columnId: string) => {
    setAddTaskColumnId(columnId);
    setAddTaskOpen(true);
  };

  const handleOpenTask = (task: Task) => {
    setSelectedTask(task);
    setDetailOpen(true);
  };

  const handleAddColumn = async () => {
    if (!newColumnName.trim()) return;
    await dispatch(
      createColumn({ dashboardId, name: newColumnName.trim() }),
    ).unwrap();
    setNewColumnName("");
    setAddingColumn(false);
  };

  const addTaskColumnName =
    columns.find((c) => c._id === addTaskColumnId)?.name || "";

  // Loading state
  if (status === "loading") {
    return (
      <div className="mx-auto max-w-350 px-6 py-10 sm:px-10 lg:px-14">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="flex gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-75 shrink-0 rounded-xl bg-muted/50 border border-border/50 p-4"
            >
              <div className="h-5 w-24 animate-pulse rounded bg-muted mb-4" />
              {[1, 2].map((j) => (
                <div
                  key={j}
                  className="mb-2.5 h-24 animate-pulse rounded-lg bg-muted"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (status === "failed") {
    return (
      <div className="mx-auto max-w-350 px-6 py-10 sm:px-10 lg:px-14">
        <div className="flex flex-col items-center justify-center py-20">
          <svg
            className="h-12 w-12 text-destructive/50 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
          <p className="text-lg font-semibold text-foreground">
            Failed to load board
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {error || "Something went wrong"}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => dispatch(fetchBoard(dashboardId))}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4.5rem)] flex-col overflow-hidden px-4 py-3 sm:px-6">
      {status === "succeeded" && error && (
        <ErrorBanner
          message={error}
          onDismiss={() => dispatch(clearBoardError())}
          className="mb-3"
        />
      )}

      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground/10">
            <svg
              className="h-4 w-4 text-foreground/60"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z"
              />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-foreground">
            {active?.name || "Board"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <AnimatedSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            className="w-72"
          />

          {addingColumn ? (
            <div className="flex items-center gap-2">
              <Input
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="Column name"
                className="h-9 w-36 text-sm"
                autoFocus
                maxLength={50}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddColumn();
                  if (e.key === "Escape") {
                    setAddingColumn(false);
                    setNewColumnName("");
                  }
                }}
              />
              <Button size="xs" onClick={handleAddColumn}>
                Add
              </Button>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => {
                  setAddingColumn(false);
                  setNewColumnName("");
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddingColumn(true)}
              className="h-9"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Column
            </Button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <KanbanBoard
          onAddTask={handleAddTask}
          onOpenTask={handleOpenTask}
          searchQuery={searchQuery}
        />
      </div>

      <AddTaskDialog
        open={addTaskOpen}
        onClose={() => setAddTaskOpen(false)}
        columnId={addTaskColumnId}
        dashboardId={dashboardId}
        columnName={addTaskColumnName}
      />

      <TaskDetailModal
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
      />
    </div>
  );
}
