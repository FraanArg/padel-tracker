

import { getHeadToHead, getAllArchivedMatchesSync } from '../src/lib/stats';

async function testH2HAnalytics() {
    console.log('--- Debugging Data ---');
    const allMatches = getAllArchivedMatchesSync();
    console.log(`Total archived matches: ${allMatches.length}`);

    const galanMatches = allMatches.filter(m =>
        (m.team1 && m.team1.some(p => p.includes('Galan'))) ||
        (m.team2 && m.team2.some(p => p.includes('Galan')))
    );
    console.log(`Matches with "Galan": ${galanMatches.length}`);

    if (galanMatches.length > 0) {
        const sample = galanMatches[0];
        console.log('Sample Match:', JSON.stringify({
            tournament: sample.tournament?.name,
            team1: sample.team1,
            team2: sample.team2,
            score: sample.score,
            year: (sample as any).year
        }, null, 2));
    }


    // Test case: Galan/Chingotto vs Coello/Tapia (All Time)
    const team1 = ['A. Galan', 'F. Chingotto'];
    const team2 = ['A. Coello', 'A. Tapia'];
    const year = 'all';

    console.log(`\nTesting H2H for ${team1.join('/')} vs ${team2.join('/')} (${year})`);

    const stats = await getHeadToHead(team1, team2, year);


    console.log('Total Matches:', stats.totalMatches);
    console.log('Team 1 Wins:', stats.team1Wins);
    console.log('Team 2 Wins:', stats.team2Wins);

    if (stats.totalMatches > 0) {
        console.log('\n--- First Strike Stats ---');
        console.log(JSON.stringify(stats.firstSetStats, null, 2));

        console.log('\n--- Deciding Set Stats ---');
        console.log(JSON.stringify(stats.threeSetStats, null, 2));

        console.log('\n--- Tiebreak Stats ---');
        console.log(JSON.stringify(stats.tiebreakStats, null, 2));
    }
}

testH2HAnalytics().catch(console.error);

