'use client';

import { Match } from '@/lib/padel';
import { Trophy } from 'lucide-react';

interface ShareCardProps {
    match: Match;
    id?: string;
}

export default function ShareCard({ match, id = 'share-card' }: ShareCardProps) {
    return (
        <div id={id} className="w-[600px] h-[315px] bg-gradient-to-br from-slate-900 to-slate-800 p-8 flex flex-col justify-between relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[url('/grid.svg')]"></div>

            {/* Header */}
            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <div className="text-blue-400 font-bold uppercase tracking-widest text-sm mb-1">Match Result</div>
                    <div className="text-white font-black text-2xl max-w-[300px] leading-tight">{match.tournament?.name}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                    <span className="text-white font-bold text-sm">{match.round}</span>
                </div>
            </div>

            {/* Score Board */}
            <div className="relative z-10 flex items-center justify-between mt-4">
                {/* Team 1 */}
                <div className="flex-1">
                    <div className="text-white font-bold text-xl mb-1">{match.team1?.join(' / ')}</div>
                    {match.team1Seed && <div className="text-slate-400 text-sm">Seed {match.team1Seed}</div>}
                </div>

                {/* Score */}
                <div className="mx-8 flex gap-3">
                    {match.score?.map((set, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <div className="text-3xl font-black text-white tracking-tighter">{set}</div>
                        </div>
                    ))}
                </div>

                {/* Team 2 */}
                <div className="flex-1 text-right">
                    <div className="text-white font-bold text-xl mb-1">{match.team2?.join(' / ')}</div>
                    {match.team2Seed && <div className="text-slate-400 text-sm">Seed {match.team2Seed}</div>}
                </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 flex justify-between items-end mt-auto pt-6 border-t border-white/10">
                <div className="flex items-center text-slate-400 text-sm">
                    <Trophy className="w-4 h-4 mr-2" />
                    <span>Padel Tracker</span>
                </div>
                <div className="text-slate-500 text-xs">padeltracker.app</div>
            </div>
        </div>
    );
}
