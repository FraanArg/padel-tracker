
import { getRankings } from '../src/lib/padel';
import axios from 'axios';

// Increase timeout
axios.defaults.timeout = 30000;

async function main() {
    console.log('Fetching rankings with increased timeout...');
    try {
        const { men, women } = await getRankings();

        console.log('\n--- MEN (Top 10) ---');
        men.slice(0, 10).forEach(p => {
            console.log(`Rank: ${p.rank} | Name: ${p.name} | Country: "${p.country}" | FlagURL: "${p.flagUrl}"`);
        });

        console.log('\n--- WOMEN (Top 10) ---');
        women.slice(0, 10).forEach(p => {
            console.log(`Rank: ${p.rank} | Name: ${p.name} | Country: "${p.country}" | FlagURL: "${p.flagUrl}"`);
        });
    } catch (e) {
        console.error('Failed again:', e);
    }
}

main();
