
import { getHeadToHead } from '../src/lib/stats';

async function debugH2H() {
    // Tapia vs Galan (based on screenshot)
    // Player 1: Agustin Tapia
    // Player 2: Alejandro Galan
    // Year: 2025 (as per screenshot)

    console.log('Fetching H2H for Tapia vs Galan (2025)...');

    try {
        const result = await getHeadToHead(
            ['Agustin Tapia'],
            ['Alejandro Galan'],
            2025
        );

        console.log('--- Summary Stats ---');
        console.log(`Total Matches: ${result.totalMatches}`);
        console.log(`Team 1 Wins: ${result.team1Wins}`);
        console.log(`Team 2 Wins: ${result.team2Wins}`);

        console.log('\n--- Match List ---');
        result.matches.forEach((m, i) => {
            console.log(`Match ${i + 1}:`);
            console.log(`  Tournament: ${m.tournament?.name}`);
            console.log(`  Round: ${m.round}`);
            console.log(`  Score: ${m.score?.join(' ')}`);
            console.log(`  Team 1: ${m.team1?.join(', ')}`);
            console.log(`  Team 2: ${m.team2?.join(', ')}`);

            // Infer winner logic check
            let p1Won = false;
            if (m.score && m.score.length > 0) {
                let t1Sets = 0;
                let t2Sets = 0;
                m.score.forEach(s => {
                    const parts = s.replace(/[\(\)]/g, '').trim().split('-');
                    if (parts.length === 2) {
                        const g1 = parseInt(parts[0]);
                        const g2 = parseInt(parts[1]);
                        if (!isNaN(g1) && !isNaN(g2)) {
                            if (g1 > g2) t1Sets++;
                            else if (g2 > g1) t2Sets++;
                        }
                    }
                });

                // Check if Team 1 is actually Tapia's team in this match record
                // (Sometimes API might return matches where queried team is Team 2)
                const isTapiaTeam1 = m.team1?.some(p => p.includes('Tapia')) ?? false;

                if (isTapiaTeam1) {
                    p1Won = t1Sets > t2Sets;
                } else {
                    p1Won = t2Sets > t1Sets;
                }
                console.log(`  -> Inferred Winner: ${p1Won ? 'Tapia (Team 1)' : 'Galan (Team 2)'} (isTapiaTeam1: ${isTapiaTeam1})`);
            }
        });

    } catch (e) {
        console.error('Error fetching H2H:', e);
    }
}

debugH2H();
