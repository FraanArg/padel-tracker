import { prisma, isDatabaseAvailable } from './prisma';
import { Match } from './types';
import { unstable_cache } from 'next/cache';
import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'tournaments');

export interface ArchivedTournament {
    id: string;
    name: string;
    year: number;
    dateStart?: string;
    dateEnd?: string;
    matches: Match[];
    archivedAt: string;
}

// ============================================
// DATABASE FUNCTIONS (when available)
// ============================================

// Convert database match to application Match type
function dbMatchToMatch(dbMatch: any, tournament?: any): Match {
    return {
        raw: '',
        time: dbMatch.scheduledTime?.toISOString(),
        timezone: dbMatch.timezone || undefined,
        category: dbMatch.category || undefined,
        round: dbMatch.round || undefined,
        court: dbMatch.court || undefined,
        team1: [dbMatch.team1Player1, dbMatch.team1Player2].filter(Boolean),
        team2: [dbMatch.team2Player1, dbMatch.team2Player2].filter(Boolean),
        team1Flags: [dbMatch.team1Flag1, dbMatch.team1Flag2].filter(Boolean),
        team2Flags: [dbMatch.team2Flag1, dbMatch.team2Flag2].filter(Boolean),
        score: dbMatch.score ? JSON.parse(dbMatch.score) : undefined,
        status: dbMatch.status || undefined,
        team1Seed: dbMatch.team1Seed || undefined,
        team2Seed: dbMatch.team2Seed || undefined,
        tournament: tournament ? {
            name: tournament.name,
            dateStart: tournament.dateStart?.toISOString().split('T')[0],
            dateEnd: tournament.dateEnd?.toISOString().split('T')[0],
        } : undefined,
        id: dbMatch.externalId || dbMatch.id,
        year: dbMatch.year?.toString(),
        tournamentId: tournament?.externalId || dbMatch.tournamentId,
        organization: 'FIP',
    };
}

// ============================================
// JSON FILE FUNCTIONS (fallback)
// ============================================

function loadTournamentFromFile(filename: string): ArchivedTournament | null {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
        return null;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
}

function getAllMatchesFromFiles(): Match[] {
    if (!fs.existsSync(DATA_DIR)) {
        return [];
    }

    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
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

    return allMatches;
}

function getAllTournamentsFromFiles(): ArchivedTournament[] {
    if (!fs.existsSync(DATA_DIR)) return [];
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
    const tournaments: ArchivedTournament[] = [];
    for (const file of files) {
        const t = loadTournamentFromFile(file);
        if (t) tournaments.push(t);
    }
    return tournaments;
}

// ============================================
// UNIFIED API (uses DB if available, falls back to files)
// ============================================

// Get all matches
export async function getAllMatchesFromDB(): Promise<Match[]> {
    if (!isDatabaseAvailable || !prisma) {
        return getAllMatchesFromFiles();
    }

    try {
        const matches = await prisma.match.findMany({
            include: {
                tournament: true,
            },
            orderBy: [
                { year: 'desc' },
                { createdAt: 'desc' },
            ],
        });

        return matches.map(m => dbMatchToMatch(m, m.tournament));
    } catch (error) {
        console.error('Database query failed, falling back to files:', error);
        return getAllMatchesFromFiles();
    }
}

// Cached version for production
export const getAllArchivedMatchesAsync = unstable_cache(
    async () => {
        console.log('Stats: Cache MISS - Reading matches');
        return getAllMatchesFromDB();
    },
    ['all-matches-v2'],
    { revalidate: 3600, tags: ['matches'] }
);

// Sync version for compatibility
let matchesCache: { matches: Match[], lastLoaded: number } | null = null;
const CACHE_DURATION = 1000 * 60 * 5;

export function getAllArchivedMatchesSync(): Match[] {
    if (matchesCache && Date.now() - matchesCache.lastLoaded < CACHE_DURATION) {
        return matchesCache.matches;
    }

    // For sync access, use file-based approach
    const matches = getAllMatchesFromFiles();
    matchesCache = { matches, lastLoaded: Date.now() };
    return matches;
}

// Get matches for a specific tournament
export async function getArchivedTournamentMatches(tournamentNameOrId: string): Promise<Match[]> {
    if (!isDatabaseAvailable || !prisma) {
        const all = getAllMatchesFromFiles();
        const term = tournamentNameOrId.toLowerCase();
        return all.filter(m => {
            const tName = m.tournament?.name?.toLowerCase() || '';
            const tId = m.tournamentId?.toLowerCase() || '';
            return tName.includes(term) || tId.includes(term);
        });
    }

    try {
        const term = tournamentNameOrId.toLowerCase();

        const tournament = await prisma.tournament.findFirst({
            where: {
                OR: [
                    { externalId: { contains: term } },
                    { name: { contains: term } },
                ],
            },
            include: {
                matches: true,
            },
        });

        if (!tournament) return [];

        return tournament.matches.map(m => dbMatchToMatch(m, tournament));
    } catch (error) {
        console.error('Database query failed:', error);
        return [];
    }
}

