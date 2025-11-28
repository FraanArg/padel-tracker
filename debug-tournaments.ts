
import { getTournaments } from './src/lib/padel';

async function debug() {
    console.log('Fetching tournaments...');
    const tournaments = await getTournaments();

    console.log(`Found ${tournaments.length} tournaments.`);

    const mexico = tournaments.filter(t =>
        t.name.toUpperCase().includes('MEXICO') ||
        t.name.toUpperCase().includes('ACAPULCO') ||
        t.name.toUpperCase().includes('MAJOR')
    );

    console.log('--- Potential Mexico/Major Tournaments ---');
    mexico.forEach(t => {
        console.log({
            name: t.name,
            status: t.status,
            dateStart: t.dateStart,
            parsedDate: t.parsedDate,
            url: t.url
        });
    });

    console.log('--- All Live Tournaments ---');
    const live = tournaments.filter(t => t.status === 'live');
    live.forEach(t => {
        console.log({
            name: t.name,
            status: t.status,
            dateStart: t.dateStart
        });
    });
}

debug();
