
import Link from 'next/link';
import { Trophy, Star, Heart, ArrowLeftRight } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/10 dark:border-white/5 bg-white/70 dark:bg-[#1a1a1a]/70 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-[#1a1a1a]/50 transition-all duration-300">
            <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-[var(--foreground)] text-[var(--background)] p-1.5 rounded-lg transition-transform group-hover:scale-110">
                        <Trophy className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-[var(--foreground)] hidden sm:block">Padel Tracker</span>
                </Link>

                <div className="flex items-center gap-2">
                    <div className="hidden md:flex items-center gap-2">
                        <Link href="/rankings" className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" title="Rankings">
                            <Trophy className="w-6 h-6" />
                        </Link>
                        <Link href="/compare" className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" title="Compare Players">
                            <ArrowLeftRight className="w-6 h-6" />
                        </Link>
                        <Link href="/favorites" className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--foreground)]/5 rounded-full transition-all" title="Favorites">
                            <Heart className="w-5 h-5" />
                        </Link>
                    </div>
                    <ThemeToggle />
                </div>
            </div>
        </nav>
    );
}
