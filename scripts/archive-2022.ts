import { getMatches, Tournament } from '../src/lib/padel';
import * as fs from 'fs';
import * as path from 'path';

// Known 2022 Premier Padel Tournaments
// Since there is no calendar page, we hardcode the IDs/URLs found from research or trial/error
const TOURNAMENTS_2022 = [
    { name: 'Ooredoo Qatar Major 2022', url: 'https://www.padelfip.com/events/ooredoo-qatar-major-2022/', id: 'ooredoo-qatar-major-2022' },
    { name: 'Italy Major Premier Padel 2022', url: 'https://www.padelfip.com/events/italy-major-premier-padel-2022/', id: 'italy-major-premier-padel-2022' },
    { name: 'Paris Major Premier Padel 2022', url: 'https://www.padelfip.com/events/paris-major-premier-padel-2022/', id: 'paris-major-premier-padel-2022' },
    { name: 'Madrid Premier Padel P1 2022', url: 'https://www.padelfip.com/events/madrid-premier-padel-p1-2022/', id: 'madrid-premier-padel-p1-2022' },
    { name: 'Argentina Premier Padel P1 2022', url: 'https://www.padelfip.com/events/argentina-premier-padel-p1-2022/', id: 'argentina-premier-padel-p1-2022' },
    { name: 'Mexico Major Premier Padel 2022', url: 'https://www.padelfip.com/events/mexico-major-premier-padel-2022/', id: 'mexico-major-premier-padel-2022' },
    { name: 'NewGiza Premier Padel P1 2022', url: 'https://www.padelfip.com/events/newgiza-premier-padel-p1-2022/', id: 'newgiza-premier-padel-p1-2022' },
    { name: 'Milano Premier Padel P1 2022', url: 'https://www.padelfip.com/events/milano-premier-padel-p1-2022/', id: 'milano-premier-padel-p1-2022' }
];

const DATA_DIR = path.join(process.cwd(), 'data', 'tournaments');

async function archive2022() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    console.log(`Starting archive for 2022 season...`);

    for (const t of TOURNAMENTS_2022) {
        const filename = `${t.id}.json`;
        const filePath = path.join(DATA_DIR, filename);

        if (fs.existsSync(filePath)) {
            console.log(`Skipping ${t.name} (already archived)`);
            continue;
        }

        console.log(`Archiving ${t.name}...`);
        try {
            // We assume 'draw' view gives all matches
            const data = await getMatches(t.url);

            if ('error' in data || !data.matches || data.matches.length === 0) {
                console.error(`Failed to fetch matches for ${t.name}: ${data.error || 'No matches found'}`);
                continue;
            }

            const archiveData = {
                id: t.id,
                name: t.name,
                year: 2022,
                url: t.url,
                matches: data.matches
            };

            fs.writeFileSync(filePath, JSON.stringify(archiveData, null, 2));
            console.log(`Saved ${data.matches.length} matches to ${filename}`);

            // Be nice to the server
            await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (e) {
            console.error(`Error archiving ${t.name}:`, e);
        }
    }

    console.log('2022 Archive complete!');
}

archive2022();
