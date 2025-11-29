
import axios from 'axios';
import * as cheerio from 'cheerio';
import { getAllMatches } from '../src/lib/padel';
import { saveTournament } from '../src/lib/archive';

const year = process.argv[2] || '2024';
const filter = process.argv[3] || 'Premier Padel';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function main() {
    // Default to Premier Padel calendar
    const calendarUrl = `https://www.padelfip.com/calendar-premier-padel/?events-year=${year}`;
    console.log(`Fetching calendar from ${calendarUrl}...`);

    try {
        const { data } = await axios.get(calendarUrl, {
            headers: { 'User-Agent': USER_AGENT }
        });
        const $ = cheerio.load(data);
        const tournaments: { name: string, url: string }[] = [];

        // Parse calendar
        $('.loop-container').children().each((_, element) => {
            if ($(element).find('.cover-category-event').length > 0) {
                const img = $(element).find('.cover-category-event');
                const link = img.closest('a');
                const eventUrl = link.attr('href');

                let name = link.next().text().trim();
                if (!name) name = link.parent().text().trim();
                name = name.replace(/<[^>]*>/g, '').replace(/GO TO EVENT/i, '').trim();

                if (!name || name.length < 3 || name.includes('http')) {
                    const urlParts = eventUrl?.split('/').filter(Boolean);
                    const slug = urlParts?.[urlParts.length - 1];
                    name = slug ? slug.replace(/-/g, ' ').toUpperCase() : 'Unknown Tournament';
                }

                if (eventUrl && name) {
                    tournaments.push({ name, url: eventUrl });
                }
            }
        });

        console.log(`Found ${tournaments.length} total tournaments.`);

        // Filter
        const filtered = tournaments.filter(t =>
            t.name.toLowerCase().includes(filter.toLowerCase()) ||
            t.name.toLowerCase().includes('major') ||
            t.name.toLowerCase().includes('p1') ||
            t.name.toLowerCase().includes('p2')
        );

        console.log(`Filtered down to ${filtered.length} tournaments matching "${filter}" (or Major/P1/P2).`);

        // Archive sequentially
        for (const [i, t] of filtered.entries()) {
            console.log(`\n[${i + 1}/${filtered.length}] Processing: ${t.name}`);
            console.log(`URL: ${t.url}`);

            try {
                const result = await getAllMatches(t.url);



                const matches = result.matches || [];
                if (matches.length === 0) {
                    console.log('  No matches found.');
                    continue;
                }

                const id = result.tournamentId || t.url.split('/').filter(Boolean).pop() || 'unknown';
                const filename = saveTournament(id, result.tournamentName || t.name, matches);
                console.log(`  ✅ Archived ${matches.length} matches to ${filename}`);

            } catch (e) {
                console.error(`  Error processing ${t.name}:`, e);
            }

            // Delay to be nice
            if (i < filtered.length - 1) {
                console.log('  Waiting 2s...');
                await new Promise(r => setTimeout(r, 2000));
            }
        }

    } catch (error) {
        console.error('Fatal error:', error);
    }
}

main();
