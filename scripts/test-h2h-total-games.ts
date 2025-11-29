
import { getHeadToHead } from '../src/lib/stats';

// Mock data will be loaded by the function from the file system
// We will test with known players

async function testTotalGames() {
    console.log('Testing H2H Total Games Logic...');

    // Test Case 1: Galan/Chingotto vs Coello/Tapia (2024)
    // These teams played many times in 2024
    const team1 = ['A. Galan', 'F. Chingotto'];
    const team2 = ['A. Coello', 'A. Tapia'];
    const year = 2024;

    console.log(`\nAnalyzing H2H for ${team1.join('/')} vs ${team2.join('/')} in ${year}`);

    const stats = await getHeadToHead(team1, team2, year);

    console.log(`Total Matches: ${stats.totalMatches}`);
    console.log(`Team 1 Wins: ${stats.team1Wins}`);
    console.log(`Team 2 Wins: ${stats.team2Wins}`);

    if (stats.totalGamesStats) {
        console.log('\nTotal Games Stats:');
        console.log(`Total Games Played: ${stats.totalGamesStats.total}`);
        console.log(`Team 1 Games Won: ${stats.totalGamesStats.team1Wins}`);
        console.log(`Team 2 Games Won: ${stats.totalGamesStats.team2Wins}`);

        const t1Pct = (stats.totalGamesStats.team1Wins / stats.totalGamesStats.total) * 100;
        const t2Pct = (stats.totalGamesStats.team2Wins / stats.totalGamesStats.total) * 100;

        console.log(`Team 1 %: ${t1Pct.toFixed(1)}%`);
        console.log(`Team 2 %: ${t2Pct.toFixed(1)}%`);

        // Basic validation
        if (stats.totalGamesStats.total !== (stats.totalGamesStats.team1Wins + stats.totalGamesStats.team2Wins)) {
            console.error('ERROR: Total games does not match sum of team wins!');
        } else {
            console.log('VALIDATION: Total games sum is correct.');
        }
    } else {
        console.error('ERROR: totalGamesStats is missing!');
    }
}

testTotalGames().catch(console.error);
