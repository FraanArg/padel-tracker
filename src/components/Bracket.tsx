
'use client';

import { Match } from '@/lib/padel';
import { cn } from '@/lib/utils';

interface BracketProps {
    matches: Match[];
}

export default function Bracket({ matches }: BracketProps) {
    // Helper to normalize round names
    const normalizeRound = (round: string = '') => {
        const r = round.toLowerCase();
        if (r.includes('quarter') || r.includes('cuartos')) return 'QF';
        if (r.includes('semi')) return 'SF';
        if (r.includes('final') && !r.includes('quarter') && !r.includes('semi')) return 'F';
        return 'Other';
    };

    // Group matches by round
    const rounds = {
        QF: matches.filter(m => normalizeRound(m.round) === 'QF'),
        SF: matches.filter(m => normalizeRound(m.round) === 'SF'),
        F: matches.filter(m => normalizeRound(m.round) === 'F'),
    };

    // If no matches in these rounds, show empty state
    if (rounds.QF.length === 0 && rounds.SF.length === 0 && rounds.F.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                <p className="text-slate-500 font-medium">Draw not available yet.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto pb-8">
            <div className="min-w-[800px] flex justify-between px-4">
                {/* Quarter Finals */}
                <RoundColumn title="Quarter Finals" matches={rounds.QF} />

                {/* Connector Column 1 */}
                <div className="w-16 flex flex-col justify-around py-12">
                    {/* Visual connectors would go here, simplified for now */}
                </div>

                {/* Semi Finals */}
                <RoundColumn title="Semi Finals" matches={rounds.SF} />

                {/* Connector Column 2 */}
                <div className="w-16 flex flex-col justify-around py-24">
                </div>

                {/* Final */}
                <RoundColumn title="Final" matches={rounds.F} isFinal />
            </div>
        </div>
    );
}

function RoundColumn({ title, matches, isFinal }: { title: string, matches: Match[], isFinal?: boolean }) {
    return (
        <div className={cn("flex-1 flex flex-col space-y-8", isFinal ? "justify-center" : "justify-around")}>
            <h3 className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                {title}
            </h3>
            <div className={cn("flex flex-col w-full space-y-6", isFinal && "space-y-0")}>
                {matches.map((match, i) => (
                    <BracketMatchCard key={i} match={match} />
                ))}
                {matches.length === 0 && (
                    <div className="h-24 rounded-xl border border-dashed border-gray-200 dark:border-white/10 flex items-center justify-center">
                        <span className="text-xs text-slate-400">TBD</span>
                    </div>
                )}
            </div>
        </div>
    );
}

function BracketMatchCard({ match }: { match: Match }) {
    // Helper to get surname
    const getSurname = (fullName: string) => {
        const parts = fullName.split(' ');
        if (parts.length > 1) {
            if (parts[0].endsWith('.') || parts[0].length === 1) {
                return parts.slice(1).join(' ');
            }
            return parts.slice(1).join(' ');
        }
        return fullName;
    };

    // Parse scores
    const parseScores = (score: string[] | undefined) => {
        if (!score || score.length === 0) return { t1: [], t2: [] };
        const t1: string[] = [];
        const t2: string[] = [];
        score.forEach(set => {
            const parts = set.split('-');
            if (parts.length === 2) {
                t1.push(parts[0]);
                t2.push(parts[1]);
            }
        });
        return { t1, t2 };
    };

    const { t1: t1Scores, t2: t2Scores } = parseScores(match.score);

    return (
        <div className="bg-white dark:bg-[#202020] rounded-lg border border-gray-200 dark:border-white/10 shadow-sm p-3 w-full relative group hover:border-blue-500 transition-colors">
            {/* Status Indicator */}
            {match.status === 'live' && (
                <div className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
            )}

            <div className="space-y-2">
                {/* Team 1 */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2 overflow-hidden">
                        {match.team1?.map((p, idx) => (
                            <div key={idx} className="flex items-center space-x-1">
                                {match.team1Flags?.[idx] && (
                                    <img
                                        src={match.team1Flags[idx]}
                                        alt="Flag"
                                        className="w-3 h-2 object-cover rounded-[1px]"
                                    />
                                )}
                                <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[80px]">
                                    {getSurname(p)}
                                </span>
                                {idx < (match.team1?.length || 0) - 1 && <span className="text-slate-400 text-xs">/</span>}
                            </div>
                        ))}
                    </div>
                    {/* Scores T1 */}
                    <div className="flex space-x-1 ml-2">
                        {t1Scores.map((s, i) => (
                            <span key={i} className={cn("text-xs font-mono", parseInt(s) > parseInt(t2Scores[i]) ? "font-bold text-slate-900 dark:text-white" : "text-slate-400")}>
                                {s}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Team 2 */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2 overflow-hidden">
                        {match.team2?.map((p, idx) => (
                            <div key={idx} className="flex items-center space-x-1">
                                {match.team2Flags?.[idx] && (
                                    <img
                                        src={match.team2Flags[idx]}
                                        alt="Flag"
                                        className="w-3 h-2 object-cover rounded-[1px]"
                                    />
                                )}
                                <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[80px]">
                                    {getSurname(p)}
                                </span>
                                {idx < (match.team2?.length || 0) - 1 && <span className="text-slate-400 text-xs">/</span>}
                            </div>
                        ))}
                    </div>
                    {/* Scores T2 */}
                    <div className="flex space-x-1 ml-2">
                        {t2Scores.map((s, i) => (
                            <span key={i} className={cn("text-xs font-mono", parseInt(s) > parseInt(t1Scores[i]) ? "font-bold text-slate-900 dark:text-white" : "text-slate-400")}>
                                {s}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
