'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface MomentumChartProps {
    scores: string[]; // e.g. ["6-4", "3-6", "6-2"]
    team1Name: string;
    team2Name: string;
}

export default function MomentumChart({ scores, team1Name, team2Name }: MomentumChartProps) {
    const data = useMemo(() => {
        let cumulative = 0;
        const points = [{ name: 'Start', value: 0, label: '0-0' }];

        scores.forEach((setScore, setIndex) => {
            const [s1, s2] = setScore.split('-').map(Number);
            if (isNaN(s1) || isNaN(s2)) return;

            // Simple heuristic: +1 for T1 game, -1 for T2 game
            // This is a simplification as we don't have point-by-point data
            // We'll just plot the end of each set for now, or interpolate games if we assume linear progression?
            // Better: Plot the set result as a big jump?
            // Actually, let's just plot the set difference.

            // To make it look like "momentum", we can plot the cumulative game difference
            const diff = s1 - s2;
            cumulative += diff;

            points.push({
                name: `Set ${setIndex + 1}`,
                value: cumulative,
                label: setScore
            });
        });

        return points;
    }, [scores]);

    if (scores.length === 0) return null;

    return (
        <div className="w-full h-64 bg-white dark:bg-[#202020] rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-white/5">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Match Momentum</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                    <XAxis dataKey="name" hide />
                    <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const val = payload[0].value as number;
                                const label = payload[0].payload.label;
                                const leader = val > 0 ? team1Name : val < 0 ? team2Name : 'Even';
                                return (
                                    <div className="bg-slate-900 text-white text-xs p-2 rounded shadow-lg">
                                        <div className="font-bold">{label}</div>
                                        <div>{leader} {val !== 0 && `+${Math.abs(val)}`}</div>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
            <div className="flex justify-between text-xs text-slate-400 mt-2 px-2">
                <span>{team2Name}</span>
                <span>{team1Name}</span>
            </div>
        </div>
    );
}
