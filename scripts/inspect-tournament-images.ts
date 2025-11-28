
import axios from 'axios';
import * as cheerio from 'cheerio';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function inspectTournamentImages() {
    try {
        console.log('Fetching tournament list...');
        const { data } = await axios.get('https://www.padelfip.com/live/', {
            headers: { 'User-Agent': USER_AGENT }
        });
        const $ = cheerio.load(data);

        console.log('Found tournament images:');
        $('.cover-category-event').each((i, element) => {
            const img = $(element);
            console.log(`\n--- Image ${i + 1} ---`);
            console.log('src:', img.attr('src'));
            console.log('data-src:', img.attr('data-src'));
            console.log('data-lazy-src:', img.attr('data-lazy-src'));
            console.log('srcset:', img.attr('srcset'));
            console.log('data-srcset:', img.attr('data-srcset'));
            console.log('width:', img.attr('width'));
            console.log('height:', img.attr('height'));

            // Also check parent for picture tag sources
            const parent = img.parent();
            if (parent.is('picture')) {
                console.log('Parent is <picture>');
                parent.find('source').each((j, src) => {
                    console.log(`  Source ${j}:`, $(src).attr('srcset'));
                });
            }
        });

    } catch (e: any) {
        console.error('Error:', e.message);
    }
}

inspectTournamentImages();
