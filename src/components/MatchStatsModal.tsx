
'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Trophy, AlertCircle } from 'lucide-react';
import { MatchStats } from '@/lib/padel';

interface MatchStatsModalProps {
    isOpen: boolean;
    onClose: () => void;
    matchId: string;
    year: string;
    tournamentId: string;
    organization: string;
}

export default function MatchStatsModal({ isOpen, onClose, matchId, year, tournamentId, organization }: MatchStatsModalProps) {
    const [stats, setStats] = useState<MatchStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            setError(null);
            fetch(`/api/match/${matchId}/stats?year=${year}&tournamentId=${tournamentId}&organization=${organization}`)
                .then(res => {
                    if (!res.ok) throw new Error('Failed to fetch stats');
                    return res.json();
                })
                .then(data => {
                    setStats(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setError('Could not load match statistics.');
                    setLoading(false);
                });
        }
    }, [isOpen, matchId, year, tournamentId, organization]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-white/5">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        Match Statistics
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-6 flex-1">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            <p className="text-slate-500 font-medium">Loading stats...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-red-500" />
                            </div>
                            <p className="text-slate-900 dark:text-white font-medium">{error}</p>
                            <button onClick={onClose} className="text-blue-500 hover:underline text-sm">Close</button>
                        </div>
                    ) : stats ? (
                        <div className="space-y-8">
                            {/* Team Names Header */}
                            <div className="grid grid-cols-3 gap-4 text-center items-center pb-4 border-b border-slate-100 dark:border-white/5">
                                <div className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                    {stats.team1Name}
                                </div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">VS</div>
                                <div className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                    {stats.team2Name}
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="space-y-4">
                                {stats.stats.map((stat, i) => (
                                    <div key={i} className="grid grid-cols-3 gap-4 items-center group">
                                        <div className="text-right font-mono font-bold text-slate-700 dark:text-slate-300 text-lg">
                                            {stat.team1Value}
                                        </div>
                                        <div className="text-center">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-blue-500 transition-colors">
                                                {stat.label}
                                            </span>
                                            {/* Visual Bar */}
                                            <div className="flex h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full mt-1 overflow-hidden">
                                                <div
                                                    className="bg-blue-500 h-full transition-all duration-500"
                                                    style={{ width: '50%' }} // Placeholder width logic needed if values are numeric
                                                ></div>
                                                <div
                                                    className="bg-slate-300 dark:bg-slate-600 h-full transition-all duration-500"
                                                    style={{ width: '50%' }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div className="text-left font-mono font-bold text-slate-700 dark:text-slate-300 text-lg">
                                            {stat.team2Value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
