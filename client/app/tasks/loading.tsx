
function SkeletonCard() {
    return (
        <div className="animate-pulse rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
                <div className="h-5 w-20 rounded-full bg-muted" />
                <div className="h-5 w-14 rounded-full bg-muted" />
            </div>

            <div className="mb-2 h-4 w-3/4 rounded bg-muted" />

            <div className="mb-1 h-3 w-full rounded bg-muted" />
            <div className="mb-3 h-3 w-2/3 rounded bg-muted" />

            <div className="mb-3 flex gap-1">
                <div className="h-4 w-12 rounded-full bg-muted" />
                <div className="h-4 w-16 rounded-full bg-muted" />
            </div>

            <div className="flex items-center justify-between">
                <div className="h-3 w-24 rounded bg-muted" />
                <div className="h-3 w-16 rounded bg-muted" />
            </div>
        </div>
    );
}


export default function TasksLoading() {
    return (
        <div className="space-y-6">
            <div>
                <div className="h-7 w-24 animate-pulse rounded bg-muted" />
                <div className="mt-2 h-4 w-48 animate-pulse rounded bg-muted" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
            </div>
        </div>
    );
}
