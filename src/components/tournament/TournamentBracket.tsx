
import { Match } from '@/lib/types';

export function TournamentBracket({ matches }: { matches: Match[] }) {
    if (!matches || matches.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 dark:border-white/10">
                <div className="text-slate-400 mb-2">Draw not available</div>
                <p className="text-sm text-slate-500 max-w-xs">
                    Match data has not been populated for this tournament yet.
                </p>
            </div>
        );
    }

    // Group by Round
    const rounds: Record<string, Match[]> = {};
    const roundOrder = ['Final', 'Semi-Final', 'Quarter-Final', 'Round of 16', 'Round of 32', 'Round of 64'];

    matches.forEach(m => {
        if (!m.round) return;
        let r = m.round;
        // Normalize
        if (r.toLowerCase().includes('final') && !r.toLowerCase().includes('semi') && !r.toLowerCase().includes('quarter')) r = 'Final';
        else if (r.toLowerCase().includes('semi')) r = 'Semi-Final';
        else if (r.toLowerCase().includes('quarter')) r = 'Quarter-Final';

        if (!rounds[r]) rounds[r] = [];
        rounds[r].push(m);
    });

    // Filter to only existing rounds and sort
    const activeRounds = roundOrder.filter(r => rounds[r] && rounds[r].length > 0);
    // Add any other rounds found at the end
    Object.keys(rounds).forEach(r => {
        if (!activeRounds.includes(r)) activeRounds.push(r);
    });

    return (
        <div className="space-y-8">
            {activeRounds.map(round => (
                <div key={round}>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-white/10 pb-2">
                        {round}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {rounds[round].map((m, i) => (
                            <div key={i} className="bg-white dark:bg-[#202020] p-4 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm">
                                <div className="space-y-2">
                                    {/* Team 1 */}
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center space-x-2">
                                            <span className={`font-medium ${m.score && determineWinner(m) === 1 ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500'}`}>
                                                {m.team1?.join(' / ') || 'TBD'}
                                            </span>
                                        </div>
                                        {m.score && (
                                            <div className="flex space-x-1">
                                                {m.score.map((s, si) => {
                                                    const parts = s.replace(/[\(\)]/g, '').split('-');
                                                    return (
                                                        <span key={si} className={`w-6 text-center ${determineWinner(m) === 1 ? 'font-bold' : ''}`}>
                                                            {parts[0]}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Team 2 */}
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center space-x-2">
                                            <span className={`font-medium ${m.score && determineWinner(m) === 2 ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500'}`}>
                                                {m.team2?.join(' / ') || 'TBD'}
                                            </span>
                                        </div>
                                        {m.score && (
                                            <div className="flex space-x-1">
                                                {m.score.map((s, si) => {
                                                    const parts = s.replace(/[\(\)]/g, '').split('-');
                                                    return (
                                                        <span key={si} className={`w-6 text-center ${determineWinner(m) === 2 ? 'font-bold' : ''}`}>
                                                            {parts[1]}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

// Helper duplicated from stats.ts (should ideally be shared)
function determineWinner(match: Match): 1 | 2 | null {
    if (!match.score || match.score.length === 0) return null;
    let t1Sets = 0;
    let t2Sets = 0;
    for (const setScore of match.score) {
        let clean = setScore.replace(/[\(\)]/g, '').trim();
        const parts = clean.split('-');
        if (parts.length !== 2) continue;
        let s1 = parseInt(parts[0]);
        let s2 = parseInt(parts[1]);
        if (s1 > 7 || s2 > 7) { s1 = parseInt(parts[0][0]); s2 = parseInt(parts[1][0]); }
        if (!isNaN(s1) && !isNaN(s2)) {
            if (s1 > s2) t1Sets++;
            if (s2 > s1) t2Sets++;
        }
    }
    if (t1Sets > t2Sets) return 1;
    if (t2Sets > t1Sets) return 2;
    return null;
}
