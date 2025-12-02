
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { saveTournament } from '../src/lib/archive';

// This script expects an HTML file saved from a tournament page (e.g. FIP or Premier Padel)
// It attempts to parse the match data from the HTML structure.

async function importHtml(filePath: string, year: number) {
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
    }

    console.log(`Reading ${filePath}...`);
    const html = fs.readFileSync(filePath, 'utf-8');
    const $ = cheerio.load(html);
    const matches: any[] = [];

    // Strategy 1: Look for FIP "match-row" or similar structure
    // This depends heavily on the specific site structure.
    // Based on previous knowledge, FIP uses a widget that might be rendered in the HTML if saved correctly,
    // OR it might be in a script tag.

    // Strategy 2: Look for JSON data in script tags (Next.js __NEXT_DATA__ or similar)
    $('script').each((_, el) => {
        const content = $(el).html();
        if (content && content.includes('__NEXT_DATA__')) {
            try {
                // Try to extract JSON
                const jsonMatch = content.match(/{.*}/);
                if (jsonMatch) {
                    const data = JSON.parse(jsonMatch[0]);
                    // Traverse data to find matches... this is complex and site-specific.
                    // For now, let's focus on DOM parsing if possible.
                }
            } catch (e) {
                // ignore
            }
        }
    });

    // Strategy 3: Generic DOM parsing for "Score" or "Match" elements
    // This is a best-effort heuristic.

    // Let's try to find elements that look like match rows.
    // Often they have class names like "match", "game", "result".
    // Or we look for the specific structure of the FIP widget if the user saved the "fully loaded" page.

    console.log("Attempting to parse matches from DOM...");

    // Example heuristic for FIP widget (if rendered)
    $('.match-row, .row-match').each((_, el) => {
        const team1 = $(el).find('.team1 .player-name').map((_, p) => $(p).text().trim()).get();
        const team2 = $(el).find('.team2 .player-name').map((_, p) => $(p).text().trim()).get();
        const score = $(el).find('.score').text().trim();
        const round = $(el).find('.round-name').text().trim();

        if (team1.length > 0 && team2.length > 0) {
            matches.push({
                team1,
                team2,
                score: score.split(' '), // simplistic score parsing
                round,
                winner: 'unknown' // would need logic to determine winner from score
            });
        }
    });

    if (matches.length === 0) {
        console.log("No matches found using standard selectors. Trying generic table parsing...");
        // Try parsing <table> elements
        $('tr').each((_, el) => {
            const cells = $(el).find('td');
            if (cells.length >= 3) {
                const text = $(el).text();
                // Heuristic: check if row contains "vs" or score-like patterns
                if (text.includes('6-') || text.includes('7-') || text.includes('Match')) {
                    // This is very loose, but might catch something.
                    // For a robust import, we'd need the specific HTML structure the user is seeing.
                }
            }
        });
    }

    console.log(`Found ${matches.length} matches.`);

    if (matches.length > 0) {
        // We need a tournament ID and name.
        // Try to guess from filename or title
        const title = $('title').text().trim() || path.basename(filePath, '.html');
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        saveTournament(id, title, matches, year);
        console.log(`Saved to ${id}-${year}.json`);
    } else {
        console.log("Could not parse any matches. Please ensure you saved the page *after* the results loaded.");
        console.log("If this is a Premier Padel page, try saving the 'Draw' or 'Schedule' view.");
    }
}

const filePath = process.argv[2];
const yearArg = process.argv[3];

if (!filePath || !yearArg) {
    console.log("Usage: npx tsx scripts/import-html.ts <path-to-html-file> <year>");
    process.exit(1);
}

importHtml(filePath, parseInt(yearArg)).catch(console.error);
