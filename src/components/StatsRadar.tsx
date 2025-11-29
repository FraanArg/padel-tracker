'use client';

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';

interface StatsRadarProps {
    player1Name: string;
    player2Name: string;
    stats1: {
        winRate: number;
        streak: number;
        titles: number;
        experience: number; // e.g. matches played
        form: number; // e.g. last 5 matches win %
    };
    stats2: {
        winRate: number;
        streak: number;
        titles: number;
        experience: number;
        form: number;
    };
}

export default function StatsRadar({ player1Name, player2Name, stats1, stats2 }: StatsRadarProps) {
    // Normalize data for the chart (0-100 scale)
    // In a real app, you'd calculate this relative to a global max or between the two players

    // For now, let's assume inputs are already somewhat normalized or we normalize relative to each other
    const maxExperience = Math.max(stats1.experience, stats2.experience) || 1;
    const maxTitles = Math.max(stats1.titles, stats2.titles) || 1;
    const maxStreak = Math.max(stats1.streak, stats2.streak) || 1;

    const data = [
        {
            subject: 'Win Rate',
            A: stats1.winRate,
            B: stats2.winRate,
            fullMark: 100,
        },
        {
            subject: 'Current Form',
            A: stats1.form,
            B: stats2.form,
            fullMark: 100,
        },
        {
            subject: 'Experience',
            A: (stats1.experience / maxExperience) * 100,
            B: (stats2.experience / maxExperience) * 100,
            fullMark: 100,
        },
        {
            subject: 'Titles',
            A: (stats1.titles / maxTitles) * 100,
            B: (stats2.titles / maxTitles) * 100,
            fullMark: 100,
        },
        {
            subject: 'Streak',
            A: (stats1.streak / maxStreak) * 100,
            B: (stats2.streak / maxStreak) * 100,
            fullMark: 100,
        },
    ];

    return (
        <div className="w-full h-[300px] bg-white dark:bg-[#202020] rounded-2xl p-4 border border-gray-100 dark:border-white/5 shadow-sm">
            <h3 className="text-center text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Tale of the Tape</h3>
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name={player1Name}
                        dataKey="A"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="#3b82f6"
                        fillOpacity={0.3}
                    />
                    <Radar
                        name={player2Name}
                        dataKey="B"
                        stroke="#ef4444"
                        strokeWidth={2}
                        fill="#ef4444"
                        fillOpacity={0.3}
                    />
                    <Legend
                        wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                        iconType="circle"
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
