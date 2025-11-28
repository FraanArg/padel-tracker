import * as cheerio from 'cheerio';
import axios from 'axios';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export interface Tournament {
    name: string;
    url: string;
    imageUrl: string;
    id: string;
    dateStart?: string;
    dateEnd?: string;
}

export interface Match {
    raw: string;
    // Add more structured fields later
    time?: string;
    timezone?: string;
    category?: string;
    round?: string;
    location?: string;
    court?: string;
    team1?: string[];
    team2?: string[];
    score?: string[];
    status?: string;
    team1Seed?: string;
    team2Seed?: string;
}

const TOURNAMENT_METADATA: Record<string, { timezone: string, location: string }> = {
    'MEXICO': { timezone: 'America/Mexico_City', location: 'Acapulco, Mexico' },
    'ACAPULCO': { timezone: 'America/Mexico_City', location: 'Acapulco, Mexico' },
    'SPAIN': { timezone: 'Europe/Madrid', location: 'Spain' },
    'MADRID': { timezone: 'Europe/Madrid', location: 'Madrid, Spain' },
    'BARCELONA': { timezone: 'Europe/Madrid', location: 'Barcelona, Spain' },
    'ITALY': { timezone: 'Europe/Rome', location: 'Italy' },
    'ROME': { timezone: 'Europe/Rome', location: 'Rome, Italy' },
    'MILAN': { timezone: 'Europe/Rome', location: 'Milan, Italy' },
    'COMO': { timezone: 'Europe/Rome', location: 'Como, Italy' },
    'FRANCE': { timezone: 'Europe/Paris', location: 'France' },
    'PARIS': { timezone: 'Europe/Paris', location: 'Paris, France' },
    'BELGIUM': { timezone: 'Europe/Brussels', location: 'Belgium' },
    'BRUSSELS': { timezone: 'Europe/Brussels', location: 'Brussels, Belgium' },
    'ROESELARE': { timezone: 'Europe/Brussels', location: 'Roeselare, Belgium' },
    'QATAR': { timezone: 'Asia/Qatar', location: 'Doha, Qatar' },
    'DOHA': { timezone: 'Asia/Qatar', location: 'Doha, Qatar' },
    'ARGENTINA': { timezone: 'America/Argentina/Buenos_Aires', location: 'Argentina' },
    'MENDOZA': { timezone: 'America/Argentina/Buenos_Aires', location: 'Mendoza, Argentina' },
    'MAR DEL PLATA': { timezone: 'America/Argentina/Buenos_Aires', location: 'Mar del Plata, Argentina' },
    'CHILE': { timezone: 'America/Santiago', location: 'Santiago, Chile' },
    'SANTIAGO': { timezone: 'America/Santiago', location: 'Santiago, Chile' },
    'MANAMA': { timezone: 'Asia/Bahrain', location: 'Manama, Bahrain' },
    'BAHRAIN': { timezone: 'Asia/Bahrain', location: 'Manama, Bahrain' },
    'KUWAIT': { timezone: 'Asia/Kuwait', location: 'Kuwait City, Kuwait' },
    'DUBAI': { timezone: 'Asia/Dubai', location: 'Dubai, UAE' },
    'UAE': { timezone: 'Asia/Dubai', location: 'Dubai, UAE' },
    'RIYADH': { timezone: 'Asia/Riyadh', location: 'Riyadh, Saudi Arabia' },
    'SAUDI': { timezone: 'Asia/Riyadh', location: 'Saudi Arabia' },
    'SWEDEN': { timezone: 'Europe/Stockholm', location: 'Sweden' },
    'GERMANY': { timezone: 'Europe/Berlin', location: 'Germany' },
    'NETHERLANDS': { timezone: 'Europe/Amsterdam', location: 'Netherlands' },
    'ROTTERDAM': { timezone: 'Europe/Amsterdam', location: 'Rotterdam, Netherlands' },
    'EGYPT': { timezone: 'Africa/Cairo', location: 'Egypt' },
    'NEWGIZA': { timezone: 'Africa/Cairo', location: 'New Giza, Egypt' },
    'FINLAND': { timezone: 'Europe/Helsinki', location: 'Finland' },
    'VENEZUELA': { timezone: 'America/Caracas', location: 'Venezuela' },
    'PUERTO CABELLO': { timezone: 'America/Caracas', location: 'Puerto Cabello, Venezuela' },
    'PARAGUAY': { timezone: 'America/Asuncion', location: 'Paraguay' },
    'ASUNCION': { timezone: 'America/Asuncion', location: 'Asuncion, Paraguay' }
};

