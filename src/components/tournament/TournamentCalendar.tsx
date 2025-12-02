
import Link from 'next/link';
import { Calendar, MapPin } from 'lucide-react';

interface TournamentSummary {
    id: string;
    name: string;
    dateStart?: string;
    dateEnd?: string;
    city?: string; // If available
}

export function TournamentCalendar({ tournaments }: { tournaments: TournamentSummary[] }) {
    // Group by Month
    const months: Record<string, TournamentSummary[]> = {};

    tournaments.forEach(t => {
        if (!t.dateStart) return;
        const date = new Date(t.dateStart);
        if (isNaN(date.getTime())) return;

        const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });
        if (!months[month]) months[month] = [];
        months[month].push(t);
    });

    // Sort months chronologically
    const sortedMonths = Object.keys(months).sort((a, b) => {
        const da = new Date(a);
        const db = new Date(b);
        return da.getTime() - db.getTime();
    });

    return (
        <div className="space-y-8">
            {sortedMonths.map(month => (
                <div key={month}>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 sticky top-0 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-sm py-2 z-10">
                        {month}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {months[month].map(t => (
                            <Link key={t.id} href={`/tournament/${t.id}`} className="group block bg-white dark:bg-[#202020] rounded-2xl p-5 border border-slate-100 dark:border-white/5 hover:border-blue-500/50 transition-all hover:shadow-lg">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                                        <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-full">
                                        {t.dateStart ? new Date(t.dateStart).getDate() : ''} - {t.dateEnd ? new Date(t.dateEnd).getDate() : ''}
                                    </span>
                                </div>
                                <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-1 group-hover:text-blue-500 transition-colors">
                                    {t.name}
                                </h4>
                                <div className="flex items-center text-sm text-slate-500">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {t.city || 'Premier Padel'}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
