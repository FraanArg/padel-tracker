
import { getAllTournaments } from './src/lib/archive';

function debugTournaments() {
    console.log("Fetching all tournaments...");
    const tournaments = getAllTournaments();
    console.log(`Found ${tournaments.length} tournaments.`);

    if (tournaments.length > 0) {
        console.log("First Tournament:", JSON.stringify(tournaments[0], null, 2));
    }

    // Check for 2024 tournaments
    const t2024 = tournaments.filter(t => t.year === 2024);
    console.log(`Found ${t2024.length} tournaments for 2024.`);
}

debugTournaments();
