import axios from 'axios';
import * as cheerio from 'cheerio';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function debugUpcomingMatch() {
    try {
        console.log('Fetching tournaments...');
        const { data: homeData } = await axios.get('https://www.padelfip.com/live/', {
            headers: { 'User-Agent': USER_AGENT }
        });
        const $home = cheerio.load(homeData);
        // Try to find a tournament that likely has upcoming matches (maybe not the first one if it's over)
        // Let's look for one that says "Live" or just pick the first few
        const tournamentUrls: string[] = [];
        $home('.cover-category-event').each((_, el) => {
            const href = $home(el).closest('a').attr('href');
            if (href) tournamentUrls.push(href);
        });

        console.log(`Found ${tournamentUrls.length} tournaments. Checking for upcoming matches...`);

        for (const url of tournamentUrls.slice(0, 3)) { // Check first 3
            console.log(`\nChecking tournament: ${url}`);
            const { data: eventHtml } = await axios.get(url, { headers: { 'User-Agent': USER_AGENT } });
            const $event = cheerio.load(eventHtml);
            let tournamentId = '';
            $event('[class*="idEvent_"]').each((_, el) => {
                const classes = $event(el).attr('class')?.split(/\s+/) || [];
                const idClass = classes.find(c => c.startsWith('idEvent_'));
                if (idClass) tournamentId = idClass.replace('idEvent_', '');
            });

            if (!tournamentId) continue;

            const year = new Date().getFullYear();
            const widgetId = `FIP-${year}-${tournamentId}`;
            // Check day 1, 2, 3... to find upcoming
            // Actually, let's just check the current day or tomorrow
            const initialWidgetUrl = `https://widget.matchscorerlive.com/screen/oopbyday/${widgetId}/1?t=tol`;
            const { data: widgetHtml } = await axios.get(initialWidgetUrl);
            const $w = cheerio.load(widgetHtml);

            let dayUrls: string[] = [];
            $w('a[href*="oopbyday"]').each((_, el) => {
                let href = $w(el).attr('href');
                if (href) {
                    if (!href.startsWith('http')) href = `https://widget.matchscorerlive.com${href}`;
                    dayUrls.push(href);
                }
            });

            // Check the last day, it's most likely to have upcoming matches if the tournament is ongoing
            if (dayUrls.length > 0) {
                const targetDay = dayUrls[dayUrls.length - 1];
                console.log(`Fetching matches from day: ${targetDay}`);
                const { data: matchesHtml } = await axios.get(targetDay);
                const $m = cheerio.load(matchesHtml);

                // Look for a row that does NOT have a score, or has "Upcoming" status
                // The structure for upcoming matches might be different.
                // Let's dump a few rows

                // Dump all rows to see structure
                $m('tr').each((i, row) => {
                    if (i > 20) return false; // Limit output
                    const html = $m(row).html() || '';
                    const text = $m(row).text().replace(/\s+/g, ' ').trim();

                    // Look for rows that might contain time or status
                    if (text.includes('Upcoming') || text.includes(':') || html.includes('live-status-summary')) {
                        console.log(`\n--- Row ${i} ---`);
                        console.log(`Text: ${text}`);
                        console.log(`HTML: ${html.substring(0, 500)}`);
                    }
                });
            }
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

debugUpcomingMatch();
