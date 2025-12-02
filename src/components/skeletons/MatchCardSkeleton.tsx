export default function MatchCardSkeleton() {
    return (
        <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm h-[200px] animate-pulse">
            {/* Header */}
            <div className="bg-slate-50 dark:bg-white/5 px-6 py-4 flex justify-between items-center border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center space-x-3">
                    <div className="w-2 h-8 rounded-full bg-slate-200 dark:bg-white/10"></div>
                    <div className="flex flex-col space-y-2">
                        <div className="w-16 h-3 bg-slate-200 dark:bg-white/10 rounded"></div>
                        <div className="w-24 h-2 bg-slate-200 dark:bg-white/10 rounded"></div>
                    </div>
                </div>
                <div className="w-12 h-4 bg-slate-200 dark:bg-white/10 rounded"></div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
                {/* Team 1 */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex -space-x-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 border-2 border-white dark:border-[#1a1a1a]"></div>
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 border-2 border-white dark:border-[#1a1a1a]"></div>
                        </div>
                        <div className="w-32 h-5 bg-slate-200 dark:bg-white/10 rounded"></div>
                    </div>
                    <div className="w-16 h-6 bg-slate-200 dark:bg-white/10 rounded"></div>
                </div>

                <div className="h-px bg-slate-100 dark:bg-white/5 w-full"></div>

                {/* Team 2 */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex -space-x-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 border-2 border-white dark:border-[#1a1a1a]"></div>
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 border-2 border-white dark:border-[#1a1a1a]"></div>
                        </div>
                        <div className="w-32 h-5 bg-slate-200 dark:bg-white/10 rounded"></div>
                    </div>
                    <div className="w-16 h-6 bg-slate-200 dark:bg-white/10 rounded"></div>
                </div>
            </div>
        </div>
    )
}
