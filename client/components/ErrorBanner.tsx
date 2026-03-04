"use client";

import { useEffect, useState } from "react";

interface ErrorBannerProps {
  message: string | null;
  onDismiss?: () => void;
  /** Auto-dismiss after this many ms (0 = no auto-dismiss, default 5000) */
  autoDismissMs?: number;
  className?: string;
}

/**
 * A dismissible inline error banner for showing Redux/API error messages.
 * Renders nothing when `message` is null.
 */
export default function ErrorBanner({
  message,
  onDismiss,
  autoDismissMs = 5000,
  className = "",
}: ErrorBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);

      if (autoDismissMs > 0) {
        const timer = setTimeout(() => {
          setVisible(false);
          onDismiss?.();
        }, autoDismissMs);
        return () => clearTimeout(timer);
      }
    } else {
      setVisible(false);
    }
  }, [message, autoDismissMs, onDismiss]);

  if (!visible || !message) return null;

  return (
    <div
      role="alert"
      className={`flex items-center justify-between gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive ${className}`}
    >
      <div className="flex items-center gap-2">
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
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <span>{message}</span>
      </div>
      {onDismiss && (
        <button
          onClick={() => {
            setVisible(false);
            onDismiss();
          }}
          className="shrink-0 rounded p-0.5 hover:bg-destructive/20 transition-colors"
          aria-label="Dismiss error"
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
        </button>
      )}
    </div>
  );
}
