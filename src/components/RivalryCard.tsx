
import React, { forwardRef } from 'react';
import { Trophy, Activity, TrendingUp, MapPin } from 'lucide-react';
import { Player } from '@/lib/padel';
import { H2HResult } from '@/lib/stats';

interface RivalryCardProps {
    p1: Player;
    p2: Player;
    stats: H2HResult;
}

const RivalryCard = forwardRef<HTMLDivElement, RivalryCardProps>(({ p1, p2, stats }, ref) => {
    return (
        <div
            ref={ref}
            className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-3xl w-[600px] shadow-2xl relative overflow-hidden"
            style={{ fontFamily: 'Inter, sans-serif' }}
        >
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -ml-16 -mb-16"></div>

            {/* Header */}
            <div className="flex justify-between items-center mb-8 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-xl tracking-tight">Padel Tracker</span>
                </div>
                <div className="text-sm text-slate-400 font-medium uppercase tracking-wider">Head to Head</div>
            </div>

            {/* Players & Score */}
            <div className="flex items-center justify-between mb-8 relative z-10">
                {/* Player 1 */}
                <div className="flex flex-col items-center w-1/3">
                    <div className="w-24 h-24 rounded-full border-4 border-blue-500/50 p-1 mb-3">
                        {p1.imageUrl ? (
                            <img src={p1.imageUrl} alt={p1.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <div className="w-full h-full rounded-full bg-slate-700 flex items-center justify-center">
                                <span className="text-2xl font-bold">{p1.name.charAt(0)}</span>
                            </div>
                        )}
                    </div>
                    <h2 className="font-bold text-lg text-center leading-tight">{p1.name}</h2>
                    <div className="text-xs text-blue-400 font-medium mt-1">#{p1.rank}</div>
                </div>

                {/* Score */}
                <div className="flex flex-col items-center justify-center w-1/3">
                    <div className="text-6xl font-black tracking-tighter flex items-center gap-4">
                        <span className={stats.team1Wins > stats.team2Wins ? 'text-blue-400' : 'text-white'}>{stats.team1Wins}</span>
                        <span className="text-slate-600 text-4xl">-</span>
                        <span className={stats.team2Wins > stats.team1Wins ? 'text-blue-400' : 'text-white'}>{stats.team2Wins}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-2 uppercase tracking-widest font-medium">Matches</div>
                </div>

                {/* Player 2 */}
                <div className="flex flex-col items-center w-1/3">
                    <div className="w-24 h-24 rounded-full border-4 border-red-500/50 p-1 mb-3">
                        {p2.imageUrl ? (
                            <img src={p2.imageUrl} alt={p2.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <div className="w-full h-full rounded-full bg-slate-700 flex items-center justify-center">
                                <span className="text-2xl font-bold">{p2.name.charAt(0)}</span>
                            </div>
                        )}
                    </div>
                    <h2 className="font-bold text-lg text-center leading-tight">{p2.name}</h2>
                    <div className="text-xs text-red-400 font-medium mt-1">#{p2.rank}</div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 relative z-10">
                {/* Big Matches */}
                <div className="bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-2 mb-2 text-yellow-400">
                        <Trophy className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase">Big Matches</span>
                    </div>
                    <div className="text-2xl font-bold">
                        {stats.bigMatchStats ? `${stats.bigMatchStats.team1Wins} - ${stats.bigMatchStats.team2Wins}` : '0 - 0'}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">Major & P1 Tournaments</div>
                </div>

                {/* Total Games */}
                <div className="bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-2 mb-2 text-green-400">
                        <Activity className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase">Total Games</span>
                    </div>
                    <div className="text-2xl font-bold">
                        {stats.totalGamesStats ? `${stats.totalGamesStats.team1Wins} - ${stats.totalGamesStats.team2Wins}` : '0 - 0'}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">Games Won</div>
                </div>

                {/* Avg Length */}
                <div className="bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-2 mb-2 text-purple-400">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase">Avg Length</span>
                    </div>
                    <div className="text-2xl font-bold">
                        {stats.averageMatchLength ? `${stats.averageMatchLength.avgSets} Sets` : '-'}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                        {stats.averageMatchLength ? `${stats.averageMatchLength.avgGames} Games / Match` : ''}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-[10px] text-slate-500 font-medium tracking-widest uppercase">
                Generated by Padel Tracker
            </div>
        </div>
    );
});

RivalryCard.displayName = 'RivalryCard';

export default RivalryCard;
