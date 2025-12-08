/**
 * Standalone Tournament Match Scraper
 * 
 * Fetches match data from padelfip.com for Premier Padel tournaments
 * and saves to JSON files in data/tournaments/
 */

import * as cheerio from 'cheerio';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)';
const DATA_DIR = path.join(process.cwd(), 'data', 'tournaments');

// Known Premier Padel tournaments with direct URLs
const TOURNAMENTS: { id: string; name: string; url: string; year: number }[] = [
    // 2024 Season
    { id: 'riyadh-p1-2024', name: 'Riyadh Season P1', url: 'https://www.padelfip.com/events/riyadh-p1-2024/', year: 2024 },
    { id: 'qatar-major-2024', name: 'Qatar Major', url: 'https://www.padelfip.com/events/qatar-major-2024/', year: 2024 },
    { id: 'acapulco-major-2024', name: 'Acapulco Major', url: 'https://www.padelfip.com/events/premier-padel-gnp-acapulco-major-2024/', year: 2024 },
    { id: 'brussels-p2-2024', name: 'Brussels P2', url: 'https://www.padelfip.com/events/premier-padel-brussels-p2-2024/', year: 2024 },
    { id: 'sevilla-p2-2024', name: 'Sevilla P2', url: 'https://www.padelfip.com/events/premier-padel-sevilla-p2-2024/', year: 2024 },
    { id: 'asuncion-p2-2024', name: 'Asuncion P2', url: 'https://www.padelfip.com/events/premier-padel-asuncion-p2-2024/', year: 2024 },
    { id: 'argentina-p1-2024', name: 'Argentina P1', url: 'https://www.padelfip.com/events/premier-padel-argentina-p1-2024/', year: 2024 },
    { id: 'santiago-p1-2024', name: 'Santiago P1', url: 'https://www.padelfip.com/events/premier-padel-santiago-p1-2024/', year: 2024 },
    { id: 'bordeaux-p2-2024', name: 'Bordeaux P2', url: 'https://www.padelfip.com/events/premier-padel-bordeaux-p2-2024/', year: 2024 },
    { id: 'italy-major-2024', name: 'Italy Major', url: 'https://www.padelfip.com/events/premier-padel-italy-major-2024/', year: 2024 },
    { id: 'malaga-p1-2024', name: 'Malaga P1', url: 'https://www.padelfip.com/events/premier-padel-malaga-p1-2024/', year: 2024 },
    { id: 'finland-p2-2024', name: 'Finland P2', url: 'https://www.padelfip.com/events/premier-padel-finland-p2-2024/', year: 2024 },
    { id: 'madrid-p1-2024', name: 'Madrid P1', url: 'https://www.padelfip.com/events/premier-padel-madrid-p1-2024/', year: 2024 },
    { id: 'rotterdam-p1-2024', name: 'Rotterdam P1', url: 'https://www.padelfip.com/events/premier-padel-rotterdam-p1-2024/', year: 2024 },
    { id: 'valladolid-p2-2024', name: 'Valladolid P2', url: 'https://www.padelfip.com/events/premier-padel-valladolid-p2-2024/', year: 2024 },
    { id: 'paris-major-2024', name: 'Paris Major', url: 'https://www.padelfip.com/events/premier-padel-paris-major-2024/', year: 2024 },
    { id: 'newgiza-p2-2024', name: 'NewGiza P2', url: 'https://www.padelfip.com/events/premier-padel-new-giza-p2-2024/', year: 2024 },
    { id: 'dubai-p1-2024', name: 'Dubai P1', url: 'https://www.padelfip.com/events/premier-padel-dubai-p1-2024/', year: 2024 },
    { id: 'kuwait-p1-2024', name: 'Kuwait P1', url: 'https://www.padelfip.com/events/premier-padel-kuwait-p1-2024/', year: 2024 },
    { id: 'mexico-major-2024', name: 'Mexico Major', url: 'https://www.padelfip.com/events/premier-padel-mexico-major-2024/', year: 2024 },
    { id: 'milano-p1-2024', name: 'Milano P1', url: 'https://www.padelfip.com/events/milano-premier-padel-p1-2024/', year: 2024 },

    // 2023 Season - Major events
    { id: 'qatar-major-2023', name: 'Qatar Major 2023', url: 'https://www.padelfip.com/events/qatar-major-2023/', year: 2023 },
    { id: 'rome-major-2023', name: 'Rome Major 2023', url: 'https://www.padelfip.com/events/italy-major-2023/', year: 2023 },
    { id: 'paris-major-2023', name: 'Paris Major 2023', url: 'https://www.padelfip.com/events/paris-major-2023/', year: 2023 },
    { id: 'mexico-major-2023', name: 'Mexico Major 2023', url: 'https://www.padelfip.com/events/mexico-major-2023/', year: 2023 },
    { id: 'madrid-p1-2023', name: 'Madrid P1 2023', url: 'https://www.padelfip.com/events/madrid-p1-2023/', year: 2023 },
    { id: 'mendoza-p1-2023', name: 'Mendoza P1 2023', url: 'https://www.padelfip.com/events/mendoza-p1-2023/', year: 2023 },
    { id: 'milano-p1-2023', name: 'Milano P1 2023', url: 'https://www.padelfip.com/events/milano-p1-2023/', year: 2023 },

    // 2022 Season
    { id: 'qatar-major-2022', name: 'Qatar Major 2022', url: 'https://www.padelfip.com/events/qatar-major-2022/', year: 2022 },
    { id: 'italy-major-2022', name: 'Rome Major 2022', url: 'https://www.padelfip.com/events/italy-major-2022/', year: 2022 },
    { id: 'paris-major-2022', name: 'Paris Major 2022', url: 'https://www.padelfip.com/events/paris-major-2022/', year: 2022 },
    { id: 'mexico-major-2022', name: 'Mexico Major 2022', url: 'https://www.padelfip.com/events/mexico-major-2022/', year: 2022 },
];

