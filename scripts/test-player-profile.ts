
import axios from 'axios';

async function main() {
    const name = 'Galan';
    const url = `http://localhost:3000/api/player/${name}/stats`;
    console.log(`Fetching ${url}...`);

    try {
        const { data } = await axios.get(url);
        console.log('Status: 200 OK');
        console.log('Profile:', data.profile ? data.profile.name : 'Missing');
        console.log('Stats:', data.stats ? `${data.stats.wins}W - ${data.stats.losses}L` : 'Missing');

        if (data.stats && data.stats.partners) {
            console.log('Partners:', data.stats.partners.map((p: any) => `${p.name} (${p.matches})`).join(', '));
        }
        if (data.debug) {
            console.log('Debug:', JSON.stringify(data.debug, null, 2));
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

main();
