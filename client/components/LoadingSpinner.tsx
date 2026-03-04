import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    label?: string;
    className?: string;
}

const sizeClasses = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-[3px]",
    lg: "h-12 w-12 border-4",
};

export default function LoadingSpinner({
    size = "md",
    label,
    className,
}: LoadingSpinnerProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center gap-3",
                className
            )}
            role="status"
            aria-label={label || "Loading"}
        >
            <div
                className={cn(
                    "animate-spin rounded-full border-muted-foreground/30 border-t-foreground",
                    sizeClasses[size]
                )}
            />
            {label && (
                <p className="text-sm text-muted-foreground">{label}</p>
            )}
        </div>
    );
}
