import * as cheerio from 'cheerio';
import axios from 'axios';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
import { TOURNAMENT_METADATA, convertMatchTime, addMinutes } from './date';

export { TOURNAMENT_METADATA, convertMatchTime, addMinutes };
export interface Tournament {
    name: string;
    url: string;
    imageUrl: string;
    id: string;
    dateStart?: string;
    dateEnd?: string;
    status?: 'live' | 'upcoming' | 'finished';
    month?: string;
    parsedDate?: Date;
}

export interface Player {
    name: string;
    rank?: number;
    points?: number;
    country?: string;
    matchesPlayed?: number;
    matchesWon?: number;
    winRate?: string;
    partner?: string;
    imageUrl?: string;
    profileUrl?: string;
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
    team1Flags?: string[];
    team2Flags?: string[];
    score?: string[];
    status?: string;
    team1Seed?: string;
    team2Seed?: string;
    tournament?: { name: string; dateStart?: string; dateEnd?: string; };
    nextMatch?: Match; // The match immediately following this one on the same court
}

// ... existing code ...



function getTournamentMetadata(tournamentName: string): { timezone?: string, location?: string } {
    const upperName = tournamentName.toUpperCase();
    for (const [key, data] of Object.entries(TOURNAMENT_METADATA)) {
        if (upperName.includes(key)) {
            return data;
        }
    }
    return {};
}



export async function getCalendarTournaments(): Promise<Tournament[]> {
    try {
        const { data } = await axios.get('https://www.padelfip.com/calendar/', {
            headers: { 'User-Agent': USER_AGENT }
        });
        const $ = cheerio.load(data);
        const tournaments: Tournament[] = [];
        let currentMonth = '';
        const currentYear = new Date().getFullYear(); // Assuming calendar is for current/next year
        // Heuristic: if month is earlier than current month, it might be next year, but usually calendar pages are for a specific year.
        // For now, let's assume the calendar page is for 2025 as seen in the text "Calendars 2025".
        const year = 2025;

        $('.loop-container').children().each((_, element) => {
            const tag = $(element).prop('tagName');
            if (tag === 'H2') {
                currentMonth = $(element).text().trim();
            } else if ($(element).find('.cover-category-event').length > 0) {
                const img = $(element).find('.cover-category-event');
                const link = img.closest('a');
                const eventUrl = link.attr('href');

                // Try to find name in following sibling link or text
                let name = link.next().text().trim();
                if (!name) name = link.parent().text().trim(); // Fallback

                // CRITICAL FIX: Clean up name to remove HTML tags or "GO TO EVENT"
                // Sometimes the text content includes the raw HTML of the image due to WP issues
                name = name.replace(/<[^>]*>/g, '').replace(/GO TO EVENT/i, '').trim();

                // If name is still empty or looks like a URL/garbage, try to extract from URL
                if (!name || name.length < 3 || name.includes('http')) {
                    const urlParts = eventUrl?.split('/').filter(Boolean);
                    const slug = urlParts?.[urlParts.length - 1];
                    name = slug ? slug.replace(/-/g, ' ').toUpperCase() : 'Unknown Tournament';
                }

                let imageUrl = img.attr('data-src') || img.attr('data-lazy-src') || img.attr('src') || '';

                // FIX: Remove resolution suffix (e.g. -212x300) to get high quality image
                imageUrl = imageUrl.replace(/-\d+x\d+(?=\.[a-z]+$)/i, '');

                if (eventUrl && name) {
                    const id = eventUrl.split('/').filter(Boolean).pop() || '';

                    // Construct a date object from the Month header
                    // We don't have exact days in the calendar view usually, so we default to the 1st of the month for sorting
                    // unless we can find a date string in the text.
                    let dateStart = '';
                    let dateObj = new Date();

                    if (currentMonth) {
                        const monthIndex = new Date(`${currentMonth} 1, 2000`).getMonth();
                        if (!isNaN(monthIndex)) {
                            dateObj = new Date(year, monthIndex, 1);
                            dateStart = `${currentMonth} ${year}`;
                        }
                    }

                    tournaments.push({
                        name,
                        url: eventUrl,
                        imageUrl,
                        id,
                        month: currentMonth,
                        status: 'upcoming',
                        dateStart, // Display string
                        parsedDate: dateObj // For filtering
                    });
                }
            }
        });
        return tournaments;
    } catch (error) {
        console.error('Error fetching calendar tournaments:', error);
        return [];
    }
}

