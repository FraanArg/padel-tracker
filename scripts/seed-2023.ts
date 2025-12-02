
import { saveTournament } from '../src/lib/archive';

const tournaments2023 = [
    { name: "Qatar Major", dateStart: "2023-02-26", dateEnd: "2023-03-05", id: "qatar-major-2023" },
    { name: "Italy Major", dateStart: "2023-07-10", dateEnd: "2023-07-16", id: "italy-major-2023" },
    { name: "Madrid P1", dateStart: "2023-07-17", dateEnd: "2023-07-23", id: "madrid-p1-2023" },
    { name: "Mendoza P1", dateStart: "2023-07-31", dateEnd: "2023-08-06", id: "mendoza-p1-2023" },
    { name: "Paris Major", dateStart: "2023-09-04", dateEnd: "2023-09-10", id: "paris-major-2023" },
    { name: "NewGiza P1", dateStart: "2023-10-30", dateEnd: "2023-11-05", id: "newgiza-p1-2023" },
    { name: "Mexico Major", dateStart: "2023-11-27", dateEnd: "2023-12-03", id: "mexico-major-2023" },
    { name: "Milano P1", dateStart: "2023-12-04", dateEnd: "2023-12-10", id: "milano-p1-2023" }
];

async function seed() {
    console.log("Seeding 2023 tournaments...");
    for (const t of tournaments2023) {
        saveTournament(t.id, t.name, [], 2023);
        console.log(`Saved ${t.name}`);
    }
}

seed().catch(console.error);
