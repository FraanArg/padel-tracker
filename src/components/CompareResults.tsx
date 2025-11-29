'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Activity, Trophy, TrendingUp, History, Zap, Share2, ArrowLeftRight, MapPin } from 'lucide-react';
import { Player, Match } from '@/lib/padel';
import { H2HResult } from '@/lib/stats';
import { getResultBadgeColor, getResultShort } from '@/lib/utils';
import RivalryCard from '@/components/RivalryCard';
import CommonOpponents from '@/components/CommonOpponents';

const StatsRadar = dynamic(() => import('@/components/StatsRadar'), { ssr: false });

interface ExtendedProfile extends Player {
    recentResults?: { tournament: string; round: string }[];
    winRate?: string;
    currentStreak?: number;
    totalMatches?: number;
    titles?: number;
}

interface CompareResultsProps {
    data: { p1: ExtendedProfile, p2: ExtendedProfile };
    stats: H2HResult | null;
    h2h: Match[];
    rivalryCardRef: React.RefObject<HTMLDivElement | null>;
    handleDownloadCard: () => void;
}

export default function CompareResults({ data, stats, h2h, rivalryCardRef, handleDownloadCard }: CompareResultsProps) {
    const [showHistory, setShowHistory] = useState(false);

    const timelineData = useMemo(() => {
        if (!stats) return [];
        return stats.matches.map(match => {
            const p1Name = data.p1.name || '';
            const isP1Team1 = match.team1?.some(p => p.includes(p1Name)) ?? false;
            let p1Won = false;
            if (match.score && match.score.length > 0) {
                let t1Sets = 0;
                let t2Sets = 0;
                match.score.forEach(s => {
                    const parts = s.replace(/[\(\)]/g, '').trim().split('-');
                    if (parts.length === 2) {
                        const g1 = parseInt(parts[0]);
                        const g2 = parseInt(parts[1]);
                        if (!isNaN(g1) && !isNaN(g2)) {
                            if (g1 > g2) t1Sets++;
                            else if (g2 > g1) t2Sets++;
                        }
                    }
                });
                if (isP1Team1) {
                    p1Won = t1Sets > t2Sets;
                } else {
                    p1Won = t2Sets > t1Sets;
                }
            }
            return { ...match, p1Won };
        });
    }, [stats, data]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[500px]">
            {/* Radar Chart Comparison */}
            <div className="mb-8">
                <StatsRadar
                    player1Name={data.p1.name}
                    player2Name={data.p2.name}
                    stats1={{
                        winRate: parseFloat(data.p1.winRate || '0'),
                        streak: data.p1.currentStreak || 0,
                        titles: data.p1.titles || 0,
                        experience: data.p1.totalMatches || 0,
                        form: parseFloat(data.p1.winRate || '0')
                    }}
                    stats2={{
                        winRate: parseFloat(data.p2.winRate || '0'),
                        streak: data.p2.currentStreak || 0,
                        titles: data.p2.titles || 0,
                        experience: data.p2.totalMatches || 0,
                        form: parseFloat(data.p2.winRate || '0')
                    }}
                />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 text-center">
                {/* P1 Stats */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#202020] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Rank</div>
                        <div className="text-3xl font-black text-slate-900 dark:text-white">#{data.p1.rank}</div>
                    </div>
                    <div className="bg-white dark:bg-[#202020] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Points</div>
                        <div className="text-xl font-bold text-blue-600">{data.p1.points}</div>
                    </div>
                </div>

                {/* Labels */}
                <div className="flex flex-col justify-around py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <div className="flex items-center justify-center"><Trophy className="w-4 h-4 mr-2" /> Ranking</div>
                    <div className="flex items-center justify-center"><Activity className="w-4 h-4 mr-2" /> Points</div>
                </div>

                {/* P2 Stats */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#202020] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Rank</div>
                        <div className="text-3xl font-black text-slate-900 dark:text-white">#{data.p2.rank}</div>
                    </div>
                    <div className="bg-white dark:bg-[#202020] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Points</div>
                        <div className="text-xl font-bold text-blue-600">{data.p2.points}</div>
                    </div>
                </div>
            </div>

            {/* H2H Stats */}
            {stats && (
                <div className="w-full max-w-4xl mt-12">
                    <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-white/5">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-500" />
                                Head to Head Record
                            </h2>
                            <button
                                onClick={() => setShowHistory(true)}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                            >
                                <History className="w-4 h-4" />
                                View History
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{stats.team1Wins}</div>
                                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Wins</div>
                            </div>
                            <div className="flex flex-col items-center px-8">
                                <div className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Total Matches</div>
                                <div className="text-2xl font-bold">{stats.totalMatches}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-red-500 dark:text-red-400">{stats.team2Wins}</div>
                                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Wins</div>
                            </div>
                        </div>

                        {/* Average Match Length */}
                        {stats.averageMatchLength && (
                            <div className="mt-6 flex justify-center gap-8 text-sm text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-lg">
                                    <Activity className="w-4 h-4" />
                                    <span>Avg Sets: <span className="font-bold text-slate-900 dark:text-white">{stats.averageMatchLength.avgSets}</span></span>
                                </div>
                                <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-lg">
                                    <Activity className="w-4 h-4" />
                                    <span>Avg Games: <span className="font-bold text-slate-900 dark:text-white">{stats.averageMatchLength.avgGames}</span></span>
                                </div>
                            </div>
                        )}

                        {/* Big Match Stats */}
                        {stats.bigMatchStats && stats.bigMatchStats.total > 0 && (
                            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-yellow-500" />
                                    Major & P1 Performance
                                </h3>
                                <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="text-sm text-slate-500">Total Big Matches</div>
                                        <div className="font-bold text-slate-900 dark:text-white">{stats.bigMatchStats.total}</div>
                                    </div>

                                    <div className="relative h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden mb-4">
                                        <div
                                            className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-500"
                                            style={{ width: `${(stats.bigMatchStats.team1Wins / stats.bigMatchStats.total) * 100}%` }}
                                        ></div>
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <div>
                                            <div className="font-bold text-slate-900 dark:text-white">{stats.bigMatchStats.team1Wins} Wins</div>
                                            <div className="text-xs text-slate-500">{data?.p1.name}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-slate-900 dark:text-white">{stats.bigMatchStats.team2Wins} Wins</div>
                                            <div className="text-xs text-slate-500">{data?.p2.name}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Visual Timeline */}
                        {stats.matches.length > 0 && (
                            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-blue-500" />
                                    Match Timeline
                                </h3>
                                <div className="relative">
                                    {/* Connecting Line */}
                                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 dark:bg-white/10 -translate-y-1/2 z-0"></div>

                                    <div className="flex items-center justify-between relative z-10 overflow-x-auto pb-4 hide-scrollbar gap-4">
                                        {timelineData.map((match, i) => (
                                            <div key={i} className="flex flex-col items-center gap-2 min-w-[60px] group cursor-pointer">
                                                <div className="text-[10px] font-medium text-slate-400 whitespace-nowrap">
                                                    {match.tournament?.dateStart ? match.tournament.dateStart.split('/')[0] + '/' + match.tournament.dateStart.split('/')[1] : ''}
                                                </div>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-transform group-hover:scale-110 ${match.p1Won
                                                    ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30'
                                                    : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30'
                                                    }`}>
                                                    {match.p1Won ? 'W' : 'L'}
                                                </div>
                                                <div className="text-[10px] font-bold text-slate-600 dark:text-slate-300 max-w-[80px] truncate text-center">
                                                    {getResultShort(match.round || '')}
                                                </div>

                                                {/* Tooltip */}
                                                <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs rounded-lg p-2 w-48 pointer-events-none z-20 shadow-xl">
                                                    <div className="font-bold mb-1">{match.tournament?.name}</div>
                                                    <div className="text-slate-300 mb-1">{match.round}</div>
                                                    <div className="font-mono">{match.score?.join(' ')}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* First Strike Analysis */}
                        {stats.firstSetStats && (
                            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-yellow-500" />
                                    First Strike Analysis
                                </h3>
                                <div className="grid grid-cols-2 gap-8">
                                    {/* Team 1 First Strike */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500 dark:text-slate-400">When winning Set 1</span>
                                            <span className="font-medium text-blue-600 dark:text-blue-400">
                                                {stats.firstSetStats.team1WonFirstSet > 0
                                                    ? `${Math.round((stats.firstSetStats.team1WonMatchAfterFirstSet / stats.firstSetStats.team1WonFirstSet) * 100)}% Win Rate`
                                                    : 'No Data'}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${stats.firstSetStats.team1WonFirstSet > 0
                                                        ? (stats.firstSetStats.team1WonMatchAfterFirstSet / stats.firstSetStats.team1WonFirstSet) * 100
                                                        : 0}%`
                                                }}
                                            />
                                        </div>
                                        <div className="text-xs text-slate-400 text-right">
                                            Won {stats.firstSetStats.team1WonMatchAfterFirstSet} of {stats.firstSetStats.team1WonFirstSet} matches
                                        </div>
                                    </div>

                                    {/* Team 2 First Strike */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500 dark:text-slate-400">When winning Set 1</span>
                                            <span className="font-medium text-red-500 dark:text-red-400">
                                                {stats.firstSetStats.team2WonFirstSet > 0
                                                    ? `${Math.round((stats.firstSetStats.team2WonMatchAfterFirstSet / stats.firstSetStats.team2WonFirstSet) * 100)}% Win Rate`
                                                    : 'No Data'}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-red-500 rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${stats.firstSetStats.team2WonFirstSet > 0
                                                        ? (stats.firstSetStats.team2WonMatchAfterFirstSet / stats.firstSetStats.team2WonFirstSet) * 100
                                                        : 0}%`
                                                }}
                                            />
                                        </div>
                                        <div className="text-xs text-slate-400 text-right">
                                            Won {stats.firstSetStats.team2WonMatchAfterFirstSet} of {stats.firstSetStats.team2WonFirstSet} matches
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Deciding Set Analysis */}
                        {stats.threeSetStats && stats.threeSetStats.total > 0 && (
                            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-purple-500" />
                                    Deciding Set Performance
                                </h3>
                                <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-6 flex items-center justify-between">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.threeSetStats.team1Wins}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Wins</div>
                                    </div>
                                    <div className="flex flex-col items-center px-8">
                                        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">3-Set Matches</div>
                                        <div className="text-xl font-bold">{stats.threeSetStats.total}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-red-500 dark:text-red-400">{stats.threeSetStats.team2Wins}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Wins</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tiebreak Analysis */}
                        {stats.tiebreakStats && stats.tiebreakStats.total > 0 && (
                            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-orange-500" />
                                    Tiebreak Dominance
                                </h3>
                                <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-6 flex items-center justify-between">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.tiebreakStats.team1Wins}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Wins</div>
                                    </div>
                                    <div className="flex flex-col items-center px-8">
                                        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Tiebreaks Played</div>
                                        <div className="text-xl font-bold">{stats.tiebreakStats.total}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-red-500 dark:text-red-400">{stats.tiebreakStats.team2Wins}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Wins</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Round-by-Round Analysis */}
                        {stats.roundStats && Object.keys(stats.roundStats).length > 0 && (
                            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-green-500" />
                                    Round-by-Round Breakdown
                                </h3>
                                <div className="bg-slate-50 dark:bg-white/5 rounded-xl overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400">
                                                <th className="py-3 px-4 text-left font-medium">Round</th>
                                                <th className="py-3 px-4 text-center font-medium">{data.p1.name}</th>
                                                <th className="py-3 px-4 text-center font-medium">{data.p2.name}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                            {['Final', 'Semi-Final', 'Quarter-Final'].map(round => {
                                                const stat = stats.roundStats?.[round];
                                                if (!stat) return null;
                                                return (
                                                    <tr key={round} className="hover:bg-white dark:hover:bg-white/5 transition-colors">
                                                        <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{round}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            <span className={`font-bold ${stat.team1Wins > stat.team2Wins ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>
                                                                {stat.team1Wins}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <span className={`font-bold ${stat.team2Wins > stat.team1Wins ? 'text-red-500 dark:text-red-400' : 'text-slate-500'}`}>
                                                                {stat.team2Wins}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {/* Other Rounds */}
                                            {Object.keys(stats.roundStats).filter(r => !['Final', 'Semi-Final', 'Quarter-Final'].includes(r)).map(round => {
                                                const stat = stats.roundStats?.[round];
                                                if (!stat) return null;
                                                return (
                                                    <tr key={round} className="hover:bg-white dark:hover:bg-white/5 transition-colors">
                                                        <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{round}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            <span className={`font-bold ${stat.team1Wins > stat.team2Wins ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>
                                                                {stat.team1Wins}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <span className={`font-bold ${stat.team2Wins > stat.team1Wins ? 'text-red-500 dark:text-red-400' : 'text-slate-500'}`}>
                                                                {stat.team2Wins}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Total Games Dominance */}
                        {stats.totalGamesStats && stats.totalGamesStats.total > 0 && (
                            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-indigo-500" />
                                    Total Games Dominance
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-blue-600 dark:text-blue-400">
                                            {stats.totalGamesStats.team1Wins} Games ({Math.round((stats.totalGamesStats.team1Wins / stats.totalGamesStats.total) * 100)}%)
                                        </span>
                                        <span className="font-medium text-red-500 dark:text-red-400">
                                            {stats.totalGamesStats.team2Wins} Games ({Math.round((stats.totalGamesStats.team2Wins / stats.totalGamesStats.total) * 100)}%)
                                        </span>
                                    </div>
                                    <div className="h-4 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden flex">
                                        <div
                                            className="h-full bg-blue-500 transition-all duration-500"
                                            style={{
                                                width: `${(stats.totalGamesStats.team1Wins / stats.totalGamesStats.total) * 100}%`
                                            }}
                                        />
                                        <div
                                            className="h-full bg-red-500 transition-all duration-500"
                                            style={{
                                                width: `${(stats.totalGamesStats.team2Wins / stats.totalGamesStats.total) * 100}%`
                                            }}
                                        />
                                    </div>
                                    <div className="text-center text-xs text-slate-400">
                                        Total Games Played: {stats.totalGamesStats.total}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-white dark:bg-[#202020] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 mt-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <History className="w-5 h-5 text-blue-500" />
                                    Head to Head Record
                                </h2>
                                <button
                                    onClick={handleDownloadCard}
                                    className="flex items-center gap-2 text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-lg"
                                >
                                    <Share2 className="w-4 h-4" />
                                    Share Card
                                </button>
                            </div>

                            {/* Hidden Rivalry Card for Generation */}
                            <div className="fixed left-[-9999px] top-[-9999px]">
                                {stats && (
                                    <RivalryCard
                                        ref={rivalryCardRef}
                                        p1={data.p1}
                                        p2={data.p2}
                                        stats={stats}
                                    />
                                )}
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                                Recent Form
                            </h3>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="text-center">
                                    <div className="font-bold mb-3 text-slate-900 dark:text-white">{data.p1.name}</div>
                                    <div className="flex justify-center gap-1 flex-wrap">
                                        {data.p1.recentResults?.slice(0, 5).map((result, j) => (
                                            <div
                                                key={j}
                                                className={`w-10 h-10 flex items-center justify-center rounded-lg border text-sm font-bold ${getResultBadgeColor(result.round)}`}
                                                title={`${result.tournament} - ${result.round}`}
                                            >
                                                {getResultShort(result.round)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="font-bold mb-3 text-slate-900 dark:text-white">{data.p2.name}</div>
                                    <div className="flex justify-center gap-1 flex-wrap">
                                        {data.p2.recentResults?.slice(0, 5).map((result, j) => (
                                            <div
                                                key={j}
                                                className={`w-10 h-10 flex items-center justify-center rounded-lg border text-sm font-bold ${getResultBadgeColor(result.round)}`}
                                                title={`${result.tournament} - ${result.round}`}
                                            >
                                                {getResultShort(result.round)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Common Opponents */}
                        <div className="bg-white dark:bg-[#202020] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 mt-8">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center justify-center">
                                <ArrowLeftRight className="w-5 h-5 mr-2 text-blue-500" />
                                Common Opponents Analysis
                            </h3>
                            <CommonOpponents
                                opponents={stats && (stats as any).commonOpponents ? (stats as any).commonOpponents.slice(0, 5) : []}
                                team1Name={data.p1.name}
                                team2Name={data.p2.name}
                            />
                        </div>

                        {/* Match History Modal */}
                        {showHistory && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                                <div className="bg-white dark:bg-[#202020] w-full max-w-3xl max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                                    <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center">
                                            <History className="w-5 h-5 mr-2 text-blue-500" />
                                            Match History
                                        </h3>
                                        <button
                                            onClick={() => setShowHistory(false)}
                                            className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
                                        >
                                            <span className="sr-only">Close</span>
                                            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="overflow-y-auto p-6 space-y-4">
                                        {h2h.length === 0 ? (
                                            <div className="text-center py-12 text-slate-500">
                                                No matches found for this selection.
                                            </div>
                                        ) : (
                                            h2h.map((match, i) => (
                                                <div key={i} className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/5">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                                                        <div>
                                                            <div className="font-bold text-slate-900 dark:text-white">{match.tournament?.name || 'Unknown Tournament'}</div>
                                                            <div className="text-xs text-slate-500 flex items-center gap-2">
                                                                {match.tournament?.dateStart && <span>{match.tournament.dateStart}</span>}
                                                                {match.round && <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${match.round.toLowerCase().includes('final') ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-200 text-slate-600'
                                                                    }`}>{match.round}</span>}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-mono font-bold text-slate-900 dark:text-white text-lg">
                                                                {match.score?.join(', ')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div className={`p-2 rounded-lg ${match.team1?.some(p => data.p1.name && p.includes(data.p1.name))
                                                            ? 'bg-blue-100/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30'
                                                            : 'bg-white dark:bg-white/5'
                                                            }`}>
                                                            <div className="font-bold text-slate-700 dark:text-slate-200 mb-1">Team 1</div>
                                                            {match.team1?.map((p, idx) => (
                                                                <div key={idx} className="text-slate-600 dark:text-slate-400">{p}</div>
                                                            ))}
                                                        </div>
                                                        <div className={`p-2 rounded-lg ${match.team2?.some(p => data.p1.name && p.includes(data.p1.name))
                                                            ? 'bg-blue-100/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30'
                                                            : 'bg-white dark:bg-white/5'
                                                            }`}>
                                                            <div className="font-bold text-slate-700 dark:text-slate-200 mb-1">Team 2</div>
                                                            {match.team2?.map((p, idx) => (
                                                                <div key={idx} className="text-slate-600 dark:text-slate-400">{p}</div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
