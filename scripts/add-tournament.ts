
import { getMatches } from '../src/lib/padel';
import { saveTournament } from '../src/lib/archive';

async function addTournament(url: string) {
    if (!url) {
        console.error("Please provide a URL as an argument.");
        process.exit(1);
    }

    console.log(`Fetching tournament from ${url}...`);
    try {
        const result = await getMatches(url);

        if (result && result.matches && result.matches.length > 0) {
            console.log(`Found ${result.matches.length} matches.`);

            // If we have a tournament name from the result, use it.
            // Otherwise, try to extract from URL or ask user (not interactive here).
            const name = result.tournamentName || "Unknown Tournament";
            const id = result.tournamentId || `t-${Date.now()}`;

            const filename = saveTournament(id, name, result.matches);
            console.log(`Successfully saved to ${filename}`);
        } else {
            console.error("No matches found. The URL might be invalid or the site is blocking requests.");
        }
    } catch (error) {
        console.error("Error adding tournament:", error);
    }
}

const url = process.argv[2];
addTournament(url);
