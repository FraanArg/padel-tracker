
import Link from 'next/link';
import { Trophy, Star, Heart, ArrowLeftRight } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './auth/UserMenu';

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/10 dark:border-white/5 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-[#121212]/60 transition-all duration-300">
            <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-slate-900 dark:bg-white text-white dark:text-black p-1.5 rounded-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-blue-500/20">
                        <Trophy className="w-4 h-4" />
                    </div>
                    <span className="font-black text-lg tracking-tighter text-slate-900 dark:text-white hidden sm:block">Padel Tracker</span>
                </Link>

                <div className="flex items-center gap-2">
                    {/* H2H Quick Access (Visible on Mobile) */}
                    <Link href="/compare" className="md:hidden p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all hover:scale-110 active:scale-95" title="Head to Head">
                        <ArrowLeftRight className="w-5 h-5" />
                    </Link>

                    <div className="hidden md:flex items-center gap-1">
                        <Link href="/rankings" className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all hover:scale-110 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full" title="Rankings">
                            <Trophy className="w-5 h-5" />
                        </Link>
                        <Link href="/compare" className="flex items-center gap-1 px-3 py-1.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 bg-slate-100 dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all hover:scale-105 border border-transparent hover:border-blue-200 dark:hover:border-blue-800" title="Compare Players">
                            <ArrowLeftRight className="w-4 h-4" />
                            <span className="text-xs font-bold">H2H</span>
                        </Link>
                        <Link href="/favorites" className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-all hover:scale-110" title="Favorites">
                            <Heart className="w-5 h-5" />
                        </Link>
                    </div>
                    <div className="pl-2 border-l border-slate-200 dark:border-white/10 ml-2 flex items-center gap-2">
                        <ThemeToggle />
                        <UserMenu />
                    </div>
                </div>
            </div>
        </nav>
    );
}
