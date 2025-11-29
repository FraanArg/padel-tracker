
import * as fs from 'fs';
import * as path from 'path';
import { Match } from './padel';
import { ArchivedTournament } from './archive';

const DATA_DIR = path.join(process.cwd(), 'data', 'tournaments');

// Cache for all matches to avoid reading files on every request
let matchesCache: { matches: Match[], lastLoaded: number } | null = null;
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

export function getAllArchivedMatches(): Match[] {
    if (matchesCache && Date.now() - matchesCache.lastLoaded < CACHE_DURATION) {
        // console.log('Returning cached matches');
        return matchesCache.matches;
    }

    if (!fs.existsSync(DATA_DIR)) {
        console.log(`Stats: DATA_DIR not found at ${DATA_DIR}`);
        return [];
    }

    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
    console.log(`Stats: Loading ${files.length} tournament files from ${DATA_DIR}`);
    const allMatches: Match[] = [];

    for (const file of files) {
        try {
            const content = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');
            const tournament: ArchivedTournament = JSON.parse(content);
            // Enrich matches with tournament name/year if missing
            const tournamentMatches = tournament.matches.map(m => ({
                ...m,
                tournament: m.tournament || { name: tournament.name },
                year: tournament.year
            }));
            allMatches.push(...tournamentMatches);
        } catch (e) {
            console.error(`Failed to load ${file}:`, e);
        }
    }

    console.log(`Stats: Loaded ${allMatches.length} total matches`);
    matchesCache = { matches: allMatches, lastLoaded: Date.now() };
    return allMatches;
}

export function getDebugInfo(playerName?: string) {
    const info: any = {
        cacheExists: !!matchesCache,
        matchesCount: matchesCache ? matchesCache.matches.length : 0,
        dataDir: DATA_DIR,
        filesCount: fs.existsSync(DATA_DIR) ? fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json')).length : 0
    };

    if (playerName && matchesCache) {
        const p = playerName.toLowerCase();
        const matches = matchesCache.matches.filter(m => {
            if (!m.team1 || !m.team2) return false;
            const t1 = m.team1.map(n => n.toLowerCase());
            const t2 = m.team2.map(n => n.toLowerCase());
            return t1.some(n => n.includes(p) || p.includes(n)) || t2.some(n => n.includes(p) || p.includes(n));
        });
        info.playerSearch = {
            term: p,
            found: matches.length,
            sampleMatch: matches.length > 0 ? matches[0] : null
        };
    }

    return info;
}

export interface H2HResult {
    matches: Match[];
    team1Wins: number;
    team2Wins: number;
    totalMatches: number;
}

export function getHeadToHead(team1: string[], team2: string[]): H2HResult {
    try {
        console.log(`Stats: getHeadToHead called with team1=[${team1}], team2=[${team2}]`);
        const allMatches = getAllArchivedMatches();
        const t1Names = team1.map(p => p.toLowerCase());
        const t2Names = team2.map(p => p.toLowerCase());

        const h2hMatches = allMatches.filter(m => {
            if (!m.team1 || !m.team2) return false;

            const mTeam1 = m.team1.map(p => p.toLowerCase());
            const mTeam2 = m.team2.map(p => p.toLowerCase());

            // Check if t1Names matches mTeam1 (all players present)
            const t1MatchesM1 = t1Names.every(p => mTeam1.some(mp => mp.includes(p) || p.includes(mp)));
            const t2MatchesM2 = t2Names.every(p => mTeam2.some(mp => mp.includes(p) || p.includes(mp)));

            if (t1MatchesM1 && t2MatchesM2) return true;

            // Check if t1Names matches mTeam2 (swapped)
            const t1MatchesM2 = t1Names.every(p => mTeam2.some(mp => mp.includes(p) || p.includes(mp)));
            const t2MatchesM1 = t2Names.every(p => mTeam1.some(mp => mp.includes(p) || p.includes(mp)));

            return t1MatchesM2 && t2MatchesM1;
        });

        let team1Wins = 0;
        let team2Wins = 0;

        h2hMatches.forEach(m => {
            const winner = determineWinner(m);
            if (winner === 1) {
                // If team1 matched m.team1, then team1 won.
                const mTeam1 = m.team1?.map(p => p.toLowerCase()) || [];
                const t1MatchesM1 = t1Names.every(p => mTeam1.some(mp => mp.includes(p) || p.includes(mp)));

                if (t1MatchesM1) {
                    team1Wins++;
                } else {
                    team2Wins++;
                }
            } else if (winner === 2) {
                const mTeam2 = m.team2?.map(p => p.toLowerCase()) || [];
                const t1MatchesM2 = t1Names.every(p => mTeam2.some(mp => mp.includes(p) || p.includes(mp)));

                if (t1MatchesM2) {
                    team1Wins++; // team1 was m.team2, so team1 won
                } else {
                    team2Wins++;
                }
            }
        });

        return {
            matches: h2hMatches,
            team1Wins,
            team2Wins,
            totalMatches: h2hMatches.length
        };
    } catch (error) {
        console.error('Stats: getHeadToHead failed', error);
        return { matches: [], team1Wins: 0, team2Wins: 0, totalMatches: 0 };
    }
}

