
'use client';

import { useEffect, useState } from 'react';
import { Tournament, Match } from '@/lib/padel';
import { Activity, Trophy, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface LiveTickerProps {
    tournaments: Tournament[];
}

export default function LiveTicker({ tournaments }: LiveTickerProps) {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [bestTournament, setBestTournament] = useState<Tournament | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    // Helper to determine tournament importance
    const getImportance = (name: string) => {
        const n = name.toUpperCase();
        if (n.includes('MAJOR')) return 4;
        if (n.includes('P1')) return 3;
        if (n.includes('P2')) return 2;
        if (n.includes('PLATINUM')) return 1.5;
        return 1;
    };

    useEffect(() => {
        // 1. Select the "Best" live tournament
        const live = tournaments.filter(t => t.status === 'live');
        if (live.length === 0) {
            setLoading(false);
            return;
        }

        // Sort by importance
        const sorted = [...live].sort((a, b) => getImportance(b.name) - getImportance(a.name));
        const selected = sorted[0];
        setBestTournament(selected);

        // 2. Fetch matches
        const fetchMatches = async () => {
            try {
                const res = await fetch(`/api/matches?url=${encodeURIComponent(selected.url)}`);
                const data = await res.json();

                // Filter for active matches if possible, or just show all "Live" ones
                // The scraper might return 'live' status matches.
                // If no status is 'live', maybe show the most recent ones?
                // Let's show matches that are NOT 'finished' or are 'live'
                const activeMatches = data.matches.filter((m: Match) =>
                    m.status?.toLowerCase() === 'live' ||
                    m.status?.toLowerCase().includes('set') ||
                    (m.score && m.score.length > 0 && m.status !== 'finished')
                );

                // If no active matches found, maybe show the last few finished ones?
                // For now, let's stick to active.
                setMatches(activeMatches.length > 0 ? activeMatches : data.matches.slice(0, 5));
                setLastUpdated(new Date());
            } catch (error) {
                console.error('Error fetching live matches:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();

        // Poll every 60 seconds
        const interval = setInterval(fetchMatches, 60000);
        return () => clearInterval(interval);

    }, [tournaments]);

    if (!bestTournament) return null;

    if (loading) {
        return (
            <div className="w-full h-32 bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse flex items-center justify-center mb-8">
                <div className="text-slate-400 text-sm font-medium flex items-center">
                    <Activity className="w-4 h-4 mr-2 animate-spin" />
                    Loading live scores...
                </div>
            </div>
        );
    }

    // Helper to parse name (get surname)
    const getSurname = (fullName: string) => {
        // Remove initial (e.g. "A. Galan" -> "Galan")
        // Also handle "Alejandro Galan" -> "Galan"
        // Usually format is "I. Surname" or "Name Surname"
        const parts = fullName.split(' ');
        if (parts.length > 1) {
            // If first part is an initial (ends with dot or length 1)
            if (parts[0].endsWith('.') || parts[0].length === 1) {
                return parts.slice(1).join(' ');
            }
            // Otherwise return last part? Or everything after first?
            // "Alejandro Galan Romo" -> "Galan Romo"
            return parts.slice(1).join(' ');
        }
        return fullName;
    };

    if (matches.length === 0) return null;

    return (
        <div className="mb-8 space-y-3">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center space-x-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Live Now: <span className="text-blue-600 dark:text-blue-400">{bestTournament.name}</span>
                    </h3>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                    Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>

            {/* Horizontal Scroll Container */}
            <div className="flex overflow-x-auto pb-4 gap-3 snap-x scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                {matches.map((match, i) => (
                    <div
                        key={i}
                        className="flex-none w-[320px] bg-white dark:bg-[#202020] rounded-xl border border-gray-100 dark:border-white/5 shadow-sm p-4 snap-center flex flex-col justify-between"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                {match.round || 'Match'}
                            </div>
                            {match.status === 'live' && (
                                <div className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-[10px] font-bold uppercase">
                                    Live
                                </div>
                            )}
                        </div>

                        <div className="space-y-3 flex-grow">
                            {/* Team 1 */}
                            <div className="flex justify-between items-center">
                                <div className="flex flex-wrap items-center gap-y-1 gap-x-2">
                                    {match.team1?.map((p, idx) => (
                                        <div key={idx} className="flex items-center space-x-1">
                                            {match.team1Flags?.[idx] && (
                                                <img
                                                    src={match.team1Flags[idx]}
                                                    alt="Flag"
                                                    className="w-4 h-3 object-cover rounded-[1px] shadow-sm flex-shrink-0"
                                                />
                                            )}
                                            <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                                                {getSurname(p)}
                                            </span>
                                            {idx < (match.team1?.length || 0) - 1 && <span className="text-slate-400">/</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Team 2 */}
                            <div className="flex justify-between items-center">
                                <div className="flex flex-wrap items-center gap-y-1 gap-x-2">
                                    {match.team2?.map((p, idx) => (
                                        <div key={idx} className="flex items-center space-x-1">
                                            {match.team2Flags?.[idx] && (
                                                <img
                                                    src={match.team2Flags[idx]}
                                                    alt="Flag"
                                                    className="w-4 h-3 object-cover rounded-[1px] shadow-sm flex-shrink-0"
                                                />
                                            )}
                                            <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                                                {getSurname(p)}
                                            </span>
                                            {idx < (match.team2?.length || 0) - 1 && <span className="text-slate-400">/</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Score Display */}
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/5 flex justify-end">
                            <div className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400 tracking-widest">
                                {match.score?.join(' ') || 'vs'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
