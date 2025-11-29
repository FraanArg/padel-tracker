
'use client';

import { useEffect, useState } from 'react';
import { convertMatchTime } from '@/lib/date';

interface ClientTimeProps {
    time: string;
    timezone?: string;
    className?: string;
    showLocal?: boolean;
    showYours?: boolean;
    format?: 'card' | 'ticker' | 'ticker-footer';
}

export default function ClientTime({ time, timezone, className = '', showLocal = true, showYours = true, format = 'card' }: ClientTimeProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Default server render (just local time or TBD)
    if (!mounted) {
        if (format === 'card') {
            return (
                <div className={`flex flex-col items-end ${className}`}>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 font-mono bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
                        {time || 'TBD'}
                    </span>
                </div>
            );
        }
        if (format === 'ticker') {
            return (
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono bg-white dark:bg-white/10 px-2 py-1 rounded inline-block w-full text-center">
                    <span>{time} Local Time</span>
                </div>
            );
        }
        // ticker-footer
        return <span className="text-[10px] text-slate-400 font-mono">{time || 'Followed by'}</span>;
    }

    // Client render
    const { local, yours } = convertMatchTime(time || '', timezone || '');

    if (format === 'card') {
        return (
            <div className={`flex flex-col items-end ${className}`}>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 font-mono bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
                    {local || 'TBD'}
                </span>
                {showYours && yours && (
                    <span className="text-[11px] text-slate-400 mt-1 font-medium">
                        Your Time: {yours}
                    </span>
                )}
            </div>
        );
    }

    if (format === 'ticker') {
        if (!local) return <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono bg-white dark:bg-white/10 px-2 py-1 rounded inline-block w-full text-center">Coming up soon</div>;

        return (
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono bg-white dark:bg-white/10 px-2 py-1 rounded inline-block w-full text-center">
                {yours ? (
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white">{local} Local</span>
                        <span className="text-blue-600 dark:text-blue-400 font-bold text-[10px]">{yours} Your Time</span>
                    </div>
                ) : (
                    <span>{local} Local Time</span>
                )}
            </div>
        );
    }

    // ticker-footer
    if (!yours) return <span className="text-[10px] text-slate-400 font-mono">{local || 'Followed by'}</span>;
    return (
        <div className="flex flex-col items-end leading-tight">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{local} Local</span>
            <span className="text-[10px] text-blue-500 font-bold font-mono">{yours} Your Time</span>
        </div>
    );
}
