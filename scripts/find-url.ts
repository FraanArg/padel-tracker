import axios from 'axios';

async function findUrl() {
    const id = '236199';
    const candidates = [
        `https://widget.matchscorerlive.com/screen/livescore/${id}?t=tol`,
        `https://widget.matchscorerlive.com/screen/feed/livescore/${id}?t=tol`,
        `https://widget.matchscorerlive.com/screen/widget/livescore/${id}?t=tol`,
        `https://widget.matchscorerlive.com/screen/livescore/${id}`,
        `https://widget.matchscorerlive.com/livescore/${id}`,
    ];

    for (const url of candidates) {
        try {
            console.log(`Checking ${url}...`);
            const res = await axios.head(url, { validateStatus: () => true });
            console.log(`Status: ${res.status}`);
            if (res.status === 200) {
                console.log(`FOUND VALID URL: ${url}`);
                break;
            }
        } catch (e: any) {
            console.log(`Error: ${e.message}`);
        }
    }
}

findUrl();
