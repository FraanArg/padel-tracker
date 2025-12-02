
import * as fs from 'fs';
import * as path from 'path';
import { Match } from './types';
import { unstable_cache } from 'next/cache';

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

export function saveTournament(id: string, name: string, matches: Match[], year: number = new Date().getFullYear()) {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // const year = new Date().getFullYear(); // Removed hardcoded year
    // Create a slug from the name for the filename
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
    console.log(`Saved tournament to ${filePath}`);
    return filename;
}

export function loadTournament(filename: string): ArchivedTournament | null {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
        return null;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
}




// Cache for all matches to avoid reading files on every request
let matchesCache: { matches: Match[], lastLoaded: number } | null = null;
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

export function getAllArchivedMatchesSync(): Match[] {
    if (matchesCache && Date.now() - matchesCache.lastLoaded < CACHE_DURATION) {
        return matchesCache.matches;
    }

    if (!fs.existsSync(DATA_DIR)) {
        console.log(`Stats: DATA_DIR not found at ${DATA_DIR}`);
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

    matchesCache = { matches: allMatches, lastLoaded: Date.now() };
    return allMatches;
}

export const getAllArchivedMatchesAsync = unstable_cache(
    async () => {
        console.log('Stats: Cache MISS - Reading from FS');
        return getAllArchivedMatchesSync();
    },
    ['all-matches-v1'],
    { revalidate: 3600, tags: ['matches'] }
);

export function getArchivedTournamentMatches(tournamentNameOrId: string): Match[] {
    const all = getAllArchivedMatchesSync();
    const term = tournamentNameOrId.toLowerCase();
    return all.filter(m => {
        const tName = m.tournament?.name?.toLowerCase() || '';
        const tId = m.tournamentId?.toLowerCase() || '';
        return tName.includes(term) || tId.includes(term);
    });
}

export function listArchivedTournaments(): string[] {
    if (!fs.existsSync(DATA_DIR)) return [];
    return fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
}

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

