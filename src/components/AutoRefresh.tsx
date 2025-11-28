'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

export default function AutoRefresh() {
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState(60);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    // Trigger refresh
                    setIsRefreshing(true);
                    router.refresh();
                    setTimeout(() => setIsRefreshing(false), 1000); // Reset spinner after 1s
                    return 60;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [router]);

    return (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 bg-white/90 dark:bg-black/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 dark:border-white/10 text-xs font-medium text-slate-500 dark:text-slate-400 pointer-events-none">
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
            <span>{timeLeft}s</span>
        </div>
    );
}
