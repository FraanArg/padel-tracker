'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Trophy, Award, Target, TrendingUp, MapPin, Calendar } from 'lucide-react';

interface PlayerHeroProps {
    name: string;
    countryCode?: string;
    countryFlag?: string;
    rank?: number;
    previousRank?: number;
    stats?: {
        titles: number;
        finals: number;
        winRate: string;
        totalMatches: number;
    };
    highlights?: {
        title: string;
        year: number;
        type: 'title' | 'final' | 'achievement';
    }[];
}

// Country color palettes for gradient backgrounds
const countryColors: Record<string, [string, string]> = {
    ESP: ['#c60b1e', '#ffc400'],
    ARG: ['#74acdf', '#f6b40e'],
    BRA: ['#009c3b', '#ffdf00'],
    ITA: ['#009246', '#ce2b37'],
    FRA: ['#002654', '#ed2939'],
    POR: ['#006600', '#ff0000'],
    MEX: ['#006847', '#ce1126'],
    USA: ['#3c3b6e', '#b22234'],
    GBR: ['#012169', '#c8102e'],
    default: ['#3b82f6', '#8b5cf6']
};

export default function PlayerHero({
    name,
    countryCode = 'default',
    countryFlag,
    rank,
    previousRank,
    stats,
    highlights = []
}: PlayerHeroProps) {
    const colors = countryColors[countryCode] || countryColors.default;
    const rankChange = previousRank && rank ? previousRank - rank : 0;

    // Sort highlights by year descending
    const sortedHighlights = useMemo(() =>
        [...highlights].sort((a, b) => b.year - a.year).slice(0, 5),
        [highlights]
    );

    return (
        <div className="relative overflow-hidden rounded-3xl mb-6">
            {/* Animated gradient background */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0"
                style={{
                    background: `linear-gradient(135deg, ${colors[0]}20 0%, ${colors[1]}30 50%, ${colors[0]}20 100%)`
                }}
            />

            {/* Animated decoration circles */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute -right-20 -top-20 w-80 h-80 rounded-full opacity-20"
                style={{ background: `radial-gradient(circle, ${colors[0]} 0%, transparent 70%)` }}
            />
            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    rotate: [360, 180, 0]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="absolute -left-10 -bottom-10 w-60 h-60 rounded-full opacity-20"
                style={{ background: `radial-gradient(circle, ${colors[1]} 0%, transparent 70%)` }}
            />

            <div className="relative z-10 p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                    {/* Flag and name */}
                    <div className="flex items-center gap-4">
                        {countryFlag && (
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 200 }}
                                className="relative"
                            >
                                <div
                                    className="w-16 h-16 rounded-2xl overflow-hidden shadow-xl ring-4 ring-white/30"
                                    style={{ boxShadow: `0 0 30px ${colors[0]}40` }}
                                >
                                    <Image
                                        src={countryFlag}
                                        alt={countryCode}
                                        width={64}
                                        height={64}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            </motion.div>
                        )}

                        <div>
                            <motion.h1
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white"
                            >
                                {name}
                            </motion.h1>

                            {rank && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex items-center gap-2 mt-1"
                                >
                                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                                        World Rank #{rank}
                                    </span>
                                    {rankChange !== 0 && (
                                        <span className={`flex items-center text-xs font-bold ${rankChange > 0 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            <TrendingUp className={`w-3 h-3 mr-0.5 ${rankChange < 0 ? 'rotate-180' : ''}`} />
                                            {Math.abs(rankChange)}
                                        </span>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Quick stats */}
                    {stats && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex gap-4 md:ml-auto"
                        >
                            <QuickStat icon={Trophy} value={stats.titles} label="Titles" color={colors[0]} />
                            <QuickStat icon={Award} value={stats.finals} label="Finals" color={colors[1]} />
                            <QuickStat icon={Target} value={stats.winRate} label="Win Rate" color={colors[0]} />
                        </motion.div>
                    )}
                </div>

                {/* Career highlights carousel */}
                {sortedHighlights.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mt-6"
                    >
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                            Career Highlights
                        </h3>
                        <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
                            {sortedHighlights.map((highlight, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 + i * 0.1 }}
                                    className="flex-shrink-0 px-4 py-2 bg-white/60 dark:bg-white/10 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/10"
                                >
                                    <div className="flex items-center gap-2">
                                        {highlight.type === 'title' && <Trophy className="w-4 h-4 text-yellow-500" />}
                                        {highlight.type === 'final' && <Award className="w-4 h-4 text-slate-400" />}
                                        {highlight.type === 'achievement' && <Target className="w-4 h-4 text-blue-500" />}
                                        <span className="text-sm font-medium text-slate-900 dark:text-white whitespace-nowrap">
                                            {highlight.title}
                                        </span>
                                        <span className="text-xs text-slate-500">{highlight.year}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

function QuickStat({
    icon: Icon,
    value,
    label,
    color
}: {
    icon: typeof Trophy;
    value: string | number;
    label: string;
    color: string;
}) {
    return (
        <div className="text-center">
            <div
                className="w-10 h-10 mx-auto mb-1 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${color}20` }}
            >
                <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white">{value}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</div>
        </div>
    );
}
