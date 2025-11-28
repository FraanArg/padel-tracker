'use client';

import { useState, useEffect } from 'react';
import { X, Trophy, TrendingUp, Activity } from 'lucide-react';
import { Match, PlayerRanking, TournamentResult } from '@/lib/padel';

interface MatchPreviewProps {
    match: Match;
}

interface PreviewData {
    team1: (PlayerRanking & { recentResults: TournamentResult[] })[];
    team2: (PlayerRanking & { recentResults: TournamentResult[] })[];
}

export default function MatchPreview({ match }: MatchPreviewProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<PreviewData | null>(null);

    const [h2hMatches, setH2HMatches] = useState<Match[]>([]);
    const [loadingH2H, setLoadingH2H] = useState(false);

    const openPreview = async () => {
        setIsOpen(true);
        if (!data && !loading) {
            setLoading(true);
            setLoadingH2H(true);
            try {
                const t1 = match.team1?.join(',') || '';
                const t2 = match.team2?.join(',') || '';

                // Fetch profile data
                const res = await fetch(`/api/match/preview?team1=${encodeURIComponent(t1)}&team2=${encodeURIComponent(t2)}`);
                const json = await res.json();
                setData(json);
                setLoading(false);

                // Fetch H2H data
                const h2hRes = await fetch(`/api/match/h2h?team1=${encodeURIComponent(t1)}&team2=${encodeURIComponent(t2)}`);
                const h2hJson = await h2hRes.json();
                setH2HMatches(h2hJson.matches || []);
            } catch (error) {
                console.error('Failed to load preview', error);
                setLoading(false);
            } finally {
                setLoadingH2H(false);
            }
        }
    };

    const getAvgRank = (profiles: PlayerRanking[]) => {
        if (!profiles.length) return '-';
        const sum = profiles.reduce((acc, p) => acc + (parseInt(p.rank) || 100), 0);
        return Math.round(sum / profiles.length);
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
        <>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openPreview();
                }}
                className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
            >
                <Activity className="w-3 h-3 mr-1" />
                H2H
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
                    <div
                        className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                                <Activity className="w-5 h-5 mr-2 text-blue-500" />
                                Match Preview
                            </h3>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-8">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-sm text-slate-500">Analyzing recent form...</p>
                                </div>
                            ) : data ? (
                                <>
                                    {/* Teams Comparison */}
                                    <div className="grid grid-cols-2 gap-8">
                                        {/* Team 1 */}
                                        <div className="text-center space-y-4">
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white text-lg">{match.team1?.join(' / ')}</h4>
                                                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-sm font-medium text-slate-600 dark:text-slate-300">
                                                    <Trophy className="w-3 h-3 mr-1.5" />
                                                    Avg Rank: {getAvgRank(data.team1)}
                                                </div>
                                            </div>

                                            {/* Recent Form */}
                                            <div className="space-y-3">
                                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recent Form</p>
                                                {data.team1.map((player, i) => (
                                                    <div key={i} className="bg-gray-50 dark:bg-white/5 rounded-lg p-3 text-left">
                                                        <div className="text-xs font-medium text-slate-500 mb-2">{player.name}</div>
                                                        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                                                            {player.recentResults?.slice(0, 5).map((result, j) => (
                                                                <div
                                                                    key={j}
                                                                    className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded border text-xs font-bold ${getResultBadgeColor(result.round)}`}
                                                                    title={`${result.tournament} - ${result.round}`}
                                                                >
                                                                    {getResultShort(result.round)}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Team 2 */}
                                        <div className="text-center space-y-4">
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white text-lg">{match.team2?.join(' / ')}</h4>
                                                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-sm font-medium text-slate-600 dark:text-slate-300">
                                                    <Trophy className="w-3 h-3 mr-1.5" />
                                                    Avg Rank: {getAvgRank(data.team2)}
                                                </div>
                                            </div>

                                            {/* Recent Form */}
                                            <div className="space-y-3">
                                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recent Form</p>
                                                {data.team2.map((player, i) => (
                                                    <div key={i} className="bg-gray-50 dark:bg-white/5 rounded-lg p-3 text-left">
                                                        <div className="text-xs font-medium text-slate-500 mb-2">{player.name}</div>
                                                        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                                                            {player.recentResults?.slice(0, 5).map((result, j) => (
                                                                <div
                                                                    key={j}
                                                                    className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded border text-xs font-bold ${getResultBadgeColor(result.round)}`}
                                                                    title={`${result.tournament} - ${result.round}`}
                                                                >
                                                                    {getResultShort(result.round)}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* H2H History */}
                                    <div className="pt-6 border-t border-gray-100 dark:border-white/5">
                                        <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                                            <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
                                            Head-to-Head History
                                        </h4>

                                        {loadingH2H ? (
                                            <div className="flex items-center justify-center py-8 text-sm text-slate-500">
                                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                                                Checking past tournaments...
                                            </div>
                                        ) : h2hMatches.length > 0 ? (
                                            <div className="space-y-3">
                                                {h2hMatches.map((m, i) => (
                                                    <div key={i} className="bg-gray-50 dark:bg-white/5 rounded-lg p-3 flex items-center justify-between">
                                                        <div className="text-xs font-bold text-slate-500 uppercase">{m.tournament?.name}</div>
                                                        <div className="flex items-center gap-3 font-mono text-sm font-bold">
                                                            <span className={m.score && m.score[0] ? 'text-slate-900 dark:text-white' : 'text-slate-400'}>
                                                                {m.score?.join(' ') || 'Score N/A'}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs font-medium text-slate-400">{m.round}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 text-sm text-slate-500 bg-gray-50 dark:bg-white/5 rounded-lg">
                                                No direct matches found in recent tournaments.
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-8 text-slate-500">
                                    No data available for these players.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
