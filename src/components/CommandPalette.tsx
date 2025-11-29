'use client';

import { useState, useEffect } from 'react';
import { Search, X, User, Trophy, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SearchResult {
    type: 'player' | 'tournament';
    name: string;
    id?: string;
    detail?: string;
    url?: string;
}

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const router = useRouter();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen((open) => !open);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    useEffect(() => {
        if (!query) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            // Mock search for now, ideally fetch from an API that aggregates everything
            // We can reuse the player search API and maybe a tournament search
            try {
                const [playerRes] = await Promise.all([
                    fetch(`/api/players/search?q=${encodeURIComponent(query)}`)
                ]);

                const playerData = await playerRes.json();

                const newResults: SearchResult[] = [];

                // Players
                if (playerData.players) {
                    newResults.push(...playerData.players.map((p: any) => ({
                        type: 'player',
                        name: p.name,
                        detail: `Rank #${p.rank} • ${p.country}`,
                        url: `/player/${encodeURIComponent(p.name)}`
                    })));
                }

                // TODO: Add tournament search logic here (requires an API or client-side filtering of known tournaments)

                setResults(newResults);
            } catch (e) {
                console.error(e);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
            <div className="relative w-full max-w-lg bg-white dark:bg-[#1a1a1a] rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-white/10 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center px-4 py-3 border-b border-gray-100 dark:border-white/5">
                    <Search className="w-5 h-5 text-slate-400 mr-3" />
                    <input
                        autoFocus
                        type="text"
                        placeholder="Search players, tournaments..."
                        className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-400 text-lg"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-md text-slate-400">
                        <span className="text-xs font-bold border border-slate-200 dark:border-white/20 px-1.5 py-0.5 rounded">ESC</span>
                    </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-2">
                    {results.length === 0 && query && (
                        <div className="p-4 text-center text-slate-500">No results found.</div>
                    )}
                    {results.length === 0 && !query && (
                        <div className="p-4 text-center text-slate-400 text-sm">
                            Type to search...
                        </div>
                    )}

                    {results.map((result, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                if (result.url) {
                                    router.push(result.url);
                                    setIsOpen(false);
                                }
                            }}
                            className="w-full flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-left group transition-colors"
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${result.type === 'player' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                {result.type === 'player' ? <User className="w-4 h-4" /> : <Trophy className="w-4 h-4" />}
                            </div>
                            <div>
                                <div className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{result.name}</div>
                                <div className="text-xs text-slate-500">{result.detail}</div>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="px-4 py-2 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5 text-[10px] text-slate-400 flex justify-between">
                    <span>Search powered by Padel Tracker</span>
                    <div className="flex gap-2">
                        <span>Select <kbd className="font-sans">↵</kbd></span>
                        <span>Navigate <kbd className="font-sans">↑↓</kbd></span>
                    </div>
                </div>
            </div>
        </div>
    );
}
