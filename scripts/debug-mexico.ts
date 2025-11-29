
import axios from 'axios';
import * as cheerio from 'cheerio';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function debugMexico() {
    const url = 'https://www.padelfip.com/events/premier-padel-gnp-acapulco-major-2025/';
    // Note: I'm guessing the URL based on the user's screenshot "MEXICO MAJOR 2025". 
    // If this 404s, I'll need to find the correct URL.
    // Actually, let's try to find it via the live page first or just use a known one if we can find it.
    // The user's screenshot shows "MEXICO MAJOR 2025 | Padel FIP".

    console.log('Fetching:', url);
    try {
        // First get the main page to find the widget
        const { data: html } = await axios.get(url, { headers: { 'User-Agent': USER_AGENT } });
        const $ = cheerio.load(html);

        let widgetId = '';
        $('[class*="idEvent_"]').each((_, el) => {
            const classes = $(el).attr('class')?.split(/\s+/) || [];
            const idClass = classes.find(c => c.startsWith('idEvent_'));
            if (idClass) {
                widgetId = idClass.replace('idEvent_', '');
            }
        });

        console.log('Widget ID found:', widgetId);

        if (!widgetId) {
            // Fallback logic from padel.ts
            const year = new Date().getFullYear();
            // Maybe it's 2024 actually? The screenshot says 2025 but maybe the ID is different.
            // Let's try to find the iframe.
            const iframe = $('.iframe-livescore');
            console.log('Iframe src:', iframe.attr('src'));
            console.log('Iframe data-src:', iframe.attr('data-src'));
            return;
        }

        // Fetch OOP for Day 1 to see structure
        const oopUrl = `https://widget.matchscorerlive.com/screen/oopbyday/FIP-2025-${widgetId}/1?t=tol`;
        console.log('Fetching OOP:', oopUrl);

        const { data: oopHtml } = await axios.get(oopUrl);
        const $w = cheerio.load(oopHtml);

        // Find the active day (today)
        let activeDayUrl = '';
        $w('a[href*="oopbyday"]').each((_, el) => {
            const href = $w(el).attr('href');
            const text = $w(el).text().trim();
            console.log('Day:', text, href);
            if (text.includes('NOV 29') || text.includes('Nov 29')) {
                activeDayUrl = href?.startsWith('http') ? href : `https://widget.matchscorerlive.com${href}`;
            }
        });

        if (!activeDayUrl) {
            console.log('No active day found for Nov 29, using first day');
            const firstDay = $w('a[href*="oopbyday"]').first().attr('href');
            activeDayUrl = firstDay?.startsWith('http') ? firstDay : `https://widget.matchscorerlive.com${firstDay}`;
        }

        console.log('Fetching Active Day:', activeDayUrl);
        const { data: dayHtml } = await axios.get(activeDayUrl);
        const $d = cheerio.load(dayHtml);

        // Dump the first few rows to see structure
        $d('tr').slice(0, 10).each((i, el) => {
            console.log(`Row ${i}:`, $d(el).html()?.substring(0, 200));
            console.log(`Row ${i} Text:`, $d(el).text().replace(/\s+/g, ' ').trim());
        });

    } catch (e) {
        console.error('Error:', (e as Error).message);
    }
}

debugMexico();
