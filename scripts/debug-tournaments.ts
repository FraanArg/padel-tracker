import axios from 'axios';
import * as cheerio from 'cheerio';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function debugTournaments() {
    try {
        console.log('Fetching https://www.padelfip.com/live/ ...');
        const { data } = await axios.get('https://www.padelfip.com/live/', {
            headers: { 'User-Agent': USER_AGENT }
        });
        const $ = cheerio.load(data);

        console.log('Parsing tournaments...');
        $('.cover-category-event').each((i, element) => {
            const img = $(element);
            const link = img.closest('a');
            const container = link.parent();

            console.log(`\n--- Tournament ${i + 1} ---`);
            console.log('Container HTML snippet:', container.html()?.substring(0, 300));

            let name = 'Unknown Tournament';
            container.find('a').each((_, el) => {
                const t = $(el).text().trim();
                const href = $(el).attr('href');
                console.log(`Found link: text="${t}", href="${href}"`);
            });

            const header = container.find('h1, h2, h3, h4, h5, h6').first();
            console.log('Header found:', header.text().trim());
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

debugTournaments();
