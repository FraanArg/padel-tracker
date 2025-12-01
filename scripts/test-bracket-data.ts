
import { getAllMatches } from '../src/lib/padel';

async function main() {
    const url = 'https://www.padelfip.com/events/milano-premier-padel-p1-2024/';
    console.log(`Fetching all matches for: ${url}`);

    const { matches } = await getAllMatches(url);

    console.log(`Total matches found: ${matches.length}`);

    // Group by round
    const rounds: Record<string, number> = {};
    matches.forEach(m => {
        const r = m.round || 'Unknown';
        rounds[r] = (rounds[r] || 0) + 1;
    });

    console.log('\n--- Round Distribution ---');
    console.table(rounds);

    // Check specifically for QF, SF, F
    const qf = matches.filter(m => m.round?.toLowerCase().includes('quarter'));
    const sf = matches.filter(m => m.round?.toLowerCase().includes('semi'));
    const f = matches.filter(m => m.round?.toLowerCase().includes('final') && !m.round?.toLowerCase().includes('semi') && !m.round?.toLowerCase().includes('quarter'));

    console.log('\n--- Bracket Matches ---');
    console.log(`Quarter Finals: ${qf.length}`);
    console.log(`Semi Finals: ${sf.length}`);
    console.log(`Finals: ${f.length}`);

    if (f.length > 0) {
        console.log('\nFinal Match:');
        console.log(f[0].raw);
    }
}

main();
