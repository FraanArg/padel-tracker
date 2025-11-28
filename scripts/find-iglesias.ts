
import axios from 'axios';
import * as cheerio from 'cheerio';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function findIglesias() {
    console.log('\nSearching for Iglesias...');
    try {
        const url = 'https://www.padelfip.com/ranking-female/?s=Iglesias';
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': USER_AGENT }
        });
        const $page = cheerio.load(data);
        const rows = $page('table tr');
        console.log(`Search rows: ${rows.length}`);

        rows.each((i, el) => {
            const row = $page(el);
            const cells = row.find('td');
            if (cells.length >= 2) {
                const nameCell = $page(cells[1]);
                let name = nameCell.text().trim();
                if (name.startsWith('<img')) {
                    const $inner = cheerio.load(name);
                    name = $inner.text().trim();
                }
                console.log(`Search Row ${i}:`, name);
            }
        });
    } catch (e: any) {
        console.log(`Search fetch failed:`, e.message);
    }
}

findIglesias();