export async function getTournaments(): Promise<Tournament[]> {
    try {
        // Fetch both sources in parallel
        const [liveData, calendarData] = await Promise.all([
            (async () => {
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
                        // FIX: Remove resolution suffix (e.g. -212x300) to get high quality image
                        imageUrl = imageUrl.replace(/-\d+x\d+(?=\.[a-z]+$)/i, '');

                        const container = $(element).closest('.event-container');
                        let dateText = container.find('.date-start-end').text().trim();

                        // Fallback to old selector if new one fails
                        if (!dateText) {
                            const wrapper = $(element).closest('.wrapper-events');
                            dateText = wrapper.find('.date-event').text().trim();
                        }

                        let name = container.find('.event-title').text().trim();
                        if (!name) {
                            const wrapper = $(element).closest('.wrapper-events');
                            name = wrapper.find('.name-event').text().trim();
                        }

                        // Fallback name extraction from URL if empty
                        if (!name) {
                            const urlParts = eventUrl?.split('/').filter(Boolean);
                            const slug = urlParts?.[urlParts.length - 1];
                            name = slug ? slug.replace(/-/g, ' ').toUpperCase() : 'Unknown Tournament';
                        }

                        if (eventUrl && name) {
                            const id = eventUrl.split('/').filter(Boolean).pop() || '';

                            let parsedDate = new Date();
                            let dateStart = dateText;
                            let dateEnd = '';

                            // Parse "From DD/MM/YYYY to DD/MM/YYYY"
                            const rangeMatch = dateText.match(/From\s+(\d{2})\/(\d{2})\/(\d{4})\s+to\s+(\d{2})\/(\d{2})\/(\d{4})/i);
                            if (rangeMatch) {
                                const [_, d1, m1, y1, d2, m2, y2] = rangeMatch;
                                parsedDate = new Date(parseInt(y1), parseInt(m1) - 1, parseInt(d1));
                                dateStart = `${d1}/${m1}/${y1}`;
                                dateEnd = `${d2}/${m2}/${y2}`;
                            } else {
                                // Try Spanish format fallback: "24 AL 30 DE NOV"
                                const esMonths: Record<string, number> = {
                                    'ENE': 0, 'FEB': 1, 'MAR': 2, 'ABR': 3, 'MAY': 4, 'JUN': 5,
                                    'JUL': 6, 'AGO': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DIC': 11
                                };
                                const match = dateText.match(/(\d+).*DE\s+([A-Z]+)/i);
                                if (match) {
                                    const day = parseInt(match[1]);
                                    const monthStr = match[2].toUpperCase().substring(0, 3);
                                    const month = esMonths[monthStr];
                                    if (month !== undefined) {
                                        const year = new Date().getFullYear();
                                        parsedDate = new Date(year, month, day);
                                    }
                                }
                            }

                            // Determine status
                            const status = 'live';

                            tournaments.push({
                                name,
                                url: eventUrl,
                                imageUrl,
                                id,
                                dateStart,
                                dateEnd,
                                status,
                                parsedDate
                            });
                        }
                    });
                    return tournaments;
                } catch (e) {
                    console.error('Error fetching live tournaments:', e);
                    return [];
                }
            })(),
            getCalendarTournaments()
        ]);

        // Merge and Deduplicate
        const tournamentMap = new Map<string, Tournament>();

        // Add Calendar data first
        calendarData.forEach(t => tournamentMap.set(t.id, t));

        // Overwrite with Live data
        liveData.forEach(t => tournamentMap.set(t.id, t));

        const allTournaments = Array.from(tournamentMap.values());

        // Helper to get importance score (Higher is better)
        const getImportance = (name: string) => {
            const n = name.toUpperCase();
            if (n.includes('MAJOR')) return 4;
            if (n.includes('P1')) return 3;
            if (n.includes('P2')) return 2;
            if (n.includes('FIP PLATINUM')) return 1.5;
            if (n.includes('FIP GOLD')) return 1.4;
            if (n.includes('FIP STAR')) return 1.3;
            if (n.includes('FIP RISE')) return 1.2;
            if (n.includes('FIP PROMOTION')) return 1.1;
            return 1;
        };

        // Return all tournaments sorted by:
        // 1. Status: Live > Upcoming > Finished
        // 2. Importance (for Live/Upcoming): Major > P1 > P2...
        // 3. Date: Sooner > Later
        return allTournaments.map(t => {
            // Logic to promote "Upcoming" events to "Live" if they are in the current month/week
            // especially for Major tournaments which might be listed in the calendar but not yet on the live page
            const today = new Date();
            const isSameMonth = t.parsedDate &&
                t.parsedDate.getMonth() === today.getMonth() &&
                t.parsedDate.getFullYear() === today.getFullYear();

            // SPECIFIC FIX: Only promote Acapulco Major as requested by user
            // We avoid promoting other Premier/Major tournaments (like Dubai) if they are not actually live
            if (t.status === 'upcoming' && isSameMonth && t.name.toUpperCase().includes('ACAPULCO')) {
                return { ...t, status: 'live' as const };
            }
            return t;
        }).filter(t => {
            // Filter out past tournaments
            // We keep 'live' tournaments regardless of date
            if (t.status === 'live') return true;

            // For upcoming events, we want to keep them if they are in the future OR in the current month
            // If parsedDate is valid:
            if (t.parsedDate) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                // If the tournament is in the past (before today), filter it out
                // UNLESS it's in the current month (we might want to show recent/ongoing events that aren't marked live yet)
                // But for "Upcoming" tab, we usually want strictly future.
                // However, the issue was "Acapulco" (Nov) being filtered out on Nov 28.
                // Nov 1 < Nov 28, so it was filtered.

                // Let's keep it if it's in the current month or future
                const isCurrentMonth = t.parsedDate.getMonth() === today.getMonth() &&
                    t.parsedDate.getFullYear() === today.getFullYear();

                if (t.parsedDate < today && !isCurrentMonth) return false;
            }

            return true;
        }).sort((a, b) => {
            // 1. Status Priority
            const statusScore = (status?: string) => {
                if (status === 'live') return 3;
                if (status === 'upcoming') return 2;
                return 1; // finished
            };

            const scoreA = statusScore(a.status);
            const scoreB = statusScore(b.status);

            if (scoreA !== scoreB) return scoreB - scoreA; // Descending status

            // 2. Importance Priority (only if both are live or both are upcoming)
            if (scoreA === scoreB && scoreA > 1) {
                const impA = getImportance(a.name);
                const impB = getImportance(b.name);
                if (impA !== impB) return impB - impA; // Descending importance
            }

            // 3. Date Priority
            const dateA = a.parsedDate?.getTime() || 0;
            const dateB = b.parsedDate?.getTime() || 0;

            // For upcoming, we want sooner first (ascending date)
            // For finished, we want most recent first (descending date)
            if (a.status === 'finished') {
                return dateB - dateA;
            }
            return dateA - dateB;
        });

    } catch (error) {
        console.error('Error fetching tournaments:', error);
        return [];
    }
}

