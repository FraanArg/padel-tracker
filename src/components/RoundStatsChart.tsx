'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from 'recharts';

interface RoundStatsChartProps {
    data: {
        round: string;
        team1Wins: number;
        team2Wins: number;
    }[];
    team1Name: string;
    team2Name: string;
}

export default function RoundStatsChart({ data, team1Name, team2Name }: RoundStatsChartProps) {
    // Transform data for "Butterfly" chart
    // Team 1 wins will be negative to show on left, Team 2 wins positive on right
    const chartData = data.map(item => ({
        ...item,
        team1WinsDisplay: item.team1Wins, // For tooltip
        team1Wins: -item.team1Wins, // For chart
    }));

    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900 text-white text-xs p-3 rounded-lg shadow-xl border border-white/10">
                    <p className="font-bold mb-2">{label}</p>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span>{team1Name}: {payload[0].payload.team1WinsDisplay} wins</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span>{team2Name}: {payload[0].payload.team2Wins} wins</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-[400px] bg-white dark:bg-[#202020] rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm flex flex-col">
            <h3 className="text-center text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">Round-by-Round Dominance</h3>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={chartData}
                        stackOffset="sign"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <ReferenceLine x={0} stroke="#94a3b8" strokeDasharray="3 3" />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="round"
                            type="category"
                            width={100}
                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }}
                            interval={0}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                        <Bar dataKey="team1Wins" name={team1Name} fill="#3b82f6" radius={[4, 0, 0, 4]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill="#3b82f6" />
                            ))}
                        </Bar>
                        <Bar dataKey="team2Wins" name={team2Name} fill="#ef4444" radius={[0, 4, 4, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill="#ef4444" />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4 text-xs font-bold text-slate-500">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>{team1Name}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>{team2Name}</span>
                </div>
            </div>
        </div>
    );
}