function determineWinner(match: Match): 1 | 2 | null {
    if (!match.score || match.score.length === 0) return null;

    let t1Sets = 0;
    let t2Sets = 0;

    for (const setScore of match.score) {
        // Remove parens and whitespace
        let clean = setScore.replace(/[\(\)]/g, '').trim();

        // Handle cases like "6-4", "7-6(5)", "7-65", "63-7"
        const parts = clean.split('-');
        if (parts.length !== 2) continue;

        let s1Str = parts[0];
        let s2Str = parts[1];

        // Heuristic to extract the set score from potentially concatenated tiebreak
        const extractScore = (s: string, opponent: number): number => {
            const val = parseInt(s);
            if (isNaN(val)) return 0;
            if (val <= 7) return val; // Normal score

            // If > 7, it likely contains tiebreak digits.
            // E.g. "63" (6-7 tiebreak 3) or "76" (7-6) or "12" (tiebreak 12?)
            // If the string starts with '6' or '7', take that.
            const firstDigit = parseInt(s[0]);
            return firstDigit;
        };

        // We need to parse both sides to make sense of it
        // But simply taking the first digit usually works for 6/7 sets.
        // What about "10" (super tiebreak)? Padel usually plays 3 sets.

        let s1 = parseInt(s1Str);
        let s2 = parseInt(s2Str);

        // Fix malformed scores
        if (s1 > 7 || s2 > 7) {
            // Try to just take the first digit if it makes a valid set score
            const s1First = parseInt(s1Str[0]);
            const s2First = parseInt(s2Str[0]);

            if (!isNaN(s1First) && !isNaN(s2First)) {
                s1 = s1First;
                s2 = s2First;
            }
        }

        if (!isNaN(s1) && !isNaN(s2)) {
            if (s1 > s2) t1Sets++;
            if (s2 > s1) t2Sets++;
        }
    }

    if (t1Sets > t2Sets) return 1;
    if (t2Sets > t1Sets) return 2;
    return null;
}

export interface PlayerStats {
    totalMatches: number;
    wins: number;
    losses: number;
    winRate: string;
    titles: number;
    finals: number;
    partners: { name: string, matches: number }[];
    currentStreak: number;
    maxStreak: number;
    roundStats: Record<string, { played: number, won: number }>;
}

