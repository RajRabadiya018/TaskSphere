import { AppDispatch, RootState } from "@/store";
import { fetchAllTasks } from "@/store/taskListSlice";
import { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

// Custom hook that manages server-side task filtering with debouncing.
// When filters change in Redux, this hook waits 300ms before dispatching an API call.
// This prevents excessive requests while the user is still typing or selecting filters.
export function useTaskFilters() {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, filters, status } = useSelector(
    (state: RootState) => state.taskList,
  );

  // Check if any filter is active (non-default)
  const isFiltered = useMemo(() => {
    return (
      filters.priority !== "all" ||
      filters.search !== "" ||
      filters.dashboardId !== "" ||
      filters.status !== "all"
    );
  }, [filters]);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  // Debounced API call: skip the first render (initial load is handled by the page),
  // then dispatch fetchAllTasks 300ms after the last filter change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      dispatch(fetchAllTasks(filters));
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [filters, dispatch]);

  return {
    filteredTasks: tasks,
    totalCount: tasks.length,
    isFiltered,
    isLoading: status === "loading",
  };
}
