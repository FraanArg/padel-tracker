
import * as fs from 'fs';
import * as path from 'path';
import { Match } from './padel';
import { ArchivedTournament } from './archive';

const DATA_DIR = path.join(process.cwd(), 'data', 'tournaments');

// Cache for all matches to avoid reading files on every request
let matchesCache: { matches: Match[], lastLoaded: number } | null = null;
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

import { unstable_cache } from 'next/cache';

// ... existing imports ...

// Keep synchronous version for scripts/legacy
export function getAllArchivedMatches(): Match[] {
    // ... existing implementation ...
    if (matchesCache && Date.now() - matchesCache.lastLoaded < CACHE_DURATION) {
        return matchesCache.matches;
    }
    // ... (logic to read files) ...
    // I will copy the logic or just keep the existing function as is, 
    // but I need to duplicate the logic for the async version or wrap it.
    // Actually, I can wrap the sync function in the async one?
    // Yes, unstable_cache expects a function that returns a Promise.
    // So: const getCachedMatches = unstable_cache(async () => getAllArchivedMatches(), ['all-matches']);
    // But getAllArchivedMatches reads from FS.
    // That works.
    return getAllArchivedMatchesSync();
}

// Internal sync function (renamed from original getAllArchivedMatches if I could, but I'll just use the existing one)
export function getAllArchivedMatchesSync(): Match[] {
    if (matchesCache && Date.now() - matchesCache.lastLoaded < CACHE_DURATION) {
        return matchesCache.matches;
    }

    if (!fs.existsSync(DATA_DIR)) {
        console.log(`Stats: DATA_DIR not found at ${DATA_DIR}`);
        return [];
    }

    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
    // console.log(`Stats: Loading ${files.length} tournament files from ${DATA_DIR}`);
    const allMatches: Match[] = [];

    for (const file of files) {
        try {
            const content = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');
            const tournament: ArchivedTournament = JSON.parse(content);
            let year = tournament.year;
            const nameYearMatch = tournament.name.match(/\b(20\d{2})\b/);
            if (nameYearMatch) {
                year = parseInt(nameYearMatch[1]);
            }

            const tournamentMatches = tournament.matches.map(m => ({
                ...m,
                tournament: m.tournament || {
                    name: tournament.name,
                    dateStart: tournament.dateStart,
                    dateEnd: tournament.dateEnd
                },
                year: year.toString()
            }));
            allMatches.push(...tournamentMatches);
        } catch (e) {
            console.error(`Failed to load ${file}:`, e);
        }
    }

    // console.log(`Stats: Loaded ${allMatches.length} total matches`);
    matchesCache = { matches: allMatches, lastLoaded: Date.now() };
    return allMatches;
}

// Async cached version
export const getAllArchivedMatchesAsync = unstable_cache(
    async () => {
        console.log('Stats: Cache MISS - Reading from FS');
        return getAllArchivedMatchesSync();
    },
    ['all-matches-v1'],
    { revalidate: 3600, tags: ['matches'] }
);



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
    recentMatches?: any[];
}

