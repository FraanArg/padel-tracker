
import axios from 'axios';
import * as cheerio from 'cheerio';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function debugLive() {
    try {
        console.log('Fetching https://www.padelfip.com/live/ ...');
        const { data } = await axios.get('https://www.padelfip.com/live/', {
            headers: { 'User-Agent': USER_AGENT }
        });
        const $ = cheerio.load(data);

        console.log('--- Live Tournaments Found ---');
        $('.cover-category-event').each((_, element) => {
            const img = $(element);
            const link = img.closest('a');
            const eventUrl = link.attr('href');
            const wrapper = $(element).closest('.wrapper-events');
            const name = wrapper.find('.name-event').text().trim();

            // Log all image attributes to find the best quality one
            const imgAttrs = img.attr();

            if (name.toUpperCase().includes('ACAPULCO') || name.toUpperCase().includes('MAJOR')) {
                console.log('*** FOUND ACAPULCO/MAJOR ***');
                console.log({
                    name,
                    url: eventUrl,
                    imgAttributes: imgAttrs
                });
            }
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

debugLive();
