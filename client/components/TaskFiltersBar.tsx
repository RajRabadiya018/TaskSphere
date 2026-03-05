"use client";

import AnimatedSearchInput from "@/components/AnimatedSearchInput";
import StyledSelect from "@/components/StyledSelect";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AppDispatch, RootState } from "@/store";
import { clearFilters, setFilters } from "@/store/taskListSlice";
import { useDispatch, useSelector } from "react-redux";

interface TaskFiltersBarProps {
  className?: string;
}

function ToggleChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1.5 text-xs font-medium border transition-all duration-150",
        active
          ? "bg-foreground text-background border-foreground"
          : "bg-transparent text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

export default function TaskFiltersBar({ className }: TaskFiltersBarProps) {
  const dispatch = useDispatch<AppDispatch>();
  const filters = useSelector((state: RootState) => state.taskList.filters);
  const dashboards = useSelector(
    (state: RootState) => state.dashboards.dashboards,
  );

  const isFiltered =
    filters.priority.length > 0 ||
    filters.search !== "" ||
    filters.dashboardId !== "" ||
    filters.status.length > 0;

  const toggleStatus = (value: string) => {
    const current = filters.status;
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    dispatch(setFilters({ status: updated }));
  };

  const togglePriority = (value: string) => {
    const current = filters.priority;
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    dispatch(setFilters({ priority: updated }));
  };

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {/* Search */}
      <div>
        <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          Search
        </label>
        <AnimatedSearchInput
          value={filters.search}
          onChange={(val) => dispatch(setFilters({ search: val }))}
        />
      </div>

      <div className="h-px bg-border/50" />

      <div>
        <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
              d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z"
            />
          </svg>
          Dashboard
        </label>
        <StyledSelect
          value={filters.dashboardId}
          onChange={(val) => dispatch(setFilters({ dashboardId: val }))}
          options={[
            { value: "", label: "All Dashboards" },
            ...dashboards.map((d) => ({ value: d._id, label: d.name })),
          ]}
        />
      </div>

      <div>
        <label className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Status
        </label>
        <div className="flex flex-wrap gap-2">
          <ToggleChip
            label="To Do"
            active={filters.status.includes("ToDo")}
            onClick={() => toggleStatus("ToDo")}
          />
          <ToggleChip
            label="In Progress"
            active={filters.status.includes("In Progress")}
            onClick={() => toggleStatus("In Progress")}
          />
          <ToggleChip
            label="Done"
            active={filters.status.includes("Done")}
            onClick={() => toggleStatus("Done")}
          />
        </div>
      </div>

      <div>
        <label className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
              d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
            />
          </svg>
          Priority
        </label>
        <div className="flex flex-wrap gap-2">
          <ToggleChip
            label="Low"
            active={filters.priority.includes("low")}
            onClick={() => togglePriority("low")}
          />
          <ToggleChip
            label="Medium"
            active={filters.priority.includes("medium")}
            onClick={() => togglePriority("medium")}
          />
          <ToggleChip
            label="High"
            active={filters.priority.includes("high")}
            onClick={() => togglePriority("high")}
          />
        </div>
      </div>

      {isFiltered && (
        <>
          <div className="h-px bg-border/50" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch(clearFilters())}
            className="w-full justify-center gap-2 text-sm font-medium text-muted-foreground border-border/60 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
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
            Clear All Filters
          </Button>
        </>
      )}
    </div>
  );
}
