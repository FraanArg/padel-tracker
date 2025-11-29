
import { getHeadToHead } from '../src/lib/stats';

async function testAvgMatchLength() {
    console.log('Testing H2H Average Match Length Logic...');

    // Test Case: Galan/Chingotto vs Coello/Tapia (2024)
    const team1 = ['A. Galan', 'F. Chingotto'];
    const team2 = ['A. Coello', 'A. Tapia'];
    const year = 2024;

    console.log(`\nAnalyzing H2H for ${team1.join('/')} vs ${team2.join('/')} in ${year}`);

    const stats = await getHeadToHead(team1, team2, year);

    console.log(`Total Matches: ${stats.totalMatches}`);

    if (stats.averageMatchLength) {
        console.log('\nAverage Match Length Stats:');
        console.log(`Avg Sets: ${stats.averageMatchLength.avgSets}`);
        console.log(`Avg Games: ${stats.averageMatchLength.avgGames}`);

        // Basic validation
        if (stats.averageMatchLength.avgSets > 0 && stats.averageMatchLength.avgGames > 0) {
            console.log('VALIDATION: Averages are positive.');
        } else {
            console.error('ERROR: Averages are zero or negative!');
        }
    } else {
        console.error('ERROR: averageMatchLength is missing!');
    }
}

testAvgMatchLength().catch(console.error);
