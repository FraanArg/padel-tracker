'use client';

import { useState, useEffect } from 'react';
import { Match } from '@/lib/padel';
import { Trophy } from 'lucide-react';

interface BracketProps {
    matches: Match[];
}

export default function Bracket({ matches }: BracketProps) {
    const [activeTab, setActiveTab] = useState<'Men' | 'Women'>('Men');

    // Check if we have matches for both genders to decide if we need tabs
    const hasMen = matches.some(m => m.category === 'Men');
    const hasWomen = matches.some(m => m.category === 'Women');

    // Default to whatever we have if one is missing
    useEffect(() => {
        if (!hasMen && hasWomen) setActiveTab('Women');
    }, [hasMen, hasWomen]);

    const filteredMatches = matches.filter(m => m.category === activeTab);

    // Filter matches by round
    const finals = filteredMatches.filter(m => m.round?.toLowerCase().includes('final') && !m.round?.toLowerCase().includes('semi') && !m.round?.toLowerCase().includes('quarter'));
    const semis = filteredMatches.filter(m => m.round?.toLowerCase().includes('semi'));
    const quarters = filteredMatches.filter(m => m.round?.toLowerCase().includes('quarter'));

    // If no data, don't render
    if (finals.length === 0 && semis.length === 0 && quarters.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-400">No bracket data available for {activeTab}.</p>
            </div>
        );
    }

    const renderMatch = (m: Match, isFinal = false) => {
        const isWinner = m.status === 'finished' || m.score?.some(s => s.includes('6') || s.includes('7')); // Simple heuristic

        return (
            <div className={`bg-white dark:bg-[#202020] border ${isFinal ? 'border-yellow-400 dark:border-yellow-600 shadow-lg shadow-yellow-500/10' : 'border-gray-200 dark:border-white/10'} rounded-xl p-3 w-64 flex flex-col gap-2 relative shrink-0`}>
                {isFinal && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center shadow-sm">
                        <Trophy className="w-3 h-3 mr-1" />
                        CHAMPIONSHIP
                    </div>
                )}
                <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    <span>{m.time || 'TBD'}</span>
                    <span>{m.court || 'Center Court'}</span>
                </div>

                {/* Team 1 */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 truncate">
                        {m.team1Flags?.[0] && <img src={m.team1Flags[0]} className="w-3 h-2 rounded-[1px]" />}
                        <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{m.team1?.map(n => n.split(' ').pop()).join('/')}</span>
                    </div>
                    {/* Score logic would go here */}
                    {m.score && (
                        <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
                            {m.score.map(s => s.split('-')[0]).join(' ')}
                        </div>
                    )}
                </div>

                {/* Team 2 */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 truncate">
                        {m.team2Flags?.[0] && <img src={m.team2Flags[0]} className="w-3 h-2 rounded-[1px]" />}
                        <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{m.team2?.map(n => n.split(' ').pop()).join('/')}</span>
                    </div>
                    {m.score && (
                        <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
                            {m.score.map(s => s.split('-')[1]).join(' ')}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Tabs */}
            {(hasMen && hasWomen) && (
                <div className="flex justify-center">
                    <div className="bg-slate-100 dark:bg-white/5 p-1 rounded-full inline-flex">
                        <button
                            onClick={() => setActiveTab('Men')}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'Men'
                                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                }`}
                        >
                            Men
                        </button>
                        <button
                            onClick={() => setActiveTab('Women')}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'Women'
                                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                }`}
                        >
                            Women
                        </button>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto pb-8">
                <div className="flex items-center gap-16 min-w-max px-8 justify-center">
                    {/* Quarter Finals */}
                    {quarters.length > 0 && (
                        <div className="flex flex-col gap-8 justify-around">
                            <h3 className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Quarter Finals</h3>
                            {quarters.map((m, i) => (
                                <div key={i} className="relative">
                                    {renderMatch(m)}
                                    {/* Connector to next round */}
                                    <div className="absolute top-1/2 -right-8 w-8 h-[1px] bg-gray-300 dark:bg-white/10"></div>
                                    <div className={`absolute top-1/2 -right-8 w-[1px] bg-gray-300 dark:bg-white/10 ${i % 2 === 0 ? 'h-[calc(50%+2rem)] translate-y-0' : 'h-[calc(50%+2rem)] -translate-y-full'}`}></div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Semi Finals */}
                    {semis.length > 0 && (
                        <div className="flex flex-col gap-24 justify-around mt-12">
                            <h3 className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Semi Finals</h3>
                            {semis.map((m, i) => (
                                <div key={i} className="relative">
                                    {renderMatch(m)}
                                    <div className="absolute top-1/2 -right-8 w-8 h-[1px] bg-gray-300 dark:bg-white/10"></div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Final */}
                    {finals.length > 0 && (
                        <div className="flex flex-col justify-center mt-24">
                            <h3 className="text-center text-sm font-bold text-yellow-500 uppercase tracking-widest mb-4">The Final</h3>
                            {finals.map((m, i) => renderMatch(m, true))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