export function getPlayerStats(playerName: string): PlayerStats {
    const allMatches = getAllArchivedMatches();
    const p = playerName.toLowerCase();

    console.log(`Stats: Searching for "${p}" in ${allMatches.length} matches`);

    let wins = 0;
    let losses = 0;
    let titles = 0;
    let finals = 0;
    const partnerMap = new Map<string, number>();

    const playerMatches = allMatches.filter(m => {
        if (!m.team1 || !m.team2) return false;
        const t1 = m.team1.map(n => n.toLowerCase());
        const t2 = m.team2.map(n => n.toLowerCase());

        const found = t1.some(n => n.includes(p) || p.includes(n)) || t2.some(n => n.includes(p) || p.includes(n));
        // if (found) console.log(`Stats: Found match: ${m.tournament?.name} - ${m.round}`);
        return found;
    });

    console.log(`Stats: Found ${playerMatches.length} matches for "${p}"`);

    playerMatches.forEach(m => {
        const t1 = m.team1?.map(n => n.toLowerCase()) || [];
        const t2 = m.team2?.map(n => n.toLowerCase()) || [];

        const isTeam1 = t1.some(n => n.includes(p) || p.includes(n));
        const winner = determineWinner(m);

        // Track partner
        const myTeam = isTeam1 ? m.team1 : m.team2;
        if (myTeam) {
            const partner = myTeam.find(n => !n.toLowerCase().includes(p) && !p.includes(n.toLowerCase()));
            if (partner) {
                partnerMap.set(partner, (partnerMap.get(partner) || 0) + 1);
            }
        }

        if (winner) {
            if ((isTeam1 && winner === 1) || (!isTeam1 && winner === 2)) {
                wins++;
                // Check for title (Final match)
                if (m.round && (m.round.toLowerCase() === 'final' || m.round.toLowerCase() === 'f')) {
                    titles++;
                }
            } else {
                losses++;
                // Check for runner-up (Final match)
                if (m.round && (m.round.toLowerCase() === 'final' || m.round.toLowerCase() === 'f')) {
                    finals++; // Reached final but lost
                }
            }
        }
    });

    // Finals reached = Titles + Runner-up
    const finalsReached = titles + finals;

    // Sort matches by date (using tournament year/month/date heuristic)
    const sortedMatches = playerMatches.sort((a, b) => {
        // Try to use tournament date if available
        // This requires the match to have the year/month attached or the tournament object
        // We added 'year' in getAllArchivedMatches
        const getMatchDate = (m: Match) => {
            if (m.tournament?.dateStart) return new Date(m.tournament.dateStart).getTime();
            if ((m as any).year) return new Date((m as any).year, 0, 1).getTime();
            return 0;
        };
        return getMatchDate(a) - getMatchDate(b);
    });

    // Calculate Streak
    let currentStreak = 0;
    let maxStreak = 0;
    // We need to iterate chronologically
    sortedMatches.forEach(m => {
        const t1 = m.team1?.map(n => n.toLowerCase()) || [];
        const isTeam1 = t1.some(n => n.includes(p) || p.includes(n));
        const winner = determineWinner(m);

        if (winner) {
            const won = (isTeam1 && winner === 1) || (!isTeam1 && winner === 2);
            if (won) {
                currentStreak++;
                if (currentStreak > maxStreak) maxStreak = currentStreak;
            } else {
                currentStreak = 0;
            }
        }
    });

    // Calculate Round Stats
    const roundStats: Record<string, { played: number, won: number }> = {};
    const normalizeRound = (r: string) => {
        const lower = r.toLowerCase();
        if (lower.includes('final') && !lower.includes('semi') && !lower.includes('quarter')) return 'Final';
        if (lower.includes('semi')) return 'Semi Final';
        if (lower.includes('quarter')) return 'Quarter Final';
        if (lower.includes('16')) return 'Round of 16';
        if (lower.includes('32')) return 'Round of 32';
        return 'Early Rounds';
    };

    playerMatches.forEach(m => {
        if (!m.round) return;
        const round = normalizeRound(m.round);
        if (!roundStats[round]) roundStats[round] = { played: 0, won: 0 };

        roundStats[round].played++;

        const t1 = m.team1?.map(n => n.toLowerCase()) || [];
        const isTeam1 = t1.some(n => n.includes(p) || p.includes(n));
        const winner = determineWinner(m);

        if (winner && ((isTeam1 && winner === 1) || (!isTeam1 && winner === 2))) {
            roundStats[round].won++;
        }
    });


    // Calculate Partners
    const partnersMap: Record<string, number> = {};
    playerMatches.forEach(m => {
        const t1 = m.team1?.map(n => n.trim()) || [];
        const t2 = m.team2?.map(n => n.trim()) || [];

        const pLower = p.toLowerCase();
        // Strict match if possible, or fuzzy
        const inTeam1 = t1.some(n => n.toLowerCase().includes(pLower));
        const inTeam2 = t2.some(n => n.toLowerCase().includes(pLower));

        let partner = '';
        if (inTeam1) {
            partner = t1.find(n => !n.toLowerCase().includes(pLower)) || '';
        } else if (inTeam2) {
            partner = t2.find(n => !n.toLowerCase().includes(pLower)) || '';
        }

        if (partner) {
            partnersMap[partner] = (partnersMap[partner] || 0) + 1;
        }
    });

    const partners = Object.entries(partnersMap)
        .map(([name, matches]) => ({ name, matches }))
        .sort((a, b) => b.matches - a.matches);
    return {
        totalMatches: playerMatches.length,
        wins,
        losses,
        winRate: playerMatches.length > 0 ? ((wins / playerMatches.length) * 100).toFixed(1) + '%' : '0%',
        titles,
        finals: finalsReached,
        partners,
        currentStreak,
        maxStreak,
        roundStats
    };
}
