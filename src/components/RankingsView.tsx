'use client';

import { useState } from 'react';
import { PlayerRanking } from '@/lib/padel';
import { Trophy, Medal } from 'lucide-react';
import clsx from 'clsx';

export default function RankingsView({ men, women }: { men: PlayerRanking[], women: PlayerRanking[] }) {
    const [activeTab, setActiveTab] = useState<'men' | 'women'>('men');

    const rankings = activeTab === 'men' ? men : women;

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex justify-center">
                <div className="bg-slate-100 dark:bg-white/5 p-1 rounded-full inline-flex">
                    <button
                        onClick={() => setActiveTab('men')}
                        className={clsx(
                            "px-6 py-2 rounded-full text-sm font-bold transition-all",
                            activeTab === 'men'
                                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        )}
                    >
                        Men
                    </button>
                    <button
                        onClick={() => setActiveTab('women')}
                        className={clsx(
                            "px-6 py-2 rounded-full text-sm font-bold transition-all",
                            activeTab === 'women'
                                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        )}
                    >
                        Women
                    </button>
                </div>
            </div>

            {/* Rankings List */}
            <div className="bg-white dark:bg-[#202020] rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400">Rank</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400">Player</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400 text-right">Points</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {rankings.map((player, index) => (
                                <tr key={`${player.name}-${index}`} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className={clsx(
                                            "font-bold text-lg w-8 h-8 flex items-center justify-center rounded-full",
                                            index === 0 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500" :
                                                index === 1 ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400" :
                                                    index === 2 ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-500" :
                                                        "text-slate-500 dark:text-slate-400"
                                        )}>
                                            {player.rank}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            {player.imageUrl ? (
                                                <img
                                                    src={player.imageUrl}
                                                    alt={player.name}
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-slate-200 dark:border-slate-700">
                                                    <Trophy className="w-5 h-5 text-slate-400" />
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-bold text-slate-900 dark:text-white text-base">{player.name}</div>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                    {player.flagUrl && (
                                                        <img src={player.flagUrl} alt={player.country} className="w-4 h-auto rounded-sm shadow-sm" />
                                                    )}
                                                    {player.country}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="font-bold text-slate-900 dark:text-white">{player.points}</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
