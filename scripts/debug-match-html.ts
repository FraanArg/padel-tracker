import { getMatches } from '../src/lib/padel';
import axios from 'axios';
import * as cheerio from 'cheerio';

async function main() {
    const url = 'https://www.padelfip.com/events/premier-padel-gnp-acapulco-major-2025/';
    console.log('Fetching matches for:', url);

    const { data: eventHtml } = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $event = cheerio.load(eventHtml);
    let tournamentId = '';
    $event('[class*="idEvent_"]').each((_, el) => {
        const classes = $event(el).attr('class')?.split(/\s+/) || [];
        const idClass = classes.find(c => c.startsWith('idEvent_'));
        if (idClass) tournamentId = idClass.replace('idEvent_', '');
    });

    const year = new Date().getFullYear();
    const widgetId = `FIP-${year}-${tournamentId}`;
    const initialWidgetUrl = `https://widget.matchscorerlive.com/screen/oopbyday/${widgetId}/1?t=tol`;

    const { data: widgetHtml } = await axios.get(initialWidgetUrl);
    const $w = cheerio.load(widgetHtml);

    const todayStr = "NOV 26"; // Using the day from the screenshot
    let activeDayUrl = '';
    $w('a[href*="oopbyday"]').each((_, el) => {
        const text = $w(el).text();
        if (text.includes(todayStr)) {
            let href = $w(el).attr('href');
            if (href && !href.startsWith('http')) href = `https://widget.matchscorerlive.com${href}`;
            if (href) activeDayUrl = href;
        }
    });

    if (!activeDayUrl) {
        console.log('Could not find active day URL for', todayStr);
        return;
    }

    console.log('Active Day URL:', activeDayUrl);

    const { data: matchesHtml } = await axios.get(activeDayUrl);
    const $m = cheerio.load(matchesHtml);

    // Find the first "MATCH STATS" link and print its parent row and siblings
    const statsLink = $m('a:contains("MATCH STATS")').first();
    const row = statsLink.closest('tr');

    if (row.length) {
        console.log('--- FOUND ROW HTML (Summary Row) ---');
        console.log(row.html());
        console.log('--- END ROW HTML ---');

        const prevRow = row.prev();
        if (prevRow.length) {
            console.log('--- FOUND PREV ROW HTML (Match Row?) ---');
            console.log(prevRow.html());
            console.log('--- END PREV ROW HTML ---');

            const prevPrevRow = prevRow.prev();
            if (prevPrevRow.length) {
                console.log('--- FOUND PREV PREV ROW HTML ---');
                console.log(prevPrevRow.html());
                console.log('--- END PREV PREV ROW HTML ---');
            }
        }
    } else {
        console.log('Could not find a row containing MATCH STATS');
    }
}

main().catch(console.error);
