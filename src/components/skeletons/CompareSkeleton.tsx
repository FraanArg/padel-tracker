export default function CompareSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            {/* Players Header Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Player 1 Skeleton */}
                <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/5">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700" />
                        <div className="space-y-2 flex-1">
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl w-full" />
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl w-full" />
                    </div>
                </div>

                {/* Player 2 Skeleton */}
                <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/5">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700" />
                        <div className="space-y-2 flex-1">
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl w-full" />
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl w-full" />
                    </div>
                </div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5 h-24" />
                ))}
            </div>

            {/* Chart Skeleton */}
            <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/5 h-80" />
        </div>
    );
}
