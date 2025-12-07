'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface WinRateHeatmapProps {
    matches: {
        date: string; // ISO date string
        result: 'W' | 'L';
        opponent?: string;
    }[];
    year?: number;
}

export default function WinRateHeatmap({ matches, year = new Date().getFullYear() }: WinRateHeatmapProps) {
    // Generate calendar data for the year
    const calendarData = useMemo(() => {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31);

        // Create a map of date -> match result
        const matchMap = new Map<string, { result: 'W' | 'L'; count: number; opponents: string[] }>();
        matches.forEach(m => {
            const dateKey = m.date.split('T')[0]; // Get YYYY-MM-DD
            const existing = matchMap.get(dateKey);
            if (existing) {
                existing.count++;
                if (m.opponent) existing.opponents.push(m.opponent);
            } else {
                matchMap.set(dateKey, {
                    result: m.result,
                    count: 1,
                    opponents: m.opponent ? [m.opponent] : []
                });
            }
        });

        // Generate weeks
        const weeks: { date: Date; result: 'W' | 'L' | null; count: number; opponents: string[] }[][] = [];
        let currentWeek: { date: Date; result: 'W' | 'L' | null; count: number; opponents: string[] }[] = [];

        // Pad first week to start on Sunday
        const firstDay = startDate.getDay();
        for (let i = 0; i < firstDay; i++) {
            currentWeek.push({ date: new Date(0), result: null, count: 0, opponents: [] });
        }

        const current = new Date(startDate);
        while (current <= endDate) {
            const dateKey = current.toISOString().split('T')[0];
            const match = matchMap.get(dateKey);

            currentWeek.push({
                date: new Date(current),
                result: match?.result || null,
                count: match?.count || 0,
                opponents: match?.opponents || []
            });

            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }

            current.setDate(current.getDate() + 1);
        }

        // Pad last week
        while (currentWeek.length < 7 && currentWeek.length > 0) {
            currentWeek.push({ date: new Date(0), result: null, count: 0, opponents: [] });
        }
        if (currentWeek.length > 0) {
            weeks.push(currentWeek);
        }

        return weeks;
    }, [matches, year]);

    // Calculate stats
    const stats = useMemo(() => {
        const wins = matches.filter(m => m.result === 'W').length;
        const losses = matches.filter(m => m.result === 'L').length;
        return { wins, losses, total: wins + losses, winRate: wins / (wins + losses) * 100 || 0 };
    }, [matches]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Match History</h3>
                    <p className="text-sm text-slate-500">{year} Season</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-sm bg-green-500" />
                        <span className="text-slate-500">{stats.wins} wins</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-sm bg-red-500" />
                        <span className="text-slate-500">{stats.losses} losses</span>
                    </div>
                </div>
            </div>

            {/* Calendar grid */}
            <div className="overflow-x-auto pb-2">
                <div className="inline-flex gap-1">
                    {/* Day labels */}
                    <div className="flex flex-col gap-1 mr-2 text-[10px] text-slate-400">
                        {days.map((day, i) => (
                            <div key={day} className="h-3 flex items-center" style={{ display: i % 2 === 0 ? 'flex' : 'none' }}>
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Weeks */}
                    {calendarData.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-1">
                            {week.map((day, dayIndex) => {
                                if (day.date.getTime() === 0) {
                                    return <div key={dayIndex} className="w-3 h-3" />;
                                }

                                const isToday = day.date.toDateString() === new Date().toDateString();

                                return (
                                    <motion.div
                                        key={dayIndex}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: weekIndex * 0.01 }}
                                        className={`
                                            w-3 h-3 rounded-sm cursor-pointer transition-all
                                            ${day.result === 'W'
                                                ? 'bg-green-500 hover:bg-green-400'
                                                : day.result === 'L'
                                                    ? 'bg-red-500 hover:bg-red-400'
                                                    : 'bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20'}
                                            ${isToday ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-900' : ''}
                                        `}
                                        title={`${day.date.toLocaleDateString()}: ${day.result
                                                ? `${day.result === 'W' ? 'Win' : 'Loss'}${day.opponents.length > 0 ? ` vs ${day.opponents.join(', ')}` : ''}`
                                                : 'No match'
                                            }`}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Month labels */}
                <div className="flex mt-1 ml-8">
                    {months.map((month, i) => (
                        <div
                            key={month}
                            className="text-[10px] text-slate-400"
                            style={{ width: `${100 / 12}%` }}
                        >
                            {month}
                        </div>
                    ))}
                </div>
            </div>

            {/* Win rate bar */}
            <div className="bg-slate-100 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.winRate}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                />
            </div>
            <p className="text-xs text-center text-slate-500">
                {stats.winRate.toFixed(1)}% win rate ({stats.total} matches)
            </p>
        </div>
    );
}
