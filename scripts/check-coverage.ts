
import axios from 'axios';
import * as cheerio from 'cheerio';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function checkCoverage() {
    const urls = [
        { name: 'Male', url: 'https://www.padelfip.com/ranking-male/' },
        { name: 'Female', url: 'https://www.padelfip.com/ranking-female/' }
    ];

    for (const { name, url } of urls) {
        console.log(`\nChecking ${name} Rankings...`);
        try {
            const { data } = await axios.get(url, { headers: { 'User-Agent': USER_AGENT } });
            const $ = cheerio.load(data);

            const players: any[] = [];

            // 1. Slider
            $('.slider__overall').each((_, el) => {
                const slider = $(el);
                const rank = slider.find('.slider__number').text().trim().split(' ')[0];
                const name = slider.find('.slider__name').text().trim();
                if (name) players.push({ rank, name, source: 'Slider' });
            });

            // 2. Table
            $('table tr').each((_, el) => {
                const row = $(el);
                const cells = row.find('td');
                if (cells.length >= 2) {
                    const rank = $(cells[0]).text().trim().split(' ')[0];
                    let name = $(cells[1]).text().trim();
                    if (name.startsWith('<img')) {
                        const $inner = cheerio.load(name);
                        name = $inner.text().trim();
                    }
                    if (name && rank && !isNaN(parseInt(rank))) {
                        players.push({ rank, name, source: 'Table' });
                    }
                }
            });

            console.log(`Found ${players.length} players.`);
            if (players.length > 0) {
                console.log('Ranks found:', players.map(p => p.rank).join(', '));
                console.log('First 5:', players.slice(0, 5));
                console.log('Last 5:', players.slice(-5));
            }

            // Check for specific players
            const targets = name === 'Male' ? ['Galan', 'Tapia', 'Coello', 'Gala'] : ['Iglesias', 'Josemaria', 'Sanchez', 'Llaguno'];
            console.log('Checking targets:');
            targets.forEach(t => {
                const found = players.find(p => p.name.toLowerCase().includes(t.toLowerCase()));
                console.log(`  ${t}: ${found ? `FOUND (Rank ${found.rank})` : 'MISSING'}`);
            });

        } catch (e: any) {
            console.error(`Error fetching ${name}:`, e.message);
        }
    }
}

checkCoverage();
