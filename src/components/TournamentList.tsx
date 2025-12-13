
'use client';

import { useState } from 'react';
import TournamentCard from './TournamentCard';
import { Tournament } from '@/lib/padel';
import SegmentedControl from './ui/SegmentedControl';
import StickyHeader from './ui/StickyHeader';
import EmptyState from './ui/EmptyState';
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

    const tabOptions = [
        {
            value: 'live',
            label: 'Live',
            icon: (
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
            )
        },
        { value: 'upcoming', label: 'Upcoming' },
        { value: 'previous', label: 'Previous' },
    ];

    const handleTabChange = (value: string) => {
        setActiveTab(value as 'live' | 'upcoming' | 'previous');
        setVisibleCount(10);
    };

    return (
        <div className="space-y-6">
            {/* Sticky Segmented Control */}
            <StickyHeader>
                <div className="flex justify-center">
                    <SegmentedControl
                        options={tabOptions}
                        value={activeTab}
                        onChange={handleTabChange}
                        size="md"
                    />
                </div>
            </StickyHeader>

            {/* Live Ticker (Only visible on Live tab) */}
            {activeTab === 'live' && (
                <LiveTicker tournaments={liveTournaments} />
            )}

            {/* Grid */}
            {activeList.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {visibleTournaments.map((tournament) => (
                            <TournamentCard key={tournament.id} tournament={tournament} />
                        ))}
                    </div>

                    {/* Load More */}
                    {hasMore && (
                        <div className="flex justify-center pt-4">
                            <button
                                onClick={() => setVisibleCount(prev => prev + 10)}
                                className="px-6 py-2.5 rounded-full bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-white/15 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                            >
                                Load More
                            </button>
                        </div>
                    )}
                </>
            ) : (
                /* Empty State */
                <EmptyState
                    type="tournament"
                    title={
                        activeTab === 'live' ? 'No live tournaments' :
                            activeTab === 'upcoming' ? 'No upcoming tournaments' :
                                'No past tournaments'
                    }
                    description={
                        activeTab === 'live' ? 'Check back when tournaments are in progress.' :
                            activeTab === 'upcoming' ? 'New tournaments will appear here soon.' :
                                'Past tournament results will be shown here.'
                    }
                />
            )}
        </div>
    );
}
