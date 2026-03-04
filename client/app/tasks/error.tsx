"use client";

import { Button } from "@/components/ui/button";

export default function TasksError({
    error,
    reset,
}: {
    error: Error & { digest?: string }; 
    reset: () => void;                   
}) {
    return (
        <div className="flex flex-col items-center justify-center py-20">
        
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
                <svg
                    className="h-6 w-6 text-red-400"
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

        
            <h2 className="mb-2 text-lg font-semibold text-foreground">
                Something went wrong!
            </h2>
            <p className="mb-6 max-w-md text-center text-sm text-muted-foreground">
                {error.message || "An unexpected error occurred while loading tasks."}
            </p>

        
            <Button onClick={reset} variant="default">
                Try Again
            </Button>
        </div>
    );
}
