
'use client';

import { useState } from 'react';
import TournamentCard from './TournamentCard';
import { Tournament } from '@/lib/padel';
import { cn } from '@/lib/utils';

interface TournamentListProps {
    liveTournaments: Tournament[];
    upcomingTournaments: Tournament[];
    pastTournaments: Tournament[];
}

export default function TournamentList({ liveTournaments, upcomingTournaments, pastTournaments }: TournamentListProps) {
    const [activeTab, setActiveTab] = useState<'live' | 'upcoming' | 'past'>(
        liveTournaments.length > 0 ? 'live' : 'upcoming'
    );
    const [visibleCount, setVisibleCount] = useState(10);

    const getActiveList = () => {
        if (activeTab === 'live') return liveTournaments;
        if (activeTab === 'upcoming') return upcomingTournaments;
        return pastTournaments;
    };

    const activeTournaments = getActiveList();
    const visibleTournaments = activeTournaments.slice(0, visibleCount);
    const hasMore = visibleCount < activeTournaments.length;

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 10);
    };

    const handleTabChange = (tab: 'live' | 'upcoming' | 'past') => {
        setActiveTab(tab);
        setVisibleCount(10); // Reset count on tab change
    };

    return (
        <div className="space-y-8">
            {/* Tabs */}
            <div className="flex items-center space-x-6 border-b border-slate-200 dark:border-slate-800 pb-1 overflow-x-auto">
                <button
                    onClick={() => handleTabChange('live')}
                    className={cn(
                        "pb-3 text-sm font-bold uppercase tracking-wider transition-colors relative flex items-center gap-2 flex-shrink-0",
                        activeTab === 'live'
                            ? "text-red-500"
                            : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    )}
                >
                    <span className="relative flex h-2.5 w-2.5">
                        <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75", activeTab !== 'live' && "hidden")}></span>
                        <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500", activeTab !== 'live' && "bg-slate-400")}></span>
                    </span>
                    Live
                    {activeTab === 'live' && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 rounded-t-full" />
                    )}
                </button>

                <button
                    onClick={() => handleTabChange('upcoming')}
                    className={cn(
                        "pb-3 text-sm font-bold uppercase tracking-wider transition-colors relative flex-shrink-0",
                        activeTab === 'upcoming'
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    )}
                >
                    Upcoming
                    {activeTab === 'upcoming' && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => handleTabChange('past')}
                    className={cn(
                        "pb-3 text-sm font-bold uppercase tracking-wider transition-colors relative flex-shrink-0",
                        activeTab === 'past'
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    )}
                >
                    Previous
                    {activeTab === 'past' && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
                    )}
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {visibleTournaments.map((tournament) => (
                    <TournamentCard key={tournament.id} tournament={tournament} />
                ))}
            </div>

            {/* Empty State */}
            {activeTournaments.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-slate-400 dark:text-slate-500">
                        No {activeTab} tournaments found.
                    </p>
                </div>
            )}

            {/* Load More */}
            {hasMore && (
                <div className="flex justify-center pt-4">
                    <button
                        onClick={handleLoadMore}
                        className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm active:scale-95"
                    >
                        Load More
                    </button>
                </div>
            )}
        </div>
    );
}
