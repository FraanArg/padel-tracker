import { getTournaments } from '@/lib/padel';
import TournamentCard from '@/components/TournamentCard';
import TournamentList from '@/components/TournamentList';
import Hero from '@/components/Hero';

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  const tournaments = await getTournaments();
  const liveTournaments = tournaments.filter(t => t.status === 'live');

  // Filter upcoming (future) and past (finished) tournaments
  // Note: getTournaments already filters out past events from the main return, 
  // but we might want to fetch them differently or adjust the logic in padel.ts to return everything and filter here.
  // For now, let's assume getTournaments returns sorted future events + live events.
  // Wait, I modified getTournaments to filter out past events. I should probably modify it to return ALL events so I can split them here.
  // Or I can just rely on the fact that I only want to show upcoming in the main list, but the user asked for a "Previous" tab.
  // So I need to update getTournaments to NOT filter out past events, but mark them as finished.

  // Let's assume I will update getTournaments to return everything.
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingTournaments = tournaments.filter(t => t.status !== 'live' && (!t.parsedDate || t.parsedDate >= today));
  const pastTournaments = tournaments.filter(t => t.status !== 'live' && t.parsedDate && t.parsedDate < today).reverse(); // Most recent past first

  return (
    <main className="min-h-screen pb-32">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

        <Hero nextTournament={tournaments[0]} />

        {/* Live Tournaments Section */}
        {liveTournaments.length > 0 && (
          <div className="space-y-6">
            <div className="space-y-1 px-2">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                Live Now
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {liveTournaments.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming & Past Tournaments */}
        <TournamentList
          upcomingTournaments={upcomingTournaments}
          pastTournaments={pastTournaments}
        />
      </div>
    </main>
  );
}
