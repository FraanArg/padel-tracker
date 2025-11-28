'use client';

import { useState } from 'react';
import PlayerSearch from '@/components/PlayerSearch';
import { ArrowLeftRight, Trophy, TrendingUp, MapPin, Activity, History } from 'lucide-react';
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
}

interface H2HMatch {
    tournament?: { name: string };
    score?: string[];
    round?: string;
    date?: string;
}

export default function ComparePage() {
    const [p1, setP1] = useState<Player | null>(null);
    const [p2, setP2] = useState<Player | null>(null);

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<{ p1: ExtendedProfile, p2: ExtendedProfile } | null>(null);
    const [h2h, setH2H] = useState<H2HMatch[]>([]);
    const [loadingH2H, setLoadingH2H] = useState(false);

    const handleCompare = async () => {
        if (!p1 || !p2) return;

        setLoading(true);
        setLoadingH2H(true);
        setData(null);
        setH2H([]);

        try {
            // Fetch profiles
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
            const h2hRes = await fetch(`/api/match/h2h?team1=${encodeURIComponent(p1.name)}&team2=${encodeURIComponent(p2.name)}`);
            const h2hJson = await h2hRes.json();
            setH2H(h2hJson.matches || []);
        } catch (error) {
            console.error('Comparison failed', error);
        } finally {
            setLoading(false);
            setLoadingH2H(false);
        }
    };

    const getResultBadgeColor = (round: string) => {
        const r = round.toLowerCase();
        if (r.includes('winner') || r.includes('champion')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        if (r.includes('final')) return 'bg-slate-100 text-slate-800 border-slate-200';
        if (r.includes('semi')) return 'bg-orange-50 text-orange-800 border-orange-100';
        return 'bg-gray-50 text-gray-600 border-gray-100';
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
                <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back
                </Link>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
                    <ArrowLeftRight className="w-6 h-6 mr-2 text-blue-500" />
                    Player Comparison
                </h1>
                <div className="w-16"></div> {/* Spacer */}
            </div>

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
            {data && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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

                    {/* H2H History */}
                    <div className="bg-white dark:bg-[#202020] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center justify-center">
                            <History className="w-5 h-5 mr-2 text-blue-500" />
                            Head-to-Head History
                        </h3>

                        {loadingH2H ? (
                            <div className="flex flex-col items-center justify-center py-8 text-sm text-slate-500">
                                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                Checking archives...
                            </div>
                        ) : h2h.length > 0 ? (
                            <div className="space-y-4">
                                {h2h.map((m, i) => (
                                    <div key={i} className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                                        <div className="text-center md:text-left">
                                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">{m.tournament?.name}</div>
                                            <div className="text-xs text-slate-400">{m.round}</div>
                                        </div>
                                        <div className="font-mono text-lg font-bold text-slate-900 dark:text-white bg-white dark:bg-black/20 px-4 py-2 rounded-lg border border-gray-100 dark:border-white/5">
                                            {m.score?.join(' ') || 'Score N/A'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500 bg-gray-50 dark:bg-white/5 rounded-xl">
                                No direct matches found in recent history.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
