"use client";

import ConfirmDialog from "@/components/ConfirmDialog";
import TaskCard from "@/components/TaskCard";
import { Button } from "@/components/ui/button";
import { usePagination } from "@/hooks/usePagination";
import { useTaskFilters } from "@/hooks/useTaskFilters";
import { AppDispatch, RootState } from "@/store";
import { deleteTaskFromList } from "@/store/taskListSlice";
import { TaskListItem } from "@/types/task";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const PAGE_SIZE = 6;

function TaskCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="h-5 w-20 rounded-full bg-muted" />
        <div className="h-5 w-5 rounded bg-muted" />
      </div>
      <div className="mb-2 h-5 w-3/4 rounded bg-muted" />
      <div className="mb-4 space-y-1.5">
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-2/3 rounded bg-muted" />
      </div>
      <div className="mb-3 flex gap-1.5">
        <div className="h-5 w-14 rounded-full bg-muted" />
        <div className="h-5 w-16 rounded-full bg-muted" />
      </div>
      <div className="flex items-center justify-between border-t border-border/50 pt-3">
        <div className="h-3 w-20 rounded bg-muted" />
        <div className="h-3 w-16 rounded bg-muted" />
      </div>
    </div>
  );
}

export default function TaskList() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { filteredTasks, isFiltered } = useTaskFilters();
  const { status } = useSelector((state: RootState) => state.taskList);

  const { currentPage, totalPages, goToPage, nextPage, prevPage, pageItems } =
    usePagination(filteredTasks.length, PAGE_SIZE);

  const paginatedTasks = pageItems(filteredTasks);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleEdit = (task: TaskListItem) => {
    router.push(`/tasks/${task._id}/edit`);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (deleteId && !isDeleting) {
      setIsDeleting(true);
      setDeleteError(null);
      try {
        await dispatch(deleteTaskFromList(deleteId)).unwrap();
      } catch (err: unknown) {
        setDeleteError(
          typeof err === "string"
            ? err
            : "Failed to delete task. Please try again.",
        );
      } finally {
        setDeleteId(null);
        setIsDeleting(false);
      }
    }
  };

  // Show skeleton while loading
  if (status === "loading" && filteredTasks.length === 0) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <TaskCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <>
      {deleteError && (
        <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive flex items-center justify-between">
          <span>{deleteError}</span>
          <button
            onClick={() => setDeleteError(null)}
            className="shrink-0 rounded p-0.5 hover:bg-destructive/20 transition-colors"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {paginatedTasks.length > 0 ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {paginatedTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevPage}
                disabled={currentPage === 1}
                className="text-sm"
              >
                ← Prev
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "ghost"}
                    size="sm"
                    onClick={() => goToPage(page)}
                    className="h-9 w-9 p-0 text-sm"
                  >
                    {page}
                  </Button>
                ),
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="text-sm"
              >
                Next →
              </Button>
            </div>
          )}
        </>
      ) : isFiltered ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-base text-muted-foreground">
            No tasks match your current filters.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-base font-medium text-foreground mb-1">
            No tasks yet
          </p>
          <p className="text-sm text-muted-foreground">
            Create your first task to get started.
          </p>
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
        confirmLabel="Delete"
        destructive
      />
    </>
  );
}
