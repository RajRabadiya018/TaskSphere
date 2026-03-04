import { useCallback, useMemo, useState } from "react";

// Generic client-side pagination hook.
// Handles page state, navigation, clamping (prevents out-of-bounds pages),
// and provides a pageItems() function to slice an array for the current page.
export function usePagination(totalItems: number, pageSize: number) {
  const [rawPage, setCurrentPage] = useState<number>(1);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalItems / pageSize));
  }, [totalItems, pageSize]);

  // Clamp current page to valid range (handles edge case when items are deleted)
  const currentPage = Math.min(rawPage, totalPages);

  const goToPage = useCallback(
    (page: number) => {
      const clamped = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(clamped);
    },
    [totalPages],
  );

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  // Slice an array to return only the items for the current page
  function pageItems<T>(items: T[]): T[] {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return items.slice(startIndex, endIndex);
  }

  return {
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    pageItems,
  };
}
