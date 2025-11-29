
import React from 'react';
import { Users, Trophy, XCircle } from 'lucide-react';

interface CommonOpponentStats {
    opponent: string;
    team1Stats: { wins: number; losses: number; total: number };
    team2Stats: { wins: number; losses: number; total: number };
}

interface CommonOpponentsProps {
    opponents: CommonOpponentStats[];
    team1Name: string;
    team2Name: string;
}

export default function CommonOpponents({ opponents, team1Name, team2Name }: CommonOpponentsProps) {
    if (!opponents || opponents.length === 0) {
        return (
            <div className="text-center py-8 text-slate-500 bg-gray-50 dark:bg-white/5 rounded-xl">
                <p className="mb-2">No common opponents found.</p>
                <p className="text-xs">These teams haven't played against the same pairs yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="grid grid-cols-3 gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-2">
                <div>{team1Name}</div>
                <div>Opponent</div>
                <div>{team2Name}</div>
            </div>

            {/* List */}
            <div className="space-y-2">
                {opponents.map((opp, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-4 items-center bg-white dark:bg-[#252525] p-4 rounded-xl border border-slate-100 dark:border-white/5 hover:border-blue-500/30 transition-colors">

                        {/* Team 1 Stats */}
                        <div className="flex justify-center items-center gap-3">
                            <div className="flex flex-col items-center">
                                <span className={`text-lg font-black ${opp.team1Stats.wins > opp.team1Stats.losses ? 'text-green-500' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {opp.team1Stats.wins}
                                </span>
                                <span className="text-[10px] text-slate-400">W</span>
                            </div>
                            <div className="h-8 w-px bg-slate-100 dark:bg-white/10"></div>
                            <div className="flex flex-col items-center">
                                <span className={`text-lg font-black ${opp.team1Stats.losses > opp.team1Stats.wins ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {opp.team1Stats.losses}
                                </span>
                                <span className="text-[10px] text-slate-400">L</span>
                            </div>
                        </div>

                        {/* Opponent Name */}
                        <div className="text-center">
                            <div className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                                {opp.opponent}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-1">
                                {opp.team1Stats.total + opp.team2Stats.total} Total Matches
                            </div>
                        </div>

                        {/* Team 2 Stats */}
                        <div className="flex justify-center items-center gap-3">
                            <div className="flex flex-col items-center">
                                <span className={`text-lg font-black ${opp.team2Stats.wins > opp.team2Stats.losses ? 'text-green-500' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {opp.team2Stats.wins}
                                </span>
                                <span className="text-[10px] text-slate-400">W</span>
                            </div>
                            <div className="h-8 w-px bg-slate-100 dark:bg-white/10"></div>
                            <div className="flex flex-col items-center">
                                <span className={`text-lg font-black ${opp.team2Stats.losses > opp.team2Stats.wins ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {opp.team2Stats.losses}
                                </span>
                                <span className="text-[10px] text-slate-400">L</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
