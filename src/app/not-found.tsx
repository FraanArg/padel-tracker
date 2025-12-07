import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#121212] px-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="text-8xl font-black text-slate-200 dark:text-slate-800">
                    404
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Page not found
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-semibold hover:opacity-90 transition-opacity"
                    >
                        <Home className="w-4 h-4" />
                        Go home
                    </Link>
                    <Link
                        href="/rankings"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-full font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <Search className="w-4 h-4" />
                        Browse rankings
                    </Link>
                </div>
            </div>
        </div>
    );
}
