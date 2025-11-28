
'use client';

import { useState } from 'react';
import TournamentCard from './TournamentCard';
import { Tournament } from '@/lib/padel';
import { cn } from '@/lib/utils';

import LiveTicker from './LiveTicker';

interface TournamentListProps {
    liveTournaments: Tournament[];
    upcomingTournaments: Tournament[];
    pastTournaments: Tournament[];
}

export default function TournamentList({ liveTournaments, upcomingTournaments, pastTournaments }: TournamentListProps) {
    const [activeTab, setActiveTab] = useState<'live' | 'upcoming' | 'previous'>(
        liveTournaments.length > 0 ? 'live' : 'upcoming'
    );
    const [visibleCount, setVisibleCount] = useState(10);

    const getActiveList = () => {
        if (activeTab === 'live') return liveTournaments;
        if (activeTab === 'previous') return pastTournaments;
        return upcomingTournaments;
    };

    const activeList = getActiveList();
    const visibleTournaments = activeList.slice(0, visibleCount);
    const hasMore = visibleCount < activeList.length;

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex space-x-1 overflow-x-auto pb-2 scrollbar-hide">
                <button
                    onClick={() => { setActiveTab('live'); setVisibleCount(10); }}
                    className={`
                        relative px-4 py-2 rounded-full text-sm font-bold transition-all flex-shrink-0 flex items-center
                        ${activeTab === 'live'
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                            : 'bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10'}
                    `}
                >
                    {/* Pulsating Dot for Live Tab */}
                    <span className="relative flex h-2 w-2 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    LIVE
                </button>
                <button
                    onClick={() => { setActiveTab('upcoming'); setVisibleCount(10); }}
                    className={`
                        px-4 py-2 rounded-full text-sm font-bold transition-all flex-shrink-0
                        ${activeTab === 'upcoming'
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                            : 'bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10'}
                    `}
                >
                    UPCOMING
                </button>
                <button
                    onClick={() => { setActiveTab('previous'); setVisibleCount(10); }}
                    className={`
                        px-4 py-2 rounded-full text-sm font-bold transition-all flex-shrink-0
                        ${activeTab === 'previous'
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                            : 'bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10'}
                    `}
                >
                    PREVIOUS
                </button>
            </div>

            {/* Live Ticker (Only visible on Live tab) */}
            {activeTab === 'live' && (
                <LiveTicker tournaments={liveTournaments} />
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {visibleTournaments.map((tournament) => (
                    <TournamentCard key={tournament.id} tournament={tournament} />
                ))}
            </div>

            {/* Empty State */}
            {activeList.length === 0 && (
                <div className="text-center py-12 bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                    <p className="text-slate-500 font-medium">No tournaments found in this section.</p>
                </div>
            )}

            {/* Load More */}
            {hasMore && (
                <div className="flex justify-center pt-4">
                    <button
                        onClick={() => setVisibleCount(prev => prev + 10)}
                        className="px-6 py-2 rounded-full bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-sm font-bold text-slate-600 dark:text-white hover:bg-gray-50 dark:hover:bg-white/20 transition-colors shadow-sm"
                    >
                        Load More
                    </button>
                </div>
            )}
        </div>
    );
}
