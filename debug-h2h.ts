
import { getHeadToHead, getAllArchivedMatchesSync } from './src/lib/stats';

async function testH2H() {
    console.log("Testing H2H...");

    const team1 = ["Agustin Tapia"];
    const team2 = ["Alejandro Galan"];

    console.log("\n--- Testing 2025 ---");
    const h2h2025 = await getHeadToHead(team1, team2, 2025);
    console.log(`H2H 2025 Matches: ${h2h2025.totalMatches}`);
    console.log(`Team 1 Wins: ${h2h2025.team1Wins}`);
    console.log(`Team 2 Wins: ${h2h2025.team2Wins}`);

    console.log("\n--- Testing All Time ---");
    const h2hAll = await getHeadToHead(team1, team2, 'all');
    console.log(`H2H All Time Matches: ${h2hAll.totalMatches}`);
}

testH2H().catch(console.error);
