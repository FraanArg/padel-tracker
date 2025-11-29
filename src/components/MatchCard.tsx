'use client';

import FavoriteButton from './FavoriteButton';
import ClientTime from './ClientTime';
import { downloadICS } from '@/lib/calendar';
import { CalendarPlus } from 'lucide-react';
import Link from 'next/link';
import MatchPreview from './MatchPreview';

interface MatchProps {
    match: any;
    tournamentId?: string;
}

export default function MatchCard({ match, tournamentId }: MatchProps) {
    // Check if live
    const isLive = match.status && (match.status.toLowerCase() === 'live' || match.status.includes('Set') || match.status.includes('Game') || match.status.includes('Tie'));

    // Time conversion logic
    const tournamentTime = match.time;

    const scores = parseScores(match.score);

    const handleAddToCalendar = () => {
        downloadICS(match);
    };

    return (
        <div
            className={`
                group relative flex flex-col justify-between
                bg-white/80 dark:bg-[#202020]/80 backdrop-blur-md
                border border-gray-100 dark:border-white/5
                rounded-2xl p-6 md:p-8
                shadow-sm hover:shadow-md
                transition-all duration-300 ease-out
                hover:scale-[1.02] active:scale-[0.98]
                ${isLive ? 'ring-1 ring-red-500/20' : ''}
            `}
        >
            {/* Live Indicator or Date */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {match.round || 'Match'}
                    </span>
                    {match.court && (
                        <span className="text-[10px] font-medium text-slate-400">
                            {match.court}
                        </span>
                    )}
                </div>

                {isLive ? (
                    <div className="flex items-center space-x-1.5 px-2 py-1 bg-red-50 dark:bg-red-500/10 rounded-full border border-red-100 dark:border-red-500/20">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Live</span>
                    </div>
                ) : (
                    <div className="flex items-center space-x-2">
                        {/* Calendar Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent card click
                                handleAddToCalendar();
                            }}
                            className="p-1.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-full transition-colors"
                            title="Add to Calendar"
                        >
                            <CalendarPlus className="w-4 h-4" />
                        </button>
                        <ClientTime
                            time={tournamentTime || ''}
                            timezone={match.timezone}
                            format="card"
                        />
                    </div>
                )}
            </div>

            {/* Teams */}
            <div className="space-y-4 mb-4">
                {/* Team 1 */}
                <div className="flex items-center justify-between group/team">
                    <div className="flex items-center space-x-3">
                        <div className="flex -space-x-2">
                            {match.team1Flags?.map((flag: string, i: number) => (
                                flag && <img key={i} src={flag} alt="Flag" className="w-5 h-5 rounded-full border-2 border-white dark:border-[#202020] shadow-sm" />
                            ))}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-base md:text-lg font-bold text-slate-900 dark:text-white leading-tight group-hover/team:text-blue-600 dark:group-hover/team:text-blue-400 transition-colors">
                                {match.team1?.map(getSurname).join(' / ') || 'TBD'}
                            </span>
                        </div>
                    </div>
                    {/* Score T1 */}
                    <div className="flex space-x-1 font-mono text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                        {scores.t1.map((s, i) => (
                            <span key={i} className={i === scores.t1.length - 1 ? 'text-black dark:text-white' : 'text-slate-400'}>{s}</span>
                        ))}
                    </div>
                </div>

                {/* Team 2 */}
                <div className="flex items-center justify-between group/team">
                    <div className="flex items-center space-x-3">
                        <div className="flex -space-x-2">
                            {match.team2Flags?.map((flag: string, i: number) => (
                                flag && <img key={i} src={flag} alt="Flag" className="w-5 h-5 rounded-full border-2 border-white dark:border-[#202020] shadow-sm" />
                            ))}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-base md:text-lg font-bold text-slate-900 dark:text-white leading-tight group-hover/team:text-blue-600 dark:group-hover/team:text-blue-400 transition-colors">
                                {match.team2?.map(getSurname).join(' / ') || 'TBD'}
                            </span>
                        </div>
                    </div>
                    {/* Score T2 */}
                    <div className="flex space-x-1 font-mono text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                        {scores.t2.map((s, i) => (
                            <span key={i} className={i === scores.t2.length - 1 ? 'text-black dark:text-white' : 'text-slate-400'}>{s}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
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
        // Remove tiebreak part for main numbers (e.g. "7-6(4)" -> "7-6")
        // But actually, usually we want to keep the tiebreak info or just show the set score.
        // Let's just take the first 3 chars if it's "6-4" or "7-6".
        // A simple regex to find the two numbers separated by hyphen
        const match = set.match(/(\d+)-(\d+)/);
        if (match) {
            t1.push(match[1]);
            t2.push(match[2]);
        } else {
            // Fallback
            t1.push('-');
            t2.push('-');
        }
    });

    return { t1, t2 };
}
