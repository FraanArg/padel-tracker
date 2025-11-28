import axios from 'axios';
import * as cheerio from 'cheerio';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function debugMatchDetails() {
    try {
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

        let dayUrl = '';
        $w('a[href*="oopbyday"]').each((_, el) => {
            let href = $w(el).attr('href');
            if (href && !dayUrl) {
                if (!href.startsWith('http')) href = `https://widget.matchscorerlive.com${href}`;
                dayUrl = href;
            }
        });

        if (!dayUrl) dayUrl = initialWidgetUrl;

        console.log(`Fetching matches from: ${dayUrl}`);
        const { data: matchesHtml } = await axios.get(dayUrl);
        const $m = cheerio.load(matchesHtml);

        // Find a match and inspect its context (previous rows, parent elements)
        const statsLink = $m('a:contains("MATCH STATS")').first();
        if (statsLink.length) {
            const summaryRow = statsLink.closest('tr');
            const team2Row = summaryRow.prev();
            const team1Row = team2Row.prev();

            console.log('\n--- Match Block HTML ---');
            console.log('Team 1 Row:', team1Row.html()?.substring(0, 200));
            console.log('Team 2 Row:', team2Row.html()?.substring(0, 200));
            console.log('Summary Row:', summaryRow.html());

            // Check for headers or previous rows that might contain Category/Round
            console.log('\n--- Previous Siblings (looking for headers) ---');
            let prev = team1Row.prev();
            for (let i = 0; i < 5; i++) {
                if (prev.length) {
                    console.log(`Prev ${i + 1}:`, prev.text().replace(/\s+/g, ' ').trim());
                    console.log(`Prev ${i + 1} HTML:`, prev.html()?.substring(0, 200));
                    prev = prev.prev();
                }
            }
        } else {
            console.log('No matches found to inspect.');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

debugMatchDetails();
