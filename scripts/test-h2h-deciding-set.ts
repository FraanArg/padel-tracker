
import { getHeadToHead } from '../src/lib/stats';

const team1 = ['Agustin Tapia'];
const team2 = ['Alejandro Galan'];

console.log(`Testing H2H Deciding Set for ${team1} vs ${team2}...`);
const h2h = await getHeadToHead(team1, team2);

console.log('Total Matches:', h2h.totalMatches);
if (h2h.threeSetStats) {
    console.log('3-Set Stats:');
    console.log('Total 3-Set Matches:', h2h.threeSetStats.total);
    console.log('Team 1 Wins:', h2h.threeSetStats.team1Wins);
    console.log('Team 2 Wins:', h2h.threeSetStats.team2Wins);
} else {
    console.error('3-Set Stats missing!');
}
