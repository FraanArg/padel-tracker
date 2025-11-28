
import axios from 'axios';
import * as cheerio from 'cheerio';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function debugSearch() {
    const query = 'Iglesias';
    console.log(`Searching for "${query}"...`);
    try {
        const url = `https://www.padelfip.com/?s=${query}`;
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': USER_AGENT }
        });
        const $ = cheerio.load(data);

        const results = $('.entry-title a'); // Standard WP search results title link
        console.log(`Found ${results.length} results.`);

        results.each((i, el) => {
            const title = $(el).text().trim();
            const href = $(el).attr('href');
            console.log(`Result ${i}: ${title} -> ${href}`);
        });

    } catch (e: any) {
        console.error('Search failed:', e.message);
    }
}

debugSearch();
