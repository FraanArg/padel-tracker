
import { getHeadToHead } from '../src/lib/stats';

async function testTimeline() {
    console.log('Testing H2H Timeline Sorting Logic...');

    // Test Case: Galan/Chingotto vs Coello/Tapia (2024)
    const team1 = ['A. Galan', 'F. Chingotto'];
    const team2 = ['A. Coello', 'A. Tapia'];
    const year = 2024;

    console.log(`\nAnalyzing H2H for ${team1.join('/')} vs ${team2.join('/')} in ${year}`);

    const stats = await getHeadToHead(team1, team2, year);

    console.log(`Total Matches: ${stats.totalMatches}`);

    if (stats.matches.length > 0) {
        console.log('\nMatch Timeline (Sorted?):');
        let previousDate = 0;
        let isSorted = true;

        stats.matches.forEach((m, i) => {
            let date = 0;
            if (m.tournament?.dateStart) {
                const parts = m.tournament.dateStart.split('/');
                if (parts.length === 3) {
                    date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
                } else {
                    date = new Date(m.tournament.dateStart).getTime();
                }
            }

            console.log(`${i + 1}. ${m.tournament?.name} - ${m.tournament?.dateStart} (${date})`);

            if (date < previousDate) {
                isSorted = false;
                console.error(`  ERROR: Match ${i + 1} is out of order!`);
            }
            previousDate = date;
        });

        if (isSorted) {
            console.log('\nVALIDATION: Matches are sorted chronologically.');
        } else {
            console.error('\nERROR: Matches are NOT sorted correctly!');
        }
    } else {
        console.error('ERROR: No matches found!');
    }
}

testTimeline().catch(console.error);
