
import { getAllTournaments } from '@/lib/archive';
import { TournamentCalendar } from '@/components/tournament/TournamentCalendar';

export const revalidate = 3600;

export default async function TournamentsPage() {
    const tournaments = await getAllTournaments();

    // Convert to summary format
    const summary = tournaments.map(t => ({
        id: t.id,
        name: t.name,
        dateStart: t.dateStart,
        dateEnd: t.dateEnd,
        city: 'Premier Padel' // Placeholder
    }));

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Tournament Calendar</h1>
            <TournamentCalendar tournaments={summary} />
        </div>
    );
}

