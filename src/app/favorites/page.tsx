'use client';

import { useEffect, useState } from 'react';
import { useFavorites } from '@/context/FavoritesContext';
import Link from 'next/link';
import { ArrowLeft, Star, Loader2 } from 'lucide-react';
import MatchCard from '@/components/MatchCard';

export default function FavoritesPage() {
    const { favorites, toggleFavorite } = useFavorites();
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (favorites.length > 0) {
            fetchMatches(favorites);
        } else {
            setMatches([]);
            setLoading(false);
        }
    }, [favorites]);

    const fetchMatches = async (favs: string[]) => {
        setLoading(true);
        try {
            const res = await fetch('/api/matches/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ favorites: favs })
            });
            const data = await res.json();
            setMatches(data.matches || []);
        } catch (error) {
            console.error('Error fetching favorite matches:', error);
        } finally {
            setLoading(false);
        }
    };

    const removeFavorite = (player: string) => {
        toggleFavorite(player, player);
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/" className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </Link>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Favorites</h1>
            </div>

            {/* Favorites List */}
            <div className="bg-white dark:bg-[#202020] p-6 rounded-xl shadow-sm border border-slate-100 dark:border-white/5">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-slate-100">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    Following Players
                </h2>
                {favorites.length === 0 ? (
                    <p className="text-slate-500 dark:text-slate-400">You haven't added any favorite players yet.</p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {favorites.map(player => (
                            <div key={player} className="bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                {player}
                                <button
                                    onClick={() => removeFavorite(player)}
                                    className="text-slate-400 hover:text-red-500 font-bold"
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Matches List */}
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Upcoming Matches</h2>
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                ) : matches.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-[#202020] rounded-xl border border-slate-100 dark:border-white/5">
                        <p className="text-slate-500 dark:text-slate-400">No matches found for your favorite players.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {matches.map((match, i) => (
                            <div key={i} className="relative">
                                <div className="absolute -top-3 left-4 bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-sm z-10">
                                    {match.tournament.name}
                                </div>
                                <MatchCard match={match} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
