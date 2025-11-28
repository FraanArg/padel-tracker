import Link from 'next/link';
import { Trophy, Star } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 bg-[#F7F7F5]/80 dark:bg-[#191919]/80 backdrop-blur-md border-b border-gray-200/50 dark:border-white/5 transition-colors duration-300">
            <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-black dark:bg-white text-white dark:text-black p-1.5 rounded-lg group-hover:scale-105 transition-transform">
                        <Trophy className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 tracking-tight">Padel Tracker</span>
                </Link>
                <div className="flex items-center gap-2">
                    <Link
                        href="/favorites"
                        className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all"
                    >
                        <Star className="w-4 h-4" />
                        <span>Favorites</span>
                    </Link>
                    <ThemeToggle />
                </div>
            </div>
        </nav>
    );
}
