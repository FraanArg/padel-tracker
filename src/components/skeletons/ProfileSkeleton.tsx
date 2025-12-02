
export default function ProfileSkeleton() {
    return (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-pulse">
            {/* Header / Profile Card Skeleton */}
            <div className="bg-white dark:bg-[#202020] rounded-3xl shadow-xl border border-slate-100 dark:border-white/5 p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Avatar */}
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0" />

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left space-y-4 w-full">
                        <div>
                            <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-2 mx-auto md:mx-0" />
                            <div className="h-10 w-64 bg-slate-200 dark:bg-slate-700 rounded mx-auto md:mx-0" />
                            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mt-2 mx-auto md:mx-0" />
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <div className="h-12 w-24 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                            <div className="h-12 w-24 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Health Score Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-[#202020] rounded-3xl p-6 border border-slate-100 dark:border-white/5 h-48">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                            <div className="w-16 h-6 bg-slate-200 dark:bg-slate-700 rounded-full" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                            <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Partner History Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 bg-white dark:bg-[#202020] rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 p-8 h-96">
                    <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-6" />
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-[#202020] rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 p-8 h-96">
                    <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-6" />
                    <div className="space-y-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between">
                                    <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                                    <div className="h-4 w-10 bg-slate-200 dark:bg-slate-700 rounded" />
                                </div>
                                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
