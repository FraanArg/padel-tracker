
import axios from 'axios';
import * as cheerio from 'cheerio';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function inspectProfile() {
    const url = 'https://www.padelfip.com/player/victoria-iglesias/';
    console.log(`Fetching ${url}...`);
    try {
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': USER_AGENT }
        });
        const $ = cheerio.load(data);

        // Check for flag
        const flagImg = $('.player-country img, .country img, .flag img');
        console.log('Flag Src:', flagImg.attr('src'));
        console.log('Flag Data-Src:', flagImg.attr('data-src'));
        console.log('Flag Alt:', flagImg.attr('alt'));
        console.log('Flag Parent HTML:', flagImg.parent().html()?.substring(0, 300));

        // Check for main image again (meta vs img)
        console.log('Meta OG Image:', $('meta[property="og:image"]').attr('content'));
        const mainImg = $('.player-image img, .wp-post-image');
        console.log('Main Img Src:', mainImg.attr('src'));
        console.log('Main Img Data-Src:', mainImg.attr('data-src'));

        console.log('Page Title:', $('title').text());
        const html = $.html();
        console.log('HTML Length:', html.length);

        const nameIdx = html.indexOf('Victoria');
        if (nameIdx !== -1) {
            console.log('Name Context:', html.substring(nameIdx - 200, nameIdx + 200));
        } else {
            console.log('Name "Victoria" NOT found in HTML');
        }

    } catch (e: any) {
        console.error('Fetch failed:', e.message);
    }
}

inspectProfile();
