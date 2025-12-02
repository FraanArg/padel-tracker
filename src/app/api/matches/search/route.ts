import { NextResponse } from 'next/server';
import { getTournaments, getMatches, Match } from '@/lib/padel';
import { getAllArchivedMatchesAsync } from '@/lib/stats';

export async function POST(request: Request) {
    try {
        const { favorites } = await request.json();

        if (!favorites || !Array.isArray(favorites) || favorites.length === 0) {
            return NextResponse.json({ matches: [] });
        }

        // Normalize favorites for easier comparison
        const normalizedFavorites = favorites.map((f: string) => f.toLowerCase().trim());

        // 1. Fetch all tournaments (Live/Upcoming)
        const tournaments = await getTournaments();

        // 2. Fetch matches for each tournament (Live/Upcoming)
        const liveMatchesPromises = tournaments.map(async (tournament) => {
            const data = await getMatches(tournament.url);
            if ('error' in data) return [];

            // Filter matches
            return data.matches.filter((match: any) => {
                const allPlayers = [...(match.team1 || []), ...(match.team2 || [])];
                return allPlayers.some(player => {
                    const pName = player.toLowerCase();
                    return normalizedFavorites.some(fav => pName.includes(fav));
                });
            }).map((match: Match) => ({
                ...match,
                tournament: {
                    name: tournament.name,
                    id: tournament.id
                },
                isLiveOrUpcoming: true
            }));
        });

        const liveResults = await Promise.all(liveMatchesPromises);
        const liveMatches = liveResults.flat();

        // 3. Fetch Archived Matches (Recent Results)
        let archivedMatches: Match[] = [];
        try {
            const allArchived = await getAllArchivedMatchesAsync();
            archivedMatches = allArchived.filter((match: Match) => {
                const allPlayers = [...(match.team1 || []), ...(match.team2 || [])];
                return allPlayers.some(player => {
                    const pName = player.toLowerCase();
                    return normalizedFavorites.some(fav => pName.includes(fav));
                });
            }).map(m => ({ ...m, isArchived: true }));
        } catch (e) {
            console.error('Failed to fetch archived matches:', e);
        }

        // 4. Combine and Sort
        // We want Live/Upcoming first, then Recent Results (sorted by date desc)

        // Sort archived by date desc
        archivedMatches.sort((a, b) => {
            // Try to use tournament date if available
            const getMatchDate = (m: Match) => {
                if (m.tournament?.dateStart) return new Date(m.tournament.dateStart).getTime();
                if ((m as any).year) return new Date((m as any).year, 0, 1).getTime();
                return 0;
            };
            return getMatchDate(b) - getMatchDate(a);
        });

        // Limit archived to last 20
        const recentMatches = archivedMatches.slice(0, 20);

        const allMatches = [...liveMatches, ...recentMatches];

        return NextResponse.json({ matches: allMatches });

    } catch (error) {
        console.error('Error searching matches:', error);
        return NextResponse.json({ error: 'Failed to search matches' }, { status: 500 });
    }
}
