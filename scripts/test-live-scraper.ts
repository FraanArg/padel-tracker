
import axios from 'axios';
import * as cheerio from 'cheerio';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function testScraper() {
    // Use a known live tournament URL or the main live page to find one
    // For testing, we might need to find a currently active tournament.
    // If none are active, we can try to use a recent one and see if we can parse the structure even if matches are finished.

    // Let's try to fetch the live page first to get a valid URL
    console.log('Fetching live tournaments list...');
    const { data: liveData } = await axios.get('https://www.padelfip.com/live/', {
        headers: { 'User-Agent': USER_AGENT }
    });
    const $live = cheerio.load(liveData);

    let tournamentUrl = '';
    $live('.cover-category-event').each((_, el) => {
        if (tournamentUrl) return;
        const link = $live(el).closest('a');
        tournamentUrl = link.attr('href') || '';
    });

    if (!tournamentUrl) {
        console.log('No live tournaments found. Using a fallback URL for testing structure (might be finished).');
        // Fallback to a recent known tournament if possible, or just exit
        tournamentUrl = 'https://www.padelfip.com/events/fip-platinum-mexico-2024/'; // Example
    }

    console.log(`Testing with tournament: ${tournamentUrl}`);

    // Fetch the tournament page to get the widget ID
    const { data: eventHtml } = await axios.get(tournamentUrl, {
        headers: { 'User-Agent': USER_AGENT }
    });
    const $event = cheerio.load(eventHtml);

    // Inspect main page for widgets
    console.log('\n--- Inspecting Main Page for Widgets ---');
    $event('iframe').each((i, el) => {
        console.log(`Iframe ${i}: src="${$event(el).attr('src')}"`);
    });

    $event('a[href*="matchscorerlive"]').each((i, el) => {
        console.log(`Link ${i}: href="${$event(el).attr('href')}"`);
    });

    let tournamentId = '';
    $event('[class*="idEvent_"]').each((_, el) => {
        const classes = $event(el).attr('class')?.split(/\s+/) || [];
        const idClass = classes.find(c => c.startsWith('idEvent_'));
        if (idClass) {
            tournamentId = idClass.replace('idEvent_', '');
        }
    });

    if (!tournamentId) {
        console.error('Could not find tournament ID');
        return;
    }

    const year = new Date().getFullYear();
    const widgetId = `FIP-${year}-${tournamentId}`;
    console.log(`Widget ID: ${widgetId}`);

    // Fetch day 1 to get the list of days
    const initialWidgetUrl = `https://widget.matchscorerlive.com/screen/oopbyday/${widgetId}/1?t=tol`;
    const { data: widgetHtml } = await axios.get(initialWidgetUrl);
    const $w = cheerio.load(widgetHtml);

    let activeDayUrl = '';
    const days: { text: string, url: string }[] = [];
    $w('a[href*="oopbyday"]').each((_, el) => {
        let href = $w(el).attr('href');
        const text = $w(el).text().replace(/\s+/g, ' ').trim();
        if (href) {
            if (!href.startsWith('http')) {
                href = `https://widget.matchscorerlive.com${href}`;
            }
            days.push({ text, url: href });
        }
    });

    console.log('Available days:', days.map(d => d.text).join(', '));

    // Try to find today's date in the days list
    const today = new Date();
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const todayStr = `${monthNames[today.getMonth()]} ${today.getDate()}`;
    console.log(`Looking for day matching: ${todayStr}`);

    activeDayUrl = days.find(d => d.text.includes(todayStr))?.url || days[0].url;

    // If we are testing, maybe we want a day with results?
    // Let's try to find a day that is NOT today if today has no matches yet?
    // Or just use the first day which usually has many matches.
    // activeDayUrl = days[0].url; 

    // Let's try to guess the OOP URL
    // const oopUrl = activeDayUrl.replace('oopbyday', 'oop').replace(/\/\d+\?/, '?');
    // console.log(`Trying OOP URL: ${oopUrl}`);

    // Fetch matches from OOP view
    // const { data: matchesHtml } = await axios.get(oopUrl);
    // const $m = cheerio.load(matchesHtml);

    // Restore fetching active day for $m
    const { data: matchesHtml } = await axios.get(activeDayUrl);
    const $m = cheerio.load(matchesHtml);

    // Debug: Dump the first 500 chars of body to see if we got content
    console.log('HTML Body Start:', $m('body').text().substring(0, 200).replace(/\s+/g, ' '));

    // Save to file
    const fs = await import('fs');
    fs.writeFileSync('debug_live.html', matchesHtml);
    console.log('Saved HTML to debug_live.html');

    // Analyze structure
    console.log('\n--- Analyzing Matches Structure ---');

    // We want to group by Court.
    // Usually courts are headers like <thead> or <tr class="header-row">?
    // Let's dump some structure.

    let currentCourt = 'Unknown Court';

    // Debug: Search for "Court" or "Pista" in the entire body
    const bodyText = $m('body').text();
    const courtIndices = [...bodyText.matchAll(/(Court|Pista)/gi)].map(m => m.index);
    console.log(`Found ${courtIndices.length} occurrences of "Court" or "Pista"`);

    courtIndices.slice(0, 5).forEach(index => {
        if (index !== undefined) {
            const start = Math.max(0, index - 50);
            const end = Math.min(bodyText.length, index + 50);
            console.log(`Context: ...${bodyText.substring(start, end).replace(/\s+/g, ' ')}...`);
        }
    });

    $m('tr').each((i, el) => {
        const row = $m(el);
        const text = row.text().replace(/\s+/g, ' ').trim();

        // Check for Court Header
        // It seems court headers might be in a div or a specific row style
        // Based on previous code, we looked for "Center Court" etc.

        // Heuristic: Court headers often have 'court-name' class or are just strong text in a row
        if (text.toUpperCase().includes('COURT') || text.toUpperCase().includes('PISTA') || text.toUpperCase().includes('GRAND STAND')) {
            console.log(`Possible Court Header Row ${i}: ${text}`);
            console.log(`HTML: ${$m(el).html()}`);
        }
    });

    // Let's try to extract matches and see if we can find their court
    // The previous logic looked backwards from the match row.

    // Inspect all headers HTML
    console.log('\n--- Inspecting Headers HTML ---');
    $m('tr').each((i, el) => {
        const row = $m(el);
        if (row.find('th').length > 0 || row.attr('class')?.includes('header')) {
            console.log(`Header Row ${i} HTML: ${row.html()?.replace(/\s+/g, ' ').trim()}`);
        }
    });

    // Dump all rows to a file
    const rowsText = $m('tr').map((i, el) => {
        return `Row ${i}: ${$m(el).text().replace(/\s+/g, ' ').trim()}`;
    }).get().join('\n');

    fs.writeFileSync('debug_rows.txt', rowsText);
    console.log('Saved all rows to debug_rows.txt');

    // Iterate over all rows
    let currentCategory = '';
    let currentRound = '';

    // In the widget, it seems the structure is:
    // Header (Court?) -> Header (Category/Round?) -> Match Rows

    // Let's try to identify "Match Blocks"
    // A match block usually consists of 2 player rows + 1 summary row (sometimes)

    // Alternative strategy:
    // Find all elements that look like a match container or iterate strictly.

    // Let's use the existing logic's finding of "MATCH STATS" as a starting point, 
    // but we also need "Scheduled" matches which might NOT have stats yet.

    // Look for rows with class 'line-thin' (player names)
    // Group them by 2s?

    const playerRows = $m('.line-thin').closest('tr');
    console.log(`Found ${playerRows.length} player rows.`);

    if (playerRows.length === 0) {
        console.log('No player rows found. Dumping table rows classes:');
        $m('tr').each((i, el) => {
            if (i < 10) console.log(`Row ${i}: class="${$m(el).attr('class')}" text="${$m(el).text().substring(0, 50).replace(/\s+/g, ' ')}"`);
        });
    }

    // This might be too low level.

    // Let's try to find the "Court" headers specifically.
    // Inspecting the HTML of these widgets (from memory/experience):
    // Often they are tables.
    // <tr class="header-row">...</tr>

    $m('tr').each((_, el) => {
        const row = $m(el);
        const text = row.text().replace(/\s+/g, ' ').trim();

        // Check if it's a header
        if (row.find('th').length > 0 || row.hasClass('header-row') || row.attr('style')?.includes('background')) {
            // console.log(`Header: ${text}`);
            if (text.match(/(Center Court|Court \d+|Grand Stand|Pista \d+)/i)) {
                currentCourt = text;
                // console.log(`--> Set Court: ${currentCourt}`);
            }
        }

        // Check if it's a match row (contains players)
        if (row.find('.line-thin').length > 0) {
            // This is a player row.
            // A match has 2 player rows.
            // We need to identify if this is Team 1 or Team 2.
            // Usually Team 1 is first.

            // We can just capture them and process later?
            // Or look at the context.
        }
    });

    // Let's try to extract ALL matches with their status and court
    // We need a robust way to group rows into matches.
    // Matches are usually:
    // Row 1: Team 1
    // Row 2: Team 2
    // Row 3: Summary/Stats (optional/sometimes merged)

    // Let's iterate and group
    let matchBuffer: any[] = [];

    $m('tr').each((_, el) => {
        const row = $m(el);

        // Update Court context
        const text = row.text().replace(/\s+/g, ' ').trim();
        if (text.match(/(Center Court|Court \d+|Grand Stand|Pista \d+)/i)) {
            // Extract just the court name
            const match = text.match(/(Center Court|Court \d+|Grand Stand|Pista \d+)/i);
            if (match) currentCourt = match[1];
        }

        if (row.find('.line-thin').length > 0) {
            matchBuffer.push(row);
        } else if (matchBuffer.length === 2) {
            // We have 2 teams, this row might be the summary or just a separator
            // Process the match
            const t1Row = matchBuffer[0];
            const t2Row = matchBuffer[1];

            const t1 = t1Row.find('.line-thin').map((_: number, p: any) => $m(p).text().trim()).get();
            const t2 = t2Row.find('.line-thin').map((_: number, p: any) => $m(p).text().trim()).get();

            // Check for status in this current row (summary)
            let status = 'Scheduled';
            let nextMatch = false;

            // If this row has "MATCH STATS" or "Live", it's the summary
            if (row.text().includes('MATCH STATS') || row.find('.live-status-summary').length > 0) {
                status = row.find('.live-status-summary').text().trim() || 'Finished';
            } else {
                // Maybe the match is just scheduled and has no summary row?
                // Or the summary is inside the player rows?
                // In some views, "Not before..." is in the header.
            }

            console.log(`Match on ${currentCourt}: ${t1.join('/')} vs ${t2.join('/')} [${status}]`);

            matchBuffer = [];
        } else {
            // Reset if we encounter something else and haven't filled the buffer
            if (matchBuffer.length > 0) {
                // console.log('Incomplete match buffer, clearing.');
                matchBuffer = [];
            }
        }
    });

}

testScraper();
