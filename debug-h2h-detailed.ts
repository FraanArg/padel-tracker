
import { getHeadToHead } from './src/lib/stats';
import { listArchivedTournaments } from './src/lib/archive';

async function debugDetailed() {
    console.log("--- Debugging H2H Details ---");

    // 1. List Tournaments
    const files = listArchivedTournaments();
    console.log(`Found ${files.length} tournament files.`);

    // 2. Get H2H Matches
    const team1 = ["Agustin Tapia"];
    const team2 = ["Alejandro Galan"];

    const h2h = await getHeadToHead(team1, team2, 'all');
    console.log(`\nTotal H2H Matches (All Time): ${h2h.totalMatches}`);
    console.log(`Tapia Wins: ${h2h.team1Wins}`);
    console.log(`Galan Wins: ${h2h.team2Wins}`);

    console.log("\n--- Match List ---");
    h2h.matches.forEach((m, i) => {
        const date = m.tournament?.dateStart || (m as any).year;
        const tournament = m.tournament?.name || 'Unknown';
        const round = m.round || '-';
        const score = m.score?.join(' ') || 'No Score';

        const t1 = m.team1?.join('/') || '';
        const t2 = m.team2?.join('/') || '';

        console.log(`${i + 1}. [${date}] ${tournament} (${round})`);
        console.log(`   ${t1} vs ${t2}`);
        console.log(`   Score: ${score}`);
    });


    console.log("\n--- Checking ANY Lebron Matches ---");
    const allMatches = await import('./src/lib/archive').then(m => m.getAllArchivedMatchesSync());
    const lebronMatches = allMatches.filter(m =>
        (m.team1 && m.team1.some(p => p.toLowerCase().includes('lebron'))) ||
        (m.team2 && m.team2.some(p => p.toLowerCase().includes('lebron')))
    );
    console.log(`Total Lebron Matches: ${lebronMatches.length}`);
    if (lebronMatches.length > 0) {
        console.log("Sample Lebron Match:", JSON.stringify(lebronMatches[0], null, 2));
    }
}

debugDetailed().catch(console.error);
