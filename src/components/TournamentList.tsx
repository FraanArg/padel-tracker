
'use client';

import { useState } from 'react';
import TournamentCard from './TournamentCard';
import { Tournament } from '@/lib/padel';
import { cn } from '@/lib/utils';

interface TournamentListProps {
    upcomingTournaments: Tournament[];
    pastTournaments: Tournament[];
}

export default function TournamentList({ upcomingTournaments, pastTournaments }: TournamentListProps) {
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const [visibleCount, setVisibleCount] = useState(10);

    const activeTournaments = activeTab === 'upcoming' ? upcomingTournaments : pastTournaments;
    const visibleTournaments = activeTournaments.slice(0, visibleCount);
    const hasMore = visibleCount < activeTournaments.length;

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 10);
    };

    const handleTabChange = (tab: 'upcoming' | 'past') => {
        setActiveTab(tab);
        setVisibleCount(10); // Reset count on tab change
    };

    return (
        <div className="space-y-8">
            {/* Tabs */}
            <div className="flex items-center space-x-4 border-b border-slate-200 dark:border-slate-800 pb-1">
                <button
                    onClick={() => handleTabChange('upcoming')}
                    className={cn(
                        "pb-3 text-sm font-bold uppercase tracking-wider transition-colors relative",
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
                        "pb-3 text-sm font-bold uppercase tracking-wider transition-colors relative",
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
