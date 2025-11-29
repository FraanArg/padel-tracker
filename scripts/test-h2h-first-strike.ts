
import { getHeadToHead } from '../src/lib/stats';

const team1 = ['Agustin Tapia'];
const team2 = ['Alejandro Galan'];

console.log(`Testing H2H for ${team1} vs ${team2}...`);
const h2h = await getHeadToHead(team1, team2);

console.log('Total Matches:', h2h.totalMatches);
console.log('Team 1 Wins:', h2h.team1Wins);
console.log('Team 2 Wins:', h2h.team2Wins);

if (h2h.firstSetStats) {
    console.log('First Set Stats:');
    console.log('Team 1 Won First Set:', h2h.firstSetStats.team1WonFirstSet);
    console.log('Team 1 Won Match After First Set:', h2h.firstSetStats.team1WonMatchAfterFirstSet);
    console.log('Team 2 Won First Set:', h2h.firstSetStats.team2WonFirstSet);
    console.log('Team 2 Won Match After First Set:', h2h.firstSetStats.team2WonMatchAfterFirstSet);
} else {
    console.error('First Set Stats missing!');
}
