import FavoriteButton from './FavoriteButton';

interface MatchProps {
    raw: string;
}

export default function MatchCard({ match }: { match: any }) {
    // Use structured data if available
    const team1 = match.team1 && match.team1.length > 0 ? match.team1.join(' / ') : '';
    const team2 = match.team2 && match.team2.length > 0 ? match.team2.join(' / ') : '';
    const score = match.score && match.score.length > 0 ? match.score.join(' ') : '';

    // Fallback to raw parsing if structured data is missing
    const isParsable = team1 && team2;

    // Check if live
    const isLive = match.status && (match.status.includes('Set') || match.status.includes('Game') || match.status.includes('Tie'));

    return (
        <div className="bg-white dark:bg-[#202020] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-white/5 overflow-hidden hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300">
            {isParsable ? (
                <div className="flex flex-col md:flex-row items-stretch">
                    {/* Status Strip */}
                    <div className={`h-1 md:h-auto md:w-1.5 ${isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-200 dark:bg-white/10'}`} />

                    <div className="flex-1 p-5 flex flex-col gap-4">
                        {/* Header / Status */}
                        <div className="flex justify-between items-center">
                            <span className="text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase">
                                {match.status || 'Scheduled'}
                            </span>
                            {isLive && (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-bold uppercase tracking-wider rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                    Live
                                </span>
                            )}
                        </div>

                        {/* Teams & Score */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            {/* Team 1 */}
                            <div className="flex-1">
                                <div className="font-medium text-slate-900 dark:text-slate-100 text-lg leading-snug tracking-tight">
                                    {match.team1.map((p: string, i: number) => (
                                        <div key={i} className={`group/player flex items-center gap-2 ${i === 0 ? "mb-0.5" : "text-slate-600 dark:text-slate-400"}`}>
                                            <span>{p}</span>
                                            <FavoriteButton playerName={p} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* VS / Score */}
                            <div className="flex flex-col items-center justify-center min-w-[100px]">
                                {score ? (
                                    <div className="text-xl font-mono font-medium text-slate-900 dark:text-slate-100 bg-gray-50 dark:bg-white/5 px-4 py-2 rounded-lg tracking-widest border border-gray-100 dark:border-white/5">
                                        {score}
                                    </div>
                                ) : (
                                    <div className="text-gray-300 dark:text-gray-600 font-bold text-xs tracking-widest">VS</div>
                                )}
                            </div>

                            {/* Team 2 */}
                            <div className="flex-1 md:text-right">
                                <div className="font-medium text-slate-900 dark:text-slate-100 text-lg leading-snug tracking-tight">
                                    {match.team2.map((p: string, i: number) => (
                                        <div key={i} className={`group/player flex items-center gap-2 md:justify-end ${i === 0 ? "mb-0.5" : "text-slate-600 dark:text-slate-400"}`}>
                                            <div className="md:order-2">{p}</div>
                                            <div className="md:order-1">
                                                <FavoriteButton playerName={p} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-5 text-slate-600 dark:text-slate-400 font-medium text-sm">
                    {match.raw}
                </div>
            )}
        </div>
    );
}
