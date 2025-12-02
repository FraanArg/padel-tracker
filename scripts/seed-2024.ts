
import { saveTournament } from '../src/lib/archive';

const tournaments2024 = [
    { name: "Riyadh Season P1", dateStart: "2024-02-26", dateEnd: "2024-03-02", id: "riyadh-p1-2024" },
    { name: "Qatar Major", dateStart: "2024-03-03", dateEnd: "2024-03-08", id: "qatar-major-2024" },
    { name: "Acapulco Major", dateStart: "2024-03-18", dateEnd: "2024-03-24", id: "acapulco-major-2024" },
    { name: "Puerto Cabello P2", dateStart: "2024-03-25", dateEnd: "2024-03-31", id: "puerto-cabello-p2-2024" },
    { name: "Brussels P2", dateStart: "2024-04-22", dateEnd: "2024-04-28", id: "brussels-p2-2024" },
    { name: "Sevilla P2", dateStart: "2024-04-29", dateEnd: "2024-05-05", id: "sevilla-p2-2024" },
    { name: "Asuncion P2", dateStart: "2024-05-13", dateEnd: "2024-05-19", id: "asuncion-p2-2024" },
    { name: "Argentina P1", dateStart: "2024-05-20", dateEnd: "2024-05-26", id: "argentina-p1-2024" },
    { name: "Santiago P1", dateStart: "2024-05-27", dateEnd: "2024-06-02", id: "santiago-p1-2024" },
    { name: "Bordeaux P2", dateStart: "2024-06-10", dateEnd: "2024-06-16", id: "bordeaux-p2-2024" },
    { name: "Italy Major", dateStart: "2024-06-17", dateEnd: "2024-06-23", id: "italy-major-2024" },
    { name: "Malaga P1", dateStart: "2024-07-08", dateEnd: "2024-07-14", id: "malaga-p1-2024" },
    { name: "Finland P2", dateStart: "2024-07-29", dateEnd: "2024-08-04", id: "finland-p2-2024" },
    { name: "Madrid P1", dateStart: "2024-09-02", dateEnd: "2024-09-08", id: "madrid-p1-2024" },
    { name: "Rotterdam P1", dateStart: "2024-09-09", dateEnd: "2024-09-15", id: "rotterdam-p1-2024" },
    { name: "Valladolid P2", dateStart: "2024-09-16", dateEnd: "2024-09-22", id: "valladolid-p2-2024" },
    { name: "Paris Major", dateStart: "2024-09-30", dateEnd: "2024-10-06", id: "paris-major-2024" },
    { name: "NewGiza P2", dateStart: "2024-10-21", dateEnd: "2024-10-27", id: "newgiza-p2-2024" },
    { name: "Dubai P1", dateStart: "2024-11-04", dateEnd: "2024-11-10", id: "dubai-p1-2024" },
    { name: "Kuwait P1", dateStart: "2024-11-11", dateEnd: "2024-11-17", id: "kuwait-p1-2024" },
    { name: "Mexico Major", dateStart: "2024-11-24", dateEnd: "2024-12-01", id: "mexico-major-2024" },
    { name: "Milano P1", dateStart: "2024-12-02", dateEnd: "2024-12-08", id: "milano-p1-2024" },
    { name: "Tour Finals Barcelona", dateStart: "2024-12-18", dateEnd: "2024-12-22", id: "barcelona-finals-2024" }
];

async function seed() {
    console.log("Seeding 2024 tournaments...");
    for (const t of tournaments2024) {
        // We save with empty matches for now, just to have the record
        // In a real scenario, we would try to fetch matches here if we had a working scraper
        saveTournament(t.id, t.name, [], 2024);
        console.log(`Saved ${t.name}`);
    }
}

seed().catch(console.error);
