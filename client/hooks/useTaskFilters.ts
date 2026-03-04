import { AppDispatch, RootState } from "@/store";
import { fetchAllTasks } from "@/store/taskListSlice";
import { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

export function useTaskFilters() {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, filters, status } = useSelector(
    (state: RootState) => state.taskList,
  );

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

  // Debounced fetch when filters change
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
