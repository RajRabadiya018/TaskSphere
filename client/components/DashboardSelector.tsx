"use client";

import { Button } from "@/components/ui/button";
import { AppDispatch, RootState } from "@/store";
import { fetchDashboards } from "@/store/dashboardSlice";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function DashboardSelector() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const pathname = usePathname();
    const { dashboards, status } = useSelector(
        (state: RootState) => state.dashboards
    );

    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const activeDashboardId = pathname.startsWith("/board/")
        ? pathname.split("/board/")[1]?.split("/")[0]
        : null;

    const activeDashboard = dashboards.find(
        (d) => d._id === activeDashboardId
    );

    useEffect(() => {
        if (status === "idle") {
            dispatch(fetchDashboards());
        }
    }, [dispatch, status]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, []);

    if (dashboards.length === 0) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="ghost"
                size="sm"
                className="h-9 gap-2 px-3 text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setOpen(!open)}
            >
                <svg
                    className="h-4 w-4"
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
                <span className="max-w-[120px] truncate">
                    {activeDashboard?.name || "Boards"}
                </span>
                <svg
                    className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </Button>

            {open && (
                <div className="absolute left-0 top-full z-50 mt-1.5 w-56 rounded-lg border border-border bg-popover p-1 shadow-lg">
                    <div className="px-2 py-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Your Boards
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                        {dashboards.map((d) => (
                            <button
                                key={d._id}
                                className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors ${d._id === activeDashboardId
                                        ? "bg-accent text-accent-foreground font-medium"
                                        : "text-foreground hover:bg-accent hover:text-accent-foreground"
                                    }`}
                                onClick={() => {
                                    router.push(`/board/${d._id}`);
                                    setOpen(false);
                                }}
                            >
                                <svg
                                    className="h-4 w-4 shrink-0 text-muted-foreground"
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
                                <span className="truncate">{d.name}</span>
                                {d._id === activeDashboardId && (
                                    <svg
                                        className="ml-auto h-4 w-4 shrink-0 text-foreground"
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
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="mt-1 border-t border-border pt-1">
                        <button
                            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                            onClick={() => {
                                router.push("/");
                                setOpen(false);
                            }}
                        >
                            <svg
                                className="h-4 w-4 shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                            <span>All Dashboards</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
