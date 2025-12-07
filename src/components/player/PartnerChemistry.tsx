'use client';

import { Users, Trophy, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface Partner {
    name: string;
    matches: number;
    wins: number;
    winRate: string;
}

interface PartnerChemistryProps {
    partners: Partner[];
    playerName: string;
}

export default function PartnerChemistry({ partners, playerName }: PartnerChemistryProps) {
    // Get top 5 partners by matches played
    const topPartners = partners.slice(0, 5);

    if (topPartners.length === 0) {
        return null;
    }

    const getChemistryLevel = (winRate: number) => {
        if (winRate >= 70) return { label: 'Excellent', color: 'bg-green-500', textColor: 'text-green-600' };
        if (winRate >= 55) return { label: 'Good', color: 'bg-blue-500', textColor: 'text-blue-600' };
        if (winRate >= 45) return { label: 'Average', color: 'bg-yellow-500', textColor: 'text-yellow-600' };
        return { label: 'Developing', color: 'bg-orange-500', textColor: 'text-orange-600' };
    };

    return (
        <div className="bg-white dark:bg-[#202020] rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-xl">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="font-bold text-slate-900 dark:text-white">Partner Chemistry</h2>
            </div>

            <div className="space-y-3">
                {topPartners.map((partner, idx) => {
                    const winRateNum = parseFloat(partner.winRate);
                    const chemistry = getChemistryLevel(winRateNum);

                    return (
                        <div
                            key={partner.name}
                            className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full ${idx === 0 ? 'bg-yellow-100 dark:bg-yellow-500/20' : 'bg-slate-200 dark:bg-white/10'} flex items-center justify-center`}>
                                        {idx === 0 ? (
                                            <Trophy className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                        ) : (
                                            <span className="text-sm font-bold text-slate-500">{idx + 1}</span>
                                        )}
                                    </div>
                                    <Link
                                        href={`/player/${encodeURIComponent(partner.name)}`}
                                        className="font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    >
                                        {partner.name}
                                    </Link>
                                </div>
                                <div className={`text-sm font-bold ${chemistry.textColor} dark:text-opacity-90`}>
                                    {partner.winRate}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex-grow">
                                    <div className="h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${chemistry.color} transition-all duration-500`}
                                            style={{ width: `${winRateNum}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                    <span className="font-bold text-slate-700 dark:text-slate-300">{partner.wins}</span>W -
                                    <span className="font-bold text-slate-700 dark:text-slate-300">{partner.matches - partner.wins}</span>L
                                    <span className="ml-1">({partner.matches} matches)</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {partners.length > 5 && (
                <div className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
                    +{partners.length - 5} more partners
                </div>
            )}
        </div>
    );
}
