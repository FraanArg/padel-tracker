
import axios from 'axios';
import * as cheerio from 'cheerio';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function inspectDate() {
    try {
        console.log('Fetching live page...');
        const { data } = await axios.get('https://www.padelfip.com/live/', {
            headers: { 'User-Agent': USER_AGENT }
        });
        const $ = cheerio.load(data);

        console.log('Inspecting tournaments...');
        const html = $.html();
        const index = html.indexOf('ACAPULCO');
        if (index !== -1) {
            console.log('Found ACAPULCO at index', index);
            const start = Math.max(0, index - 2000);
            const end = Math.min(html.length, index + 2000);
            const context = html.substring(start, end);

            const fs = await import('fs');
            fs.writeFileSync('debug_date.txt', context);
            console.log('Saved context to debug_date.txt');
        } else {
            console.log('ACAPULCO not found in HTML');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

inspectDate();
