'use client';

import { Zap, Target, Activity } from 'lucide-react';

interface ClutchStats {
    threeSetWins: number;
    threeSetLosses: number;
    threeSetWinRate: string;
    tiebreakWins: number;
    tiebreakLosses: number;
    tiebreakWinRate: string;
    clutchScore: number;
}

interface GoldenSets {
    won: number;
    lost: number;
}

interface ClutchMeterProps {
    clutchStats: ClutchStats;
    goldenSets: GoldenSets;
}

export default function ClutchMeter({ clutchStats, goldenSets }: ClutchMeterProps) {
    const getClutchRating = (score: number) => {
        if (score >= 80) return { label: 'Elite', color: 'text-yellow-500', bg: 'bg-yellow-500' };
        if (score >= 65) return { label: 'Strong', color: 'text-green-500', bg: 'bg-green-500' };
        if (score >= 50) return { label: 'Average', color: 'text-blue-500', bg: 'bg-blue-500' };
        if (score >= 35) return { label: 'Developing', color: 'text-orange-500', bg: 'bg-orange-500' };
        return { label: 'Needs Work', color: 'text-red-500', bg: 'bg-red-500' };
    };

    const rating = getClutchRating(clutchStats.clutchScore);
    const threeSetTotal = clutchStats.threeSetWins + clutchStats.threeSetLosses;
    const tiebreakTotal = clutchStats.tiebreakWins + clutchStats.tiebreakLosses;

    return (
        <div className="bg-white dark:bg-[#202020] rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-xl">
                    <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="font-bold text-slate-900 dark:text-white">Clutch Performance</h2>
            </div>

            {/* Clutch Score Gauge */}
            <div className="text-center mb-6">
                <div className="relative w-32 h-16 mx-auto mb-2">
                    {/* Background arc */}
                    <div className="absolute inset-0">
                        <svg viewBox="0 0 100 50" className="w-full h-full">
                            <path
                                d="M 10 50 A 40 40 0 0 1 90 50"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="8"
                                strokeLinecap="round"
                                className="text-slate-200 dark:text-white/10"
                            />
                            <path
                                d="M 10 50 A 40 40 0 0 1 90 50"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="8"
                                strokeLinecap="round"
                                className={rating.color}
                                strokeDasharray={`${clutchStats.clutchScore * 1.26} 126`}
                            />
                        </svg>
                    </div>
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white">{clutchStats.clutchScore}</div>
                <div className={`text-sm font-bold ${rating.color} uppercase tracking-wider`}>{rating.label}</div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                {/* 3-Set Matches */}
                <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3 text-center">
                    <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">3-Set Matches</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">
                        {clutchStats.threeSetWins}-{clutchStats.threeSetLosses}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                        {clutchStats.threeSetWinRate}
                    </div>
                </div>

                {/* Tiebreaks */}
                <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3 text-center">
                    <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Tiebreaks</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">
                        {clutchStats.tiebreakWins}-{clutchStats.tiebreakLosses}
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                        {clutchStats.tiebreakWinRate}
                    </div>
                </div>
            </div>

            {/* Golden Sets */}
            {(goldenSets.won > 0 || goldenSets.lost > 0) && (
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-500/10 dark:to-amber-500/10 rounded-xl p-3 border border-yellow-200 dark:border-yellow-500/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                            <span className="text-sm font-medium text-slate-900 dark:text-white">Golden Sets (6-0)</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm">
                                <span className="font-bold text-green-600 dark:text-green-400">{goldenSets.won}</span>
                                <span className="text-slate-400 mx-1">won</span>
                            </span>
                            <span className="text-sm">
                                <span className="font-bold text-red-600 dark:text-red-400">{goldenSets.lost}</span>
                                <span className="text-slate-400 mx-1">lost</span>
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