// Get all tournaments
export async function getAllTournaments(): Promise<ArchivedTournament[]> {
    if (!isDatabaseAvailable || !prisma) {
        return getAllTournamentsFromFiles();
    }

    try {
        const tournaments = await prisma.tournament.findMany({
            include: {
                matches: true,
            },
            orderBy: [
                { year: 'desc' },
                { dateStart: 'desc' },
            ],
        });

        return tournaments.map(t => ({
            id: t.externalId,
            name: t.name,
            year: t.year,
            dateStart: t.dateStart?.toISOString().split('T')[0],
            dateEnd: t.dateEnd?.toISOString().split('T')[0],
            matches: t.matches.map(m => dbMatchToMatch(m, t)),
            archivedAt: t.createdAt.toISOString(),
        }));
    } catch (error) {
        console.error('Database query failed, falling back to files:', error);
        return getAllTournamentsFromFiles();
    }
}

// List tournament IDs
export async function listArchivedTournaments(): Promise<string[]> {
    if (!isDatabaseAvailable || !prisma) {
        if (!fs.existsSync(DATA_DIR)) return [];
        return fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
    }

    try {
        const tournaments = await prisma.tournament.findMany({
            select: { externalId: true },
        });
        return tournaments.map(t => t.externalId);
    } catch (error) {
        console.error('Database query failed:', error);
        return [];
    }
}

// Save a tournament
export async function saveTournament(
    id: string,
    name: string,
    matches: Match[],
    year: number = new Date().getFullYear()
) {
    // Always save to file as backup
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const filename = `${slug}-${year}.json`;
    const filePath = path.join(DATA_DIR, filename);

    const data: ArchivedTournament = {
        id,
        name,
        year,
        matches,
        archivedAt: new Date().toISOString()
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    // Also save to database if available
    if (isDatabaseAvailable && prisma) {
        try {
            const tournament = await prisma.tournament.upsert({
                where: { externalId: id },
                create: {
                    externalId: id,
                    name,
                    year,
                    category: getCategoryFromName(name),
                    status: 'finished',
                },
                update: {
                    name,
                    year,
                },
            });

            if (matches.length > 0) {
                await prisma.match.deleteMany({
                    where: { tournamentId: tournament.id },
                });

                for (const match of matches) {
                    await prisma.match.create({
                        data: {
                            tournamentId: tournament.id,
                            round: match.round,
                            court: match.court,
                            category: match.category,
                            status: match.status || 'finished',
                            team1Player1: match.team1?.[0] || 'TBD',
                            team1Player2: match.team1?.[1],
                            team2Player1: match.team2?.[0] || 'TBD',
                            team2Player2: match.team2?.[1],
                            team1Seed: match.team1Seed,
                            team2Seed: match.team2Seed,
                            team1Flag1: match.team1Flags?.[0],
                            team1Flag2: match.team1Flags?.[1],
                            team2Flag1: match.team2Flags?.[0],
                            team2Flag2: match.team2Flags?.[1],
                            score: match.score ? JSON.stringify(match.score) : undefined,
                            timezone: match.timezone,
                            year,
                        },
                    });
                }
            }
        } catch (error) {
            console.error('Database save failed:', error);
        }
    }

    console.log(`Saved tournament ${name}`);
    return filename;
}

function getCategoryFromName(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes('major')) return 'Major';
    if (lower.includes('finals')) return 'Finals';
    if (lower.includes('p1')) return 'P1';
    if (lower.includes('p2')) return 'P2';
    return 'Other';
}

// Debug info
export async function getDebugInfo(playerName?: string) {
    const info: any = {
        source: isDatabaseAvailable ? 'database' : 'files',
        databaseAvailable: isDatabaseAvailable,
    };

    if (isDatabaseAvailable && prisma) {
        try {
            info.tournamentCount = await prisma.tournament.count();
            info.matchCount = await prisma.match.count();
            info.playerCount = await prisma.player.count();
        } catch (e) {
            info.dbError = String(e);
        }
    } else {
        info.filesCount = fs.existsSync(DATA_DIR)
            ? fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json')).length
            : 0;
    }

    return info;
}
