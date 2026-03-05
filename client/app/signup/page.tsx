"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppDispatch, RootState } from "@/store";
import { clearAuthError, signupUser } from "@/store/authSlice";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function SignupPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user, status, error } = useSelector((state: RootState) => state.auth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    // Client-side validation
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters");
      return;
    }

    dispatch(signupUser({ name, email, password }));
  };

  const isLoading = status === "loading";
  const displayError = localError || error;

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 overflow-hidden bg-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-125 w-125 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="pointer-events-none absolute right-1/4 top-1/4 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

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

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-10">
          <div className="w-full max-w-md">
            <div className="rounded-2xl border border-background/10 bg-background/6 p-5 backdrop-blur-md shadow-2xl">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-background/30" />
                <div className="h-2.5 w-32 rounded-full bg-background/15" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                    <span className="text-[10px] font-medium text-background/40">
                      To Do
                    </span>
                    <span className="ml-auto text-[9px] text-background/25">
                      3
                    </span>
                  </div>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="rounded-lg bg-background/7 p-2.5 border border-background/5"
                    >
                      <div className="h-1.5 w-full rounded-full bg-background/10 mb-1.5" />
                      <div className="h-1.5 w-2/3 rounded-full bg-background/8" />
                      {i === 1 && (
                        <div className="mt-2 flex gap-1">
                          <div className="h-3.5 w-8 rounded-full bg-amber-400/15" />
                          <div className="h-3.5 w-10 rounded-full bg-blue-400/15" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    <span className="text-[10px] font-medium text-background/40">
                      In Progress
                    </span>
                    <span className="ml-auto text-[9px] text-background/25">
                      2
                    </span>
                  </div>
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="rounded-lg bg-background/7 p-2.5 border border-background/5"
                    >
                      <div className="h-1.5 w-full rounded-full bg-background/10 mb-1.5" />
                      <div className="h-1.5 w-3/4 rounded-full bg-background/8" />
                      {i === 2 && (
                        <div className="mt-2 flex items-center gap-1">
                          <div className="h-4 w-4 rounded-full bg-violet-400/20" />
                          <div className="h-1.5 w-10 rounded-full bg-background/10" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[10px] font-medium text-background/40">
                      Done
                    </span>
                    <span className="ml-auto text-[9px] text-background/25">
                      4
                    </span>
                  </div>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="rounded-lg bg-background/7 p-2.5 border border-background/5"
                    >
                      <div className="flex items-center gap-1.5">
                        <svg
                          className="h-2.5 w-2.5 text-emerald-400/60"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <div className="h-1.5 flex-1 rounded-full bg-background/10" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-center gap-6">
              {[
                { label: "Tasks", value: "9", color: "text-blue-300" },
                { label: "Boards", value: "3", color: "text-violet-300" },
                { label: "Done", value: "4", color: "text-emerald-300" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className={`text-lg font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-background/30">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 p-10">
          <blockquote className="space-y-2">
            <p className="text-sm leading-relaxed text-background/60">
              &ldquo;From idea to done — manage every phase of your project with
              clarity and confidence.&rdquo;
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

      <div className="flex w-full flex-col justify-center px-6 sm:px-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="text-center lg:text-left">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-foreground lg:hidden">
              <span className="text-lg font-bold text-background">TS</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Create an account
            </h1>
            <p className="mt-2 text-muted-foreground">
              Get started with Task Sphere
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {displayError && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
                {displayError}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
                minLength={2}
                maxLength={50}
                autoComplete="name"
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={6}
                    autoComplete="new-password"
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={6}
                    autoComplete="new-password"
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
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
                  Creating account...
                </span>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
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
