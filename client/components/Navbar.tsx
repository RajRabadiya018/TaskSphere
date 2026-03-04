"use client";

import DashboardSelector from "@/components/DashboardSelector";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { AppDispatch, RootState } from "@/store";
import { logout } from "@/store/authSlice";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-350 items-center justify-between px-6 sm:px-10 lg:px-14">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground">
              <span className="text-sm font-bold text-background">TS</span>
            </div>
            <span className="hidden text-xl font-semibold tracking-tight sm:inline">
              Task Sphere
            </span>
          </Link>
        </div>

        <div className="hidden items-center gap-1.5 sm:flex">
          <Link
            href="/"
            className={`rounded-lg px-4 py-2.5 text-[15px] font-medium transition-colors ${
              isActive("/") && !isActive("/board") && !isActive("/tasks")
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            Dashboards
          </Link>

          <Link
            href="/tasks"
            className={`rounded-lg px-4 py-2.5 text-[15px] font-medium transition-colors ${
              isActive("/tasks")
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            Tasks
          </Link>

          <DashboardSelector />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
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
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
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
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </Button>

          {user && (
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-sm font-medium text-muted-foreground">
                {user.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-3 text-sm text-muted-foreground hover:text-foreground"
                onClick={handleLogout}
              >
                <svg
                  className="mr-1.5 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </Button>
            </div>
          )}

          <div className="flex items-center gap-1 sm:hidden">
            <Link
              href="/"
              className={`rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
                isActive("/") && !isActive("/board") && !isActive("/tasks")
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Home
            </Link>
            <Link
              href="/tasks"
              className={`rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
                isActive("/tasks")
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              }`}
            >
              Tasks
            </Link>
            <DashboardSelector />
            {user && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-muted-foreground"
                onClick={handleLogout}
              >
                Logout
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
