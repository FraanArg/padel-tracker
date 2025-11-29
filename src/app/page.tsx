import { getTournaments } from '@/lib/padel';
import TournamentList from '@/components/TournamentList';
import TournamentHero from '@/components/TournamentHero';

export const revalidate = 3600; // Revalidate every hour

export default async function Home() {
  const tournaments = await getTournaments();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Categorize tournaments
  // Note: getTournaments returns sorted list.
  // We need to split them based on status or date.

  const liveTournaments = tournaments.filter(t => t.status === 'live');

  // Upcoming: status is upcoming OR (status is undefined/unknown AND date is future)
  const upcomingTournaments = tournaments.filter(t =>
    t.status === 'upcoming' ||
    (t.status !== 'live' && t.status !== 'finished' && (!t.parsedDate || t.parsedDate >= today))
  );

  // Past: status is finished OR (status is undefined/unknown AND date is past)
  const pastTournaments = tournaments.filter(t =>
    t.status === 'finished' ||
    (t.status !== 'live' && t.status !== 'upcoming' && t.parsedDate && t.parsedDate < today)
  );

  // Find best live tournament for Hero
  const bestLive = liveTournaments.length > 0 ? liveTournaments[0] : null;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#121212] pb-24 safe-area-inset-bottom">
      <div className="max-w-md mx-auto md:max-w-2xl lg:max-w-4xl px-4 pt-6">

        {/* Hero Section */}
        {bestLive && (
          <TournamentHero tournament={bestLive} />
        )}

        {/* Tournament List (Tabs: Live, Upcoming, Previous) */}
        <TournamentList
          liveTournaments={liveTournaments}
          upcomingTournaments={upcomingTournaments}
          pastTournaments={pastTournaments}
        />
      </div>
    </main>
  );
}
