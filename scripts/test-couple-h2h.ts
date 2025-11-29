
import axios from 'axios';

async function main() {
    // Galan/Chingotto vs Tapia/Coello
    const team1 = ['Galan', 'Chingotto'];
    const team2 = ['Tapia', 'Coello'];

    const url = `http://localhost:3000/api/match/h2h?team1=${encodeURIComponent(team1.join(','))}&team2=${encodeURIComponent(team2.join(','))}`;
    console.log(`Fetching ${url}...`);

    try {
        const { data } = await axios.get(url);
        console.log('Status: 200 OK');
        console.log(`Stats: ${data.team1Wins}W - ${data.team2Wins}L (${data.totalMatches} matches)`);

        if (data.matches && data.matches.length > 0) {
            console.log('Sample Match:', data.matches[0].tournament.name, data.matches[0].score);
        } else {
            console.log('No matches found');
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

main();
