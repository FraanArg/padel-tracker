
import * as fs from 'fs';
import * as path from 'path';
import { getTournaments } from '../src/lib/padel';
import { ArchivedTournament } from '../src/lib/archive';

const DATA_DIR = path.join(process.cwd(), 'data', 'tournaments');

async function fixDates() {
    console.log('Fetching fresh tournament list...');
    const tournaments = await getTournaments();
    console.log(`Fetched ${tournaments.length} tournaments.`);

    if (!fs.existsSync(DATA_DIR)) {
        console.log('No data directory found.');
        return;
    }

    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
    console.log(`Found ${files.length} archived files.`);

    for (const file of files) {
        const filePath = path.join(DATA_DIR, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const archived: ArchivedTournament = JSON.parse(content);

        // Normalize names
        const cleanArchivedName = archived.name.replace(' | Padel FIP', '').trim().toLowerCase();

        // Find matching tournament
        let match = tournaments.find(t => {
            const cleanTName = t.name.replace(' | Padel FIP', '').trim().toLowerCase();
            return cleanTName === cleanArchivedName;
        });

        // If not found, try fuzzy match
        if (!match) {
            match = tournaments.find(t => {
                const cleanTName = t.name.replace(' | Padel FIP', '').trim().toLowerCase();
                return cleanTName.includes(cleanArchivedName) || cleanArchivedName.includes(cleanTName);
            });
        }

        if (match) {
            if (!archived.dateStart) {
                console.log(`Updating ${file}: ${archived.name} -> ${match.dateStart}`);
                archived.dateStart = match.dateStart;
                archived.dateEnd = match.dateEnd;

                fs.writeFileSync(filePath, JSON.stringify(archived, null, 2));
            } else {
                // console.log(`Skipping ${file}: already has dateStart`);
            }
        } else {
            console.warn(`WARNING: Could not find match for "${archived.name}"`);
        }
    }
}

fixDates().catch(console.error);
