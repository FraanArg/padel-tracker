
import { ArrowLeft, Calendar, GitGraph, List } from "lucide-react";

export default function TournamentSkeleton() {
    return (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="w-16 h-4 bg-slate-200 dark:bg-white/10 rounded"></div>

                    {/* View Toggle Skeleton */}
                    <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-lg">
                        <div className="w-8 h-8 bg-slate-200 dark:bg-white/10 rounded-md"></div>
                        <div className="w-8 h-8 bg-slate-200 dark:bg-white/10 rounded-md ml-1"></div>
                    </div>
                </div>

                <div>
                    <div className="h-8 w-3/4 bg-slate-200 dark:bg-white/10 rounded mb-2"></div>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-4 h-4 bg-slate-200 dark:bg-white/10 rounded-full"></div>
                        <div className="w-32 h-4 bg-slate-200 dark:bg-white/10 rounded"></div>
                    </div>
                </div>
            </div>

            {/* Day Tabs Skeleton */}
            <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-24 h-9 bg-slate-200 dark:bg-white/10 rounded-full flex-shrink-0"></div>
                ))}
            </div>

            {/* Matches List Skeleton */}
            <div className="space-y-8">
                {[1, 2].map((court) => (
                    <div key={court} className="space-y-4">
                        {/* Court Header */}
                        <div className="flex items-center gap-2">
                            <div className="w-32 h-6 bg-slate-200 dark:bg-white/10 rounded"></div>
                            <div className="w-24 h-6 bg-slate-200 dark:bg-white/10 rounded-full"></div>
                        </div>

                        {/* Match Cards */}
                        <div className="space-y-4">
                            {[1, 2, 3].map((match) => (
                                <div key={match} className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-3xl p-6 space-y-6">
                                    {/* Header */}
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-2 h-8 bg-slate-200 dark:bg-white/10 rounded-full"></div>
                                            <div className="space-y-1">
                                                <div className="w-16 h-3 bg-slate-200 dark:bg-white/10 rounded"></div>
                                                <div className="w-24 h-3 bg-slate-200 dark:bg-white/10 rounded"></div>
                                            </div>
                                        </div>
                                        <div className="w-16 h-4 bg-slate-200 dark:bg-white/10 rounded"></div>
                                    </div>

                                    {/* Teams */}
                                    <div className="space-y-6">
                                        {/* Team 1 */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex -space-x-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 border-2 border-white dark:border-[#1a1a1a]"></div>
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 border-2 border-white dark:border-[#1a1a1a]"></div>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="w-32 h-5 bg-slate-200 dark:bg-white/10 rounded"></div>
                                                    <div className="w-12 h-3 bg-slate-200 dark:bg-white/10 rounded"></div>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <div className="w-8 h-8 bg-slate-200 dark:bg-white/10 rounded"></div>
                                                <div className="w-8 h-8 bg-slate-200 dark:bg-white/10 rounded"></div>
                                            </div>
                                        </div>

                                        <div className="h-px bg-slate-100 dark:bg-white/5 w-full"></div>

                                        {/* Team 2 */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex -space-x-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 border-2 border-white dark:border-[#1a1a1a]"></div>
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 border-2 border-white dark:border-[#1a1a1a]"></div>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="w-32 h-5 bg-slate-200 dark:bg-white/10 rounded"></div>
                                                    <div className="w-12 h-3 bg-slate-200 dark:bg-white/10 rounded"></div>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <div className="w-8 h-8 bg-slate-200 dark:bg-white/10 rounded"></div>
                                                <div className="w-8 h-8 bg-slate-200 dark:bg-white/10 rounded"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
