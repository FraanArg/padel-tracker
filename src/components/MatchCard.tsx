'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FavoriteButton from './FavoriteButton';
import ClientTime from './ClientTime';
import { downloadICS } from '@/lib/calendar';
import { CalendarPlus, MapPin, Clock, BarChart2, ChevronDown, Swords } from 'lucide-react';
import Link from 'next/link';
import MatchPreview from './MatchPreview';
import MatchStatsModal from './MatchStatsModal';

interface MatchProps {
    match: any;
    tournamentId?: string;
}

export default function MatchCard({ match, tournamentId }: MatchProps) {
    const [isStatsOpen, setIsStatsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // Check if live
    const isLive = match.status && (match.status.toLowerCase() === 'live' || match.status.includes('Set') || match.status.includes('Game') || match.status.includes('Tie'));

    // Time conversion logic
    const tournamentTime = match.time;

    const scores = parseScores(match.score);
    const winner = determineWinner(scores);

    const handleAddToCalendar = () => {
        downloadICS(match);
    };

    const hasStats = !!match.id && !!match.year && !!match.tournamentId && !!match.organization;

    // Mock H2H data (in real app, would fetch this)
    const h2hRecord = match.h2h || null; // e.g., { team1: 3, team2: 2 }

    return (
        <>
            <motion.div
                layout
                className={`
                    group relative flex flex-col
                    bg-white dark:bg-[#1a1a1a]
                    border border-slate-200 dark:border-white/5
                    rounded-3xl overflow-hidden
                    shadow-sm hover:shadow-xl hover:border-blue-500/20 dark:hover:border-blue-500/20
                    transition-all duration-300 ease-out
                    hover:-translate-y-1 active:scale-[0.98] cursor-pointer
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

                    <div className="flex items-center gap-2">
                        {/* H2H Chip */}
                        {h2hRecord && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 dark:bg-purple-500/20 rounded-lg border border-purple-200 dark:border-purple-500/30">
                                <Swords className="w-3 h-3 text-purple-500" />
                                <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400">
                                    H2H {h2hRecord.team1}-{h2hRecord.team2}
                                </span>
                            </div>
                        )}

                        {isLive ? (
                            <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-red-500/10 rounded-full border border-red-500/20">
                                <span className="live-dot" />
                                <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Live</span>
                            </div>
                        ) : (
                            <>
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
                                        className="p-2.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-colors btn-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                        title="View Stats"
                                        aria-label="View match statistics"
                                    >
                                        <BarChart2 className="w-5 h-5" />
                                    </button>
                                )}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddToCalendar();
                                    }}
                                    className="p-2.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-colors btn-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                    title="Add to Calendar"
                                    aria-label="Add match to calendar"
                                >
                                    <CalendarPlus className="w-5 h-5" />
                                </button>
                            </>
                        )}
                    </div>
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
                                <span className={`text-lg font-bold leading-tight group-hover/team:text-blue-600 dark:group-hover/team:text-blue-400 transition-colors ${winner === 1 ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                                    {match.team1?.map(getSurname).join(' / ') || 'TBD'}
                                </span>
                                {match.team1Seed && <span className="text-xs text-slate-400 font-medium">Seed {match.team1Seed}</span>}
                            </div>
                        </div>
                        {/* Score with heatmap */}
                        <div className="flex space-x-1.5 font-mono text-xl font-bold">
                            {scores.sets.map((set, i) => (
                                <span
                                    key={i}
                                    className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm ${set.t1Won ? 'score-win' : set.t2Won ? 'score-loss' : 'text-slate-400'
                                        } ${winner === 1 ? 'font-bold' : ''}`}
                                >
                                    {set.t1}
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
                                <span className={`text-lg font-bold leading-tight group-hover/team:text-blue-600 dark:group-hover/team:text-blue-400 transition-colors ${winner === 2 ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                                    {match.team2?.map(getSurname).join(' / ') || 'TBD'}
                                </span>
                                {match.team2Seed && <span className="text-xs text-slate-400 font-medium">Seed {match.team2Seed}</span>}
                            </div>
                        </div>
                        {/* Score with heatmap */}
                        <div className="flex space-x-1.5 font-mono text-xl font-bold">
                            {scores.sets.map((set, i) => (
                                <span
                                    key={i}
                                    className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm ${set.t2Won ? 'score-win' : set.t1Won ? 'score-loss' : 'text-slate-400'
                                        } ${winner === 2 ? 'font-bold' : ''}`}
                                >
                                    {set.t2}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Expandable Stats Section */}
                {scores.sets.length > 0 && (
                    <>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(!isExpanded);
                            }}
                            className="w-full py-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-center gap-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                            <span>{isExpanded ? 'Hide' : 'Show'} set details</span>
                            <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ChevronDown className="w-4 h-4" />
                            </motion.div>
                        </button>

                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden border-t border-slate-100 dark:border-white/5"
                                >
                                    <div className="p-4 bg-slate-50 dark:bg-white/5">
                                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                            <div className="font-bold text-slate-500">Set</div>
                                            <div className="font-bold text-slate-500">{match.team1?.map(getSurname).join('/') || 'T1'}</div>
                                            <div className="font-bold text-slate-500">{match.team2?.map(getSurname).join('/') || 'T2'}</div>

                                            {scores.sets.map((set, i) => (
                                                <>
                                                    <div key={`set-${i}`} className="font-medium text-slate-400">Set {i + 1}</div>
                                                    <div key={`t1-${i}`} className={`font-bold ${set.t1Won ? 'text-green-600' : 'text-slate-400'}`}>
                                                        {set.t1}{set.tb1 ? <span className="text-[10px]">({set.tb1})</span> : ''}
                                                    </div>
                                                    <div key={`t2-${i}`} className={`font-bold ${set.t2Won ? 'text-green-600' : 'text-slate-400'}`}>
                                                        {set.t2}{set.tb2 ? <span className="text-[10px]">({set.tb2})</span> : ''}
                                                    </div>
                                                </>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}
            </motion.div>

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

interface SetScore {
    t1: string;
    t2: string;
    t1Won: boolean;
    t2Won: boolean;
    tb1?: string;
    tb2?: string;
}

function parseScores(score: string[] | undefined): { sets: SetScore[] } {
    if (!score || score.length === 0) return { sets: [] };

    const sets: SetScore[] = [];

    score.forEach(setStr => {
        // Handle "6-4" or "7-6(5)" or "6(5)-7(7)"
        const tbMatch1 = setStr.match(/(\d+)\((\d+)\)-(\d+)(?:\((\d+)\))?/);
        const tbMatch2 = setStr.match(/(\d+)-(\d+)\((\d+)\)/);

        let t1: number, t2: number, tb1: string | undefined, tb2: string | undefined;

        if (tbMatch1) {
            t1 = parseInt(tbMatch1[1]);
            tb1 = tbMatch1[2];
            t2 = parseInt(tbMatch1[3]);
            tb2 = tbMatch1[4];
        } else if (tbMatch2) {
            t1 = parseInt(tbMatch2[1]);
            t2 = parseInt(tbMatch2[2]);
            tb2 = tbMatch2[3];
        } else {
            const parts = setStr.replace(/\(.*?\)/g, '').split('-');
            t1 = parseInt(parts[0]) || 0;
            t2 = parseInt(parts[1]) || 0;
        }

        sets.push({
            t1: t1.toString(),
            t2: t2.toString(),
            t1Won: t1 > t2,
            t2Won: t2 > t1,
            tb1,
            tb2
        });
    });

    return { sets };
}

function determineWinner(scores: { sets: SetScore[] }): 1 | 2 | null {
    if (scores.sets.length === 0) return null;

    let t1Sets = 0;
    let t2Sets = 0;

    scores.sets.forEach(set => {
        if (set.t1Won) t1Sets++;
        if (set.t2Won) t2Sets++;
    });

    if (t1Sets > t2Sets) return 1;
    if (t2Sets > t1Sets) return 2;
    return null;
}
