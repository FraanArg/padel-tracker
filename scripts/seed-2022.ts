
import { saveTournament } from '../src/lib/archive';

const tournaments2022 = [
    { name: "Qatar Major", dateStart: "2022-03-28", dateEnd: "2022-04-02", id: "qatar-major-2022" },
    { name: "Italy Major", dateStart: "2022-05-23", dateEnd: "2022-05-29", id: "italy-major-2022" },
    { name: "Paris Major", dateStart: "2022-07-11", dateEnd: "2022-07-17", id: "paris-major-2022" },
    { name: "Madrid P1", dateStart: "2022-08-01", dateEnd: "2022-08-06", id: "madrid-p1-2022" }, // Added Madrid P1 from search results in step 212 (though not in step 403 summary, it was in 2022 results)
    { name: "Argentina P1", dateStart: "2022-08-08", dateEnd: "2022-08-14", id: "argentina-p1-2022" },
    { name: "Mexico Major", dateStart: "2022-11-28", dateEnd: "2022-12-04", id: "mexico-major-2022" }
];

async function seed() {
    console.log("Seeding 2022 tournaments...");
    for (const t of tournaments2022) {
        saveTournament(t.id, t.name, [], 2022);
        console.log(`Saved ${t.name}`);
    }
}

seed().catch(console.error);
