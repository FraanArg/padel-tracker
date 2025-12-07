'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Global error:', error);
    }, [error]);

    return (
        <html lang="en">
            <body className="bg-slate-50 dark:bg-[#121212]">
                <div className="min-h-screen flex items-center justify-center px-4">
                    <div className="max-w-md w-full text-center space-y-6">
                        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                Critical Error
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400">
                                Something went seriously wrong. Please try refreshing.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={reset}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-semibold hover:opacity-90 transition-opacity"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Try again
                            </button>
                            <Link
                                href="/"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-full font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <Home className="w-4 h-4" />
                                Go home
                            </Link>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