// Helper to normalize names for comparison
function normalizeName(name: string): string {
    return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Helper to check if two names match (handling abbreviations and accents)
function namesMatch(n1: string, n2: string): boolean {
    const s1 = normalizeName(n1);
    const s2 = normalizeName(n2);

    if (s1.includes(s2) || s2.includes(s1)) return true;

    // Handle "A. Tapia" vs "Agustin Tapia"
    const parts1 = s1.split(/[\s.]+/).filter(Boolean);
    const parts2 = s2.split(/[\s.]+/).filter(Boolean);

    if (parts1.length < 2 || parts2.length < 2) return false;

    // If last names match and first initial matches
    const last1 = parts1[parts1.length - 1];
    const last2 = parts2[parts2.length - 1];

    if (last1 === last2) {
        const first1 = parts1[0];
        const first2 = parts2[0];
        if (first1[0] === first2[0]) return true;
    }

    return false;
}

export function getPlayerStats(playerName: string, year?: number | 'all'): PlayerStats {
    let allMatches = getAllArchivedMatches();
    const p = playerName.toLowerCase();

    // Filter by year if specified
    if (year && year !== 'all') {
        allMatches = allMatches.filter(m => {
            if ((m as any).year) return (m as any).year === year;
            if (m.tournament?.dateStart) {
                return new Date(m.tournament.dateStart).getFullYear() === year;
            }
            return false;
        });
    }

    console.log(`Stats: Searching for "${p}" in ${allMatches.length} matches (Year: ${year || 'all'})`);

    let wins = 0;
    let losses = 0;
    let titles = 0;
    let finals = 0;
    const partnerMap = new Map<string, number>();

    const playerMatches = allMatches.filter(m => {
        if (!m.team1 || !m.team2) return false;

        const found = m.team1.some(n => namesMatch(n, p)) ||
            m.team2.some(n => namesMatch(n, p));
        return found;
    });

    console.log(`Stats: Found ${playerMatches.length} matches for "${p}"`);

    playerMatches.forEach(m => {
        const isTeam1 = m.team1?.some(n => namesMatch(n, p));
        const winner = determineWinner(m);

        // Track partner
        const myTeam = isTeam1 ? m.team1 : m.team2;
        if (myTeam) {
            const partner = myTeam.find(n => !namesMatch(n, p));
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
        const isTeam1 = m.team1?.some(n => namesMatch(n, p));
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

    // Get recent matches (last 5)
    // We want the *last* 5 matches from the sorted list, reversed (most recent first)
    const recentMatches = sortedMatches.slice(-5).reverse().map(m => ({
        tournament: m.tournament?.name || 'Unknown',
        round: m.round || '-',
        result: determineWinner(m) ? (
            (m.team1?.some(n => namesMatch(n, p)) && determineWinner(m) === 1) ||
                (m.team2?.some(n => namesMatch(n, p)) && determineWinner(m) === 2)
                ? 'W' : 'L'
        ) : '-',
        score: m.score
    }));

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

        const isTeam1 = m.team1?.some(n => namesMatch(n, playerName));
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

        // Strict match if possible, or fuzzy
        const inTeam1 = t1.some(n => namesMatch(n, playerName));
        const inTeam2 = t2.some(n => namesMatch(n, playerName));

        let partner = '';
        if (inTeam1) {
            partner = t1.find(n => !namesMatch(n, playerName)) || '';
        } else if (inTeam2) {
            partner = t2.find(n => !namesMatch(n, playerName)) || '';
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
        roundStats,
        recentMatches
    };
}
export interface CommonOpponentStats {
    opponent: string;
    team1Stats: { wins: number; losses: number; total: number };
    team2Stats: { wins: number; losses: number; total: number };
}

export interface H2HResult {
    matches: Match[];
    team1Wins: number;
    team2Wins: number;
    totalMatches: number;
    firstSetStats?: {
        team1WonFirstSet: number;
        team1WonMatchAfterFirstSet: number;
        team2WonFirstSet: number;
        team2WonMatchAfterFirstSet: number;
    };
    threeSetStats?: {
        total: number;
        team1Wins: number;
        team2Wins: number;
    };
    tiebreakStats?: {
        total: number;
        team1Wins: number;
        team2Wins: number;
    };
    roundStats?: Record<string, {
        total: number;
        team1Wins: number;
        team2Wins: number;
    }>;
    totalGamesStats?: {
        total: number;
        team1Wins: number;
        team2Wins: number;
    };
    averageMatchLength?: {
        avgSets: number;
        avgGames: number;
    };
    bigMatchStats?: {
        total: number;
        team1Wins: number;
        team2Wins: number;
    };
}

export async function getHeadToHead(team1: string[], team2: string[], year?: number | 'all'): Promise<H2HResult> {
    try {
        console.log(`Stats: getHeadToHead called with team1=[${team1}], team2=[${team2}], year=${year}`);
        let allMatches: Match[] = [];
        try {
            allMatches = await getAllArchivedMatchesAsync();
        } catch (e) {
            console.warn('Stats: getAllArchivedMatchesAsync failed (likely due to missing cache context), falling back to sync:', e);
            allMatches = getAllArchivedMatchesSync();
        }

        // Filter by year if specified
        if (year && year !== 'all') {
            allMatches = allMatches.filter(m => {
                // Try to get year from match object or tournament date
                if ((m as any).year) return (m as any).year === year;
                if (m.tournament?.dateStart) {
                    return new Date(m.tournament.dateStart).getFullYear() === year;
                }
                return false;
            });
        }

        let team1Wins = 0;
        let team2Wins = 0;

        // First Set Stats
        let team1WonFirstSet = 0;
        let team1WonMatchAfterFirstSet = 0;
        let team2WonFirstSet = 0;
        let team2WonMatchAfterFirstSet = 0;

        // 3-Set Stats
        let threeSetTotal = 0;
        let threeSetTeam1Wins = 0;
        let threeSetTeam2Wins = 0;

        // Tiebreak Stats
        let tiebreakTotal = 0;
        let tiebreakTeam1Wins = 0;
        let tiebreakTeam2Wins = 0;

        // Round Stats
        const roundStats: Record<string, { total: number, team1Wins: number, team2Wins: number }> = {};

        // Total Games Stats
        let totalGames = 0;
        let team1TotalGames = 0;
        let team2TotalGames = 0;

        // Big Match Stats (Major/P1)
        let bigMatchTotal = 0;
        let bigMatchTeam1Wins = 0;
        let bigMatchTeam2Wins = 0;

        const h2hMatches = allMatches.filter(m => {
            if (!m.team1 || !m.team2) return false;

            // Check if team1 is in the match (as team1 or team2)
            const t1IsT1 = team1.every(p => m.team1!.some(mp => namesMatch(mp, p)));
            const t1IsT2 = team1.every(p => m.team2!.some(mp => namesMatch(mp, p)));

            if (!t1IsT1 && !t1IsT2) return false;

            // Check if team2 is the OTHER team
            const t2IsT2 = team2.every(p => m.team2!.some(mp => namesMatch(mp, p)));
            const t2IsT1 = team2.every(p => m.team1!.some(mp => namesMatch(mp, p)));

            if (t1IsT1 && t2IsT2) return true;
            if (t1IsT2 && t2IsT1) return true;

            return false;
        }).sort((a, b) => {
            // Sort by date
            const getDate = (m: Match) => {
                if (m.tournament?.dateStart) {
                    // Try to parse DD/MM/YYYY
                    const parts = m.tournament.dateStart.split('/');
                    if (parts.length === 3) {
                        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
                    }
                    // Try to parse "24 NOV 2024" (approximate)
                    return new Date(m.tournament.dateStart).getTime();
                }
                return 0;
            };
            return getDate(a) - getDate(b);
        });

        h2hMatches.forEach(m => {
            const winner = determineWinner(m);
            if (winner) {
                // Determine who is who
                const t1IsT1 = team1.every(p => m.team1!.some(mp => namesMatch(mp, p)));
                const t1Won = (t1IsT1 && winner === 1) || (!t1IsT1 && winner === 2);

                // Winner logic
                if (t1Won) {
                    team1Wins++;
                } else {
                    team2Wins++;
                }

                // Round Logic
                if (m.round) {
                    // Normalize round name
                    let roundName = m.round.trim();
                    if (roundName.toLowerCase().includes('final') && !roundName.toLowerCase().includes('semi') && !roundName.toLowerCase().includes('quarter') && !roundName.toLowerCase().includes('1/')) {
                        roundName = 'Final';
                    } else if (roundName.toLowerCase().includes('semi')) {
                        roundName = 'Semi-Final';
                    } else if (roundName.toLowerCase().includes('quarter')) {
                        roundName = 'Quarter-Final';
                    }

                    if (!roundStats[roundName]) {
                        roundStats[roundName] = { total: 0, team1Wins: 0, team2Wins: 0 };
                    }

                    roundStats[roundName].total++;
                    if (t1Won) {
                        roundStats[roundName].team1Wins++;
                    } else {
                        roundStats[roundName].team2Wins++;
                    }
                }

                // Big Match Logic
                const tournamentName = m.tournament?.name?.toLowerCase() || '';
                if (tournamentName.includes('major') || tournamentName.includes('p1')) {
                    bigMatchTotal++;
                    if (t1Won) {
                        bigMatchTeam1Wins++;
                    } else {
                        bigMatchTeam2Wins++;
                    }
                }

                // Process all sets for stats
                if (m.score && m.score.length > 0) {
                    m.score.forEach((setScore, index) => {
                        let clean = setScore.replace(/[\(\)]/g, '').trim();
                        const parts = clean.split('-');
                        if (parts.length === 2) {
                            let s1 = parseInt(parts[0]);
                            let s2 = parseInt(parts[1]);

                            // Handle malformed/tiebreak scores simplified
                            if (s1 > 7 || s2 > 7) {
                                s1 = parseInt(parts[0][0]);
                                s2 = parseInt(parts[1][0]);
                            }

                            if (!isNaN(s1) && !isNaN(s2)) {
                                // Total Games Logic
                                totalGames += (s1 + s2);
                                if (t1IsT1) {
                                    team1TotalGames += s1;
                                    team2TotalGames += s2;
                                } else {
                                    team1TotalGames += s2;
                                    team2TotalGames += s1;
                                }

                                // First Set Logic (only for index 0)
                                if (index === 0) {
                                    let firstSetWinner = 0;
                                    if (s1 > s2) firstSetWinner = 1;
                                    else if (s2 > s1) firstSetWinner = 2;

                                    if (firstSetWinner !== 0) {
                                        if (t1IsT1) {
                                            if (firstSetWinner === 1) {
                                                team1WonFirstSet++;
                                                if (winner === 1) team1WonMatchAfterFirstSet++;
                                            } else {
                                                team2WonFirstSet++;
                                                if (winner === 2) team2WonMatchAfterFirstSet++;
                                            }
                                        } else {
                                            if (firstSetWinner === 2) {
                                                team1WonFirstSet++;
                                                if (winner === 2) team1WonMatchAfterFirstSet++;
                                            } else {
                                                team2WonFirstSet++;
                                                if (winner === 1) team2WonMatchAfterFirstSet++;
                                            }
                                        }
                                    }
                                }

                                // Tiebreak Logic
                                // A set is a tiebreak if it reached 7-6 or 6-7
                                if ((s1 === 7 && s2 === 6) || (s1 === 6 && s2 === 7)) {
                                    tiebreakTotal++;
                                    let tbWinner = s1 > s2 ? 1 : 2;

                                    if (t1IsT1) {
                                        if (tbWinner === 1) tiebreakTeam1Wins++;
                                        else tiebreakTeam2Wins++;
                                    } else {
                                        if (tbWinner === 2) tiebreakTeam1Wins++;
                                        else tiebreakTeam2Wins++;
                                    }
                                }
                            }
                        }
                    });
                }

                // 3-Set Logic
                if (m.score && m.score.length === 3) {
                    threeSetTotal++;
                    if (t1Won) {
                        threeSetTeam1Wins++;
                    } else {
                        threeSetTeam2Wins++;
                    }
                }
            }
        });

        return {
            matches: h2hMatches,
            team1Wins,
            team2Wins,
            totalMatches: h2hMatches.length,
            firstSetStats: {
                team1WonFirstSet,
                team1WonMatchAfterFirstSet,
                team2WonFirstSet,
                team2WonMatchAfterFirstSet
            },
            threeSetStats: {
                total: threeSetTotal,
                team1Wins: threeSetTeam1Wins,
                team2Wins: threeSetTeam2Wins
            },
            tiebreakStats: {
                total: tiebreakTotal,
                team1Wins: tiebreakTeam1Wins,
                team2Wins: tiebreakTeam2Wins
            },
            roundStats,
            totalGamesStats: {
                total: totalGames,
                team1Wins: team1TotalGames,
                team2Wins: team2TotalGames
            },
            averageMatchLength: {
                avgSets: h2hMatches.length > 0 ? parseFloat((h2hMatches.reduce((acc, m) => {
                    // Only count sets for matches in h2hMatches
                    if (m.score) return acc + m.score.length;
                    return acc;
                }, 0) / h2hMatches.length).toFixed(1)) : 0,
                avgGames: h2hMatches.length > 0 ? parseFloat((totalGames / h2hMatches.length).toFixed(1)) : 0
            },
            bigMatchStats: {
                total: bigMatchTotal,
                team1Wins: bigMatchTeam1Wins,
                team2Wins: bigMatchTeam2Wins
            }
        };
    } catch (error) {
        console.error('Stats: getHeadToHead failed', error);
        return {
            matches: [],
            team1Wins: 0,
            team2Wins: 0,
            totalMatches: 0,
            firstSetStats: {
                team1WonFirstSet: 0,
                team1WonMatchAfterFirstSet: 0,
                team2WonFirstSet: 0,
                team2WonMatchAfterFirstSet: 0
            },
            threeSetStats: {
                total: 0,
                team1Wins: 0,
                team2Wins: 0
            },
            tiebreakStats: {
                total: 0,
                team1Wins: 0,
                team2Wins: 0
            },
            roundStats: {},
            totalGamesStats: {
                total: 0,
                team1Wins: 0,
                team2Wins: 0
            },
            averageMatchLength: {
                avgSets: 0,
                avgGames: 0
            }
        };
    }
}


export async function getCommonOpponents(team1: string[], team2: string[]): Promise<any> {
    const allMatches = await getAllArchivedMatchesAsync();

    // Helper to get stats against a specific opponent team
    const getStatsAgainst = (myTeam: string[], opponentTeam: string[]) => {
        let wins = 0;
        let losses = 0;

        const relevantMatches = allMatches.filter(m => {
            if (!m.team1 || !m.team2) return false;

            // Check if myTeam is in the match
            const myTeamIsT1 = myTeam.every(p => m.team1!.some(mp => namesMatch(mp, p)));
            const myTeamIsT2 = myTeam.every(p => m.team2!.some(mp => namesMatch(mp, p)));

            if (!myTeamIsT1 && !myTeamIsT2) return false;

            // Check if opponentTeam is the OTHER team
            const opponentIsT2 = opponentTeam.every(p => m.team2!.some(op => namesMatch(op, p)));
            const opponentIsT1 = opponentTeam.every(p => m.team1!.some(op => namesMatch(op, p)));

            if (myTeamIsT1 && opponentIsT2) return true;
            if (myTeamIsT2 && opponentIsT1) return true;

            return false;
        });

        relevantMatches.forEach(m => {
            const winner = determineWinner(m);
            if (!winner) return;

            const myTeamIsT1 = myTeam.every(p => m.team1!.some(mp => namesMatch(mp, p)));

            if ((myTeamIsT1 && winner === 1) || (!myTeamIsT1 && winner === 2)) {
                wins++;
            } else {
                losses++;
            }
        });

        return { wins, losses, total: wins + losses };
    };

    // 1. Find all opponents for Team 1
    const t1Opponents = new Set<string>();
    allMatches.forEach(m => {
        if (!m.team1 || !m.team2) return;

        const t1IsT1 = team1.every(p => m.team1!.some(mp => namesMatch(mp, p)));
        const t1IsT2 = team1.every(p => m.team2!.some(mp => namesMatch(mp, p)));

        if (t1IsT1) {
            // Opponent is Team 2
            t1Opponents.add(JSON.stringify(m.team2.slice().sort()));
        } else if (t1IsT2) {
            // Opponent is Team 1
            t1Opponents.add(JSON.stringify(m.team1.slice().sort()));
        }
    });

    // 2. Find all opponents for Team 2
    const commonOpponents: string[][] = [];
    allMatches.forEach(m => {
        if (!m.team1 || !m.team2) return;

        const t2IsT1 = team2.every(p => m.team1!.some(mp => namesMatch(mp, p)));
        const t2IsT2 = team2.every(p => m.team2!.some(mp => namesMatch(mp, p)));

        let opponent: string[] | null = null;

        if (t2IsT1) {
            opponent = m.team2;
        } else if (t2IsT2) {
            opponent = m.team1;
        }

        if (opponent) {
            const key = JSON.stringify(opponent.slice().sort());
            if (t1Opponents.has(key)) {
                // Check if we already added this common opponent
                const alreadyAdded = commonOpponents.some(co => JSON.stringify(co.slice().sort()) === key);
                if (!alreadyAdded) {
                    commonOpponents.push(opponent);
                }
            }
        }
    });

    // 3. Calculate stats for each common opponent
    const results: CommonOpponentStats[] = commonOpponents.map(opponent => {
        return {
            opponent: opponent.join(' / '), // Display name
            team1Stats: getStatsAgainst(team1, opponent),
            team2Stats: getStatsAgainst(team2, opponent)
        };
    });

    // Sort by total matches played (relevance)
    return results.sort((a, b) => (b.team1Stats.total + b.team2Stats.total) - (a.team1Stats.total + a.team2Stats.total));
}

export function getPartners(playerName: string): string[] {
    const allMatches = getAllArchivedMatches();
    const partners = new Set<string>();

    allMatches.forEach(m => {
        if (!m.team1 || !m.team2) return;

        // Check Team 1
        if (m.team1.some(p => namesMatch(p, playerName))) {
            // Find the partner in Team 1
            m.team1.forEach(p => {
                if (!namesMatch(p, playerName)) {
                    partners.add(p);
                }
            });
        }

        // Check Team 2
        if (m.team2.some(p => namesMatch(p, playerName))) {
            // Find the partner in Team 2
            m.team2.forEach(p => {
                if (!namesMatch(p, playerName)) {
                    partners.add(p);
                }
            });
        }
    });

    return Array.from(partners).sort();
}