interface Match {
    raw: string;
    team1: string[];
    team2: string[];
    score?: string[];
    round?: string;
    category?: string;
    status?: string;
    court?: string;
    time?: string;
}

async function getWidgetUrl(eventUrl: string): Promise<string | null> {
    try {
        const { data } = await axios.get(eventUrl, {
            headers: { 'User-Agent': USER_AGENT },
            timeout: 10000
        });
        const $ = cheerio.load(data);

        // Find tournament ID from class
        let tournamentId = '';
        $('[class*="idEvent_"]').each((_, el) => {
            const classes = $(el).attr('class')?.split(/\s+/) || [];
            const idClass = classes.find(c => c.startsWith('idEvent_'));
            if (idClass) tournamentId = idClass.replace('idEvent_', '');
        });

        if (!tournamentId) {
            // Try body class postid-
            const bodyClasses = $('body').attr('class')?.split(/\s+/) || [];
            const postidClass = bodyClasses.find(c => c.startsWith('postid-'));
            if (postidClass) tournamentId = postidClass.replace('postid-', '');
        }

        if (tournamentId) {
            // Extract year from URL  
            const yearMatch = eventUrl.match(/20\d{2}/);
            const year = yearMatch ? yearMatch[0] : new Date().getFullYear().toString();
            return `https://widget.matchscorerlive.com/screen/oopbyday/FIP-${year}-${tournamentId}/1?t=tol`;
        }

        return null;
    } catch (e: any) {
        console.log(`    Error getting widget URL: ${e.message}`);
        return null;
    }
}

