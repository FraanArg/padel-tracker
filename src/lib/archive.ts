
import * as fs from 'fs';
import * as path from 'path';
import { Match } from './padel';

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

export function saveTournament(id: string, name: string, matches: Match[]) {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const year = new Date().getFullYear();
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

export function listArchivedTournaments(): string[] {
    if (!fs.existsSync(DATA_DIR)) return [];
    return fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
}
