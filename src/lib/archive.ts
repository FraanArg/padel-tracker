import { PrismaClient } from '@prisma/client';
import { Match } from './types';
import { unstable_cache } from 'next/cache';

// Initialize Prisma client
const prisma = new PrismaClient();

export interface ArchivedTournament {
    id: string;
    name: string;
    year: number;
    dateStart?: string;
    dateEnd?: string;
    matches: Match[];
    archivedAt: string;
}

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

// Get all matches from database
export async function getAllMatchesFromDB(): Promise<Match[]> {
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
}

// Cached version for production
export const getAllArchivedMatchesAsync = unstable_cache(
    async () => {
        console.log('Stats: Cache MISS - Reading from database');
        return getAllMatchesFromDB();
    },
    ['all-matches-db-v1'],
    { revalidate: 3600, tags: ['matches'] }
);

// Sync version for compatibility (now async internally but cached)
let matchesCache: { matches: Match[], lastLoaded: number } | null = null;
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

export function getAllArchivedMatchesSync(): Match[] {
    // For sync compatibility, return cached data or empty array
    // The actual data should be loaded via async function
    if (matchesCache && Date.now() - matchesCache.lastLoaded < CACHE_DURATION) {
        return matchesCache.matches;
    }

    // Return empty and let async populate
    return matchesCache?.matches || [];
}

// Initialize cache on module load (for SSR)
(async () => {
    try {
        const matches = await getAllMatchesFromDB();
        matchesCache = { matches, lastLoaded: Date.now() };
    } catch (e) {
        console.error('Failed to initialize matches cache:', e);
    }
})();

// Get matches for a specific tournament
export async function getTournamentMatches(tournamentNameOrId: string): Promise<Match[]> {
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
}

// Alias for compatibility
export const getArchivedTournamentMatches = async (id: string): Promise<Match[]> => {
    return getTournamentMatches(id);
};

// Get all tournaments from database
export async function getAllTournaments(): Promise<ArchivedTournament[]> {
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
}

// List tournament IDs
export async function listArchivedTournaments(): Promise<string[]> {
    const tournaments = await prisma.tournament.findMany({
        select: { externalId: true },
    });
    return tournaments.map(t => t.externalId);
}

// Save a tournament (for scraper compatibility)
export async function saveTournament(
    id: string,
    name: string,
    matches: Match[],
    year: number = new Date().getFullYear()
) {
    // Upsert tournament
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

    // Delete existing matches and add new ones
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

    console.log(`Saved tournament ${name} with ${matches.length} matches`);
    return id;
}

function getCategoryFromName(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes('major')) return 'Major';
    if (lower.includes('finals')) return 'Finals';
    if (lower.includes('p1')) return 'P1';
    if (lower.includes('p2')) return 'P2';
    return 'Other';
}

// Helper functions
function normalizeName(name: string): string {
    return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function namesMatch(n1: string, n2: string): boolean {
    const s1 = normalizeName(n1);
    const s2 = normalizeName(n2);

    if (s1.includes(s2) || s2.includes(s1)) return true;

    const parts1 = s1.split(/[\s.]+/).filter(Boolean);
    const parts2 = s2.split(/[\s.]+/).filter(Boolean);

    if (parts1.length < 2 || parts2.length < 2) return false;

    const last1 = parts1[parts1.length - 1];
    const last2 = parts2[parts2.length - 1];

    if (last1 === last2) {
        const first1 = parts1[0];
        const first2 = parts2[0];
        if (first1[0] === first2[0]) return true;
    }

    return false;
}

// Debug info
export async function getDebugInfo(playerName?: string) {
    const tournamentCount = await prisma.tournament.count();
    const matchCount = await prisma.match.count();
    const playerCount = await prisma.player.count();

    const info: any = {
        source: 'database',
        tournamentCount,
        matchCount,
        playerCount,
        cacheAge: matchesCache ? Date.now() - matchesCache.lastLoaded : null,
    };

    if (playerName) {
        const p = playerName.toLowerCase();
        const matches = await prisma.match.findMany({
            where: {
                OR: [
                    { team1Player1: { contains: p } },
                    { team1Player2: { contains: p } },
                    { team2Player1: { contains: p } },
                    { team2Player2: { contains: p } },
                ],
            },
            include: { tournament: true },
            take: 5,
        });

        info.playerSearch = {
            term: p,
            found: matches.length,
            sampleMatch: matches.length > 0 ? dbMatchToMatch(matches[0], matches[0].tournament) : null,
        };
    }

    return info;
}
