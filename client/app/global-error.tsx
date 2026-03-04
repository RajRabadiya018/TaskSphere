"use client";

/**
 * Root-level error boundary.
 * This catches errors that occur in the root layout itself.
 * It must provide its own <html> and <body> since the root layout is broken.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100 font-sans antialiased">
        <div className="mx-auto max-w-md px-6 text-center">
          {/* Icon */}
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20">
            <svg
              className="h-7 w-7 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h1 className="mb-2 text-xl font-semibold">Something went wrong!</h1>
          <p className="mb-6 text-sm text-zinc-400">
            {error.message || "An unexpected error occurred. Please try again."}
          </p>

          <button
            onClick={reset}
            className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