function getTournamentMetadata(tournamentName: string): { timezone?: string, location?: string } {
    const upperName = tournamentName.toUpperCase();
    for (const [key, data] of Object.entries(TOURNAMENT_METADATA)) {
        if (upperName.includes(key)) {
            return data;
        }
    }
    return {};
}

export async function getTournaments(): Promise<Tournament[]> {
    try {
        const { data } = await axios.get('https://www.padelfip.com/live/', {
            headers: { 'User-Agent': USER_AGENT }
        });
        const $ = cheerio.load(data);
        const tournaments: Tournament[] = [];

        $('.cover-category-event').each((_, element) => {
            const img = $(element);
            const link = img.closest('a');
            const eventUrl = link.attr('href');

            let imageUrl = img.attr('data-src') || img.attr('data-lazy-src') || img.attr('src') || '';
            if (imageUrl?.startsWith('data:')) {
                const srcset = img.attr('srcset');
                if (srcset) {
                    imageUrl = srcset.split(' ')[0];
                }
            }

            // Clean image URL to get full resolution
            // Remove dimensions like -212x300, -150x150, etc.
            if (imageUrl) {
                imageUrl = imageUrl.replace(/-\d+x\d+(\.[a-zA-Z]+)$/, '$1');
            }

            const container = link.parent();
            const article = img.closest('article');
            const articleText = article.text().replace(/\s+/g, ' ').trim();

            // Extract dates
            let dateStart = '';
            let dateEnd = '';
            const dateMatch = articleText.match(/From (\d{2}\/\d{2}\/\d{4}) to (\d{2}\/\d{2}\/\d{4})/);
            if (dateMatch) {
                dateStart = dateMatch[1];
                dateEnd = dateMatch[2];
            }

            // Strategy 1: Get name from the title attribute of the main link
            let name = link.attr('title') || link.attr('aria-label') || 'Unknown Tournament';

            // Strategy 2: If not found, look for text links (fallback)
            if (name === 'Unknown Tournament') {
                container.find('a').each((_, el) => {
                    const t = $(el).text().trim();
                    const href = $(el).attr('href');
                    if (t && t.toUpperCase() !== 'GO TO EVENT' && t.toUpperCase() !== 'LIVE' && href === eventUrl && $(el).find('img').length === 0) {
                        name = t;
                    }
                });
            }

            // Strategy 3: Look for headers
            if (name === 'Unknown Tournament') {
                const header = container.find('h1, h2, h3, h4, h5, h6').first();
                if (header.length) name = header.text().trim();
            }

            if (eventUrl && imageUrl) {
                if (!tournaments.some(t => t.url === eventUrl)) {
                    tournaments.push({
                        name,
                        url: eventUrl,
                        imageUrl,
                        id: eventUrl.split('/').filter(Boolean).pop() || 'unknown',
                        dateStart,
                        dateEnd
                    });
                }
            }
        });

        return tournaments;
    } catch (error) {
        console.error('Error fetching tournaments:', error);
        return [];
    }
}

