import { getTournaments } from '@/lib/padel';
import TournamentCard from '@/components/TournamentCard';
import Hero from '@/components/Hero';

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  const tournaments = await getTournaments();

  return (
    <main className="min-h-screen pb-20">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

        <Hero nextTournament={tournaments[0]} />

        {/* Header */}
        <div className="space-y-1 px-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-8 bg-blue-500 rounded-full inline-block"></span>
            All Tournaments
          </h2>
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
