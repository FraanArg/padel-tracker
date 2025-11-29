
import { getHeadToHead, getPlayerStats } from '../src/lib/stats';

async function main() {
    console.log('--- Testing Player Stats ---');
    const galanStats = getPlayerStats('Galan');
    console.log('Galan Stats:', JSON.stringify(galanStats, null, 2));

    const coelloStats = getPlayerStats('Coello');
    console.log('Coello Stats:', JSON.stringify(coelloStats, null, 2));

    console.log('\n--- Testing H2H (Galan vs Coello) ---');
    const h2h = getHeadToHead(['Galan'], ['Coello']);
    console.log(`Total Matches: ${h2h.totalMatches}`);
    console.log(`Galan Wins: ${h2h.team1Wins}`);
    console.log(`Coello Wins: ${h2h.team2Wins}`);

    console.log('\n--- Recent H2H Matches ---');
    h2h.matches.slice(0, 5).forEach(m => {
        console.log(`${m.tournament?.name}: ${m.round} - ${m.score?.join(' ')}`);
        console.log(`   ${m.team1?.join('/')} vs ${m.team2?.join('/')}`);
    });
}

main();
