import { getMatches } from '../src/lib/padel';

async function testLiveFix() {
    const url = 'https://www.padelfip.com/events/premier-padel-gnp-acapulco-major-2025/?tab=Live+Score';
    console.log(`Testing Live Fix with URL: ${url}`);

    const result = await getMatches(url);



    console.log(`Found ${result.matches.length} matches.`);
    console.log(`Widget ID: ${result.widgetId}`);
    console.log(`Active URL: ${result.activeDayUrl}`);

    const liveMatches = result.matches.filter((m: any) => m.status?.toLowerCase() === 'live');
    console.log(`Live Matches: ${liveMatches.length}`);

    result.matches.slice(0, 3).forEach((m: any) => {
        console.log(`[${m.status}] ${m.team1?.join('/')} vs ${m.team2?.join('/')} (${m.score?.join(' ')})`);
    });
}

testLiveFix();
