'use client';

import Image from 'next/image';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PlayerSearch from '@/components/PlayerSearch';
import { ArrowLeftRight, Trophy, TrendingUp, MapPin, Activity, History, Zap, Share2 } from 'lucide-react';
import dynamic from 'next/dynamic';
const StatsRadar = dynamic(() => import('@/components/StatsRadar'), { ssr: false });
import RivalryCard from '@/components/RivalryCard';
import CompareSkeleton from '@/components/skeletons/CompareSkeleton';
import Link from 'next/link';
import { Player, Match } from '@/lib/padel';
import { H2HResult } from '@/lib/stats';
import { getResultBadgeColor, getResultShort } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import CompareResults from '@/components/CompareResults';


interface ExtendedProfile extends Player {
    recentResults?: { tournament: string; round: string }[];
    winRate?: string;
    currentStreak?: number;
    totalMatches?: number;
    titles?: number;
}

interface H2HMatch {
    tournament?: { name: string };
    score?: string[];
    round?: string;
    date?: string;
    team1?: string[];
    team2?: string[];
}

import CommonOpponents from '@/components/CommonOpponents';

export default function ComparePage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [p1, setP1] = useState<Player | null>(null);
    const [p1Partner, setP1Partner] = useState<Player | null>(null);
    const [p2, setP2] = useState<Player | null>(null);
    const [p2Partner, setP2Partner] = useState<Player | null>(null);
    const [urlLoaded, setUrlLoaded] = useState(false);

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<{ p1: ExtendedProfile, p2: ExtendedProfile } | null>(null);
    const [stats, setStats] = useState<H2HResult | null>(null);
    const [h2h, setH2H] = useState<Match[]>([]);
    const [loadingH2H, setLoadingH2H] = useState(false);
    const rivalryCardRef = useRef<HTMLDivElement>(null);

    const handleDownloadCard = async () => {
        if (!rivalryCardRef.current) return;

        try {
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(rivalryCardRef.current, {
                backgroundColor: null,
                scale: 2, // Higher quality
                logging: false,
                useCORS: true // For images
            } as any);

            const link = document.createElement('a');
            link.download = `rivalry-${data?.p1.name.split(' ')[1] || 'p1'}-vs-${data?.p2.name.split(' ')[1] || 'p2'}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error('Failed to generate rivalry card:', err);
        }
    };

    const [p1Partners, setP1Partners] = useState<Player[]>([]);
    const [p2Partners, setP2Partners] = useState<Player[]>([]);

    // Generate years dynamically based on current year
    const currentYear = new Date().getFullYear();
    const availableYears = [...Array(4)].map((_, i) => currentYear - i);

    const [year, setYear] = useState<number | 'all'>(currentYear);
    const [showHistory, setShowHistory] = useState(false);

    // Load players from URL params on mount
    useEffect(() => {
        const p1Param = searchParams.get('p1');
        const p2Param = searchParams.get('p2');
        const yearParam = searchParams.get('year');

        if (p1Param) {
            setP1({ name: decodeURIComponent(p1Param) } as Player);
        }
        if (p2Param) {
            setP2({ name: decodeURIComponent(p2Param) } as Player);
        }
        if (yearParam) {
            setYear(yearParam === 'all' ? 'all' : parseInt(yearParam));
        }

        setUrlLoaded(true);
    }, [searchParams]);

    // Auto-compare when loaded from URL
    useEffect(() => {
        if (urlLoaded && p1 && p2 && !data && !loading) {
            handleCompare();
        }
    }, [urlLoaded, p1, p2]);

    // Update URL when comparison is made
    const updateUrl = (player1: Player, player2: Player, selectedYear: number | 'all') => {
        const params = new URLSearchParams();
        params.set('p1', player1.name);
        params.set('p2', player2.name);
        params.set('year', selectedYear.toString());
        router.replace(`/compare?${params.toString()}`, { scroll: false });
    };
    useEffect(() => {
        if (p1) {
            fetch(`/api/player/${encodeURIComponent(p1.name)}/partners`)
                .then(res => res.json())
                .then(data => setP1Partners(data.partners || []))
                .catch(err => console.error('Failed to fetch p1 partners', err));
        } else {
            setP1Partners([]);
        }
    }, [p1]);

    useEffect(() => {
        if (p2) {
            fetch(`/api/player/${encodeURIComponent(p2.name)}/partners`)
                .then(res => res.json())
                .then(data => setP2Partners(data.partners || []))
                .catch(err => console.error('Failed to fetch p2 partners', err));
        } else {
            setP2Partners([]);
        }
    }, [p2]);

    const handleCompare = async () => {
        if (!p1 || !p2) return;

        setLoading(true);
        setLoadingH2H(true);
        setData(null);
        setH2H([]);
        setStats(null);

        // Update URL for sharing
        updateUrl(p1, p2, year);

        try {
            // Build query params
            const team1 = [p1.name, p1Partner?.name].filter(Boolean).join(',');
            const team2 = [p2.name, p2Partner?.name].filter(Boolean).join(',');

            // Fetch profiles (just main players for now for the preview)
            const res = await fetch(`/api/match/preview?team1=${encodeURIComponent(p1.name)}&team2=${encodeURIComponent(p2.name)}&year=${year}`);
            const json = await res.json();

            if (json.team1 && json.team2) {
                setData({
                    p1: json.team1[0],
                    p2: json.team2[0]
                });
            }

            setLoading(false);

            // Fetch H2H
            const h2hRes = await fetch(`/api/match/h2h?team1=${encodeURIComponent(team1)}&team2=${encodeURIComponent(team2)}&year=${year}`);
            const h2hJson = await h2hRes.json();

            setH2H(h2hJson.matches || []);
            setStats({
                matches: h2hJson.matches || [],
                team1Wins: h2hJson.team1Wins,
                team2Wins: h2hJson.team2Wins,
                totalMatches: h2hJson.totalMatches,
                firstSetStats: h2hJson.firstSetStats,
                threeSetStats: h2hJson.threeSetStats,
                tiebreakStats: h2hJson.tiebreakStats,
                roundStats: h2hJson.roundStats,
                totalGamesStats: h2hJson.totalGamesStats,
                averageMatchLength: h2hJson.averageMatchLength
            });
            setLoadingH2H(false);

        } catch (error) {
            console.error('Failed to fetch comparison data', error);
            setLoading(false);
            setLoadingH2H(false);
        }
    };
    const handlePlayerSelect = (player: Player | null, playerNum: 1 | 2) => {
        if (playerNum === 1) {
            setP1(player);
            setP1Partner(null); // Reset partner when main player changes
        } else {
            setP2(player);
            setP2Partner(null); // Reset partner when main player changes
        }
    };

    const timelineData = useMemo(() => {
        if (!stats || !data) return [];
        return stats.matches.map(match => {
            const p1Name = data.p1.name || '';
            const isP1Team1 = match.team1?.some(p => p.includes(p1Name)) ?? false;
            let p1Won = false;
            if (match.score && match.score.length > 0) {
                let t1Sets = 0;
                let t2Sets = 0;
                match.score.forEach(s => {
                    const parts = s.replace(/[\(\)]/g, '').trim().split('-');
                    if (parts.length === 2) {
                        const g1 = parseInt(parts[0]);
                        const g2 = parseInt(parts[1]);
                        if (!isNaN(g1) && !isNaN(g2)) {
                            if (g1 > g2) t1Sets++;
                            else if (g2 > g1) t2Sets++;
                        }
                    }
                });
                if (isP1Team1) {
                    p1Won = t1Sets > t2Sets;
                } else {
                    p1Won = t2Sets > t1Sets;
                }
            }
            return { ...match, p1Won };
        });
    }, [stats, data]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] transition-colors duration-300">


            <main className="container mx-auto px-4 py-8 max-w-5xl">
                <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                        Head to Head
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">
                        Compare players and analyze their rivalry history
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* Player 1 Search */}
                    <div className="bg-white dark:bg-white/5 p-6 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-white/20 backdrop-blur-xl">
                        <PlayerSearch
                            label="Player 1"
                            onSelect={(p) => handlePlayerSelect(p, 1)}
                            selectedPlayer={p1}
                            placeholder="Search player..."
                        />

                        {/* Partner 1 */}
                        <div className="mt-6">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Partner (Optional)</label>
                            <PlayerSearch
                                key={p1Partner ? p1Partner.name : `p1-partner-${p1?.name}`}
                                label="Partner (Optional)"
                                onSelect={setP1Partner}
                                selectedPlayer={p1Partner}
                                placeholder={p1 ? "Select partner..." : "Select player 1 first"}
                                restrictedList={p1 ? p1Partners : undefined}
                            />

                        </div>
                    </div>

                    {/* Player 2 Search */}
                    <div className="bg-white dark:bg-white/5 p-6 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-white/20 backdrop-blur-xl">
                        <PlayerSearch
                            label="Player 2"
                            onSelect={(p) => handlePlayerSelect(p, 2)}
                            selectedPlayer={p2}
                            placeholder="Search opponent..."
                        />

                        {/* Partner 2 */}
                        <div className="mt-6">
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Partner (Optional)</label>
                            <PlayerSearch
                                key={p2Partner ? p2Partner.name : `p2-partner-${p2?.name}`}
                                label="Partner (Optional)"
                                onSelect={setP2Partner}
                                selectedPlayer={p2Partner}
                                placeholder={p2 ? "Select partner..." : "Select player 2 first"}
                                restrictedList={p2 ? p2Partners : undefined}
                            />

                        </div>
                    </div>
                </div>

                {/* Compare Button & Year Selection */}
                <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2 bg-white dark:bg-[#202020] p-1 rounded-lg border border-slate-100 dark:border-white/5">
                        {[...availableYears, 'all' as const].map((y) => (
                            <button
                                key={y}
                                onClick={() => setYear(y as number | 'all')}
                                className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${year === y
                                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                {y === 'all' ? 'All Time' : y}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleCompare}
                        disabled={!p1 || !p2 || loading}
                        className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold text-lg shadow-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {loading ? 'Analyzing...' : 'Compare Head to Head'}
                    </button>
                </div>

                {/* Results */}
                {loading ? (
                    <CompareSkeleton />
                ) : data ? (
                    <CompareResults
                        data={data}
                        stats={stats}
                        h2h={h2h}
                        rivalryCardRef={rivalryCardRef}
                        handleDownloadCard={handleDownloadCard}
                    />
                ) : null}
            </main>
        </div>
    );
}
