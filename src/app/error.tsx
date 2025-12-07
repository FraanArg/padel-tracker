'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Application error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#121212] px-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Something went wrong
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        An unexpected error occurred. Please try again.
                    </p>
                </div>

                <button
                    onClick={reset}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-semibold hover:opacity-90 transition-opacity"
                >
                    <RefreshCw className="w-4 h-4" />
                    Try again
                </button>
            </div>
        </div>
    );
}
