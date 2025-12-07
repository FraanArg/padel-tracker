
'use client';


import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trophy, Medal, TrendingUp, Users, MapPin, Activity, Calendar, Share2 } from 'lucide-react';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';
import { CareerTimeline } from '@/components/player/CareerTimeline';
import { PartnerHistory } from '@/components/player/PartnerHistory';
import { StatsDashboard } from '@/components/player/StatsDashboard';
import PlayerCard from '@/components/player/PlayerCard';
import ClutchMeter from '@/components/player/ClutchMeter';
import PartnerChemistry from '@/components/player/PartnerChemistry';
import { CareerTournament, PlayerStats as IPlayerStats } from '@/lib/stats';

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
    const [stats, setStats] = useState<IPlayerStats | null>(null);
    const [timeline, setTimeline] = useState<CareerTournament[]>([]);
    const [profile, setProfile] = useState<PlayerProfile | null>(null);
    const playerCardRef = useRef<HTMLDivElement>(null);

    const handleDownloadCard = async () => {
        if (!playerCardRef.current || !profile) return;

        try {
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(playerCardRef.current, {
                backgroundColor: null,
                scale: 2, // Higher quality
                logging: false,
                useCORS: true // For images
            } as any);

            const link = document.createElement('a');
            link.download = `${profile.name.replace(/\s+/g, '-').toLowerCase()}-card.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error('Failed to generate player card:', err);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/player/${encodeURIComponent(name)}/stats`);
                const json = await res.json();
                if (json.stats) setStats(json.stats);
                if (json.timeline) setTimeline(json.timeline);
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
        return <ProfileSkeleton />;
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
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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

                            <button
                                onClick={handleDownloadCard}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/20"
                            >
                                <Share2 className="w-4 h-4" />
                                Share Card
                            </button>
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

            {/* Hidden Player Card for Generation */}
            <div className="fixed left-[-9999px] top-[-9999px]">
                <PlayerCard
                    ref={playerCardRef}
                    player={profile}
                    stats={stats}
                />
            </div>

            {/* Stats Dashboard */}
            <StatsDashboard stats={stats} />

            {/* Health Score Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Win Rate Card - The "Health Score" */}
                <div className="bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-blue-500/30"></div>

                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-2 bg-white/10 rounded-xl">
                            <Activity className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${parseFloat(stats.winRate) >= 80 ? 'bg-green-500/20 text-green-400' :
                            parseFloat(stats.winRate) >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                            }`}>
                            {parseFloat(stats.winRate) >= 80 ? 'A+' : parseFloat(stats.winRate) >= 70 ? 'A' : parseFloat(stats.winRate) >= 60 ? 'B' : 'C'}
                        </div>
                    </div>

                    <div className="relative z-10">
                        <div className="text-sm text-slate-400 font-medium mb-1">Win Rate</div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black tracking-tight">{stats.winRate}</span>
                            <span className="text-sm text-slate-400 font-medium">
                                {stats.wins}W - {stats.losses}L
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                                style={{ width: stats.winRate }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Titles Card */}
                <div className="bg-white dark:bg-[#202020] rounded-3xl p-6 border border-slate-100 dark:border-white/5 relative overflow-hidden group hover:border-yellow-500/50 transition-colors">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl">
                            <Trophy className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
                        </div>
                        <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-xs font-bold text-slate-500">
                            Titles
                        </div>
                    </div>

                    <div>
                        <div className="text-sm text-slate-500 font-medium mb-1">Championships</div>
                        <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                            {stats.titles}
                        </div>
                        <div className="text-xs text-slate-400 mt-2 font-medium">
                            Tournament Wins
                        </div>
                    </div>
                </div>

                {/* Finals Card */}
                <div className="bg-white dark:bg-[#202020] rounded-3xl p-6 border border-slate-100 dark:border-white/5 relative overflow-hidden group hover:border-purple-500/50 transition-colors">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
                            <Medal className="w-6 h-6 text-purple-600 dark:text-purple-500" />
                        </div>
                        <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-xs font-bold text-slate-500">
                            Finals
                        </div>
                    </div>

                    <div>
                        <div className="text-sm text-slate-500 font-medium mb-1">Finals Reached</div>
                        <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                            {stats.finals}
                        </div>
                        <div className="text-xs text-slate-400 mt-2 font-medium">
                            Runner-up or Winner
                        </div>
                    </div>
                </div>

                {/* Streak Card */}
                <div className="bg-white dark:bg-[#202020] rounded-3xl p-6 border border-slate-100 dark:border-white/5 relative overflow-hidden group hover:border-orange-500/50 transition-colors">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-xl">
                            <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-500" />
                        </div>
                        <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-xs font-bold text-slate-500">
                            Streak
                        </div>
                    </div>

                    <div>
                        <div className="text-sm text-slate-500 font-medium mb-1">Current Form</div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{stats.currentStreak}</span>
                            <span className="text-sm text-slate-400 font-medium">/ {stats.maxStreak} Max</span>
                        </div>

                        {/* Mini Progress for Streak */}
                        <div className="mt-4 flex gap-1 h-1.5">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`flex-1 rounded-full ${i < stats.currentStreak ? 'bg-orange-500' : 'bg-slate-100 dark:bg-white/10'
                                        }`}
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Career Timeline */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-[#202020] rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 p-8">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                            Career Timeline
                        </h3>
                        <CareerTimeline timeline={timeline} />
                    </div>

                    <div className="bg-white dark:bg-[#202020] rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 p-8">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                            <Users className="w-5 h-5 mr-2 text-blue-500" />
                            Partner History
                        </h3>
                        <PartnerHistory partners={stats.partners} />
                    </div>
                </div>

                {/* Right Column: Round Stats & Performance */}
                <div className="space-y-8">
                    {/* Clutch Performance */}
                    {stats.clutchStats && (
                        <ClutchMeter
                            clutchStats={stats.clutchStats}
                            goldenSets={stats.goldenSets}
                        />
                    )}

                    {/* Partner Chemistry */}
                    {stats.partners && stats.partners.length > 0 && (
                        <PartnerChemistry
                            partners={stats.partners}
                            playerName={profile.name}
                        />
                    )}

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
        </div>
    );
}

