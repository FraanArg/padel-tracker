
import { getTournaments } from '../src/lib/padel';

async function listTournaments() {
    console.log('Fetching tournaments...');
    const tournaments = await getTournaments();
    const mexico = tournaments.find(t => t.name.toUpperCase().includes('MEXICO') || t.name.toUpperCase().includes('MAJOR') || t.name.toUpperCase().includes('ACAPULCO'));
    if (mexico) {
        console.log('Found Mexico:', mexico);
    } else {
        console.log('Mexico not found. Listing all:');
        tournaments.forEach(t => console.log(t.name, t.url));
    }
}

listTournaments();
