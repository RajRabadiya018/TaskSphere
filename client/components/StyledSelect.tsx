"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface StyledSelectProps {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  className?: string;
}

export default function StyledSelect({
  value,
  options,
  onChange,
  className,
}: StyledSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={cn(
          "flex w-full items-center justify-between h-10 rounded-xl border px-3.5 text-sm transition-all duration-200",
          "bg-card border-border/50 text-foreground shadow-sm",
          "hover:border-border/80",
          open
            ? "border-primary/40 ring-2 ring-primary/10 shadow-md"
            : "focus:border-primary/40 focus:ring-2 focus:ring-primary/10",
        )}
      >
        <span className={selected?.value ? "" : "text-muted-foreground"}>
          {selected?.label || "Select..."}
        </span>
        <svg
          className={cn(
            "h-4 w-4 text-muted-foreground/60 transition-transform duration-200",
            open && "rotate-180",
          )}
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
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full rounded-xl border border-border/60 bg-popover p-1 shadow-lg animate-in fade-in-0 zoom-in-95 duration-150">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors",
                opt.value === value
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-foreground hover:bg-muted/80",
              )}
            >
              {opt.value === value && (
                <svg
                  className="mr-2 h-3.5 w-3.5 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
              {opt.value !== value && <span className="mr-2 w-3.5" />}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
