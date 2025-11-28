
import axios from 'axios';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function checkUrls() {
    const slugs = [
        'victoria-iglesias',
        'victoria-iglesias-segador',
        'v-iglesias',
        'v-iglesias-segador',
        'alejandro-galan', // Control
        'david-gala'       // Control
    ];

    for (const slug of slugs) {
        const url = `https://www.padelfip.com/player/${slug}/`;
        console.log(`Checking ${url}...`);
        try {
            const { status } = await axios.head(url, {
                headers: { 'User-Agent': USER_AGENT },
                validateStatus: () => true
            });
            console.log(`  Status: ${status}`);
        } catch (e: any) {
            console.log(`  Error: ${e.message}`);
        }
    }
}

checkUrls();
