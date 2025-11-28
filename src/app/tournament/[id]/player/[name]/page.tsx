
import { getMatches, getRankings, getFlagEmoji } from '@/lib/padel';
import MatchCard from '@/components/MatchCard';
import Link from 'next/link';
import { ArrowLeft, Calendar, Trophy, MapPin, Award } from 'lucide-react';
import clsx from 'clsx';

export default async function PlayerPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string; name: string }>;
    searchParams: Promise<{ day?: string }>;
}) {
    const { id, name } = await params;
    const { day } = await searchParams;
    const decodedName = decodeURIComponent(name);

    const tournamentUrl = `https://www.padelfip.com/events/${id}/`;

    // Fetch matches and rankings in parallel
    const [data, rankingsData] = await Promise.all([
        getMatches(tournamentUrl, day),
        getRankings()
    ]);

    const rankings = [...rankingsData.men, ...rankingsData.women];

    // Strict matching logic
    const normalize = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Clean the name: remove (N), (WC), (Q), etc.
    const cleanName = decodedName.replace(/\s*\(\d+\)|\s*\(WC\)|\s*\(Q\)|\s*\(LL\)/gi, '').trim();

    const pNameNorm = normalize(cleanName);
    const pTokens = pNameNorm.split(/[\s.]+/).filter(t => t.length > 0);

    // The last token is usually the surname, which is most important
    const pSurname = pTokens[pTokens.length - 1];

    let playerInfo = rankings.find(r => {
        const rNameNorm = normalize(r.name);
        const rTokens = rNameNorm.split(/[\s.]+/).filter(t => t.length > 0);

        // 1. Exact match of full normalized string
        if (rNameNorm === pNameNorm) return true;

        // 2. Check if all tokens of player name are present in ranking name (in order)
        // e.g. "V. Iglesias" -> "Victoria Iglesias"
        // "A. Galan" -> "Alejandro Galan"
        let pIndex = 0;
        let rIndex = 0;
        let matches = 0;

        while (pIndex < pTokens.length && rIndex < rTokens.length) {
            const pToken = pTokens[pIndex];
            const rToken = rTokens[rIndex];

            if (pToken.length === 1) {
                // Initial: "v" matches "victoria"
                if (rToken.startsWith(pToken)) {
                    matches++;
                    pIndex++;
                }
            } else {
                // Full word: "iglesias" matches "iglesias"
                if (rToken === pToken) {
                    matches++;
                    pIndex++;
                }
            }
            rIndex++;
        }

        if (matches === pTokens.length) return true;

        return false;
    });

    // Fallback: If not found in rankings list, try to fetch individual profile
    if (!playerInfo) {
        try {
            // Import dynamically to avoid server/client issues if any (though this is a server component)
            const { getPlayerProfile } = await import('@/lib/padel');
            const profile = await getPlayerProfile(decodedName);
            if (profile) {
                playerInfo = profile;
            }
        } catch (e) {
            console.error('Error fetching fallback profile:', e);
        }
    }

    if (!data || 'error' in data) {
        return (
            <div className="min-h-screen bg-[var(--background)] p-4 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <p className="text-slate-500">Loading player data...</p>
                    <Link href={`/tournament/${id}`} className="text-blue-500 hover:underline">
                        Back to Tournament
                    </Link>
                </div>
            </div>
        );
    }

    // Filter matches for this player
    const playerMatches = data.matches.filter((match: any) => {
        const inTeam1 = match.team1.some((p: string) => p.toLowerCase().includes(decodedName.toLowerCase()) || decodedName.toLowerCase().includes(p.toLowerCase()));
        const inTeam2 = match.team2.some((p: string) => p.toLowerCase().includes(decodedName.toLowerCase()) || decodedName.toLowerCase().includes(p.toLowerCase()));
        return inTeam1 || inTeam2;
    });

    return (
        <main className="min-h-screen bg-[var(--background)] pb-20">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--card-border)]">
                <div className="max-w-md mx-auto px-4 h-14 flex items-center gap-4">
                    <Link
                        href={`/tournament/${id}`}
                        className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-black dark:text-white" />
                    </Link>
                    <h1 className="font-bold text-lg text-black dark:text-white truncate">
                        {decodedName}
                    </h1>
                </div>
            </div>

            <div className="max-w-md mx-auto p-4 space-y-6">
                {/* Player Profile Card */}
                {playerInfo && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
                        <div className="flex items-center gap-6">
                            {playerInfo.imageUrl ? (
                                <img
                                    src={playerInfo.imageUrl}
                                    alt={decodedName}
                                    className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 dark:border-slate-700 shadow-md"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center border-4 border-slate-200 dark:border-slate-600">
                                    <Trophy className="w-10 h-10 text-slate-400" />
                                </div>
                            )}

                            <div className="flex-1">
                                <div className="flex flex-wrap gap-4 mb-2">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg border border-blue-100 dark:border-blue-800">
                                        <div className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-1">World Rank</div>
                                        <div className="text-2xl font-black text-slate-900 dark:text-white">#{playerInfo.rank}</div>
                                    </div>

                                    <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-lg border border-emerald-100 dark:border-emerald-800">
                                        <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mb-1">Points</div>
                                        <div className="text-2xl font-black text-slate-900 dark:text-white">{playerInfo.points}</div>
                                    </div>

                                    {playerInfo.country && (
                                        <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
                                            <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Country</div>
                                            <div className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                {playerInfo.flagUrl ? (
                                                    <img src={playerInfo.flagUrl} alt={playerInfo.country} className="w-6 h-4 object-cover rounded shadow-sm" />
                                                ) : (
                                                    <span className="text-xl leading-none">{getFlagEmoji(playerInfo.country)}</span>
                                                )}
                                                {playerInfo.country}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tournament Info */}
                <div className="text-center space-y-1">
                    <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {data.tournamentName}
                    </h2>
                    <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500">
                        <Calendar className="w-3 h-3" />
                        <span>
                            {data.days.find((d: any) => d.url === data.activeDayUrl)?.text || 'Schedule'}
                        </span>
                    </div>
                </div>

                {/* Day Navigation (Reuse logic from TournamentPage) */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
                    {data.days.map((d: any) => {
                        const isSelected = d.url === data.activeDayUrl;
                        return (
                            <Link
                                key={d.text}
                                href={`/tournament/${id}/player/${name}?day=${encodeURIComponent(d.url)}`}
                                className={clsx(
                                    "flex-none px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all border",
                                    isSelected
                                        ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-black dark:border-white"
                                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 dark:bg-white/5 dark:text-gray-400 dark:border-white/10 dark:hover:border-white/20"
                                )}
                            >
                                {d.text}
                            </Link>
                        );
                    })}
                </div>

                {/* Matches List */}
                <div className="space-y-4">
                    {playerMatches.length > 0 ? (
                        <div className="grid gap-3">
                            {playerMatches.map((match: any, i: number) => (
                                <MatchCard key={i} match={match} tournamentId={id} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 space-y-3">
                            <div className="text-4xl">🎾</div>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">
                                No matches found for {decodedName} on this day.
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-600">
                                Try selecting a different day above.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
