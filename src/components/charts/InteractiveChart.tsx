'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';

interface DataPoint {
    name: string;
    value: number;
    [key: string]: string | number;
}

interface InteractiveChartProps {
    data: DataPoint[];
    dataKey?: string;
    title?: string;
    color?: string;
    showTimeRange?: boolean;
    height?: number;
    type?: 'line' | 'area';
}

type TimeRange = 'month' | 'quarter' | 'year' | 'all';

export default function InteractiveChart({
    data,
    dataKey = 'value',
    title,
    color = '#3b82f6',
    showTimeRange = true,
    height = 300,
    type = 'area'
}: InteractiveChartProps) {
    const [timeRange, setTimeRange] = useState<TimeRange>('all');
    const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);

    // Filter data based on time range
    const filteredData = useMemo(() => {
        if (timeRange === 'all') return data;

        const now = new Date();
        let cutoffDate: Date;

        switch (timeRange) {
            case 'month':
                cutoffDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                break;
            case 'quarter':
                cutoffDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                break;
            case 'year':
                cutoffDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                break;
            default:
                return data;
        }

        // Assuming name is a date string or index
        const cutoffIndex = Math.max(0, data.length - (
            timeRange === 'month' ? 4 :
                timeRange === 'quarter' ? 12 :
                    timeRange === 'year' ? 52 :
                        data.length
        ));

        return data.slice(cutoffIndex);
    }, [data, timeRange]);

    // Calculate stats
    const stats = useMemo(() => {
        if (filteredData.length === 0) return { min: 0, max: 0, avg: 0, trend: 0 };

        const values = filteredData.map(d => d[dataKey] as number);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;

        // Calculate trend (difference between first and last half averages)
        const midpoint = Math.floor(values.length / 2);
        const firstHalf = values.slice(0, midpoint);
        const secondHalf = values.slice(midpoint);
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length || 0;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length || 0;
        const trend = ((secondAvg - firstAvg) / firstAvg) * 100 || 0;

        return { min, max, avg, trend };
    }, [filteredData, dataKey]);

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-800 px-3 py-2 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700"
                >
                    <p className="text-xs text-slate-500 mb-1">{label}</p>
                    <p className="text-lg font-bold" style={{ color }}>
                        {payload[0].value}
                    </p>
                </motion.div>
            );
        }
        return null;
    };

    const timeRangeOptions: { value: TimeRange; label: string }[] = [
        { value: 'month', label: '1M' },
        { value: 'quarter', label: '3M' },
        { value: 'year', label: '1Y' },
        { value: 'all', label: 'All' }
    ];

    return (
        <div className="bg-white dark:bg-[#202020] rounded-2xl border border-slate-100 dark:border-white/5 p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                {title && (
                    <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
                )}

                {showTimeRange && (
                    <div className="flex bg-slate-100 dark:bg-white/10 rounded-lg p-1">
                        {timeRangeOptions.map(option => (
                            <button
                                key={option.value}
                                onClick={() => setTimeRange(option.value)}
                                className={`
                                    px-3 py-1 text-xs font-medium rounded-md transition-all
                                    ${timeRange === option.value
                                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}
                                `}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Stats summary */}
            <div className="grid grid-cols-4 gap-2 mb-4">
                <StatBadge label="Min" value={stats.min.toFixed(1)} />
                <StatBadge label="Max" value={stats.max.toFixed(1)} />
                <StatBadge label="Avg" value={stats.avg.toFixed(1)} />
                <StatBadge
                    label="Trend"
                    value={`${stats.trend > 0 ? '+' : ''}${stats.trend.toFixed(1)}%`}
                    color={stats.trend > 0 ? 'text-green-600' : stats.trend < 0 ? 'text-red-600' : 'text-slate-600'}
                />
            </div>

            {/* Chart */}
            <motion.div
                key={timeRange}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                <ResponsiveContainer width="100%" height={height}>
                    {type === 'area' ? (
                        <AreaChart data={filteredData}>
                            <defs>
                                <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="rgba(0,0,0,0.1)"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#94a3b8' }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#94a3b8' }}
                                width={30}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey={dataKey}
                                stroke={color}
                                strokeWidth={2}
                                fill={`url(#gradient-${color})`}
                                animationDuration={1000}
                            />
                        </AreaChart>
                    ) : (
                        <LineChart data={filteredData}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="rgba(0,0,0,0.1)"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#94a3b8' }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#94a3b8' }}
                                width={30}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                                type="monotone"
                                dataKey={dataKey}
                                stroke={color}
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 6, fill: color }}
                                animationDuration={1000}
                            />
                        </LineChart>
                    )}
                </ResponsiveContainer>
            </motion.div>
        </div>
    );
}

function StatBadge({ label, value, color = 'text-slate-900 dark:text-white' }: {
    label: string;
    value: string;
    color?: string;
}) {
    return (
        <div className="text-center px-2 py-1.5 bg-slate-50 dark:bg-white/5 rounded-lg">
            <div className={`text-sm font-bold ${color}`}>{value}</div>
            <div className="text-[10px] text-slate-500 uppercase">{label}</div>
        </div>
    );
}
