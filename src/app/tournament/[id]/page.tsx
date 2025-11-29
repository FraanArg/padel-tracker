import AutoRefresh from '@/components/AutoRefresh';
import { getMatches, getAllMatches, Match } from "@/lib/padel";
import MatchCard from "@/components/MatchCard";
import Bracket from "@/components/Bracket";
import Link from "next/link";
import { ArrowLeft, Calendar, GitGraph, List } from "lucide-react";

export const revalidate = 300; // Revalidate every 5 minutes

export default async function TournamentPage({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ day?: string, view?: string }>
}) {
    // Construct the URL from the slug (ID)
    const { id } = await params;
    const { day, view } = await searchParams;
    const url = `https://www.padelfip.com/events/${id}/`;

    const isDrawView = view === 'draw';

    // Fetch data based on view
    let data: {
        matches: Match[],
        days?: { text: string, url: string }[],
        activeDayUrl?: string,
        tournamentName?: string,
        error?: string
    };

    if (isDrawView) {
        const result = await getAllMatches(url);
        data = { ...result, matches: result.matches as Match[] };
    } else {
        const result = await getMatches(url, day);
        if ('error' in result) {
            data = { matches: [], error: result.error };
        } else {
            data = result;
        }
    }

    if (data.error) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-red-500">Error loading matches</h2>
                <p className="text-slate-600 mt-2">{data.error}</p>
                <Link href="/" className="inline-block mt-4 text-blue-600 hover:underline">
                    &larr; Back to Tournaments
                </Link>
            </div>
        );
    }

    // For draw view, we need tournament name from the first match or passed data
    const tournamentName = data.tournamentName || (data.matches[0]?.tournament?.name || 'Tournament');

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back
                    </Link>

                    {/* View Toggle */}
                    <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-lg">
                        <Link
                            href={`/tournament/${id}`}
                            className={`p-2 rounded-md transition-all ${!isDrawView ? 'bg-white dark:bg-white/10 shadow-sm text-black dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                            title="Schedule"
                        >
                            <List className="w-4 h-4" />
                        </Link>
                        <Link
                            href={`/tournament/${id}?view=draw`}
                            className={`p-2 rounded-md transition-all ${isDrawView ? 'bg-white dark:bg-white/10 shadow-sm text-black dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                            title="Draw"
                        >
                            <GitGraph className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                <div>
                    <h1 className="text-xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">{tournamentName}</h1>
                    {!isDrawView && data.days && (
                        <div className="flex items-center gap-2 mt-1 text-slate-500 dark:text-slate-400 font-medium">
                            <Calendar className="w-4 h-4" />
                            <span>{data.days.find(d => d.url === data.activeDayUrl)?.text || 'Today'}</span>
                        </div>
                    )}
                </div>
            </div>

            {isDrawView ? (
                <Bracket matches={data.matches} />
            ) : (
                <>
                    {/* Day Navigation */}
                    {data.days && (
                        <div className="flex gap-2 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                            {data.days.map((d) => (
                                <Link
                                    key={d.url}
                                    href={`/tournament/${id}?day=${encodeURIComponent(d.url)}`}
                                    className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${d.url === data.activeDayUrl
                                        ? 'bg-black dark:bg-white text-white dark:text-black shadow-md transform scale-105'
                                        : 'bg-white dark:bg-[#202020] text-slate-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200 border border-gray-100 dark:border-white/5'
                                        }`}
                                >
                                    {d.text}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Matches List */}
                    <div className="space-y-8">
                        {data.matches.length > 0 ? (
                            (() => {
                                // Group matches by court
                                const matchesByCourt: Record<string, any[]> = {};
                                const noCourtMatches: any[] = [];

                                data.matches.forEach((match: any) => {
                                    if (match.court) {
                                        if (!matchesByCourt[match.court]) {
                                            matchesByCourt[match.court] = [];
                                        }
                                        matchesByCourt[match.court].push(match);
                                    } else {
                                        noCourtMatches.push(match);
                                    }
                                });

                                // Sort courts? Maybe alphabetically or by priority if we knew it.
                                // For now, just keys.
                                const courts = Object.keys(matchesByCourt).sort();

                                return (
                                    <>
                                        {courts.map(court => (
                                            <div key={court} className="space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 px-1">{court}</h2>
                                                    <div className="px-3 py-1 bg-slate-100 dark:bg-white/10 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 backdrop-blur-sm border border-slate-200 dark:border-white/10 flex items-center gap-1.5">
                                                        <span className="text-base">{getFlag(matchesByCourt[court][0].location)}</span>
                                                        {matchesByCourt[court][0].location || 'Location TBD'}
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    {(() => {
                                                        let lastTime: Date | null = null;
                                                        return matchesByCourt[court].map((match: any, i: number) => {
                                                            let estimatedTime = match.time;
                                                            let isEstimated = false;

                                                            if (match.time) {
                                                                const [h, m] = match.time.split(':').map(Number);
                                                                const d = new Date();
                                                                d.setHours(h, m, 0, 0);
                                                                lastTime = d;
                                                            } else if (lastTime) {
                                                                const nextTime = new Date(lastTime.getTime() + 90 * 60000);
                                                                lastTime = nextTime;
                                                                estimatedTime = nextTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                                                                isEstimated = true;
                                                            }

                                                            return (
                                                                <MatchCard
                                                                    key={`${court}-${i}`}
                                                                    match={{
                                                                        ...match,
                                                                        time: estimatedTime,
                                                                        isEstimated,
                                                                        tournament: { name: tournamentName }
                                                                    }}
                                                                    tournamentId={id}
                                                                />
                                                            );
                                                        });
                                                    })()}
                                                </div>
                                            </div>
                                        ))}

                                        {noCourtMatches.length > 0 && (
                                            <div className="space-y-4">
                                                {courts.length > 0 && <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 px-1">Other Matches</h2>}
                                                <div className="space-y-4">
                                                    {(() => {
                                                        let lastTime: Date | null = null;
                                                        return noCourtMatches.map((match: any, i: number) => {
                                                            let estimatedTime = match.time;
                                                            let isEstimated = false;

                                                            if (match.time) {
                                                                const [h, m] = match.time.split(':').map(Number);
                                                                const d = new Date();
                                                                d.setHours(h, m, 0, 0);
                                                                lastTime = d;
                                                            } else if (lastTime) {
                                                                const nextTime = new Date(lastTime.getTime() + 90 * 60000);
                                                                lastTime = nextTime;
                                                                estimatedTime = nextTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                                                                isEstimated = true;
                                                            }

                                                            return (
                                                                <MatchCard
                                                                    key={`nocourt-${i}`}
                                                                    match={{
                                                                        ...match,
                                                                        time: estimatedTime,
                                                                        isEstimated,
                                                                        tournament: { name: tournamentName }
                                                                    }}
                                                                    tournamentId={id}
                                                                />
                                                            );
                                                        });
                                                    })()}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                );
                            })()
                        ) : (
                            <div className="text-center py-20 bg-white dark:bg-[#202020] rounded-3xl border border-gray-100 dark:border-white/5 border-dashed">
                                <p className="text-slate-400 dark:text-slate-500 font-medium">No matches scheduled for this day.</p>
                            </div>
                        )}
                    </div>
                </>
            )}
            <AutoRefresh />
        </div >
    );
}

function getFlag(location?: string) {
    if (!location) return '🌍';
    const lower = location.toLowerCase();
    if (lower.includes('mexico')) return '🇲🇽';
    if (lower.includes('spain')) return '🇪🇸';
    if (lower.includes('italy')) return '🇮🇹';
    if (lower.includes('france')) return '🇫🇷';
    if (lower.includes('belgium')) return '🇧🇪';
    if (lower.includes('qatar')) return '🇶🇦';
    if (lower.includes('argentina')) return '🇦🇷';
    if (lower.includes('chile')) return '🇨🇱';
    if (lower.includes('bahrain')) return '🇧🇭';
    if (lower.includes('kuwait')) return '🇰🇼';
    if (lower.includes('uae') || lower.includes('dubai')) return '🇦🇪';
    if (lower.includes('saudi')) return '🇸🇦';
    if (lower.includes('sweden')) return '🇸🇪';
    if (lower.includes('germany')) return '🇩🇪';
    if (lower.includes('netherlands')) return '🇳🇱';
    if (lower.includes('egypt')) return '🇪🇬';
    if (lower.includes('finland')) return '🇫🇮';
    if (lower.includes('venezuela')) return '🇻🇪';
    if (lower.includes('paraguay')) return '🇵🇾';
    if (lower.includes('usa') || lower.includes('united states')) return '🇺🇸';
    if (lower.includes('uk') || lower.includes('london')) return '🇬🇧';
    if (lower.includes('portugal')) return '🇵🇹';
    return '📍';
}
