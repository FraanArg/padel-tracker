
import { getTournaments } from '../src/lib/padel';

async function main() {
    console.log('Fetching tournaments...');
    const tournaments = await getTournaments();

    console.log('\n--- LIVE/UPCOMING ---');
    tournaments.filter(t => t.status !== 'finished').forEach(t => {
        console.log(`[${t.status?.toUpperCase()}] ${t.name} | ID: ${t.id} | URL: ${t.url}`);
    });

    console.log('\n--- RECENT FINISHED ---');
    tournaments.filter(t => t.status === 'finished').slice(0, 5).forEach(t => {
        console.log(`[FINISHED] ${t.name} | ID: ${t.id} | URL: ${t.url}`);
    });
}

main();
