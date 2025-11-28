import { getMatches } from "@/lib/padel";
import MatchCard from "@/components/MatchCard";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";

export const revalidate = 300; // Revalidate every 5 minutes

export default async function TournamentPage({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ day?: string }>
}) {
    // Construct the URL from the slug (ID)
    const { id } = await params;
    const { day } = await searchParams;
    const url = `https://www.padelfip.com/events/${id}/`;
    const data = await getMatches(url, day);

    if ('error' in data) {
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

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
            {/* Header */}
            <div className="space-y-4">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Matches</h1>
                    <div className="flex items-center gap-2 mt-1 text-slate-500 dark:text-slate-400 font-medium">
                        <Calendar className="w-4 h-4" />
                        <span>{data.days.find(d => d.url === data.activeDayUrl)?.text || 'Today'}</span>
                    </div>
                </div>
            </div>

            {/* Day Navigation */}
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

            {/* Matches List */}
            <div className="space-y-4">
                {data.matches.length > 0 ? (
                    data.matches.map((match: any, i: number) => (
                        <MatchCard key={i} match={match} />
                    ))
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-[#202020] rounded-3xl border border-gray-100 dark:border-white/5 border-dashed">
                        <p className="text-slate-400 dark:text-slate-500 font-medium">No matches scheduled for this day.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
