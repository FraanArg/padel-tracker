import axios from 'axios';
import * as cheerio from 'cheerio';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function debugMatchTime() {
    try {
        // Use a known tournament URL (or fetch one)
        // For debugging, let's try to find a tournament first
        console.log('Fetching tournaments...');
        const { data: homeData } = await axios.get('https://www.padelfip.com/live/', {
            headers: { 'User-Agent': USER_AGENT }
        });
        const $home = cheerio.load(homeData);
        const firstTournamentUrl = $home('.cover-category-event').first().closest('a').attr('href');

        if (!firstTournamentUrl) {
            console.error('No tournament found to debug.');
            return;
        }

        console.log(`Debugging tournament: ${firstTournamentUrl}`);

        // Get the widget ID logic (simplified from padel.ts)
        const { data: eventHtml } = await axios.get(firstTournamentUrl, { headers: { 'User-Agent': USER_AGENT } });
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
        const initialWidgetUrl = `https://widget.matchscorerlive.com/screen/oopbyday/${widgetId}/1?t=tol`;

        console.log(`Fetching widget: ${initialWidgetUrl}`);
        const { data: widgetHtml } = await axios.get(initialWidgetUrl);
        const $w = cheerio.load(widgetHtml);

        // Find a day with matches
        let dayUrl = '';
        $w('a[href*="oopbyday"]').each((_, el) => {
            let href = $w(el).attr('href');
            if (href && !dayUrl) { // Just take the first one
                if (!href.startsWith('http')) href = `https://widget.matchscorerlive.com${href}`;
                dayUrl = href;
            }
        });

        if (!dayUrl) dayUrl = initialWidgetUrl; // Fallback

        console.log(`Fetching matches from: ${dayUrl}`);
        const { data: matchesHtml } = await axios.get(dayUrl);
        const $m = cheerio.load(matchesHtml);

        // Inspect a match row
        const statsLink = $m('a:contains("MATCH STATS")').first();
        if (statsLink.length) {
            const summaryRow = statsLink.closest('tr');
            console.log('\n--- Match Summary Row HTML ---');
            console.log(summaryRow.html());

            // Try to find time
            const time = summaryRow.find('.time').text().trim();
            console.log(`\nFound .time: "${time}"`);

            // Look for other potential time containers
            console.log('\n--- All text in summary row ---');
            console.log(summaryRow.text().replace(/\s+/g, ' ').trim());
        } else {
            console.log('No "MATCH STATS" link found, dumping first table row...');
            console.log($m('tr').first().html());
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

debugMatchTime();
