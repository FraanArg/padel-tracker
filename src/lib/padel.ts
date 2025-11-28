import * as cheerio from 'cheerio';
import axios from 'axios';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export interface Tournament {
    name: string;
    url: string;
    imageUrl: string;
    id: string;
}

export interface Match {
    raw: string;
    // Add more structured fields later
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

            const container = link.parent();
            let name = 'Unknown Tournament';

            container.find('a').each((_, el) => {
                const t = $(el).text().trim();
                const href = $(el).attr('href');
                if (t && t.toUpperCase() !== 'GO TO EVENT' && t.toUpperCase() !== 'LIVE' && href === eventUrl && $(el).find('img').length === 0) {
                    name = t;
                }
            });

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
                        id: eventUrl.split('/').filter(Boolean).pop() || 'unknown'
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
        let days: any[] = []; // Initialize days array

        // If no specific day requested, we need to find the default (today)
        if (!activeDayUrl) {
            const { data: eventHtml } = await axios.get(url, {
                headers: { 'User-Agent': USER_AGENT }
            });
            const $event = cheerio.load(eventHtml);

            $event('[class*="idEvent_"]').each((_, el) => {
                const classes = $event(el).attr('class')?.split(/\s+/) || [];
                const idClass = classes.find(c => c.startsWith('idEvent_'));
                if (idClass) {
                    tournamentId = idClass.replace('idEvent_', '');
                }
            });

            if (!tournamentId) {
                return { error: 'Could not find tournament ID' };
            }

            const year = new Date().getFullYear();
            widgetId = `FIP-${year}-${tournamentId}`;

            // Fetch day 1 to get the list of days
            const initialWidgetUrl = `https://widget.matchscorerlive.com/screen/oopbyday/${widgetId}/1?t=tol`;

            // We'll fetch this just to find "today", but we could also just fetch it and let the common logic handle parsing days
            // But we need to find the *correct* day URL for today.

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

        const matches: any[] = [];

        // Iterate over matches by finding the stats link
        $m('a:contains("MATCH STATS")').each((_, el) => {
            const statsLink = $m(el);
            const summaryRow = statsLink.closest('tr');
            const team2Row = summaryRow.prev();
            const team1Row = team2Row.prev();

            if (team1Row.length > 0 && team2Row.length > 0) {
                // Extract players for Team 1
                const team1Players = team1Row.find('.line-thin').map((_, p) => $m(p).text().replace(/\s+/g, ' ').trim()).get();

                // Extract players for Team 2
                const team2Players = team2Row.find('.line-thin').map((_, p) => $m(p).text().replace(/\s+/g, ' ').trim()).get();

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

                    const status = summaryRow.find('.live-status-summary span').first().text().trim();

                    const raw = `${status} ${team1Players.join(' / ')} vs ${team2Players.join(' / ')} ${formattedScore.join(' ')}`;

                    matches.push({
                        raw: raw.replace(/\s+/g, ' ').trim(),
                        team1: team1Players,
                        team2: team2Players,
                        score: formattedScore,
                        status
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
            matches
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

