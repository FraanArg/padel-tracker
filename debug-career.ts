
import { getPlayerCareerStats } from './src/lib/stats';

async function debugCareer() {
    const player = "Agustin Tapia";
    console.log(`Fetching career stats for ${player}...`);

    try {
        const data = await getPlayerCareerStats(player);
        console.log("Stats:", JSON.stringify(data.stats, null, 2));
        console.log("Timeline Length:", data.timeline.length);
        if (data.timeline.length > 0) {
            console.log("First Tournament:", data.timeline[0]);
        } else {
            console.log("Timeline is empty (Expected if no matches in DB)");
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

debugCareer().catch(console.error);
