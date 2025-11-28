import FavoriteButton from './FavoriteButton';
import Link from 'next/link';
import MatchPreview from './MatchPreview';

interface MatchProps {
    raw: string;
}

export default function MatchCard({ match, tournamentId }: { match: any, tournamentId?: string }) {
    // Use structured data if available
    const team1 = match.team1 && match.team1.length > 0 ? match.team1.join(' / ') : '';
    const team2 = match.team2 && match.team2.length > 0 ? match.team2.join(' / ') : '';
    const score = match.score && match.score.length > 0 ? match.score.join(' ') : '';

    // Fallback to raw parsing if structured data is missing
    const isParsable = team1 && team2;

    // Check if live
    const isLive = match.status && (match.status.includes('Set') || match.status.includes('Game') || match.status.includes('Tie'));

    // Time conversion logic
    let localTime = '';
    let tournamentTime = match.time;

    if (match.time && match.timezone) {
        try {
            // Create a date object for today with the match time in the tournament timezone
            // This is an approximation since we don't have the full date in the match object easily available here
            // But for "Today's" matches it works. For future matches, it might be slightly off if DST changes, but acceptable.
            const now = new Date();
            const [hours, minutes] = match.time.split(':').map(Number);

            // We need to construct a string that Date.parse or Intl can handle, or use a library.
            // Since we don't have date-fns-tz, we'll use a heuristic.

            // 1. Get UTC time of the match
            // We can use Intl.DateTimeFormat to find the offset of the tournament timezone
            const getOffset = (timeZone: string) => {
                const date = new Date();
                const str = date.toLocaleString('en-US', { timeZone, timeZoneName: 'longOffset' });
                const match = str.match(/GMT([+-]\d{2}):?(\d{2})?/);
                if (!match) return 0;
                const h = parseInt(match[1], 10);
                const m = match[2] ? parseInt(match[2], 10) : 0;
                return h * 60 + (h < 0 ? -m : m);
            };

            const tournamentOffset = getOffset(match.timezone);
            const localOffset = -now.getTimezoneOffset(); // in minutes

            const diffMinutes = localOffset - tournamentOffset;

            const matchDate = new Date();
            matchDate.setHours(hours, minutes, 0, 0);
            matchDate.setMinutes(matchDate.getMinutes() + diffMinutes);

            localTime = matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

        } catch (e) {
            console.error('Error converting time', e);
        }
    }

    return (
        <div className="relative overflow-hidden rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] p-4 transition-all hover:bg-gray-50 dark:hover:bg-white/5">
            {isParsable ? (
                <>
                    {/* Status Strip */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${isLive ? 'bg-red-500 animate-pulse' : 'bg-transparent'}`} />

                    <div className="flex flex-col gap-3 pl-2">
                        {/* Header: Tournament & Status */}
                        <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-900 dark:text-gray-400">
                            <div className="flex flex-col items-center md:items-start gap-1 overflow-hidden w-full md:w-auto">
                                <div className="font-bold text-xs md:text-[11px] truncate pr-0 md:pr-2 text-center md:text-left">
                                    {match.tournament?.name || 'Tournament'}
                                </div>
                                <div className="flex flex-wrap justify-center md:justify-start items-center gap-2">
                                    {match.category && (
                                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-200 dark:bg-white/10 text-[10px] normal-case tracking-normal text-black dark:text-gray-200 font-bold">
                                            {match.category === 'Women' && <span>🚺</span>}
                                            {match.category === 'Men' && <span>🚹</span>}
                                            <span>{match.category}</span>
                                        </div>
                                    )}
                                    {match.round && (
                                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-[10px] normal-case tracking-normal text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800/50">
                                            <span>{match.round}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-gray-500 font-medium normal-case">
                                        {match.location && <span>📍 {match.location}</span>}
                                        {match.court && <span>🏟️ {match.court}</span>}
                                    </div>
                                </div>
                            </div>

                            {isLive ? (
                                <span className="text-red-600 dark:text-red-500 animate-pulse flex items-center gap-1 font-bold mt-1 md:mt-0">
                                    <span>●</span> Live
                                </span>
                            ) : (
                                <div className="flex flex-row md:flex-col items-center md:items-end gap-3 md:gap-0.5 mt-1 md:mt-0 bg-slate-50 dark:bg-white/5 md:bg-transparent px-2 py-1 md:p-0 rounded md:rounded-none border md:border-none border-slate-100 dark:border-white/5">
                                    <div className="flex items-center gap-1.5">
                                        {match.isEstimated && <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-1 rounded uppercase tracking-wider">Est</span>}
                                        <span className="text-[9px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">Local</span>
                                        <span className="text-black dark:text-white font-black text-sm">{tournamentTime || 'Upcoming'}</span>
                                    </div>
                                    {localTime && localTime !== tournamentTime && (
                                        <div className="flex items-center gap-1.5 border-l md:border-l-0 border-slate-300 dark:border-white/10 pl-3 md:pl-0 ml-1 md:ml-0">
                                            <span className="text-[9px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">Yours</span>
                                            <span className="text-slate-900 dark:text-gray-300 font-bold text-xs">
                                                {localTime}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Teams & Score */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            {/* Team 1 */}
                            <div className="flex-1 w-full md:w-auto flex md:block flex-col items-center md:items-end text-center md:text-right">
                                {match.team1.map((p: string, i: number) => (
                                    <div key={i} className={`flex items-center justify-center md:justify-end gap-2 ${i === 0 ? "mb-1" : "text-slate-700 dark:text-gray-400"}`}>
                                        {i === 0 && match.team1Seed && (
                                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10">
                                                {match.team1Seed}
                                            </span>
                                        )}
                                        {tournamentId ? (
                                            <Link
                                                href={`/tournament/${tournamentId}/player/${encodeURIComponent(p)}`}
                                                className="font-bold text-[14px] md:text-[15px] leading-tight text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:underline decoration-2 underline-offset-2 transition-all"
                                            >
                                                {p}
                                            </Link>
                                        ) : (
                                            <span className="font-bold text-[14px] md:text-[15px] leading-tight text-black dark:text-white">{p}</span>
                                        )}
                                        <FavoriteButton playerName={p} />
                                    </div>
                                ))}
                            </div>

                            {/* Score / VS */}
                            <div className="min-w-[80px] flex flex-col items-center justify-center my-2 md:my-0 gap-2">
                                {score ? (
                                    <div className="px-3 py-1 rounded-md bg-gray-100 dark:bg-white/10 font-mono text-sm font-bold tracking-widest text-black dark:text-white border border-gray-300 dark:border-white/10">
                                        {score}
                                    </div>
                                ) : (
                                    <span className="text-xs font-black text-slate-400 dark:text-gray-600 opacity-70">VS</span>
                                )}
                                <MatchPreview match={match} />
                            </div>

                            {/* Team 2 */}
                            <div className="flex-1 w-full md:w-auto flex md:block flex-col items-center md:items-start text-center md:text-left">
                                {match.team2.map((p: string, i: number) => (
                                    <div key={i} className={`flex items-center justify-center md:justify-start gap-2 ${i === 0 ? "mb-1" : "text-slate-700 dark:text-gray-400"}`}>
                                        <FavoriteButton playerName={p} />
                                        {tournamentId ? (
                                            <Link
                                                href={`/tournament/${tournamentId}/player/${encodeURIComponent(p)}`}
                                                className="font-bold text-[14px] md:text-[15px] leading-tight text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:underline decoration-2 underline-offset-2 transition-all"
                                            >
                                                {p}
                                            </Link>
                                        ) : (
                                            <span className="font-bold text-[14px] md:text-[15px] leading-tight text-black dark:text-white">{p}</span>
                                        )}
                                        {i === 0 && match.team2Seed && (
                                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10">
                                                {match.team2Seed}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="p-4 text-[var(--text-secondary)] text-sm font-medium text-center">
                    {match.raw}
                </div>
            )}
        </div>
    );
}
