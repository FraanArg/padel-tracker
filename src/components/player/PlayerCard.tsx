import React, { forwardRef } from 'react';
import { Trophy, Activity, TrendingUp, MapPin, Star, Award } from 'lucide-react';
import { PlayerStats } from '@/lib/stats';

interface PlayerCardProps {
    player: {
        name: string;
        rank?: string | number;
        points?: string | number;
        imageUrl?: string;
        country?: string;
    };
    stats: PlayerStats;
}

const PlayerCard = forwardRef<HTMLDivElement, PlayerCardProps>(({ player, stats }, ref) => {
    return (
        <div
            ref={ref}
            className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-3xl w-[400px] shadow-2xl relative overflow-hidden"
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
                <div className="text-sm text-slate-400 font-medium uppercase tracking-wider">Season 2024</div>
            </div>

            {/* Player Profile */}
            <div className="flex flex-col items-center mb-8 relative z-10">
                <div className="w-32 h-32 rounded-full border-4 border-blue-500/50 p-1 mb-4 relative">
                    {player.imageUrl ? (
                        <img src={player.imageUrl} alt={player.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <div className="w-full h-full rounded-full bg-slate-700 flex items-center justify-center">
                            <span className="text-4xl font-bold">{player.name.charAt(0)}</span>
                        </div>
                    )}
                    <div className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-slate-900">
                        #{player.rank}
                    </div>
                </div>
                <h2 className="font-bold text-2xl text-center leading-tight mb-1">{player.name}</h2>
                <div className="text-slate-400 font-medium">{player.points} Points</div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 relative z-10">
                {/* Titles */}
                <div className="bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-2 mb-2 text-yellow-400">
                        <Trophy className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase">Titles</span>
                    </div>
                    <div className="text-3xl font-bold">{stats.titles}</div>
                    <div className="text-[10px] text-slate-400 mt-1">Tournament Wins</div>
                </div>

                {/* Win Rate */}
                <div className="bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-2 mb-2 text-green-400">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase">Win Rate</span>
                    </div>
                    <div className="text-3xl font-bold">{stats.winRate}</div>
                    <div className="text-[10px] text-slate-400 mt-1">{stats.wins}W - {stats.losses}L</div>
                </div>

                {/* Finals */}
                <div className="bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-2 mb-2 text-purple-400">
                        <Award className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase">Finals</span>
                    </div>
                    <div className="text-3xl font-bold">{stats.finals}</div>
                    <div className="text-[10px] text-slate-400 mt-1">Final Appearances</div>
                </div>

                {/* Matches */}
                <div className="bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-2 mb-2 text-blue-400">
                        <Activity className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase">Matches</span>
                    </div>
                    <div className="text-3xl font-bold">{stats.totalMatches}</div>
                    <div className="text-[10px] text-slate-400 mt-1">Total Played</div>
                </div>
            </div>

            {/* Best Partner */}
            {stats.partners && stats.partners.length > 0 && (
                <div className="mt-4 bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-white/10 relative z-10 flex items-center justify-between">
                    <div>
                        <div className="text-xs font-bold uppercase text-slate-400 mb-1">Top Partner</div>
                        <div className="font-bold text-lg">{stats.partners[0].name}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-blue-400">{stats.partners[0].matches}</div>
                        <div className="text-[10px] text-slate-400">Matches Together</div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="mt-8 text-center text-[10px] text-slate-500 font-medium tracking-widest uppercase">
                Generated by Padel Tracker
            </div>
        </div>
    );
});

PlayerCard.displayName = 'PlayerCard';

export default PlayerCard;
