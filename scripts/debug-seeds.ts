
import { getMatches } from '../src/lib/padel';

async function debugSeeds() {
    try {
        const url = 'https://www.padelfip.com/events/mexico-major-2025/';
        console.log('Fetching matches...');
        const data = await getMatches(url);

        if (data.matches) {
            console.log(`Found ${data.matches.length} matches.`);
            data.matches.forEach((m: any, idx: number) => {
                const hasSeed = m.team1Seed || m.team2Seed;
                if (hasSeed || idx < 5) {
                    console.log(`Match ${idx + 1}:`);
                    console.log(`  Team 1: ${JSON.stringify(m.team1)} (Seed: "${m.team1Seed}")`);
                    console.log(`  Team 2: ${JSON.stringify(m.team2)} (Seed: "${m.team2Seed}")`);
                    console.log(`  Raw: ${m.raw}`);
                }
            });
        } else {
            console.log('No matches found.');
        }

    } catch (e: any) {
        console.error('Error:', e.message);
    }
}

debugSeeds();
