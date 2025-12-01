'use client';

import { useState } from 'react';
import FavoriteButton from './FavoriteButton';
import ClientTime from './ClientTime';
import { downloadICS } from '@/lib/calendar';
import { CalendarPlus, MapPin, Clock, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import MatchPreview from './MatchPreview';
import MatchStatsModal from './MatchStatsModal';

interface MatchProps {
    match: any;
    tournamentId?: string;
}

export default function MatchCard({ match, tournamentId }: MatchProps) {
    const [isStatsOpen, setIsStatsOpen] = useState(false);

    // Check if live
    const isLive = match.status && (match.status.toLowerCase() === 'live' || match.status.includes('Set') || match.status.includes('Game') || match.status.includes('Tie'));

    // Time conversion logic
    const tournamentTime = match.time;

    const scores = parseScores(match.score);

    const handleAddToCalendar = () => {
        downloadICS(match);
    };

    const hasStats = !!match.id && !!match.year && !!match.tournamentId && !!match.organization;

    return (
        <>
            <div
                className={`
                    group relative flex flex-col
                    bg-white dark:bg-[#1a1a1a]
                    border border-slate-200 dark:border-white/5
                    rounded-3xl overflow-hidden
                    shadow-sm hover:shadow-xl hover:border-blue-500/20 dark:hover:border-blue-500/20
                    transition-all duration-300 ease-out
                    hover:-translate-y-1
                `}
            >
                {/* Header Section */}
                <div className="bg-slate-50 dark:bg-white/5 px-6 py-4 flex justify-between items-center border-b border-slate-100 dark:border-white/5">
                    <div className="flex items-center space-x-3">
                        <div className={`w-2 h-8 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`}></div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                {match.round || 'Match'}
                            </span>
                            <div className="flex items-center text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                {match.court && (
                                    <span className="flex items-center mr-2">
                                        <MapPin className="w-3 h-3 mr-1" />
                                        {match.court}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {isLive ? (
                        <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-red-500/10 rounded-full border border-red-500/20">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Live</span>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <ClientTime
                                time={tournamentTime || ''}
                                timezone={match.timezone}
                                format="card"
                            />
                            {hasStats && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsStatsOpen(true);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-full transition-colors"
                                    title="View Stats"
                                >
                                    <BarChart2 className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToCalendar();
                                }}
                                className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-full transition-colors"
                                title="Add to Calendar"
                            >
                                <CalendarPlus className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-6 space-y-6">
                    {/* Team 1 */}
                    <div className="flex items-center justify-between group/team">
                        <div className="flex items-center space-x-4">
                            <div className="flex -space-x-3">
                                {match.team1Flags?.map((flag: string, i: number) => (
                                    flag && <img key={i} src={flag} alt="Flag" className="w-8 h-8 rounded-full border-2 border-white dark:border-[#1a1a1a] shadow-sm object-cover" />
                                ))}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-bold text-slate-900 dark:text-white leading-tight group-hover/team:text-blue-600 dark:group-hover/team:text-blue-400 transition-colors">
                                    {match.team1?.map(getSurname).join(' / ') || 'TBD'}
                                </span>
                                {match.team1Seed && <span className="text-xs text-slate-400 font-medium">Seed {match.team1Seed}</span>}
                            </div>
                        </div>
                        {/* Score T1 */}
                        <div className="flex space-x-2 font-mono text-2xl font-bold text-slate-900 dark:text-white">
                            {scores.t1.map((s, i) => (
                                <span key={i} className={`w-8 text-center ${i === scores.t1.length - 1 ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-slate-100 dark:bg-white/5 w-full"></div>

                    {/* Team 2 */}
                    <div className="flex items-center justify-between group/team">
                        <div className="flex items-center space-x-4">
                            <div className="flex -space-x-3">
                                {match.team2Flags?.map((flag: string, i: number) => (
                                    flag && <img key={i} src={flag} alt="Flag" className="w-8 h-8 rounded-full border-2 border-white dark:border-[#1a1a1a] shadow-sm object-cover" />
                                ))}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-bold text-slate-900 dark:text-white leading-tight group-hover/team:text-blue-600 dark:group-hover/team:text-blue-400 transition-colors">
                                    {match.team2?.map(getSurname).join(' / ') || 'TBD'}
                                </span>
                                {match.team2Seed && <span className="text-xs text-slate-400 font-medium">Seed {match.team2Seed}</span>}
                            </div>
                        </div>
                        {/* Score T2 */}
                        <div className="flex space-x-2 font-mono text-2xl font-bold text-slate-900 dark:text-white">
                            {scores.t2.map((s, i) => (
                                <span key={i} className={`w-8 text-center ${i === scores.t2.length - 1 ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {hasStats && (
                <MatchStatsModal
                    isOpen={isStatsOpen}
                    onClose={() => setIsStatsOpen(false)}
                    matchId={match.id}
                    year={match.year}
                    tournamentId={match.tournamentId}
                    organization={match.organization}
                />
            )}
        </>
    );
}

// Helpers
function getSurname(name: string) {
    return name.split(' ').pop() || name;
}

function parseScores(score: string[] | undefined) {
    if (!score || score.length === 0) return { t1: [], t2: [] };

    const t1: string[] = [];
    const t2: string[] = [];

    score.forEach(set => {
        // Handle "6-4" or "6-6(5)" or "6(5)-7"
        // We want to extract the main numbers.
        // If there is a tiebreak, we might want to show it?
        // For now, let's just extract the main set score to keep the big numbers clean.
        // The user said "just showing the (5) next to chingotto/galan is fine".
        // But in this card layout, we have big numbers.
        // Maybe we can append the tiebreak score small?
        // Let's stick to main numbers for the big display for now to avoid clutter.

        const parts = set.split('-');
        if (parts.length >= 2) {
            // Remove tiebreak info from the main number for the big display
            const s1 = parts[0].replace(/\(.*\)/, '').trim();
            const s2 = parts[1].replace(/\(.*\)/, '').trim();
            t1.push(s1);
            t2.push(s2);
        } else {
            t1.push('-');
            t2.push('-');
        }
    });

    return { t1, t2 };
}