// Cache for matches: URL -> { data: any, timestamp: number }
const matchesCache: Record<string, { data: any, timestamp: number }> = {};
const CACHE_DURATION = 120 * 1000; // 120 seconds

export async function getMatches(url: string, dayUrl?: string) {
    const cacheKey = `${url}|${dayUrl || ''}`;
    const now = Date.now();

    if (matchesCache[cacheKey] && (now - matchesCache[cacheKey].timestamp < CACHE_DURATION)) {
        // console.log('Serving from cache:', cacheKey);
        return matchesCache[cacheKey].data;
    }

    try {
        let activeDayUrl = dayUrl;
        let tournamentId = '';
        let widgetId = '';
        let days: any[] = [];
        let tournamentName = '';

        // Check if this is a "Live Score" tab URL
        const isLiveTab = url.includes('tab=Live+Score') || url.includes('tab=Live Score');

        // Always fetch the event page to get the tournament name and ID
        const { data: eventHtml } = await axios.get(url, {
            headers: { 'User-Agent': USER_AGENT }
        });
        const $event = cheerio.load(eventHtml);

        // Extract tournament name
        const pageTitle = $event('title').text();
        tournamentName = pageTitle.split(' - ')[0] || 'Tournament';

        // Try to find the specific Live Score widget ID first if we are on the Live Tab
        if (isLiveTab) {
            const liveWidgetDiv = $event('.iframe-livescore');
            if (liveWidgetDiv.length > 0) {
                // Check for data-src first (lazy loading)
                const dataSrc = liveWidgetDiv.attr('data-src');
                const src = liveWidgetDiv.attr('src');

                if (dataSrc && dataSrc.includes('matchscorerlive')) {
                    activeDayUrl = dataSrc;
                    // Extract widget ID from URL if needed, but we have the full URL now
                    // URL format: https://widget.matchscorerlive.com/screen/tournamentlive/FIP-2025-4801?t=tol
                } else if (src && src.includes('matchscorerlive')) {
                    activeDayUrl = src;
                } else {
                    // Fallback to ID if URL extraction fails
                    const id = liveWidgetDiv.attr('id');
                    if (id) {
                        widgetId = id;
                        // Try the tournamentlive endpoint which seems to be the correct one for this view
                        // We might need the FIP ID, but let's try to find it from the URL we just failed to extract?
                        // If we are here, we failed to get the URL.
                        // Let's try to construct it using the tournament ID if we found it elsewhere.
                    }
                }
            }
        }

        if (!widgetId) {
            $event('[class*="idEvent_"]').each((_, el) => {
                const classes = $event(el).attr('class')?.split(/\s+/) || [];
                const idClass = classes.find(c => c.startsWith('idEvent_'));
                if (idClass) {
                    tournamentId = idClass.replace('idEvent_', '');
                }
            });
        }

        // If no specific day requested and we didn't find a direct Live Score widget
        if (!activeDayUrl) {
            if (!tournamentId && !widgetId) {
                return { error: 'Could not find tournament ID' };
            }

            // Fallback to standard OOP view if not explicitly on Live Tab or if Live Tab parsing failed
            if (!widgetId) {
                const year = new Date().getFullYear();
                widgetId = `FIP-${year}-${tournamentId}`;
            }

            // Fetch day 1 to get the list of days
            const initialWidgetUrl = `https://widget.matchscorerlive.com/screen/oopbyday/${widgetId}/1?t=tol`;
            // ... rest of logic for finding active day

            // If we are here, we are looking for OOP (Order of Play)
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

        // Iterate over all rows to group by court
        let currentCourtIndex = 0;
        let currentCourtMatches: Match[] = [];
        const courtMatchesMap: Record<string, Match[]> = {};

        // Helper to process a match block
        const processMatchBlock = (t1Row: any, t2Row: any, summaryRow: any, headerInfo: any) => {
            // Extract players for Team 1
            let team1Players = t1Row.find('.line-thin').map((_: any, p: any) => $m(p).text().replace(/\s+/g, ' ').trim()).get();
            let team1Flags = t1Row.find('.line-thin').map((_: any, p: any) => {
                const src = $m(p).parent().find('img').attr('src');
                return src ? (src.startsWith('http') ? src : `https://widget.matchscorerlive.com${src}`) : '';
            }).get();

            // Extract players for Team 2
            let team2Players = t2Row.find('.line-thin').map((_: any, p: any) => $m(p).text().replace(/\s+/g, ' ').trim()).get();
            let team2Flags = t2Row.find('.line-thin').map((_: any, p: any) => {
                const src = $m(p).parent().find('img').attr('src');
                return src ? (src.startsWith('http') ? src : `https://widget.matchscorerlive.com${src}`) : '';
            }).get();

            // Extract seeds
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
            const team1Seed = t1Data.seed;
            team1Players = t1Data.players;

            const t2Data = extractSeed(team2Players);
            const team2Seed = t2Data.seed;
            team2Players = t2Data.players;

            // Scores
            // Scores - Handle tiebreaks by adding space
            const extractScore = (row: any) => {
                return row.find('.set').map((_: any, s: any) => {
                    const el = $m(s);
                    // Check for tiebreak span
                    const tiebreak = el.find('.tiebreak');
                    if (tiebreak.length > 0) {
                        const mainScore = el.contents().filter((_: any, n: any) => n.type === 'text').text().trim();
                        const tbScore = tiebreak.text().trim();
                        return `${mainScore}(${tbScore})`;
                    }
                    return el.text().trim();
                }).get().filter((s: string) => s && s !== '-');
            };

            const sets1 = extractScore(t1Row);
            const sets2 = extractScore(t2Row);

            const formattedScore: string[] = [];
            const maxLength = Math.max(sets1.length, sets2.length);
            for (let i = 0; i < maxLength; i++) {
                const s1 = sets1[i] || '0';
                const s2 = sets2[i] || '0';
                formattedScore.push(`${s1}-${s2}`);
            }

            // Status
            let status = 'Scheduled';
            let time = '';

            if (summaryRow && summaryRow.length > 0) {
                const statusContainer = summaryRow.find('.live-status-summary');

                // Try to get text from the first div (usually contains time and status)
                const infoDiv = statusContainer.find('div').first();
                let rawStatus = infoDiv.length ? infoDiv.text() : statusContainer.text();

                // Remove the "MATCH STATS" button text if we grabbed the whole container
                rawStatus = rawStatus.replace('MATCH STATS', '').replace('Match Stats', '');

                const statusSpan = statusContainer.find('.text-uppercase');
                status = statusSpan.length ? statusSpan.text().trim() : rawStatus.trim();

                // Extract time
                const timeMatch = rawStatus.match(/(\d{2}:\d{2})/);
                if (timeMatch) {
                    time = timeMatch[1];
                }

                // Clean status
                status = status.replace(time, '').replace('🕑', '').replace('Live match', 'Live').trim();

                // If it says "Live", keep it simple
                if (status.toLowerCase().includes('live')) {
                    status = 'Live';
                }
            }

            if (!status) status = 'Scheduled';

            // Use header info if available
            let category = headerInfo.category || '';
            let round = headerInfo.round || '';
            let court = headerInfo.court || `Court ${currentCourtIndex}`; // Default to numbered court if not found

            // If time is missing from summary, try header
            if (!time && headerInfo.time) {
                time = headerInfo.time;
            }

            const raw = `${status} ${team1Players.join(' / ')} vs ${team2Players.join(' / ')} ${formattedScore.join(' ')}`;

            return {
                raw: raw.replace(/\s+/g, ' ').trim(),
                team1: team1Players,
                team2: team2Players,
                team1Flags,
                team2Flags,
                score: formattedScore,
                status,
                time,
                timezone,
                category,
                round,
                location,
                court,
                team1Seed,
                team2Seed
            };
        };

        let currentHeaderInfo = { category: '', round: '', court: '', time: '' };
        let lastMatchTimeByCourt: Record<string, string> = {};
        let matchBuffer: any[] = [];

        $m('tr').each((_, el) => {
            const row = $m(el);
            const text = row.text().replace(/\s+/g, ' ').trim();

            // Check for Header
            if (row.find('th').length > 0 || row.attr('class')?.includes('header')) {
                // Parse header
                if (text.includes('Starting at')) {
                    currentCourtIndex++;
                    // Reset matches for new court? 
                    // Yes, "Starting at" usually implies a new court or a significant break.
                    // But we need to be careful not to split the same court if it's just a time update.
                    // However, based on our analysis, "Starting at" repeated implies different courts.
                }

                // Extract Category/Round
                if (text.includes('Men')) currentHeaderInfo.category = 'Men';
                else if (text.includes('Women')) currentHeaderInfo.category = 'Women';

                const rounds = ['Quarter Final', 'Quarterfinals', 'Semi Final', 'Semifinals', 'Round of 16', 'Round of 32', 'Round of 64', 'Final', 'Q1', 'Q2', 'Q3', 'Qualifying'];
                for (const r of rounds) {
                    if (text.includes(r)) {
                        currentHeaderInfo.round = r;
                        break;
                    }
                }

                // Check for explicit court name
                const courtMatch = text.match(/(Center Court|Court \d+|Grand Stand|Pista \d+)/i);
                if (courtMatch) {
                    currentHeaderInfo.court = courtMatch[1];
                } else {
                    // If no explicit name, use index
                    currentHeaderInfo.court = `Court ${currentCourtIndex}`;
                }

                // Extract Time from header
                const timeMatch = text.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
                if (timeMatch) {
                    currentHeaderInfo.time = timeMatch[1];
                    // Update last known time for this court
                    if (currentHeaderInfo.court) {
                        lastMatchTimeByCourt[currentHeaderInfo.court] = timeMatch[1];
                    }
                } else if (text.toLowerCase().includes('followed by')) {
                    const lastTime = currentHeaderInfo.court ? lastMatchTimeByCourt[currentHeaderInfo.court] : null;
                    if (lastTime) {
                        const estTime = addMinutes(lastTime, 90);
                        currentHeaderInfo.time = `Est. ${estTime}`;
                        // Update for the next match in chain
                        lastMatchTimeByCourt[currentHeaderInfo.court] = estTime;
                    } else {
                        currentHeaderInfo.time = 'Followed by';
                    }
                } else {
                    currentHeaderInfo.time = '';
                }
            }

            // Check for Match Rows
            if (row.find('.line-thin').length > 0) {
                matchBuffer.push(row);
            } else if (matchBuffer.length === 2) {
                // We have a complete match (2 teams), check if next row is summary
                // The current row 'row' might be the summary row if it contains "MATCH STATS" or similar
                // OR it might be a header for the next match.

                let summaryRow = null;
                if (text.includes('MATCH STATS') || row.find('.live-status-summary').length > 0) {
                    summaryRow = row;
                }

                const match = processMatchBlock(matchBuffer[0], matchBuffer[1], summaryRow, currentHeaderInfo);

                // Add to court group
                const courtKey = currentHeaderInfo.court;
                if (!courtMatchesMap[courtKey]) courtMatchesMap[courtKey] = [];
                courtMatchesMap[courtKey].push(match);

                matchBuffer = [];

                // If we consumed the current row as summary, we shouldn't process it as header
            } else {
                // Reset buffer if we hit something else and buffer is not full
                if (matchBuffer.length > 0) matchBuffer = [];
            }
        });

        // Post-process matches to link "Next Match"
        const allMatches: Match[] = [];

        Object.values(courtMatchesMap).forEach(courtMatches => {
            for (let i = 0; i < courtMatches.length; i++) {
                const m = courtMatches[i];

                // Check if this match is Live
                const isLive = m.status?.toLowerCase() === 'live' ||
                    m.status?.toLowerCase().includes('live') ||
                    m.status?.toLowerCase().includes('set') ||
                    (m.score && m.score.length > 0 && !m.status?.toLowerCase().includes('finished'));

                if (isLive) {
                    // Find the next scheduled match
                    const next = courtMatches[i + 1];
                    if (next) {
                        m.nextMatch = next;
                    }
                }
                allMatches.push(m);
            }
        });

        // Replace the old matches array with our new structured one
        matches.push(...allMatches);


        const result = {
            matches,
            days,
            tournamentId,
            widgetId,
            activeDayUrl,
            tournamentName
        };

        matchesCache[cacheKey] = {
            data: result,
            timestamp: Date.now()
        };

        return result;
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
    recentResults?: TournamentResult[];
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
                        flagUrl: '',
                        recentResults: []
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

export interface TournamentResult {
    tournament: string;
    category: string;
    date: string;
    round: string;
    points: string;
}


// Cache for rankings to avoid hitting the server too often
let rankingsCache: {
    data: { men: PlayerRanking[], women: PlayerRanking[] },
    timestamp: number
} | null = null;
const RANKINGS_CACHE_DURATION = 60 * 60 * 1000; // 1 hour


async function getCachedRankings() {
    if (rankingsCache && (Date.now() - rankingsCache.timestamp < RANKINGS_CACHE_DURATION)) {
        return rankingsCache.data;
    }
    return getRankings();
}

export async function getRankings(): Promise<{ men: PlayerRanking[], women: PlayerRanking[] }> {
    // Check cache
    if (rankingsCache && (Date.now() - rankingsCache.timestamp < RANKINGS_CACHE_DURATION)) {
        console.log('Returning cached rankings');
        return rankingsCache.data;
    }

    try {
        const [menResponse, womenResponse] = await Promise.all([
            axios.get('https://www.padelfip.com/ranking-male/', { headers: { 'User-Agent': USER_AGENT } }),
            axios.get('https://www.padelfip.com/ranking-female/', { headers: { 'User-Agent': USER_AGENT } })
        ]);

        const processRankings = async (data: any, gender: 'male' | 'female') => {
            const $ = cheerio.load(data);
            const rankings: PlayerRanking[] = [];

            // 1. Top Players (Slider/Grid) - usually top 20
            // We need to fetch their profile pages to get the "round" image (og:image)
            // instead of the action shot.
            const topPlayers: { element: any, rank: string }[] = [];

            // Helper to clean rank string
            const cleanRank = (text: string) => text.replace(/\D/g, '');

            $('.slider__item, .playerGrid__item').each((_, element) => {
                const rankText = $(element).find('.slider__number, .playerGrid__number').text().trim();
                const rank = cleanRank(rankText);
                if (rank) {
                    topPlayers.push({ element, rank });
                }
            });

            // Process top players in parallel (limit concurrency if needed, but 20 is small)
            const topPlayerPromises = topPlayers.map(async ({ element, rank }) => {
                const el = $(element);
                const name = el.find('.slider__name, .playerGrid__name').text().trim();
                const points = el.find('.slider__pointTNumber, .playerGrid__pointTNumber').text().trim();
                const country = el.find('.slider__country, .playerGrid__country').text().trim();
                const flagUrl = el.find('.slider__flag img, .playerGrid__flag img').attr('src') || '';

                // Default action shot (fallback)
                let imageUrl = el.find('.slider__img img, .playerGrid__img img').attr('data-src') ||
                    el.find('.slider__img img, .playerGrid__img img').attr('src') || '';

                // Try to fetch profile for better image
                const profileLink = el.find('a').attr('href');
                if (profileLink) {
                    try {
                        const { data: profileData } = await axios.get(profileLink, {
                            headers: { 'User-Agent': USER_AGENT },
                            timeout: 5000 // Short timeout to not block everything
                        });
                        const $profile = cheerio.load(profileData);
                        const ogImage = $profile('meta[property="og:image"]').attr('content');
                        if (ogImage) {
                            imageUrl = ogImage;
                        }
                    } catch (err) {
                        console.warn(`Failed to fetch profile for ${name}:`, err);
                    }
                }

                return {
                    rank,
                    name,
                    points,
                    country,
                    imageUrl,
                    flagUrl
                };
            });

            const topPlayersData = await Promise.all(topPlayerPromises);
            rankings.push(...topPlayersData);

            // 2. Table Players (Rank 21+)
            $('.data-body-row').each((_, element) => {
                const row = $(element);
                const rank = cleanRank(row.find('.data-rank-cell').text().trim());
                const name = row.find('.data-player-img-name .data-title').text().trim();
                const points = row.find('.data-points').text().trim();
                const country = row.find('.country-name').text().trim();

                // Table images are usually already the "round" style (or close to it)
                const imageUrl = row.find('.data-player-img-name img').attr('data-src') ||
                    row.find('.data-player-img-name img').attr('src') || '';

                const flagUrl = row.find('.flag-country img').attr('data-src') ||
                    row.find('.flag-country img').attr('src') || '';

                if (rank && name) {
                    rankings.push({
                        rank,
                        name,
                        points,
                        country,
                        imageUrl,
                        flagUrl
                    });
                }
            });

            // Sort by rank numerically
            return rankings.sort((a, b) => parseInt(a.rank) - parseInt(b.rank));
        };

        const [men, women] = await Promise.all([
            processRankings(menResponse.data, 'male'),
            processRankings(womenResponse.data, 'female')
        ]);

        const result = { men, women };

        // Update cache
        rankingsCache = {
            data: result,
            timestamp: Date.now()
        };

        return result;

    } catch (error) {
        console.error('Error fetching rankings:', error);
        return { men: [], women: [] };
    }
}

export async function getPlayerExtendedProfile(name: string): Promise<PlayerRanking & { recentResults: TournamentResult[] } | null> {
    try {
        // 1. Try direct fetch with various slug combinations
        const normalize = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").trim();
        const cleanName = name.replace(/\s*\(\d+\)|\s*\(WC\)|\s*\(Q\)|\s*\(LL\)/gi, '').trim();

        const tryFetch = async (targetName: string) => {
            const parts = normalize(targetName).split(/\s+/);
            const slugs = [
                parts.join('-'),
                parts.slice(0, 2).join('-'),
                parts.join('-') + '-segador',
                parts[0] + '-' + parts[parts.length - 1],
            ];
            if (parts.length > 2) slugs.push(parts[0] + '-' + parts[1]);
            const uniqueSlugs = [...new Set(slugs)];

            for (const slug of uniqueSlugs) {
                const url = `https://www.padelfip.com/player/${slug}/`;
                try {
                    const { data } = await axios.get(url, {
                        headers: { 'User-Agent': USER_AGENT },
                        validateStatus: status => status === 200
                    });

                    const $ = cheerio.load(data);

                    const description = $('meta[name="description"]').attr('content') || '';
                    const rankMatch = description.match(/Ranking:\s*(\d+)/i);
                    const pointsMatch = description.match(/Points:\s*(\d+)/i);
                    const rank = rankMatch ? rankMatch[1] : '-';
                    const points = pointsMatch ? pointsMatch[1] : '-';

                    let imageUrl = $('meta[property="og:image"]').attr('content') || '';
                    if (!imageUrl) imageUrl = $('.wp-post-image').attr('src') || '';
                    const country = $('.player-country').text().trim() || '-';

                    const recentResults: TournamentResult[] = [];
                    $('table tr').each((i, row) => {
                        if (i === 0) return;
                        const cells = $(row).find('td');
                        if (cells.length >= 5) {
                            recentResults.push({
                                tournament: $(cells[0]).text().trim(),
                                category: $(cells[1]).text().trim(),
                                date: $(cells[2]).text().trim(),
                                round: $(cells[3]).text().trim(),
                                points: $(cells[4]).text().trim()
                            });
                        }
                    });

                    return {
                        rank,
                        name: cleanName,
                        points,
                        country,
                        imageUrl,
                        flagUrl: '',
                        recentResults
                    };

                } catch (e) {
                    // Continue
                }
            }
            return null;
        };

        // Attempt 1: Direct
        let profile = await tryFetch(cleanName);
        if (profile) return profile;

        // Attempt 2: Resolve name via rankings
        const { men, women } = await getCachedRankings();
        const lowerName = cleanName.toLowerCase();

        // Find best match
        const match = men.find((p: PlayerRanking) => p.name.toLowerCase().includes(lowerName)) ||
            women.find((p: PlayerRanking) => p.name.toLowerCase().includes(lowerName));

        if (match) {
            // Try fetching with the full name from rankings
            profile = await tryFetch(match.name);
            if (profile) return profile;

            // If fetch fails but we have ranking data, return partial profile?
            // Better than nothing, but we miss recentResults.
            // Let's return what we have from ranking + empty results
            return {
                ...match,
                recentResults: []
            };
        }

        return null;
    } catch (error) {
        console.error('Error fetching extended profile:', error);
        return null;
    }
}


export async function getAllMatches(url: string) {
    try {
        // First get the days
        const { days, tournamentId, tournamentName } = await getMatches(url);

        if (!days || days.length === 0) {
            return { matches: [], days: [], tournamentName: '' };
        }

        // Fetch all days in parallel (limit concurrency if needed)
        const matchPromises = days.map((day: { text: string, url: string }) => getMatches(url, day.url));
        const results = await Promise.all(matchPromises);

        // Combine all matches
        const allMatches = results.flatMap(r => ('matches' in r ? r.matches : []));

        return { matches: allMatches, days, tournamentName, tournamentId };
    } catch (error) {
        console.error('Error fetching all matches:', error);
        return { matches: [], days: [], tournamentName: '' };
    }
}