export async function getMatches(url: string, dayUrl?: string) {
    try {
        let activeDayUrl = dayUrl;
        let tournamentId = '';
        let widgetId = '';
        let days: any[] = [];
        let tournamentName = '';

        // Always fetch the event page to get the tournament name and ID
        const { data: eventHtml } = await axios.get(url, {
            headers: { 'User-Agent': USER_AGENT }
        });
        const $event = cheerio.load(eventHtml);

        // Extract tournament name
        const pageTitle = $event('title').text();
        tournamentName = pageTitle.split(' - ')[0] || 'Tournament';

        $event('[class*="idEvent_"]').each((_, el) => {
            const classes = $event(el).attr('class')?.split(/\s+/) || [];
            const idClass = classes.find(c => c.startsWith('idEvent_'));
            if (idClass) {
                tournamentId = idClass.replace('idEvent_', '');
            }
        });

        // If no specific day requested, we need to find the default (today)
        if (!activeDayUrl) {
            if (!tournamentId) {
                return { error: 'Could not find tournament ID' };
            }

            const year = new Date().getFullYear();
            widgetId = `FIP-${year}-${tournamentId}`;

            // Fetch day 1 to get the list of days
            const initialWidgetUrl = `https://widget.matchscorerlive.com/screen/oopbyday/${widgetId}/1?t=tol`;

            const { data: widgetHtml } = await axios.get(initialWidgetUrl, {
                validateStatus: () => true
            });

            const $w = cheerio.load(widgetHtml);

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

            const today = new Date();
            const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
            const todayStr = `${monthNames[today.getMonth()]} ${today.getDate()}`;

            activeDayUrl = days.find(d => d.text.includes(todayStr))?.url;

            if (!activeDayUrl && days.length > 0) {
                activeDayUrl = days[days.length - 1].url;
            }
        }

        if (!activeDayUrl) {
            return { matches: [], days: [], tournamentId, widgetId };
        }

        // Fetch the active day matches
        const { data: matchesHtml } = await axios.get(activeDayUrl);
        const $m = cheerio.load(matchesHtml);

        // Parse days again from the active page (to ensure we have them if we skipped the block above)
        // Or if dayUrl was provided, we need to parse days from this page.
        days = []; // Reset days, as we are parsing from the new HTML
        $m('a[href*="oopbyday"]').each((_, el) => {
            let href = $m(el).attr('href');
            const text = $m(el).text().replace(/\s+/g, ' ').trim();
            if (href) {
                if (!href.startsWith('http')) {
                    href = `https://widget.matchscorerlive.com${href}`;
                }
                days.push({ text, url: href });
            }
        });

        const matches: Match[] = [];

        const { timezone, location } = getTournamentMetadata(tournamentName);

        // Iterate over matches by finding the stats link
        $m('a:contains("MATCH STATS")').each((_, el) => {
            const statsLink = $m(el);
            const summaryRow = statsLink.closest('tr');
            const team2Row = summaryRow.prev();
            const team1Row = team2Row.prev();

            if (team1Row.length > 0 && team2Row.length > 0) {
                // Extract players for Team 1
                let team1Players = team1Row.find('.line-thin').map((_, p) => $m(p).text().replace(/\s+/g, ' ').trim()).get();

                // Extract players for Team 2
                let team2Players = team2Row.find('.line-thin').map((_, p) => $m(p).text().replace(/\s+/g, ' ').trim()).get();

                // Extract seeds
                let team1Seed = '';
                let team2Seed = '';

                // Helper to extract seed and clean name
                const extractSeed = (players: string[]) => {
                    let seed = '';
                    const cleanedPlayers = players.map(p => {
                        const match = p.match(/\((\d+)\)$/);
                        if (match) {
                            seed = match[1];
                            return p.replace(/\s*\(\d+\)$/, '').trim();
                        }
                        return p;
                    });
                    return { seed, players: cleanedPlayers };
                };

                const t1Data = extractSeed(team1Players);
                team1Seed = t1Data.seed;
                team1Players = t1Data.players;

                const t2Data = extractSeed(team2Players);
                team2Seed = t2Data.seed;
                team2Players = t2Data.players;

                if (team1Players.length > 0 || team2Players.length > 0) {
                    // Scores are usually in the team rows, let's check both or just one
                    // Often the scores are in the same columns for both rows
                    const sets1 = team1Row.find('.set').map((_, s) => $m(s).text().trim()).get().filter(s => s && s !== '-');
                    const sets2 = team2Row.find('.set').map((_, s) => $m(s).text().trim()).get().filter(s => s && s !== '-');

                    // Combine scores? Usually we just want the set scores.
                    // Let's assume sets1 and sets2 correspond to the score for each team per set.
                    // e.g. sets1 = ["6", "6"], sets2 = ["4", "2"] -> "6-4 6-2"

                    const formattedScore: string[] = [];
                    const maxLength = Math.max(sets1.length, sets2.length);
                    for (let i = 0; i < maxLength; i++) {
                        const s1 = sets1[i] || '0';
                        const s2 = sets2[i] || '0';
                        formattedScore.push(`${s1}-${s2}`);
                    }

                    // Parse the status/time container
                    const statusContainer = summaryRow.find('.live-status-summary');
                    const statusSpan = statusContainer.find('.text-uppercase');
                    const status = statusSpan.length ? statusSpan.text().trim() : statusContainer.text().trim();

                    // Extract time (look for pattern HH:mm)
                    let time = '';
                    // Try to find the time in the text content of the container
                    const containerText = statusContainer.text();
                    const timeMatch = containerText.match(/(\d{2}:\d{2})/);
                    if (timeMatch) {
                        time = timeMatch[1];
                    }

                    // Clean up status if it contains the time or icon
                    let cleanStatus = status.replace(time, '').replace('🕑', '').trim();
                    if (!cleanStatus) cleanStatus = 'Scheduled';

                    // Extract Category and Round from previous header row
                    let category = '';
                    let round = '';
                    let court = '';
                    let prevRow = team1Row.prev();
                    // Look back up to 10 rows to find a header
                    for (let i = 0; i < 10; i++) {
                        if (prevRow.length === 0) break;
                        // Check if it's a header row (often has colspan or th)
                        if (prevRow.find('th').length > 0 || prevRow.hasClass('header-row')) {
                            const headerText = prevRow.text().replace(/\s+/g, ' ').trim();
                            // Example header: "Starting at 4:00 PM Men Q1" or "Men Round of 16"

                            // Try to detect Men/Women
                            if (headerText.includes('Men')) category = 'Men';
                            else if (headerText.includes('Women')) category = 'Women';

                            // Try to detect Round
                            // Common rounds: Q1, Q2, Round of 32, Round of 16, Quarter Final, Semi Final, Final
                            // Order matters! Check for specific rounds before generic ones (e.g. "Quarter Final" before "Final")
                            const rounds = ['Quarter Final', 'Quarterfinals', 'Semi Final', 'Semifinals', 'Round of 16', 'Round of 32', 'Round of 64', 'Final', 'Q1', 'Q2', 'Q3', 'Qualifying'];
                            for (const r of rounds) {
                                if (headerText.includes(r)) {
                                    round = r;
                                    break;
                                }
                            }

                            // Try to detect Court
                            // "Center Court", "Court 1", etc.
                            const courtMatch = headerText.match(/(Center Court|Court \d+|Grand Stand)/i);
                            if (courtMatch) {
                                court = courtMatch[1];
                            }

                            // Try to detect Time in header (e.g. "Starting at 4:00 PM")
                            if (!time) {
                                const timeMatch = headerText.match(/Starting at (\d{1,2}:\d{2})\s*(AM|PM)?/i) || headerText.match(/Not before (\d{1,2}:\d{2})\s*(AM|PM)?/i);
                                if (timeMatch) {
                                    let [_, t, period] = timeMatch;
                                    if (period) {
                                        // Convert to 24h
                                        let [h, m] = t.split(':').map(Number);
                                        if (period.toUpperCase() === 'PM' && h < 12) h += 12;
                                        if (period.toUpperCase() === 'AM' && h === 12) h = 0;
                                        time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                                    } else {
                                        time = t;
                                    }
                                }
                            }

                            // If we found something, stop looking? 
                            // Sometimes headers are split. Let's assume the closest header is the most relevant.
                            if (category || round || time || court) break; // Added court to break condition
                        }
                        prevRow = prevRow.prev();
                    }

                    // If no court found in headers, maybe it's in a "court-name" span we missed?
                    // The debug output showed <span class="court-name">Starting at 4:00 PM</span>
                    // It seems "court-name" class is used for generic headers too.
                    // Let's look for a specific Court header further up if we haven't found one?
                    // Or maybe the court is not always shown in this view.

                    // Let's add a separate loop for Court if we really want it, 
                    // or just rely on the fact that usually matches are grouped by court.
                    // For now, let's stick to what we have.

                    const raw = `${cleanStatus} ${team1Players.join(' / ')} vs ${team2Players.join(' / ')} ${formattedScore.join(' ')}`;

                    matches.push({
                        raw: raw.replace(/\s+/g, ' ').trim(),
                        team1: team1Players,
                        team2: team2Players,
                        score: formattedScore,
                        status: cleanStatus,
                        time,
                        timezone,
                        category,
                        round,
                        location,
                        court,
                        team1Seed,
                        team2Seed
                    });
                } else {
                    matches.push({ raw: team1Row.text() + ' ' + team2Row.text() });
                }
            } else {
                const container = statsLink.closest('div, li');
                matches.push({ raw: container.text().replace(/\s+/g, ' ').trim() });
            }
        });

        return {
            tournamentId,
            widgetId,
            days,
            activeDayUrl,
            matches,
            tournamentName
        };

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`Error fetching matches for URL ${url}:`, error.message, 'Status:', error.response?.status, 'URL:', error.config?.url);
        } else {
            console.error('Error fetching matches:', error);
        }
        return { error: 'Failed to fetch matches' };
    }
}

