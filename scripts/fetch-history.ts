
import * as cheerio from 'cheerio';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { getMatches } from '../src/lib/padel';
import { saveTournament } from '../src/lib/archive';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// URLs for historical calendars
const CALENDAR_URLS: Record<number, string> = {
    2024: 'https://www.padelfip.com/calendar/', // Current year usually on main calendar
    2023: 'https://www.padelfip.com/calendar-2023/', // Hypothesized
    2022: 'https://www.padelfip.com/calendar-2022/'  // Hypothesized
};

async function fetchCalendar(year: number): Promise<any[]> {
    const url = CALENDAR_URLS[year];
    if (!url) {
        console.error(`No calendar URL for year ${year}`);
        return [];
    }

    console.log(`Fetching calendar for ${year} from ${url}...`);
    try {
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': USER_AGENT },
            timeout: 10000
        });
        const $ = cheerio.load(data);
        const tournaments: any[] = [];
        let currentMonth = '';

        $('.loop-container').children().each((_, element) => {
            const tag = $(element).prop('tagName');
            if (tag === 'H2') {
                currentMonth = $(element).text().trim();
            } else if ($(element).find('.cover-category-event').length > 0) {
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
                    const id = eventUrl.split('/').filter(Boolean).pop() || '';

                    // Filter for Premier Padel events only?
                    // The user asked for "Premier Padel tournaments".
                    // FIP calendar includes FIP Rise, Gold, etc.
                    // We should probably filter for Major, P1, P2, and maybe Finals.
                    const isPremier = name.toUpperCase().includes('MAJOR') ||
                        name.toUpperCase().includes('P1') ||
                        name.toUpperCase().includes('P2') ||
                        name.toUpperCase().includes('FINALS');

                    if (isPremier) {
                        tournaments.push({
                            id,
                            name,
                            url: eventUrl,
                            month: currentMonth,
                            year
                        });
                    }
                }
            }
        });

        return tournaments;
    } catch (error) {
        console.error(`Error fetching calendar for ${year}:`, error);
        return [];
    }
}

async function processTournament(t: any) {
    console.log(`Processing ${t.year} - ${t.name} (${t.url})...`);

    // Check if already exists
    const slug = t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const filename = `${slug}-${t.year}.json`;
    const filePath = path.join(process.cwd(), 'data', 'tournaments', filename);

    if (fs.existsSync(filePath)) {
        console.log(`  Skipping (already exists): ${filename}`);
        return;
    }

    // Fetch matches
    // We need to handle the fact that getMatches expects a URL and might need to find the widget
    // For historical tournaments, the "Live Score" tab might not exist or be active.
    // We might need to look for "Draws" or "Results".
    // But getMatches has a fallback to Archive... which is circular if we are building the archive.
    // However, getMatches logic primarily tries to scrape the "Live Score" widget.
    // Let's see if it works for past events.

    const result = await getMatches(t.url);

    if (result && result.matches && result.matches.length > 0) {
        console.log(`  Found ${result.matches.length} matches.`);
        saveTournament(t.id, t.name, result.matches);
    } else {
        console.log(`  No matches found for ${t.name}`);
    }
}

async function main() {
    const years = [2022, 2023, 2024];

    for (const year of years) {
        const tournaments = await fetchCalendar(year);
        console.log(`Found ${tournaments.length} Premier Padel tournaments for ${year}`);

        for (const t of tournaments) {
            await processTournament(t);
            // Rate limit
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

main().catch(console.error);
