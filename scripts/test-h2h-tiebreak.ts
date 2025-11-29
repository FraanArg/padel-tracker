
import { getHeadToHead } from '../src/lib/stats';

const team1 = ['Agustin Tapia'];
const team2 = ['Alejandro Galan'];

console.log(`Testing H2H Tiebreak for ${team1} vs ${team2}...`);
const h2h = await getHeadToHead(team1, team2);

console.log('Total Matches:', h2h.totalMatches);
if (h2h.tiebreakStats) {
    console.log('Tiebreak Stats:');
    console.log('Total Tiebreaks:', h2h.tiebreakStats.total);
    console.log('Team 1 Wins:', h2h.tiebreakStats.team1Wins);
    console.log('Team 2 Wins:', h2h.tiebreakStats.team2Wins);
} else {
    console.error('Tiebreak Stats missing!');
}
