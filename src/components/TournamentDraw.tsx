'use client';

import { useState, useMemo } from 'react';
import { Match } from '@/lib/padel';
import Link from 'next/link';

interface TournamentDrawProps {
    matches: Match[];
}

const ROUND_ORDER = [
    'Q1', 'Q2', 'Q3', 'Qualifying',
    'Round of 64', 'Round of 32', 'Round of 16',
    'Quarter Final', 'Quarterfinals',
    'Semi Final', 'Semifinals',
    'Final'
];

export default function TournamentDraw({ matches }: TournamentDrawProps) {
    const [category, setCategory] = useState<'Men' | 'Women'>('Men');

    // Filter and group matches
    const { rounds, sortedRoundNames } = useMemo(() => {
        const filtered = matches.filter(m => m.category === category);

        const grouped: Record<string, Match[]> = {};
        filtered.forEach(m => {
            const r = m.round || 'Unknown';
            if (!grouped[r]) grouped[r] = [];
            grouped[r].push(m);
        });

        const names = Object.keys(grouped).sort((a, b) => {
            const indexA = ROUND_ORDER.findIndex(r => a.includes(r));
            const indexB = ROUND_ORDER.findIndex(r => b.includes(r));
            return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
        });

        return { rounds: grouped, sortedRoundNames: names };
    }, [matches, category]);

    return (
        <div className="space-y-6">
            {/* Category Tabs */}
            <div className="flex justify-center">
                <div className="bg-gray-100 dark:bg-white/5 p-1 rounded-xl inline-flex">
                    {(['Men', 'Women'] as const).map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${category === cat
                                    ? 'bg-white dark:bg-white/10 text-black dark:text-white shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Draw Visualization */}
            <div className="overflow-x-auto pb-8 -mx-4 px-4">
                <div className="flex gap-8 min-w-max">
                    {sortedRoundNames.map(round => (
                        <div key={round} className="w-72 flex flex-col gap-4">
                            <h3 className="text-center font-bold text-slate-900 dark:text-white sticky left-0">
                                {round}
                            </h3>
                            <div className="flex flex-col gap-4">
                                {rounds[round].map((match, i) => (
                                    <div key={i} className="bg-white dark:bg-[#202020] border border-gray-100 dark:border-white/5 rounded-xl p-3 shadow-sm text-sm">
                                        {/* Team 1 */}
                                        <div className="flex justify-between items-center mb-2">
                                            <span className={`font-semibold ${match.score && match.score[0] && parseInt(match.score[0].split('-')[0]) > parseInt(match.score[0].split('-')[1]) ? 'text-black dark:text-white' : 'text-gray-500'}`}>
                                                {match.team1?.join(' / ')}
                                            </span>
                                            {match.score && (
                                                <span className="font-mono text-xs bg-gray-50 dark:bg-white/5 px-1 rounded">
                                                    {match.score.map(s => s.split('-')[0]).join(' ')}
                                                </span>
                                            )}
                                        </div>
                                        {/* Team 2 */}
                                        <div className="flex justify-between items-center">
                                            <span className={`font-semibold ${match.score && match.score[0] && parseInt(match.score[0].split('-')[1]) > parseInt(match.score[0].split('-')[0]) ? 'text-black dark:text-white' : 'text-gray-500'}`}>
                                                {match.team2?.join(' / ')}
                                            </span>
                                            {match.score && (
                                                <span className="font-mono text-xs bg-gray-50 dark:bg-white/5 px-1 rounded">
                                                    {match.score.map(s => s.split('-')[1]).join(' ')}
                                                </span>
                                            )}
                                        </div>
                                        {!match.score && (
                                            <div className="mt-2 text-xs text-center text-gray-400">
                                                {match.time || 'Scheduled'}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
