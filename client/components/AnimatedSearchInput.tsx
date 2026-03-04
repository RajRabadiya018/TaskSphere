"use client";

import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

const PLACEHOLDERS = ["Search by task name...", "Search by assignee..."];

const CHAR_INTERVAL = 55; 
const PAUSE_DURATION = 2200; 
const ERASE_INTERVAL = 30; 

interface AnimatedSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function AnimatedSearchInput({
  value,
  onChange,
  className,
}: AnimatedSearchInputProps) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFocused = useRef(false);

  const currentText = PLACEHOLDERS[placeholderIndex];

  const animate = useCallback(() => {
    if (isFocused.current || value) return; 

    if (isTyping) {
      if (displayedPlaceholder.length < currentText.length) {
        timerRef.current = setTimeout(() => {
          setDisplayedPlaceholder(
            currentText.slice(0, displayedPlaceholder.length + 1),
          );
        }, CHAR_INTERVAL);
      } else {
        timerRef.current = setTimeout(() => {
          setIsTyping(false);
        }, PAUSE_DURATION);
      }
    } else {
      if (displayedPlaceholder.length > 0) {
        timerRef.current = setTimeout(() => {
          setDisplayedPlaceholder(
            displayedPlaceholder.slice(0, displayedPlaceholder.length - 1),
          );
        }, ERASE_INTERVAL);
      } else {
        setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
        setIsTyping(true);
      }
    }
  }, [displayedPlaceholder, isTyping, currentText, value]);

  useEffect(() => {
    animate();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [animate]);

  const handleFocus = () => {
    isFocused.current = true;
    setDisplayedPlaceholder(currentText); 
  };

  const handleBlur = () => {
    isFocused.current = false;
    if (!value) {
      setDisplayedPlaceholder("");
      setIsTyping(true);
    }
  };

  return (
    <div className={cn("relative group", className)}>
     
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

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={displayedPlaceholder}
        className={cn(
          "w-full h-10 pl-10 pr-10 rounded-xl border bg-card text-sm text-foreground shadow-sm",
          "border-border/50 placeholder:text-muted-foreground/40",
          "outline-none transition-all duration-200",
          "focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:shadow-md",
          "hover:border-border/80",
        )}
      />


      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground/50 transition-colors hover:text-foreground hover:bg-muted"
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
  );
}
