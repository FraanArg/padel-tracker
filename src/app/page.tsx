import { getTournaments } from '@/lib/padel';
import TournamentCard from '@/components/TournamentCard';

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  const tournaments = await getTournaments();

  return (
    <main className="min-h-screen pb-20">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Tournaments</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Live and upcoming events</p>
        </div>

        {/* Tournament Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {tournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>

        {tournaments.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-400 dark:text-slate-500">No tournaments found at the moment.</p>
          </div>
        )}
      </div>
    </main>
  );
}
