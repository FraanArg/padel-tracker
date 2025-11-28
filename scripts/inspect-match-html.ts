
import axios from 'axios';
import * as cheerio from 'cheerio';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function inspectMatchHtml() {
    try {
        // Hardcoded widget URL for Mexico Major (derived from previous knowledge or just fetch main page first)
        // Let's fetch main page to get ID first
        const url = 'https://www.padelfip.com/events/mexico-major-2025/';
        const { data: eventHtml } = await axios.get(url, { headers: { 'User-Agent': USER_AGENT } });
        const $event = cheerio.load(eventHtml);

        let tournamentId = '';
        $event('[class*="idEvent_"]').each((_, el) => {
            const classes = $event(el).attr('class')?.split(/\s+/) || [];
            const idClass = classes.find(c => c.startsWith('idEvent_'));
            if (idClass) tournamentId = idClass.replace('idEvent_', '');
        });

        if (!tournamentId) {
            console.error('Could not find tournament ID');
            return;
        }

        const year = new Date().getFullYear();
        const widgetId = `FIP-${year}-${tournamentId}`;
        const widgetUrl = `https://widget.matchscorerlive.com/screen/oopbyday/${widgetId}/1?t=tol`;

        console.log(`Fetching widget: ${widgetUrl}`);
        const { data: widgetHtml } = await axios.get(widgetUrl);
        const $w = cheerio.load(widgetHtml);

        const days: string[] = [];
        $w('a[href*="oopbyday"]').each((_, el) => {
            let href = $w(el).attr('href');
            if (href) {
                if (!href.startsWith('http')) href = `https://widget.matchscorerlive.com${href}`;
                days.push(href);
            }
        });

        console.log(`Found ${days.length} days.`);

        for (const dayUrl of days) {
            console.log(`Checking day: ${dayUrl}`);
            const { data: matchesHtml } = await axios.get(dayUrl);

            const idx = matchesHtml.indexOf('Triay');
            if (idx !== -1) {
                console.log(`FOUND "Triay" in ${dayUrl}`);
                console.log('--- Context around "Triay" ---');
                console.log(matchesHtml.substring(idx - 300, idx + 300));

                const idx2 = matchesHtml.indexOf('Chingotto');
                if (idx2 !== -1) {
                    console.log('--- Context around "Chingotto" ---');
                    console.log(matchesHtml.substring(idx2 - 300, idx2 + 300));
                }
                break; // Stop after finding
            }
        }

    } catch (e: any) {
        console.error('Error:', e.message);
    }
}

inspectMatchHtml();
