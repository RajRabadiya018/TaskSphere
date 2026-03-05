"use client";

import ConfirmDialog from "@/components/ConfirmDialog";
import ErrorBanner from "@/components/ErrorBanner";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePagination } from "@/hooks/usePagination";
import api from "@/lib/api";
import { AppDispatch, RootState } from "@/store";
import {
  clearDashboardError,
  createDashboard,
  deleteDashboard,
  fetchDashboards,
  renameDashboard,
} from "@/store/dashboardSlice";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const PAGE_SIZE = 6;

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const FEATURES = [
  {
    icon: (
      <svg
        className="h-5 w-5"
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
    ),
    title: "Kanban Boards",
    desc: "Visualize workflow with drag-and-drop columns",
    color: "text-blue-500 bg-blue-500/10",
  },
  {
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
        />
      </svg>
    ),
    title: "Task Tracking",
    desc: "Monitor progress with priorities & statuses",
    color: "text-emerald-500 bg-emerald-500/10",
  },
  {
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
        />
      </svg>
    ),
    title: "Team Assignees",
    desc: "Assign tasks and track team workloads",
    color: "text-violet-500 bg-violet-500/10",
  },
];

export default function DashboardsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { dashboards, status, error } = useSelector(
    (state: RootState) => state.dashboards,
  );
  const { user } = useSelector((state: RootState) => state.auth);

  // Local state for dashboard CRUD operations
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const createInputRef = useRef<HTMLInputElement>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleteCounts, setDeleteCounts] = useState<{ tasks: number; columns: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchDashboards());
  }, [dispatch]);

  useEffect(() => {
    if (showCreate) createInputRef.current?.focus();
  }, [showCreate]);

  useEffect(() => {
    if (renamingId) renameInputRef.current?.focus();
  }, [renamingId]);

  // Filter dashboards by search query
  const filteredDashboards = dashboards.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );


  const { currentPage, totalPages, goToPage, nextPage, prevPage, pageItems } =
    usePagination(filteredDashboards.length, PAGE_SIZE);
  const paginatedDashboards = pageItems(filteredDashboards);


  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await dispatch(createDashboard({ name: newName.trim() })).unwrap();
      setNewName("");
      setShowCreate(false);
    } catch {
    } finally {
      setCreating(false);
    }
  };

  const handleRename = async (id: string) => {
    if (!renameValue.trim()) return;
    try {
      await dispatch(
        renameDashboard({ id, name: renameValue.trim() }),
      ).unwrap();
      setRenamingId(null);
      setRenameValue("");
    } catch {
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await dispatch(deleteDashboard(deleteTarget.id)).unwrap();
    } catch {
    }
    setDeleteTarget(null);
    setDeleteCounts(null);
  };

  useEffect(() => {
    if (!deleteTarget) {
      setDeleteCounts(null);
      return;
    }
    api.get(`/dashboards/${deleteTarget.id}/board`)
      .then((res) => {
        const columns = res.data.columns?.length || 0;
        const tasks = Object.values(res.data.tasks || {}).reduce(
          (sum: number, arr: any) => sum + (Array.isArray(arr) ? arr.length : 0),
          0,
        );
        setDeleteCounts({ tasks: tasks as number, columns });
      })
      .catch(() => setDeleteCounts(null));
  }, [deleteTarget]);

  const startRename = (id: string, currentName: string) => {
    setRenamingId(id);
    setRenameValue(currentName);
  };

  if (status === "loading" && dashboards.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" label="Loading dashboards..." />
      </div>
    );
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-4 min-h-[calc(100vh-72px-3rem)]">
      {error && status !== "failed" && (
        <ErrorBanner
          message={error}
          onDismiss={() => dispatch(clearDashboardError())}
        />
      )}

      <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-linear-to-br from-primary/6 via-background to-accent/8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 h-36 w-36 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6">
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
              {today}
            </p>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              {getGreeting()}, {user?.name || "there"}
            </h1>
            <p className="max-w-md text-sm text-muted-foreground">
              Your personalized workspace to organize, track, and ship projects
              faster.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center rounded-xl border border-border/50 bg-card/80 backdrop-blur px-5 py-2.5 shadow-sm">
              <span className="text-xl font-bold tabular-nums">
                {dashboards.length}
              </span>
              <span className="text-[11px] font-medium text-muted-foreground">
                Boards
              </span>
            </div>
            {!showCreate && (
              <Button
                onClick={() => setShowCreate(true)}
                className="h-auto gap-2 rounded-xl px-5 shadow-sm"
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
                New Board
              </Button>
            )}
          </div>
        </div>
      </div>

      {showCreate && (
        <div className="rounded-xl border border-border bg-card p-5 transition-all">
          <p className="mb-3 text-sm font-medium text-foreground">
            Create new dashboard
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              ref={createInputRef}
              placeholder="Dashboard name (e.g. Design, Backend)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") {
                  setShowCreate(false);
                  setNewName("");
                }
              }}
              maxLength={50}
              disabled={creating}
              className="flex-1"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleCreate}
                disabled={!newName.trim() || creating}
                className="flex-1 sm:flex-none"
              >
                {creating ? "Creating…" : "Create"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowCreate(false);
                  setNewName("");
                }}
                disabled={creating}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold tracking-tight">My Boards</h2>
          <div className="relative group w-full sm:w-72">
            <svg
              className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50 transition-colors group-focus-within:text-primary/70"
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
            <Input
              type="text"
              placeholder="Search boards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-9 bg-card border-border/50 rounded-lg text-sm shadow-sm placeholder:text-muted-foreground/40 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/10 transition-all duration-200 hover:border-border/80"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground/50 hover:text-foreground hover:bg-muted transition-colors"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {filteredDashboards.length > 0 ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedDashboards.map((dashboard, index) => {
                const globalIndex = (currentPage - 1) * PAGE_SIZE + index;
                const accentColors = [
                  "from-blue-500/20 to-indigo-500/20",
                  "from-emerald-500/20 to-teal-500/20",
                  "from-violet-500/20 to-purple-500/20",
                  "from-amber-500/20 to-orange-500/20",
                  "from-rose-500/20 to-pink-500/20",
                  "from-cyan-500/20 to-sky-500/20",
                ];
                const iconColors = [
                  "text-blue-500 bg-blue-500/10",
                  "text-emerald-500 bg-emerald-500/10",
                  "text-violet-500 bg-violet-500/10",
                  "text-amber-500 bg-amber-500/10",
                  "text-rose-500 bg-rose-500/10",
                  "text-cyan-500 bg-cyan-500/10",
                ];
                const borderAccents = [
                  "hover:border-blue-500/30",
                  "hover:border-emerald-500/30",
                  "hover:border-violet-500/30",
                  "hover:border-amber-500/30",
                  "hover:border-rose-500/30",
                  "hover:border-cyan-500/30",
                ];
                const accent = accentColors[globalIndex % accentColors.length];
                const iconColor = iconColors[globalIndex % iconColors.length];
                const borderColor =
                  borderAccents[globalIndex % borderAccents.length];

                return (
                  <div
                    key={dashboard._id}
                    className={`group relative overflow-hidden rounded-xl border border-border/60 bg-card transition-all duration-300 hover:shadow-lg hover:shadow-black/5 ${borderColor} cursor-pointer`}
                    onClick={() => {
                      if (renamingId !== dashboard._id) {
                        router.push(`/board/${dashboard._id}`);
                      }
                    }}
                  >
                    <div className={`h-1 w-full bg-linear-to-r ${accent}`} />

                    <div className="px-4 py-3.5">
                      <div className="mb-3 flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconColor}`}
                        >
                          <svg
                            className="h-4.5 w-4.5"
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

                        <div className="min-w-0 flex-1">
                          {renamingId === dashboard._id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                ref={renameInputRef}
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onKeyDown={(e) => {
                                  e.stopPropagation();
                                  if (e.key === "Enter")
                                    handleRename(dashboard._id);
                                  if (e.key === "Escape") {
                                    setRenamingId(null);
                                    setRenameValue("");
                                  }
                                }}
                                onClick={(e) => e.stopPropagation()}
                                maxLength={50}
                                className="h-8 flex-1 text-sm font-semibold"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 shrink-0 p-0 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRename(dashboard._id);
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
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 shrink-0 p-0 text-muted-foreground hover:text-foreground"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRenamingId(null);
                                  setRenameValue("");
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
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </Button>
                            </div>
                          ) : (
                            <h3 className="truncate text-sm font-semibold text-foreground pr-16">
                              {dashboard.name}
                            </h3>
                          )}
                        </div>

                        {renamingId !== dashboard._id && (
                          <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                startRename(dashboard._id, dashboard.name);
                              }}
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
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTarget({
                                  id: dashboard._id,
                                  name: dashboard.name,
                                });
                              }}
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
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2.5 border-t border-border/30">
                        <span className="flex items-center gap-1.5">
                          <svg
                            className="h-3 w-3 opacity-60"
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
                          {formatDate(dashboard.createdAt)}
                        </span>

                        <span className="flex items-center gap-1.5 text-primary/70 font-medium opacity-0 translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
                          Open board
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="text-sm h-8"
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
                      className="h-8 w-8 p-0 text-sm"
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
                  className="text-sm h-8"
                >
                  Next →
                </Button>
              </div>
            )}
          </>
        ) : searchQuery && dashboards.length > 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-foreground/10">
              <svg
                className="h-7 w-7 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-foreground">
              No dashboards match &ldquo;{searchQuery}&rdquo;
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different search term.
            </p>
            <Button
              variant="ghost"
              className="mt-3"
              onClick={() => setSearchQuery("")}
            >
              Clear search
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-foreground/10">
              <svg
                className="h-7 w-7 text-muted-foreground"
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
            <p className="text-sm font-medium text-foreground">
              No dashboards yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first dashboard to start organizing tasks.
            </p>
            <Button onClick={() => setShowCreate(true)} className="mt-4">
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
              Create Dashboard
            </Button>
          </div>
        )}
      </div>

      <div className="mt-auto grid gap-2.5 sm:grid-cols-3 pt-1">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="group/feat flex items-center gap-3 rounded-xl border border-border/40 bg-card/60 px-3.5 py-2.5 transition-colors hover:bg-card"
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${f.color} transition-transform group-hover/feat:scale-110`}
            >
              {f.icon}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight">{f.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground leading-snug">
                {f.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Dashboard"
        description={`Are you sure you want to delete "${deleteTarget?.name}"?${deleteCounts ? ` This will permanently delete ${deleteCounts.tasks} task${deleteCounts.tasks !== 1 ? "s" : ""} across ${deleteCounts.columns} column${deleteCounts.columns !== 1 ? "s" : ""}.` : " This will permanently remove the dashboard and all its data."}`}
        onConfirm={handleDelete}
        onCancel={() => { setDeleteTarget(null); setDeleteCounts(null); }}
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}
