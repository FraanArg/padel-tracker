
import { getHeadToHead } from '../src/lib/stats';

async function testBigMatch() {
    console.log('Testing H2H Big Match Logic...');

    // Test Case: Galan/Chingotto vs Coello/Tapia (2024)
    const team1 = ['A. Galan', 'F. Chingotto'];
    const team2 = ['A. Coello', 'A. Tapia'];
    const year = 2024;

    console.log(`\nAnalyzing H2H for ${team1.join('/')} vs ${team2.join('/')} in ${year}`);

    const stats = await getHeadToHead(team1, team2, year);

    console.log(`Total Matches: ${stats.totalMatches}`);

    if (stats.bigMatchStats) {
        console.log('\nBig Match Stats (Major/P1):');
        console.log(`Total: ${stats.bigMatchStats.total}`);
        console.log(`Team 1 Wins: ${stats.bigMatchStats.team1Wins}`);
        console.log(`Team 2 Wins: ${stats.bigMatchStats.team2Wins}`);

        // Verification
        // We know they played several P1s and Majors.
        // Let's list them to verify.
        console.log('\nBig Matches Found:');
        stats.matches.forEach(m => {
            const name = m.tournament?.name?.toLowerCase() || '';
            if (name.includes('major') || name.includes('p1')) {
                console.log(`- ${m.tournament?.name} (${m.score?.join(' ')})`);
            }
        });

        if (stats.bigMatchStats.total > 0) {
            console.log('\nVALIDATION: Big Match stats calculated.');
        } else {
            console.error('\nERROR: No Big Matches found (unexpected for this rivalry).');
        }
    } else {
        console.error('ERROR: bigMatchStats is missing!');
    }
}

testBigMatch().catch(console.error);
