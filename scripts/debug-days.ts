import axios from 'axios';
import * as cheerio from 'cheerio';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function debugDaysAndHtml() {
    try {
        console.log('Fetching tournaments...');
        const { data: homeData } = await axios.get('https://www.padelfip.com/live/', {
            headers: { 'User-Agent': USER_AGENT }
        });
        const $home = cheerio.load(homeData);
        const tournamentUrl = $home('.cover-category-event').first().closest('a').attr('href');

        if (!tournamentUrl) {
            console.error('No tournament found.');
            return;
        }

        console.log(`Checking tournament: ${tournamentUrl}`);
        const { data: eventHtml } = await axios.get(tournamentUrl, { headers: { 'User-Agent': USER_AGENT } });
        const $event = cheerio.load(eventHtml);
        let tournamentId = '';
        $event('[class*="idEvent_"]').each((_, el) => {
            const classes = $event(el).attr('class')?.split(/\s+/) || [];
            const idClass = classes.find(c => c.startsWith('idEvent_'));
            if (idClass) tournamentId = idClass.replace('idEvent_', '');
        });

        if (!tournamentId) return;

        const year = new Date().getFullYear();
        const widgetId = `FIP-${year}-${tournamentId}`;
        const initialWidgetUrl = `https://widget.matchscorerlive.com/screen/oopbyday/${widgetId}/1?t=tol`;

        console.log(`Fetching initial widget: ${initialWidgetUrl}`);
        const { data: widgetHtml } = await axios.get(initialWidgetUrl);
        const $w = cheerio.load(widgetHtml);

        console.log('\n--- Available Days ---');
        const dayUrls: string[] = [];
        $w('a[href*="oopbyday"]').each((i, el) => {
            const text = $w(el).text().trim();
            let href = $w(el).attr('href');
            if (href) {
                if (!href.startsWith('http')) href = `https://widget.matchscorerlive.com${href}`;
                dayUrls.push(href);
                console.log(`Day ${i}: ${text} -> ${href}`);
            }
        });

        if (dayUrls.length > 6) {
            // Target Day 6 (Nov 28)
            const targetUrl = dayUrls[6];
            console.log(`\nFetching matches from: ${targetUrl}`);
            const { data: matchesHtml } = await axios.get(targetUrl);
            const $m = cheerio.load(matchesHtml);

            console.log('\n--- Looking for Headers (Court, Round) ---');
            $m('th, .header-row, tr.header').each((i, el) => {
                const text = $m(el).text().replace(/\s+/g, ' ').trim();
                console.log(`Header ${i}: "${text}"`);
                console.log(`Parent HTML: ${$m(el).parent().html()?.substring(0, 200)}`);
            });

            console.log('\n--- Looking for Tournament Name in Page ---');
            const title = $m('title').text();
            console.log(`Page Title: "${title}"`);

            // Check for specific court names
            const courts = $m('*:contains("COURT"), *:contains("Court")').filter((i, el) => {
                return $m(el).children().length === 0 && $m(el).text().trim().length < 30;
            });
            console.log(`\nFound ${courts.length} potential court elements:`);
            courts.each((i, el) => {
                console.log(`Court ${i}: "${$m(el).text().trim()}"`);
                console.log(`Parent: ${$m(el).parent().prop('tagName')} class="${$m(el).parent().attr('class')}"`);
            });

            console.log('\n--- Body Start (first 1000 chars) ---');
            console.log($m('body').html()?.substring(0, 1000));

            console.log('\n--- Looking for "Upcoming" ---');
            const upcoming = $m('*:contains("Upcoming")').first().parent().html();
            if (upcoming) {
                console.log('Found "Upcoming" parent HTML:', upcoming.substring(0, 500));
            } else {
                console.log('Could not find "Upcoming" text.');
            }

            console.log('\n--- Looking for Time (e.g. 10:00) ---');
            // Regex for time like 10:00 or 14:30
            const timeRegex = /\d{1,2}:\d{2}/;
            const bodyText = $m('body').text();
            const match = bodyText.match(timeRegex);
            if (match) {
                console.log(`Found time string: "${match[0]}"`);
                // Find element containing this time
                const el = $m(`*:contains("${match[0]}")`).last();
                console.log('Element containing time:', el.parent().html()?.substring(0, 500));
            } else {
                console.log('No time string found in body text.');
            }
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

debugDaysAndHtml();
