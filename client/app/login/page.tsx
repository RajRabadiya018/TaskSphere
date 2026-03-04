"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppDispatch, RootState } from "@/store";
import { clearAuthError, loginUser } from "@/store/authSlice";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user, status, error } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // If already logged in, redirect to home
  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  // Clear errors on unmount
  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  const isLoading = status === "loading";

  return (
    <div className="flex min-h-screen">
      {/* ── Left Panel — Branding & Illustration ── */}
      <div className="relative hidden w-1/2 overflow-hidden bg-foreground lg:flex lg:flex-col lg:justify-between">
        {/* Decorative gradient blobs */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-125 w-125 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />

        {/* Subtle grid pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Top — Logo */}
        <div className="relative z-10 p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background/10 backdrop-blur-sm">
              <span className="text-sm font-bold text-background">TS</span>
            </div>
            <span className="text-lg font-semibold text-background/90">
              Task Sphere
            </span>
          </div>
        </div>

        {/* Center — Illustration */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-12">
          {/* Floating card illustrations */}
          <div className="relative w-full max-w-sm">
            {/* Card 1 */}
            <div className="absolute -left-4 -top-8 w-64 -rotate-6 rounded-xl border border-background/10 bg-background/7 p-4 backdrop-blur-md shadow-2xl">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <div className="h-2 w-24 rounded-full bg-background/20" />
              </div>
              <div className="space-y-2">
                <div className="h-2 w-full rounded-full bg-background/10" />
                <div className="h-2 w-3/4 rounded-full bg-background/10" />
              </div>
              <div className="mt-3 flex gap-1.5">
                <div className="h-5 w-12 rounded-full bg-blue-400/20" />
                <div className="h-5 w-14 rounded-full bg-violet-400/20" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="absolute -right-6 top-12 w-56 rotate-4 rounded-xl border border-background/10 bg-background/7 p-4 backdrop-blur-md shadow-2xl">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <div className="h-2 w-20 rounded-full bg-background/20" />
              </div>
              <div className="space-y-2">
                <div className="h-2 w-full rounded-full bg-background/10" />
                <div className="h-2 w-2/3 rounded-full bg-background/10" />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-rose-400/20" />
                <div className="h-2 w-16 rounded-full bg-background/15" />
              </div>
            </div>

            {/* Card 3 — center */}
            <div className="relative mx-auto mt-16 w-72 rounded-xl border border-background/10 bg-background/9 p-5 backdrop-blur-md shadow-2xl">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-blue-400" />
                  <div className="h-2.5 w-28 rounded-full bg-background/20" />
                </div>
                <div className="h-5 w-16 rounded-full bg-emerald-400/20 flex items-center justify-center">
                  <span className="text-[9px] font-medium text-emerald-300">
                    Done
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2 w-full rounded-full bg-background/10" />
                <div className="h-2 w-5/6 rounded-full bg-background/10" />
                <div className="h-2 w-1/2 rounded-full bg-background/10" />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex -space-x-1.5">
                  <div className="h-6 w-6 rounded-full bg-blue-400/30 ring-2 ring-foreground/50" />
                  <div className="h-6 w-6 rounded-full bg-violet-400/30 ring-2 ring-foreground/50" />
                  <div className="h-6 w-6 rounded-full bg-emerald-400/30 ring-2 ring-foreground/50" />
                </div>
                <div className="flex gap-1.5">
                  <div className="h-5 w-12 rounded-full bg-amber-400/15" />
                  <div className="h-5 w-10 rounded-full bg-blue-400/15" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom — Testimonial / tagline */}
        <div className="relative z-10 p-10">
          <blockquote className="space-y-2">
            <p className="text-sm leading-relaxed text-background/60">
              &ldquo;Organize your workflow, track progress, and collaborate
              seamlessly — all in one place.&rdquo;
            </p>
            <footer className="flex items-center gap-2">
              <div className="h-px flex-1 bg-background/10" />
              <span className="text-xs font-medium text-background/40">
                Task Sphere
              </span>
            </footer>
          </blockquote>
        </div>
      </div>

      {/* ── Right Panel — Login Form ── */}
      <div className="flex w-full flex-col justify-center px-6 sm:px-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center lg:text-left">
            {/* Mobile logo */}
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-foreground lg:hidden">
              <span className="text-lg font-bold text-background">TS</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="mt-2 text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="email"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
                autoComplete="current-password"
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-sm font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </p>

          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <div className="flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/50 px-3 py-1.5">
              <svg
                className="h-3.5 w-3.5 text-blue-500"
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
              <span className="text-[11px] font-medium text-muted-foreground">
                Kanban Boards
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/50 px-3 py-1.5">
              <svg
                className="h-3.5 w-3.5 text-emerald-500"
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
              <span className="text-[11px] font-medium text-muted-foreground">
                Task Tracking
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/50 px-3 py-1.5">
              <svg
                className="h-3.5 w-3.5 text-violet-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-[11px] font-medium text-muted-foreground">
                Team Collaboration
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
