
import * as fs from 'fs';
import * as path from 'path';
import { ArchivedTournament } from '../src/lib/archive';

const DATA_DIR = path.join(process.cwd(), 'data', 'tournaments');

const updates: Record<string, string> = {
    'ooredoo-qatar-major-premier-padel-2024-padel-fip-2025.json': '03/03/2024',
    'lotto-brussels-premier-padel-p2-presented-by-belfius-2024-padel-fip-2025.json': '22/04/2024',
    'betclic-bordeaux-premier-padel-p2-2024-padel-fip-2025.json': '10/06/2024',
    'bnl-italy-major-premier-padel-2024-padel-fip-2025.json': '17/06/2024',
    'malaga-premier-padel-p1-2024-padel-fip-2025.json': '08/07/2024',
    'rotterdam-premier-padel-p1-2024-padel-fip-2025.json': '09/09/2024',
    'greenweez-paris-major-premier-padel-2024-padel-fip-2025.json': '28/09/2024',
    'dubai-premier-padel-p1-2024-padel-fip-2025.json': '03/11/2024',
    'milano-premier-padel-p1-2024-padel-fip-2025.json': '02/12/2024'
};

async function manualFix() {
    for (const [filename, date] of Object.entries(updates)) {
        const filePath = path.join(DATA_DIR, filename);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            const data: ArchivedTournament = JSON.parse(content);
            data.dateStart = date;
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            console.log(`Updated ${filename} with date ${date}`);
        } else {
            console.warn(`File not found: ${filename}`);
        }
    }
}

manualFix().catch(console.error);
