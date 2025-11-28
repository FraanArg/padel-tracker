
import axios from 'axios';
import * as cheerio from 'cheerio';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function debugPlayers() {
    console.log(`Fetching tournaments list...`);
    const { data: liveHtml } = await axios.get('https://www.padelfip.com/live/', {
        headers: { 'User-Agent': USER_AGENT }
    });
    const $live = cheerio.load(liveHtml);

    let url = '';
    const link = $live('.cover-category-event').first().closest('a');
    if (link.length) {
        url = link.attr('href') || '';
    }

    if (!url) {
        console.log('No live tournament found, trying fallback...');
        url = 'https://www.padelfip.com/event/fip-platinum-mexico-major-2025/'; // Fallback
    }

    console.log(`Using tournament URL: ${url}`);

    try {
        const { data: eventHtml } = await axios.get(url, {
            headers: { 'User-Agent': USER_AGENT }
        });
        const $event = cheerio.load(eventHtml);

        console.log('\n--- Inspecting Event Page for Players List ---');
        // Look for common player list containers or links
        const playerLinks = $event('a[href*="/player/"]');
        console.log(`Found ${playerLinks.length} player links on event page.`);

        if (playerLinks.length > 0) {
            playerLinks.slice(0, 5).each((_, el) => {
                console.log('Player Link:', $event(el).attr('href'), 'Text:', $event(el).text().trim());
            });
        } else {
            console.log('No direct /player/ links found. Checking for other lists...');
            // Check for "Entry List" or similar
            const entryList = $event('a:contains("Entry List")');
            if (entryList.length) {
                console.log('Found Entry List link:', entryList.attr('href'));
            }
        }

        // ... rest of the script (widget fetching) can be skipped for now if we just want to check this
        return;

        let tournamentId = '';
        $event('[class*="idEvent_"]').each((_, el) => {
            const classes = $event(el).attr('class')?.split(/\s+/) || [];
            const idClass = classes.find(c => c.startsWith('idEvent_'));
            if (idClass) {
                tournamentId = idClass.replace('idEvent_', '');
            }
        });

        if (!tournamentId) {
            console.log('Could not find tournament ID');
            return;
        }

        const year = new Date().getFullYear();
        const widgetId = `FIP-${year}-${tournamentId}`;
        const initialWidgetUrl = `https://widget.matchscorerlive.com/screen/oopbyday/${widgetId}/1?t=tol`;

        console.log(`Fetching widget: ${initialWidgetUrl}`);
        const { data: widgetHtml } = await axios.get(initialWidgetUrl, {
            validateStatus: () => true
        });

        const $w = cheerio.load(widgetHtml);

        // Find a day with matches
        let activeDayUrl = '';
        $w('a[href*="oopbyday"]').each((_, el) => {
            let href = $w(el).attr('href');
            if (href && !activeDayUrl) {
                if (!href.startsWith('http')) {
                    href = `https://widget.matchscorerlive.com${href}`;
                }
                activeDayUrl = href;
            }
        });

        if (!activeDayUrl) {
            console.log('No active day found, using initial widget url');
            activeDayUrl = initialWidgetUrl;
        }

        console.log(`Fetching matches from: ${activeDayUrl}`);
        const { data: matchesHtml } = await axios.get(activeDayUrl);
        const $m = cheerio.load(matchesHtml);

        console.log('\n--- Inspecting Player Elements ---');
        $m('a:contains("MATCH STATS")').slice(0, 3).each((_, el) => {
            const statsLink = $m(el);
            const summaryRow = statsLink.closest('tr');
            const team2Row = summaryRow.prev();
            const team1Row = team2Row.prev();

            if (team1Row.length > 0) {
                console.log('\nMatch found:');
                team1Row.find('.line-thin').each((i, p) => {
                    console.log(`Team 1 Player ${i + 1} HTML:`, $m(p).html());
                });
                team2Row.find('.line-thin').each((i, p) => {
                    console.log(`Team 2 Player ${i + 1} HTML:`, $m(p).html());
                });
            }
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

debugPlayers();
