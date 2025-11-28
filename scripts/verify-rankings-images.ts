
import { getRankings } from '../src/lib/padel';

async function verify() {
    console.log('Fetching rankings...');
    const { men, women } = await getRankings();

    console.log(`Fetched ${men.length} men and ${women.length} women.`);

    console.log('\n--- Top 5 Men ---');
    men.slice(0, 5).forEach(p => {
        console.log(`${p.rank}. ${p.name} - Image: ${p.imageUrl}`);
    });

    console.log('\n--- Top 5 Women ---');
    women.slice(0, 5).forEach(p => {
        console.log(`${p.rank}. ${p.name} - Image: ${p.imageUrl}`);
    });
}

verify();
