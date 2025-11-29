import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';

async function inspectLiveTab() {
    // URL provided by user
    const url = 'https://www.padelfip.com/events/premier-padel-gnp-acapulco-major-2025/?tab=Live+Score';

    console.log(`Fetching ${url}...`);
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);

        // Dump the entire HTML for manual review if needed, but let's try to find key elements first
        fs.writeFileSync('debug_live_tab.html', data);
        console.log('Saved HTML to debug_live_tab.html');

        // Look for iframes (common for live score widgets)
        const iframes = $('iframe');
        console.log(`Found ${iframes.length} iframes`);
        iframes.each((i, el) => {
            console.log(`Iframe ${i}: src="${$(el).attr('src')}"`);
        });

        // Look for specific "live" containers
        const liveContainers = $('.live-score, .livescore, [id*="live"], [class*="live"]');
        console.log(`Found ${liveContainers.length} potential live containers`);
        liveContainers.each((i, el) => {
            console.log(`Container ${i}: class="${$(el).attr('class')}", id="${$(el).attr('id')}"`);
        });

    } catch (e) {
        console.error('Error fetching URL:', e);
    }
}

inspectLiveTab();
