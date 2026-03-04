"use client";

import TaskFiltersBar from "@/components/TaskFiltersBar";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { useTaskFilters } from "@/hooks/useTaskFilters";
import { cn } from "@/lib/utils";
import { AppDispatch } from "@/store";
import { fetchAllTasks } from "@/store/taskListSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const { sidebarOpen, toggleSidebar } = useTheme();
  const { filteredTasks, totalCount, isFiltered, isLoading } = useTaskFilters();

  useEffect(() => {
    dispatch(fetchAllTasks(undefined));
  }, [dispatch]);

  return (
    <div className="relative flex gap-4">
      {/* Mobile filter toggle button */}
      <button
        onClick={toggleSidebar}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-transform active:scale-95 sm:hidden"
        aria-label="Toggle filters"
      >
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
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        {isFiltered && (
          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-blue-500 ring-2 ring-background" />
        )}
      </button>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 sm:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-18 z-40 h-[calc(100vh-4.5rem)] w-72 shrink-0 overflow-y-auto border-r border-border bg-background p-5 transition-transform duration-200",
          "sm:sticky sm:top-24 sm:z-0 sm:h-fit sm:max-h-[calc(100vh-7rem)] sm:translate-x-0 sm:rounded-xl sm:border sm:bg-card",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">Filters</h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 sm:hidden"
            onClick={toggleSidebar}
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
          </Button>
        </div>

        <TaskFiltersBar />

        <div className="mt-5 rounded-lg border border-border bg-background p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Results
          </p>
          <p className="mt-1.5 text-xl font-bold text-foreground">
            {filteredTasks.length}
            <span className="text-sm font-normal text-muted-foreground">
              {" "}
              / {totalCount}
            </span>
          </p>
          {isFiltered && (
            <p className="mt-1 text-xs text-muted-foreground">Filters active</p>
          )}
        </div>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
