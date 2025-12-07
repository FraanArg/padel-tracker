'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { PlayerStats } from '@/lib/stats';
import { TrendingUp, TrendingDown, Minus, Trophy, Target, Award, Activity } from 'lucide-react';

interface StatsDashboardProps {
    stats: PlayerStats;
    previousRank?: number;
    currentRank?: number;
}

// Animated counter hook
function useCountUp(end: number, duration: number = 1500) {
    const [count, setCount] = useState(0);
    const countRef = useRef(0);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        if (hasAnimated) return;

        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out cubic)
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * end);

            setCount(current);
            countRef.current = current;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setHasAnimated(true);
            }
        };

        requestAnimationFrame(animate);
    }, [end, duration, hasAnimated]);

    return count;
}

// Sparkline component for recent form
function Sparkline({ data, color = 'blue' }: { data: ('W' | 'L' | '-')[]; color?: string }) {
    const wins = data.filter(d => d === 'W').length;
    const total = data.filter(d => d !== '-').length;

    return (
        <div className="flex items-center gap-1">
            {data.map((result, i) => (
                <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.1, type: 'spring', stiffness: 500 }}
                    className={`w-2 h-2 rounded-full ${result === 'W'
                            ? 'bg-green-500'
                            : result === 'L'
                                ? 'bg-red-500'
                                : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                    title={result === 'W' ? 'Win' : result === 'L' ? 'Loss' : 'N/A'}
                />
            ))}
            <span className="text-xs text-slate-500 ml-1">{wins}/{total}</span>
        </div>
    );
}

// Trend arrow component
function TrendArrow({ current, previous }: { current?: number; previous?: number }) {
    if (!current || !previous) return null;

    const diff = previous - current; // Positive means improved (lower rank is better)

    if (diff > 0) {
        return (
            <motion.div
                initial={{ y: 5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex items-center gap-1 text-green-500"
            >
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-bold">+{diff}</span>
            </motion.div>
        );
    } else if (diff < 0) {
        return (
            <motion.div
                initial={{ y: -5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex items-center gap-1 text-red-500"
            >
                <TrendingDown className="w-4 h-4" />
                <span className="text-xs font-bold">{diff}</span>
            </motion.div>
        );
    }

    return (
        <div className="flex items-center gap-1 text-slate-400">
            <Minus className="w-4 h-4" />
            <span className="text-xs">—</span>
        </div>
    );
}

// Get percentile badge
function getPercentileBadge(value: number, type: 'winRate' | 'titles' | 'matches') {
    // Tour averages (approximate)
    const averages = {
        winRate: 50, // Average win rate
        titles: 2,   // Average titles for active players
        matches: 50  // Average matches per year
    };

    const avg = averages[type];
    const ratio = value / avg;

    if (ratio >= 1.5) return { label: 'Elite', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400' };
    if (ratio >= 1.2) return { label: 'Top', color: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' };
    if (ratio >= 0.8) return { label: 'Avg', color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' };
    return { label: 'Dev', color: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400' };
}

// Enhanced stat card
function StatCard({
    label,
    value,
    icon: Icon,
    color,
    badge,
    sparklineData,
    animate = true
}: {
    label: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    badge?: { label: string; color: string };
    sparklineData?: ('W' | 'L' | '-')[];
    animate?: boolean;
}) {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    const displayValue = animate && !isNaN(numericValue) ? useCountUp(numericValue) : value;
    const isPercentage = typeof value === 'string' && value.includes('%');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-white dark:bg-[#202020] p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 relative overflow-hidden group hover:shadow-md transition-shadow"
        >
            {/* Background decoration */}
            <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full ${color} opacity-10 group-hover:opacity-20 transition-opacity`} />

            <div className="relative z-10">
                {/* Header with icon and badge */}
                <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-xl ${color.replace('bg-', 'bg-').replace('-500', '-100')} dark:bg-opacity-20`}>
                        <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
                    </div>
                    {badge && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${badge.color}`}>
                            {badge.label}
                        </span>
                    )}
                </div>

                {/* Value */}
                <div className="flex items-baseline gap-1">
                    <motion.span
                        className="text-3xl font-black text-slate-900 dark:text-white"
                        key={displayValue}
                    >
                        {displayValue}
                    </motion.span>
                    {isPercentage && <span className="text-lg text-slate-400">%</span>}
                </div>

                {/* Label */}
                <div className="text-xs text-slate-500 uppercase tracking-wider mt-1 font-medium">
                    {label}
                </div>

                {/* Sparkline if provided */}
                {sparklineData && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5">
                        <Sparkline data={sparklineData} />
                    </div>
                )}
            </div>
        </motion.div>
    );
}

export function StatsDashboard({ stats, previousRank, currentRank }: StatsDashboardProps) {
    // Extract recent form from recentMatches
    const recentForm: ('W' | 'L' | '-')[] = stats.recentMatches
        ? stats.recentMatches.slice(0, 5).map(m => m.result as 'W' | 'L' | '-')
        : ['-', '-', '-', '-', '-'];

    const winRateNum = parseFloat(stats.winRate);

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
                label="Matches"
                value={stats.totalMatches}
                icon={Activity}
                color="bg-blue-500"
                badge={getPercentileBadge(stats.totalMatches, 'matches')}
            />
            <StatCard
                label="Win Rate"
                value={winRateNum}
                icon={Target}
                color="bg-green-500"
                badge={getPercentileBadge(winRateNum, 'winRate')}
                sparklineData={recentForm}
            />
            <StatCard
                label="Titles"
                value={stats.titles}
                icon={Trophy}
                color="bg-yellow-500"
                badge={getPercentileBadge(stats.titles, 'titles')}
            />
            <StatCard
                label="Finals"
                value={stats.finals}
                icon={Award}
                color="bg-purple-500"
            />
        </div>
    );
}
