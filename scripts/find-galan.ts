
import axios from 'axios';
import * as cheerio from 'cheerio';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function findGalan() {
    console.log('Fetching male rankings...');
    const { data } = await axios.get('https://www.padelfip.com/ranking-male/', {
        headers: { 'User-Agent': USER_AGENT }
    });
    const $ = cheerio.load(data);

    const images = $('img');
    console.log(`Found ${images.length} images.`);

    images.each((i, el) => {
        const alt = $(el).attr('alt') || '';
        const src = $(el).attr('src') || '';
        if (alt.toLowerCase().includes('tapia')) {
            console.log(`Found Tapia Image:`, src);
            console.log(`Parent HTML:`, $(el).parent().html()?.substring(0, 300));
            console.log(`Grandparent HTML:`, $(el).parent().parent().html()?.substring(0, 300));
        }
    });
}

findGalan();
