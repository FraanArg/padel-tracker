import React from 'react';
import { Match } from '@/lib/padel';
import { Trophy, Clock, Zap, Activity } from 'lucide-react';

interface TournamentStatsProps {
    matches: Match[];
}

interface MatchStats {
    match: Match;
    games: number;
}

interface SetStats {
    match: Match;
    score: string;
    games: number;
}

export function TournamentStats({ matches }: TournamentStatsProps) {
    if (!matches || matches.length === 0) {
        return (
            <div className="text-center py-20 bg-white dark:bg-[#202020] rounded-3xl border border-gray-100 dark:border-white/5 border-dashed">
                <p className="text-slate-400 dark:text-slate-500 font-medium">No match data available for stats yet.</p>
            </div>
        );
    }

    // Calculations
    let longestMatch: MatchStats | null = null;
    let shortestMatch: MatchStats | null = null;
    let mostGamesInSet: SetStats | null = null;
    let bagels = 0; // 6-0 or 0-6 sets
    let totalGames = 0;
    let totalSets = 0;
    let threeSetMatches = 0;

    for (const m of matches) {
        if (!m.score || m.score.length === 0) continue;

        let matchGames = 0;
        let matchSets = m.score.length;
        totalSets += matchSets;
        if (matchSets === 3) threeSetMatches++;

        for (const setScore of m.score) {
            // Clean score "6-4" or "7-6(5)"
            const clean = setScore.replace(/\(.*\)/, '').trim();
            const parts = clean.split('-');
            if (parts.length === 2) {
                const s1 = parseInt(parts[0]);
                const s2 = parseInt(parts[1]);

                if (!isNaN(s1) && !isNaN(s2)) {
                    const setGames = s1 + s2;
                    matchGames += setGames;
                    totalGames += setGames;

                    // Most games in set
                    if (!mostGamesInSet || setGames > mostGamesInSet.games) {
                        mostGamesInSet = { match: m, score: setScore, games: setGames };
                    }

                    // Bagels
                    if ((s1 === 6 && s2 === 0) || (s1 === 0 && s2 === 6)) {
                        bagels++;
                    }
                }
            }
        }

        // Longest/Shortest Match (by games)
        if (!longestMatch || matchGames > longestMatch.games) {
            longestMatch = { match: m, games: matchGames };
        }
        if (!shortestMatch || (matchGames > 0 && matchGames < shortestMatch.games)) {
            shortestMatch = { match: m, games: matchGames };
        }
    }

    const formatMatchName = (m: Match) => {
        const t1 = m.team1?.map(p => p.split(' ').pop()).join('/') || 'Team 1';
        const t2 = m.team2?.map(p => p.split(' ').pop()).join('/') || 'Team 2';
        return `${t1} vs ${t2}`;
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Matches */}
                <div className="bg-white dark:bg-[#202020] p-6 rounded-3xl border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-2 mb-2 text-blue-500">
                        <Activity className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-wider">Total Matches</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">{matches.length}</div>
                    <div className="text-xs text-slate-500 mt-1">{totalSets} Sets Played</div>
                </div>

                {/* Avg Games per Match */}
                <div className="bg-white dark:bg-[#202020] p-6 rounded-3xl border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-2 mb-2 text-purple-500">
                        <Clock className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-wider">Avg Length</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">
                        {matches.length > 0 ? (totalGames / matches.length).toFixed(1) : 0}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Games per Match</div>
                </div>

                {/* 3-Setters */}
                <div className="bg-white dark:bg-[#202020] p-6 rounded-3xl border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-2 mb-2 text-orange-500">
                        <Zap className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-wider">3-Set Thrillers</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">{threeSetMatches}</div>
                    <div className="text-xs text-slate-500 mt-1">
                        {matches.length > 0 ? Math.round((threeSetMatches / matches.length) * 100) : 0}% of matches
                    </div>
                </div>

                {/* Bagels */}
                <div className="bg-white dark:bg-[#202020] p-6 rounded-3xl border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-2 mb-2 text-yellow-500">
                        <Trophy className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-wider">Bagels (6-0)</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white">{bagels}</div>
                    <div className="text-xs text-slate-500 mt-1">Sets won to love</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Longest Match */}
                {longestMatch && (
                    <div className="bg-white dark:bg-[#202020] p-6 rounded-3xl border border-slate-100 dark:border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4 text-slate-500">
                                <Activity className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Longest Match</span>
                            </div>
                            <div className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                {formatMatchName(longestMatch.match)}
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg font-mono font-bold text-sm">
                                    {longestMatch.match.score?.join(' ')}
                                </div>
                                <span className="text-sm text-slate-500 font-medium">{longestMatch.games} Games</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Shortest Match */}
                {shortestMatch && (
                    <div className="bg-white dark:bg-[#202020] p-6 rounded-3xl border border-slate-100 dark:border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4 text-slate-500">
                                <Zap className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Quickest Win</span>
                            </div>
                            <div className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                {formatMatchName(shortestMatch.match)}
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg font-mono font-bold text-sm">
                                    {shortestMatch.match.score?.join(' ')}
                                </div>
                                <span className="text-sm text-slate-500 font-medium">{shortestMatch.games} Games</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
