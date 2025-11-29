
import { getAllMatches } from '../src/lib/padel';
import { saveTournament } from '../src/lib/archive';

const url = process.argv[2];

if (!url) {
    console.error('Please provide a tournament URL');
    process.exit(1);
}

async function main() {
    console.log(`Archiving tournament from ${url}...`);
    try {
        const result = await getAllMatches(url);



        const name = result.tournamentName || 'Unknown Tournament';
        const id = result.tournamentId || 'unknown-id';
        const matches = result.matches || [];

        console.log(`Found ${matches.length} matches for "${name}"`);

        if (matches.length > 0) {
            const filename = saveTournament(id, name, matches);
            console.log(`Successfully archived to ${filename}`);
        } else {
            console.log('No matches found to archive.');
        }

    } catch (error) {
        console.error('Failed to archive:', error);
        process.exit(1);
    }
}

main();
