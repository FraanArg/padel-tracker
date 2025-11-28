import { NextResponse } from 'next/server';
import { getTournaments, getMatches } from '@/lib/padel';

export async function POST(request: Request) {
    try {
        const { favorites } = await request.json();

        if (!favorites || !Array.isArray(favorites) || favorites.length === 0) {
            return NextResponse.json({ matches: [] });
        }

        // Normalize favorites for easier comparison
        const normalizedFavorites = favorites.map((f: string) => f.toLowerCase().trim());

        // 1. Fetch all tournaments
        const tournaments = await getTournaments();

        // 2. Fetch matches for each tournament (in parallel, but maybe limited?)
        // For now, let's just fetch all. It might be slow if there are many tournaments.
        const matchesPromises = tournaments.map(async (tournament) => {
            const data = await getMatches(tournament.url);
            if ('error' in data) return [];

            // Filter matches
            return data.matches.filter((match: any) => {
                // Check if any player in team1 or team2 is in favorites
                const allPlayers = [...(match.team1 || []), ...(match.team2 || [])];
                return allPlayers.some(player => {
                    const pName = player.toLowerCase();
                    return normalizedFavorites.some(fav => pName.includes(fav));
                });
            }).map(match => ({
                ...match,
                tournament: {
                    name: tournament.name,
                    id: tournament.id
                }
            }));
        });

        const results = await Promise.all(matchesPromises);
        const allMatches = results.flat();

        return NextResponse.json({ matches: allMatches });

    } catch (error) {
        console.error('Error searching matches:', error);
        return NextResponse.json({ error: 'Failed to search matches' }, { status: 500 });
    }
}
