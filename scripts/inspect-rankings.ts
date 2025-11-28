import axios from 'axios';
import * as cheerio from 'cheerio';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function testImageGuessing() {
    const players = [
        { name: 'Agustin Tapia', url: 'https://www.padelfip.com/player/agustin-tapia/' },
        { name: 'Arturo Coello', url: 'https://www.padelfip.com/player/arturo-coello/' },
        { name: 'Juan Tello', url: 'https://www.padelfip.com/player/juan-tello/' }
    ];

    for (const player of players) {
        try {
            console.log(`\nChecking ${player.name}...`);
            const { data } = await axios.get(player.url, {
                headers: { 'User-Agent': USER_AGENT }
            });
            const $ = cheerio.load(data);

            const ogImage = $('meta[property="og:image"]').attr('content');
            console.log(`og:image: ${ogImage}`);

            // Find the action shot (usually in slider__img)
            const actionShot = $('.slider__img img, .playerGrid__img img').attr('data-src') || $('.slider__img img, .playerGrid__img img').attr('src');
            console.log(`Action Shot: ${actionShot}`);

        } catch (error: any) {
            console.error(`Error fetching ${player.name}:`, error.message);
        }
    }
}

testImageGuessing();
