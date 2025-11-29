
import { getHeadToHead } from '../src/lib/stats';

const team1 = ['Agustin Tapia'];
const team2 = ['Alejandro Galan'];

console.log(`Testing H2H Round Stats for ${team1} vs ${team2}...`);
const h2h = await getHeadToHead(team1, team2);

console.log('Total Matches:', h2h.totalMatches);
if (h2h.roundStats) {
    console.log('Round Stats:');
    Object.keys(h2h.roundStats).forEach(round => {
        const stats = h2h.roundStats![round];
        console.log(`${round}: Total ${stats.total} - Team 1 Wins: ${stats.team1Wins}, Team 2 Wins: ${stats.team2Wins}`);
    });
} else {
    console.error('Round Stats missing!');
}