async function scrapeMatches(widgetUrl: string): Promise<Match[]> {
    const matches: Match[] = [];

    try {
        const { data } = await axios.get(widgetUrl, {
            headers: { 'User-Agent': USER_AGENT },
            timeout: 15000
        });
        const $ = cheerio.load(data);

        // First find all days
        const days: string[] = [];
        $('a[href*="oopbyday"]').each((_, el) => {
            let href = $(el).attr('href');
            if (href && !href.startsWith('http')) {
                href = `https://widget.matchscorerlive.com${href}`;
            }
            if (href) days.push(href);
        });

        // Process each day
        const daysToProcess = days.length > 0 ? days : [widgetUrl];

        for (const dayUrl of daysToProcess) {
            const { data: dayData } = await axios.get(dayUrl, {
                headers: { 'User-Agent': USER_AGENT },
                timeout: 15000
            });
            const $d = cheerio.load(dayData);

            let currentRound = '';
            let currentCat = '';
            let currentCourt = 'Main Court';

            $d('tr').each((_, row) => {
                const $row = $d(row);
                const text = $row.text().replace(/\s+/g, ' ').trim();

                // Header detection
                if ($row.find('th').length > 0 || $row.attr('class')?.includes('header')) {
                    if (text.includes('Men')) currentCat = 'Men';
                    if (text.includes('Women')) currentCat = 'Women';

                    const rounds = ['Final', 'Semi', 'Quarter', 'Round of 16', 'Round of 32', 'Q1', 'Q2'];
                    for (const r of rounds) {
                        if (text.toLowerCase().includes(r.toLowerCase())) {
                            currentRound = r;
                            break;
                        }
                    }

                    const courtMatch = text.match(/(Court\s*\d+|Center Court|Grand Stand|Pista\s*\d+)/i);
                    if (courtMatch) currentCourt = courtMatch[1];
                    return;
                }

                // Match rows have .line-thin elements for player names
                const players = $row.find('.line-thin');
                if (players.length >= 2) {
                    const team1: string[] = [];
                    const team2: string[] = [];

                    players.each((i, p) => {
                        const name = $d(p).text().replace(/\s+/g, ' ').trim()
                            .replace(/\(\d+\)$/, '').trim(); // Remove seed
                        if (i < 2) team1.push(name);
                        else team2.push(name);
                    });

                    // Get score
                    const scores: string[] = [];
                    $row.find('.set').each((_, s) => {
                        const setScore = $d(s).text().trim();
                        if (setScore && setScore !== '-') scores.push(setScore);
                    });

                    if (team1.length > 0 && team2.length > 0) {
                        // Check next row for team2 if needed
                        const nextRow = $row.next('tr');
                        if (nextRow.find('.line-thin').length >= 2 && team2.length === 0) {
                            nextRow.find('.line-thin').each((_, p) => {
                                team2.push($d(p).text().replace(/\s+/g, ' ').trim());
                            });
                        }

                        matches.push({
                            raw: `${team1.join('/')} vs ${team2.join('/')} ${scores.join(' ')}`,
                            team1,
                            team2,
                            score: scores.length > 0 ? scores : undefined,
                            round: currentRound || undefined,
                            category: currentCat || undefined,
                            court: currentCourt,
                            status: 'finished'
                        });
                    }
                }
            });

            // Don't hammer the server
            await new Promise(r => setTimeout(r, 500));
        }

    } catch (e: any) {
        console.log(`    Scrape error: ${e.message}`);
    }

    return matches;
}

function saveTournament(id: string, name: string, matches: Match[], year: number) {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const filename = `${slug}-${year}.json`;
    const filePath = path.join(DATA_DIR, filename);

    const data = {
        id,
        name,
        year,
        matches,
        archivedAt: new Date().toISOString()
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return filename;
}

async function main() {
    console.log('\n========================================');
    console.log('  Premier Padel Match Scraper');
    console.log('========================================\n');

    let totalMatches = 0;
    let processedCount = 0;
    let skippedCount = 0;

    for (const t of TOURNAMENTS) {
        const slug = t.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const filename = `${slug}-${t.year}.json`;
        const filePath = path.join(DATA_DIR, filename);

        // Check if already has match data
        if (fs.existsSync(filePath)) {
            try {
                const existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                if (existing.matches && existing.matches.length > 0) {
                    console.log(`⏭️  Skip ${t.name} (${existing.matches.length} matches exist)`);
                    totalMatches += existing.matches.length;
                    skippedCount++;
                    continue;
                }
            } catch (e) { }
        }

        console.log(`🔄 Fetching ${t.name} (${t.year})...`);

        try {
            const widgetUrl = await getWidgetUrl(t.url);

            if (!widgetUrl) {
                console.log(`   ❌ Could not find widget URL`);
                continue;
            }

            const matches = await scrapeMatches(widgetUrl);

            if (matches.length > 0) {
                saveTournament(t.id, t.name, matches, t.year);
                console.log(`   ✅ Saved ${matches.length} matches`);
                totalMatches += matches.length;
                processedCount++;
            } else {
                console.log(`   ⚠️  No matches found`);
            }

            // Rate limit
            await new Promise(r => setTimeout(r, 1500));

        } catch (e: any) {
            console.log(`   ❌ Error: ${e.message}`);
        }
    }

    console.log('\n========================================');
    console.log(`  Complete!`);
    console.log(`  Processed: ${processedCount}`);
    console.log(`  Skipped: ${skippedCount}`);
    console.log(`  Total matches: ${totalMatches}`);
    console.log('========================================\n');
}

main().catch(console.error);
