
import axios from 'axios';
import * as cheerio from 'cheerio';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function debugRankings() {
    const url = 'https://www.padelfip.com/ranking-male/';
    console.log(`Fetching ${url}...`);

    try {
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': USER_AGENT }
        });
        const $ = cheerio.load(data);

        const rows = $('table tr');
        console.log(`Found ${rows.length} rows.`);

        if (rows.length > 0) {
            const lastRow = rows.last();
            console.log('Last Row:', lastRow.text().trim());
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

debugRankings();
