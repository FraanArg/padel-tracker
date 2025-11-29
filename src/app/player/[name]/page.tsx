
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trophy, Medal, TrendingUp, Users, MapPin, Activity } from 'lucide-react';

interface PartnerStat {
    name: string;
    matches: number;
}

interface PlayerStats {
    totalMatches: number;
    wins: number;
    losses: number;
    winRate: string;
    titles: number;
    finals: number;
    partners: PartnerStat[];
    currentStreak: number;
    maxStreak: number;
    roundStats: Record<string, { played: number, won: number }>;
}

interface PlayerProfile {
    name: string;
    rank: string;
    points: string;
    country: string;
    imageUrl?: string;
}

export default function PlayerProfilePage() {
    const params = useParams();
    const name = decodeURIComponent(params.name as string);

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<PlayerStats | null>(null);
    const [profile, setProfile] = useState<PlayerProfile | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/player/${encodeURIComponent(name)}/stats`);
                const json = await res.json();
                if (json.stats) setStats(json.stats);
                if (json.profile) setProfile(json.profile);
            } catch (e) {
                console.error('Failed to fetch player data', e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [name]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!stats || !profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
                <div className="text-xl text-slate-500">Player not found</div>
                <Link href="/" className="text-blue-600 hover:underline">Return Home</Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
            {/* Header / Profile Card */}
            <div className="relative overflow-hidden bg-white dark:bg-[#202020] rounded-3xl shadow-xl border border-slate-100 dark:border-white/5 p-8">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    {/* Avatar */}
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-slate-100 dark:bg-slate-800 ring-4 ring-white dark:ring-white/10 shadow-2xl overflow-hidden flex-shrink-0">
                        {profile.imageUrl ? (
                            <img src={profile.imageUrl} alt={profile.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-slate-300">
                                {profile.name.charAt(0)}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div>
                            <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors mb-2">
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Back
                            </Link>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                                {profile.name}
                            </h1>
                            <div className="flex items-center justify-center md:justify-start space-x-4 mt-2 text-slate-500 font-medium">
                                <span className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {profile.country}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <div className="bg-slate-50 dark:bg-white/5 px-4 py-2 rounded-xl border border-slate-100 dark:border-white/5">
                                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Rank</div>
                                <div className="text-xl font-bold text-slate-900 dark:text-white">#{profile.rank}</div>
                            </div>
                            <div className="bg-slate-50 dark:bg-white/5 px-4 py-2 rounded-xl border border-slate-100 dark:border-white/5">
                                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Points</div>
                                <div className="text-xl font-bold text-slate-900 dark:text-white">{profile.points}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">Win Rate</span>
                    </div>
                    <div className="text-3xl font-bold">{stats.winRate}</div>
                    <div className="text-sm text-blue-100 mt-1">{stats.wins}W - {stats.losses}L</div>
                </div>

                <div className="bg-white dark:bg-[#202020] rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                            <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <span className="text-xs font-medium text-slate-400">Titles</span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.titles}</div>
                    <div className="text-sm text-slate-500 mt-1">Tournament Wins</div>
                </div>

                <div className="bg-white dark:bg-[#202020] rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <Medal className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <span className="text-xs font-medium text-slate-400">Finals</span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.finals}</div>
                    <div className="text-sm text-slate-500 mt-1">Finals Reached</div>
                </div>

                <div className="bg-white dark:bg-[#202020] rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-xs font-medium text-slate-400">Matches</span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalMatches}</div>
                    <div className="text-sm text-slate-500 mt-1">Total Played</div>
                </div>

                <div className="bg-white dark:bg-[#202020] rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <Activity className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <span className="text-xs font-medium text-slate-400">Streak</span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.currentStreak} <span className="text-sm font-normal text-slate-400">/ {stats.maxStreak}</span></div>
                    <div className="text-sm text-slate-500 mt-1">Current / Max Wins</div>
                </div>
            </div>

            {/* Partner History */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 bg-white dark:bg-[#202020] rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 p-8">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-blue-500" />
                        Partner History
                    </h3>
                    <div className="space-y-4">
                        {stats.partners.map((partner, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500">
                                        {i + 1}
                                    </div>
                                    <span className="font-medium text-slate-900 dark:text-white">{partner.name}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-2xl font-bold text-slate-900 dark:text-white">{partner.matches}</span>
                                    <span className="text-xs text-slate-500 uppercase font-medium">Matches</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Placeholder for Recent Form or other stats */}
                <div className="bg-white dark:bg-[#202020] rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 p-8">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                        Performance
                    </h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-500">Win Rate</span>
                                <span className="font-bold text-slate-900 dark:text-white">{stats.winRate}</span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{ width: stats.winRate }}
                                />
                            </div>
                        </div>

                        {/* More mini stats can go here */}
                    </div>
                </div>

                {/* Round Performance */}
                <div className="bg-white dark:bg-[#202020] rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 p-8">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                        Round Performance
                    </h3>
                    <div className="space-y-4">
                        {Object.entries(stats.roundStats || {}).map(([round, data]) => (
                            <div key={round}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-500">{round}</span>
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        {data.played > 0 ? Math.round((data.won / data.played) * 100) : 0}%
                                        <span className="text-slate-400 font-normal ml-1">({data.won}/{data.played})</span>
                                    </span>
                                </div>
                                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full"
                                        style={{ width: `${data.played > 0 ? (data.won / data.played) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