export interface PlayerRanking {
    rank: string;
    name: string;
    points: string;
    country: string;
    imageUrl: string;
    flagUrl?: string;
}

// Helper to get flag emoji from country code
export function getFlagEmoji(countryCode: string): string {
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

export async function getPlayerProfile(name: string): Promise<PlayerRanking | null> {
    try {
        // Normalize name for slug guessing
        const normalize = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").trim();
        const cleanName = name.replace(/\s*\(\d+\)|\s*\(WC\)|\s*\(Q\)|\s*\(LL\)/gi, '').trim();
        const parts = normalize(cleanName).split(/\s+/);

        // Generate slug variations
        const slugs = [
            parts.join('-'), // firstname-lastname
            parts.slice(0, 2).join('-'), // firstname-lastname (if middle name exists)
            parts.join('-') + '-segador', // specific hack? No, just try full name
            parts[0] + '-' + parts[parts.length - 1], // firstname-surname
        ];

        // Add specific variations for known patterns if needed
        if (parts.length > 2) {
            slugs.push(parts[0] + '-' + parts[1]);
        }

        // Deduplicate slugs
        const uniqueSlugs = [...new Set(slugs)];

        for (const slug of uniqueSlugs) {
            const url = `https://www.padelfip.com/player/${slug}/`;
            try {
                const { data } = await axios.get(url, {
                    headers: { 'User-Agent': USER_AGENT },
                    validateStatus: status => status === 200
                });

                const $ = cheerio.load(data);

                // Extract from meta description
                // "Victoria Iglesias Segador - Points: 2990; Ranking: 22; Personal Informations: ..."
                const description = $('meta[name="description"]').attr('content') || '';

                const rankMatch = description.match(/Ranking:\s*(\d+)/i);
                const pointsMatch = description.match(/Points:\s*(\d+)/i);

                const rank = rankMatch ? rankMatch[1] : '';
                const points = pointsMatch ? pointsMatch[1] : '';

                // Extract image (prefer OG image for high res)
                let imageUrl = $('meta[property="og:image"]').attr('content') || '';
                if (!imageUrl) {
                    imageUrl = $('.wp-post-image').attr('src') || '';
                }

                // Extract country (bit harder from meta, try selector)
                const country = $('.player-country').text().trim() || '';

                if (rank || points) {
                    return {
                        rank: rank || '-',
                        name: cleanName,
                        points: points || '-',
                        country: country || '-',
                        imageUrl,
                        flagUrl: ''
                    };
                }
            } catch (e) {
                // Continue to next slug
            }
        }

        return null;
    } catch (error) {
        console.error('Error fetching player profile:', error);
        return null;
    }
}

export async function getRankings(): Promise<{ men: PlayerRanking[], women: PlayerRanking[] }> {
    try {
        // Fetch both male and female rankings
        const [maleResponse, femaleResponse] = await Promise.all([
            axios.get('https://www.padelfip.com/ranking-male/', { headers: { 'User-Agent': USER_AGENT } }),
            axios.get('https://www.padelfip.com/ranking-female/', { headers: { 'User-Agent': USER_AGENT } })
        ]);

        const parseRankings = (html: string): PlayerRanking[] => {
            const $ = cheerio.load(html);
            const list: PlayerRanking[] = [];

            // 1. Parse Slider Items (Top Players)
            $('.slider__overall').each((_, el) => {
                const slider = $(el);
                const rankText = slider.find('.slider__number').text().trim();
                const rank = rankText.split(' ')[0];

                const name = slider.find('.slider__name').text().trim();

                const points = slider.find('.slider__pointTNumber').text().trim();

                const country = slider.find('.slider__country').text().trim();

                // Extract flag URL
                let flagUrl = '';
                const flagImg = slider.find('.slider__flag img');
                flagUrl = flagImg.attr('data-src') || flagImg.attr('src') || '';

                // Find player image (exclude flag image)
                let imageUrl = '';
                slider.find('img').each((_, img) => {
                    const alt = $(img).attr('alt') || '';
                    const src = $(img).attr('data-src') || $(img).attr('src') || '';
                    // Flag usually has 3 letter country code as alt, player has name
                    if (alt.length > 3 && src) {
                        imageUrl = src;
                    }
                });

                if (name && rank) {
                    list.push({
                        rank,
                        name,
                        points,
                        country,
                        imageUrl,
                        flagUrl
                    });
                }
            });

            // 2. Parse Table Rows (Rest of players)
            $('table tr').each((_, el) => {
                const row = $(el);
                const cells = row.find('td');
                if (cells.length >= 4) {
                    const rankText = $(cells[0]).text().trim();
                    const rank = rankText.split(' ')[0];

                    const nameCell = $(cells[1]);
                    let name = nameCell.text().trim();
                    let imageUrl = '';

                    // Check if the name cell contains escaped HTML (starts with <img)
                    if (name.startsWith('<img')) {
                        const $inner = cheerio.load(name);
                        const img = $inner('img');
                        imageUrl = img.attr('src') || '';
                        if (img.attr('srcset')) {
                            imageUrl = img.attr('srcset')?.split(' ')[0] || imageUrl;
                        }
                        name = $inner.text().trim();
                    } else {
                        // Normal HTML structure
                        const img = nameCell.find('img');
                        imageUrl = img.attr('src') || '';
                        if (img.attr('srcset')) {
                            imageUrl = img.attr('srcset')?.split(' ')[0] || imageUrl;
                        }
                    }

                    const countryCell = $(cells[2]);
                    let country = countryCell.text().trim();
                    let flagUrl = '';

                    // Check if country cell contains escaped HTML
                    if (country.startsWith('<img')) {
                        const $inner = cheerio.load(country);
                        const img = $inner('img');
                        flagUrl = img.attr('src') || '';
                        country = $inner.text().trim();
                    } else {
                        const img = countryCell.find('img');
                        flagUrl = img.attr('src') || '';
                    }

                    const points = $(cells[3]).text().trim();

                    if (name && rank) {
                        list.push({
                            rank,
                            name,
                            points,
                            country,
                            imageUrl,
                            flagUrl
                        });
                    }
                }
            });
            return list;
        };

        const men = parseRankings(maleResponse.data);
        const women = parseRankings(femaleResponse.data);

        return { men, women };
    } catch (error) {
        console.error('Error fetching rankings:', error);
        return { men: [], women: [] };
    }
}

