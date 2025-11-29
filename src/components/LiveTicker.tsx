
'use client';

import { useEffect, useState } from 'react';
import { Tournament, Match, convertMatchTime } from '@/lib/padel';
import { Activity, RefreshCw } from 'lucide-react';

interface LiveTickerProps {
    tournaments: Tournament[];
}

export default function LiveTicker({ tournaments }: LiveTickerProps) {
    const [matches, setMatches] = useState<Match[]>([]);
    const [nextMatches, setNextMatches] = useState<Match[]>([]);
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

                // Filter for strictly active matches
                const activeMatches = data.matches.filter((m: Match) => {
                    const status = m.status?.toLowerCase() || '';
                    const hasScore = m.score && m.score.length > 0;
                    const isSetStatus = status.includes('set');
                    return hasScore || isSetStatus;
                });

                setMatches(activeMatches);

                // Find the next scheduled matches (Earliest Batch Logic)
                let upcoming = data.matches.filter((m: Match) => {
                    const status = m.status?.toLowerCase() || '';
                    const isActive = activeMatches.some((am: Match) =>
                        JSON.stringify(am.team1) === JSON.stringify(m.team1) &&
                        JSON.stringify(am.team2) === JSON.stringify(m.team2)
                    );
                    return !isActive && status !== 'finished';
                });

                // HOTFIX: Manually set time for Brea/Triay match if missing
                // User confirmed it is at 16:00 Local Time (Acapulco)
                upcoming = upcoming.map((m: Match) => {
                    const isBrea = m.team1?.some(p => p.includes('Brea')) || m.team2?.some(p => p.includes('Brea'));
                    const isTriay = m.team1?.some(p => p.includes('Triay')) || m.team2?.some(p => p.includes('Triay'));

                    if (isBrea && isTriay && !m.time) {
                        return { ...m, time: '16:00' };
                    }
                    return m;
                });

                if (upcoming.length > 0) {
                    // Sort by time
                    // Matches with time should come BEFORE matches without time (assuming no time = "followed by" / later)
                    // But wait, "Coming up soon" might be "Next available".
                    // However, user specifically said "all others are continuations" of the 16:00 match.
                    // So we prioritize the one WITH time.
                    upcoming.sort((a: Match, b: Match) => {
                        if (a.time && !b.time) return -1;
                        if (!a.time && b.time) return 1;
                        return (a.time || '').localeCompare(b.time || '');
                    });

                    // Get the time of the very first match
                    const firstTime = upcoming[0].time;

                    // Filter all matches that have this same time
                    // If firstTime is defined, only show matches with that time.
                    // If firstTime is undefined (all are "Coming up soon"), show all of them? 
                    // Or just the first one? User said "if there's more than one... adding horizontally".
                    // But for this specific case, we expect firstTime to be '16:00'.

                    let batch = [];
                    if (firstTime) {
                        batch = upcoming.filter((m: Match) => m.time === firstTime);
                    } else {
                        // If no time is available for ANY match, show all "Coming up soon" ones?
                        // Or just the first one? Let's show all for now, unless user complains.
                        // But in this specific case, Brea will have time, others won't, so Brea will be first and alone.
                        batch = upcoming.filter((m: Match) => !m.time);
                    }

                    setNextMatches(batch);
                } else {
                    setNextMatches([]);
                }

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

            {matches.length === 0 ? (
                <div className="bg-white dark:bg-[#202020] rounded-xl border border-gray-100 dark:border-white/5 shadow-sm p-8 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-400">
                            <RefreshCw className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-slate-900 dark:text-white font-medium">No matches currently live</p>
                            <p className="text-sm text-slate-500">Matches will appear here as soon as they start.</p>
                        </div>

                        {nextMatches.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5 w-full">
                                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-4">Up Next</p>

                                {/* Horizontal Scroll for Up Next Batch */}
                                <div className="flex overflow-x-auto gap-4 justify-center pb-2">
                                    {nextMatches.map((match, idx) => (
                                        <div key={idx} className="flex-none w-64 bg-slate-50 dark:bg-white/5 rounded-lg p-3 text-left border border-gray-100 dark:border-white/5">
                                            <div className="text-sm font-bold text-slate-900 dark:text-white mb-1 truncate">
                                                {match.team1?.map(getSurname).join('/')}
                                            </div>
                                            <div className="text-xs text-slate-400 mb-1">vs</div>
                                            <div className="text-sm font-bold text-slate-900 dark:text-white mb-3 truncate">
                                                {match.team2?.map(getSurname).join('/')}
                                            </div>

                                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono bg-white dark:bg-white/10 px-2 py-1 rounded inline-block w-full text-center">
                                                {(() => {
                                                    const { local, yours } = convertMatchTime(match.time || '', match.timezone || '');
                                                    if (!local) return 'Coming up soon';
                                                    return yours ? (
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-slate-900 dark:text-white">{yours}</span>
                                                            <span className="opacity-75 text-[9px]">Your Time</span>
                                                            <span className="opacity-50 text-[9px] mt-0.5">{local} Local</span>
                                                        </div>
                                                    ) : (
                                                        <span>{local} Local Time</span>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Horizontal Scroll Container */
                <div className="flex overflow-x-auto pb-4 gap-3 snap-x scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                    {matches.map((match, i) => {
                        const { t1: t1Scores, t2: t2Scores } = parseScores(match.score);
                        const isLiveStatus = match.status?.toLowerCase() === 'live';

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
                                    {isLiveStatus && (
                                        <div className="flex flex-col items-end">
                                            <div className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-[10px] font-bold uppercase mb-1">
                                                Live
                                            </div>
                                            {/* Pulse Bar - Mocked for visual */}
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className={`w-1 h-3 rounded-full ${i === 3 ? 'bg-red-500 animate-pulse' : 'bg-red-200'}`}></div>
                                                ))}
                                            </div>
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
                                    <div className="mt-auto pt-3 border-t border-gray-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 -mx-4 -mb-4 px-4 py-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Upcoming on {match.court || 'this court'}</span>
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-mono">
                                                {(() => {
                                                    const { local, yours } = convertMatchTime(match.nextMatch.time || '', match.timezone || '');
                                                    return yours ? `${local} (${yours})` : (local || 'Followed by');
                                                })()}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                                            <div className="flex-1 truncate text-right pr-2">
                                                {match.nextMatch.team1?.map(getSurname).join('/')}
                                            </div>
                                            <div className="px-2 text-slate-400 text-[10px] font-bold">VS</div>
                                            <div className="flex-1 truncate pl-2">
                                                {match.nextMatch.team2?.map(getSurname).join('/')}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
