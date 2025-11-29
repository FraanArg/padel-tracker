'use client';

import { useState } from 'react';
import PlayerSearch from '@/components/PlayerSearch';
import { ArrowLeftRight, Trophy, TrendingUp, MapPin, Activity, History } from 'lucide-react';
import StatsRadar from '@/components/StatsRadar';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface Player {
    name: string;
    rank: string;
    points: string;
    country: string;
    imageUrl?: string;
}

interface ExtendedProfile extends Player {
    recentResults?: any[];
    winRate?: string;
    currentStreak?: number;
    totalMatches?: number;
    titles?: number;
}

interface H2HMatch {
    tournament?: { name: string };
    score?: string[];
    round?: string;
    date?: string;
}

export default function ComparePage() {
    const [p1, setP1] = useState<Player | null>(null);
    const [p1Partner, setP1Partner] = useState<Player | null>(null);
    const [p2, setP2] = useState<Player | null>(null);
    const [p2Partner, setP2Partner] = useState<Player | null>(null);

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<{ p1: ExtendedProfile, p2: ExtendedProfile } | null>(null);
    const [stats, setStats] = useState<{ team1Wins: number, team2Wins: number, totalMatches: number } | null>(null);
    const [h2h, setH2H] = useState<H2HMatch[]>([]);
    const [loadingH2H, setLoadingH2H] = useState(false);

    const handleCompare = async () => {
        if (!p1 || !p2) return;

        setLoading(true);
        setLoadingH2H(true);
        setData(null);
        setH2H([]);
        setStats(null);

        try {
            // Build query params
            const team1 = [p1.name, p1Partner?.name].filter(Boolean).join(',');
            const team2 = [p2.name, p2Partner?.name].filter(Boolean).join(',');

            // Fetch profiles (just main players for now for the preview)
            const res = await fetch(`/api/match/preview?team1=${encodeURIComponent(p1.name)}&team2=${encodeURIComponent(p2.name)}`);
            const json = await res.json();

            if (json.team1 && json.team2) {
                setData({
                    p1: json.team1[0],
                    p2: json.team2[0]
                });
            }

            setLoading(false);

            // Fetch H2H
            const h2hRes = await fetch(`/api/match/h2h?team1=${encodeURIComponent(team1)}&team2=${encodeURIComponent(team2)}`);
            const h2hJson = await h2hRes.json();
            setH2H(h2hJson.matches || []);
            setStats({
                team1Wins: h2hJson.team1Wins || 0,
                team2Wins: h2hJson.team2Wins || 0,
                totalMatches: h2hJson.totalMatches || 0
            });
        } catch (error) {
            console.error('Comparison failed', error);
        } finally {
            setLoading(false);
            setLoadingH2H(false);
        }
    };

    const getResultBadgeColor = (round: string) => {
        const r = round.toLowerCase();
        if (r.includes('winner') || r.includes('champion')) return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700/30';
        if (r.includes('final')) return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
        if (r.includes('semi')) return 'bg-orange-50 text-orange-800 border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/30';
        return 'bg-gray-50 text-gray-600 border-gray-100 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700/30';
    };

    const getResultShort = (round: string) => {
        const r = round.toLowerCase();
        if (r.includes('winner')) return 'W';
        if (r.includes('final')) return 'F';
        if (r.includes('semi')) return 'SF';
        if (r.includes('quarter')) return 'QF';
        if (r.includes('16')) return 'R16';
        if (r.includes('32')) return 'R32';
        return '-';
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors mb-2">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back
                    </Link>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Head to Head</h1>
                    <p className="text-slate-500 mt-1">Compare players and teams history</p>
                </div>
            </div>

            {/* Selection Area */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-start">
                {/* Team 1 */}
                <div className="md:col-span-3 space-y-4">
                    <div className="bg-white dark:bg-[#202020] p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Player 1</label>
                        <PlayerSearch label="Player 1" onSelect={setP1} selectedPlayer={null} placeholder="Search player..." />
                        {p1 && (
                            <div className="mt-4 flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center font-bold text-blue-600 dark:text-blue-300 mr-3">
                                    {p1.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-white">{p1.name}</div>
                                    <div className="text-xs text-slate-500">Rank #{p1.rank}</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Partner 1 */}
                    <div className="bg-white dark:bg-[#202020] p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Partner (Optional)</label>
                        <PlayerSearch label="Partner (Optional)" onSelect={setP1Partner} selectedPlayer={null} placeholder="Add partner..." />
                        {p1Partner && (
                            <div className="mt-4 flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center font-bold text-blue-600 dark:text-blue-300 mr-3">
                                    {p1Partner.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-white">{p1Partner.name}</div>
                                    <div className="text-xs text-slate-500">Rank #{p1Partner.rank}</div>
                                </div>
                                <button onClick={() => setP1Partner(null)} className="ml-auto text-xs text-red-500 hover:underline">Remove</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* VS */}
                <div className="hidden md:flex flex-col items-center justify-center h-full pt-12">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-300">VS</div>
                </div>

                {/* Team 2 */}
                <div className="md:col-span-3 space-y-4">
                    <div className="bg-white dark:bg-[#202020] p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Player 2</label>
                        <PlayerSearch label="Player 2" onSelect={setP2} selectedPlayer={null} placeholder="Search opponent..." />
                        {p2 && (
                            <div className="mt-4 flex items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800/30">
                                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-800 flex items-center justify-center font-bold text-red-600 dark:text-red-300 mr-3">
                                    {p2.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-white">{p2.name}</div>
                                    <div className="text-xs text-slate-500">Rank #{p2.rank}</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Partner 2 */}
                    <div className="bg-white dark:bg-[#202020] p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Partner (Optional)</label>
                        <PlayerSearch label="Partner (Optional)" onSelect={setP2Partner} selectedPlayer={null} placeholder="Add partner..." />
                        {p2Partner && (
                            <div className="mt-4 flex items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800/30">
                                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-800 flex items-center justify-center font-bold text-red-600 dark:text-red-300 mr-3">
                                    {p2Partner.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-white">{p2Partner.name}</div>
                                    <div className="text-xs text-slate-500">Rank #{p2Partner.rank}</div>
                                </div>
                                <button onClick={() => setP2Partner(null)} className="ml-auto text-xs text-red-500 hover:underline">Remove</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Compare Button */}
            <div className="flex justify-center">
                <button
                    onClick={handleCompare}
                    disabled={!p1 || !p2 || loading}
                    className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold text-lg shadow-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                >
                    {loading ? 'Analyzing...' : 'Compare Head to Head'}
                </button>
            </div>
            <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
                <ArrowLeftRight className="w-6 h-6 mr-2 text-blue-500" />
                Player Comparison
            </h1>
            <div className="w-16"></div> {/* Spacer */}
            <div className="w-16"></div> {/* Spacer */}

            {/* Search Area */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-center bg-white dark:bg-[#202020] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                <PlayerSearch label="Player 1" onSelect={setP1} selectedPlayer={p1} />

                <div className="flex justify-center pt-6 md:pt-0">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-slate-400 font-bold">
                        VS
                    </div>
                </div>

                <PlayerSearch label="Player 2" onSelect={setP2} selectedPlayer={p2} />
            </div>

            {/* Action Button */}
            <div className="flex justify-center">
                <button
                    onClick={handleCompare}
                    disabled={!p1 || !p2 || loading}
                    className={`px-8 py-3 rounded-full font-bold text-white shadow-lg transition-all transform hover:scale-105 active:scale-95 ${!p1 || !p2 ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/30'
                        }`}
                >
                    {loading ? 'Analyzing...' : 'Compare Players'}
                </button>
            </div>

            {/* Results */}
            {
                data && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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

                        {/* Head to Head Stats */}
                        {stats && (
                            <div className="bg-white dark:bg-[#202020] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center justify-center">
                                    <Activity className="w-5 h-5 mr-2 text-blue-500" />
                                    Head to Head Record
                                </h3>
                                {/* Stats */}
                                {stats && (
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl text-center border border-blue-100 dark:border-blue-800/30">
                                            <div className="text-4xl font-black text-blue-600 dark:text-blue-400">{stats.team1Wins}</div>
                                            <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mt-1">Wins</div>
                                        </div>
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="text-slate-400 text-sm font-medium mb-2">Total Matches</div>
                                            <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalMatches}</div>
                                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden flex">
                                                <div className="h-full bg-blue-500" style={{ width: `${stats.totalMatches > 0 ? (stats.team1Wins / stats.totalMatches) * 100 : 0}%` }}></div>
                                                <div className="h-full bg-red-500" style={{ width: `${stats.totalMatches > 0 ? (stats.team2Wins / stats.totalMatches) * 100 : 0}%` }}></div>
                                            </div>
                                        </div>
                                        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl text-center border border-red-100 dark:border-red-800/30">
                                            <div className="text-4xl font-black text-red-600 dark:text-red-400">{stats.team2Wins}</div>
                                            <div className="text-xs font-bold text-red-400 uppercase tracking-wider mt-1">Wins</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Recent Form */}
                        <div className="bg-white dark:bg-[#202020] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
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
                        <div className="bg-white dark:bg-[#202020] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center justify-center">
                                <ArrowLeftRight className="w-5 h-5 mr-2 text-blue-500" />
                                Common Opponents Analysis
                            </h3>
                            <div className="text-center py-8 text-slate-500 bg-gray-50 dark:bg-white/5 rounded-xl">
                                <p className="mb-2">Coming Soon</p>
                                <p className="text-xs">Compare performance against shared rivals like Coello/Tapia or Galan/Chingotto.</p>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
}
