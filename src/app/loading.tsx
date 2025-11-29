export default function Loading() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="space-y-4">
                <div className="h-4 w-24 bg-gray-200 dark:bg-white/10 rounded"></div>
                <div className="h-8 w-64 bg-gray-200 dark:bg-white/10 rounded"></div>
            </div>

            {/* Content Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-48 bg-gray-100 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/5"></div>
                ))}
            </div>
        </div>
    );
}
