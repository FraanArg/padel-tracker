
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
        const parts = fullName.split(' ');
        if (parts.length > 1) {
            if (parts[0].endsWith('.') || parts[0].length === 1) {
                return parts.slice(1).join(' ');
            }
            return parts.slice(1).join(' ');
        }
        return fullName;
    };

    // Helper to parse scores
    const parseScores = (score: string[] | undefined) => {
        if (!score || score.length === 0) return { t1: [], t2: [] };

        const t1: string[] = [];
        const t2: string[] = [];

        score.forEach(set => {
            const parts = set.split('-');
            if (parts.length === 2) {
                t1.push(parts[0]);
                t2.push(parts[1]);
            }
        });

        return { t1, t2 };
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
                {matches.map((match, i) => {
                    const { t1: t1Scores, t2: t2Scores } = parseScores(match.score);

                    return (
                        <div
                            key={i}
                            className="flex-none w-[340px] bg-white dark:bg-[#202020] rounded-xl border border-gray-100 dark:border-white/5 shadow-sm p-4 snap-center flex flex-col justify-between relative overflow-hidden"
                        >
                            {/* Court Name Badge */}
                            <div className="absolute top-0 right-0 bg-slate-100 dark:bg-white/10 px-2 py-1 rounded-bl-lg text-[10px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                                {match.court || 'Court'}
                            </div>

                            <div className="flex justify-between items-start mb-3">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pr-16">
                                    {match.round || 'Match'}
                                </div>
                                {match.status === 'live' && (
                                    <div className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-[10px] font-bold uppercase mr-16">
                                        Live
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between mb-4">
                                {/* Players Column */}
                                <div className="space-y-3 flex-grow min-w-0 pr-4">
                                    {/* Team 1 */}
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

                                    {/* Team 2 */}
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

                                {/* Scores Column */}
                                <div className="flex space-x-1">
                                    {t1Scores.map((s1, idx) => {
                                        const s2 = t2Scores[idx];
                                        const n1 = parseInt(s1);
                                        const n2 = parseInt(s2);
                                        const isT1Winning = !isNaN(n1) && !isNaN(n2) && n1 > n2;
                                        const isT2Winning = !isNaN(n1) && !isNaN(n2) && n2 > n1;

                                        const isCurrentSet = idx === t1Scores.length - 1;
                                        const textColor = isCurrentSet
                                            ? "text-slate-900 dark:text-white"
                                            : "text-slate-400 dark:text-slate-500";

                                        return (
                                            <div key={idx} className="flex flex-col items-center justify-center w-8 space-y-3">
                                                <span className={`text-lg font-mono ${textColor} ${isT1Winning ? 'font-bold' : 'font-medium'}`}>
                                                    {s1}
                                                </span>
                                                <span className={`text-lg font-mono ${textColor} ${isT2Winning ? 'font-bold' : 'font-medium'}`}>
                                                    {s2}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Next Match Section */}
                            {match.nextMatch && (
                                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/5">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Next Match</span>
                                        <span className="text-[10px] text-slate-400">{match.nextMatch.time || 'Followed by'}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                                        <div className="flex items-center space-x-1 truncate">
                                            <span>{match.nextMatch.team1?.map(getSurname).join('/')}</span>
                                        </div>
                                        <span className="px-1 text-slate-300">vs</span>
                                        <div className="flex items-center space-x-1 truncate">
                                            <span>{match.nextMatch.team2?.map(getSurname).join('/')}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
