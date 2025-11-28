'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, User } from 'lucide-react';

interface Player {
    name: string;
    rank: string;
    points: string;
    country: string;
    imageUrl?: string;
}

interface PlayerSearchProps {
    label: string;
    onSelect: (player: Player | null) => void;
    selectedPlayer: Player | null;
}

export default function PlayerSearch({ label, onSelect, selectedPlayer }: PlayerSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Player[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2) {
                setLoading(true);
                try {
                    const res = await fetch(`/api/players/search?q=${encodeURIComponent(query)}`);
                    const data = await res.json();
                    setResults(data.players || []);
                    setIsOpen(true);
                } catch (error) {
                    console.error('Search failed', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    if (selectedPlayer) {
        return (
            <div className="w-full">
                <label className="block text-sm font-medium text-slate-500 mb-1">{label}</label>
                <div className="relative flex items-center p-3 bg-white dark:bg-white/5 border border-blue-200 dark:border-blue-500/30 rounded-xl shadow-sm">
                    {selectedPlayer.imageUrl ? (
                        <img src={selectedPlayer.imageUrl} alt={selectedPlayer.name} className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-100" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                            <User className="w-5 h-5 text-blue-500" />
                        </div>
                    )}
                    <div className="flex-1">
                        <div className="font-bold text-slate-900 dark:text-white">{selectedPlayer.name}</div>
                        <div className="text-xs text-slate-500">Rank #{selectedPlayer.rank} • {selectedPlayer.country}</div>
                    </div>
                    <button
                        onClick={() => {
                            onSelect(null);
                            setQuery('');
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full relative" ref={wrapperRef}>
            <label className="block text-sm font-medium text-slate-500 mb-1">{label}</label>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                    placeholder="Search player..."
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                />
                {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                    {results.map((player, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                onSelect(player);
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center p-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left border-b border-gray-50 dark:border-white/5 last:border-0"
                        >
                            {player.imageUrl ? (
                                <img src={player.imageUrl} alt={player.name} className="w-8 h-8 rounded-full object-cover mr-3" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center mr-3">
                                    <User className="w-4 h-4 text-slate-400" />
                                </div>
                            )}
                            <div>
                                <div className="font-medium text-slate-900 dark:text-white text-sm">{player.name}</div>
                                <div className="text-xs text-slate-500">#{player.rank} • {player.country}</div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
