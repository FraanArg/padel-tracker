
import axios from 'axios';
import * as cheerio from 'cheerio';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function inspectTournamentDates() {
    try {
        console.log('Fetching tournament list...');
        const { data } = await axios.get('https://www.padelfip.com/live/', {
            headers: { 'User-Agent': USER_AGENT }
        });
        const $ = cheerio.load(data);

        // Search for specific date string known from screenshot
        const searchString = "24-30 NOV";
        if (data.includes(searchString)) {
            console.log(`FOUND "${searchString}" in HTML!`);
            // Find the element containing this text
            $('*').each((_, el) => {
                const t = $(el).text();
                if (t.includes(searchString) && $(el).children().length === 0) {
                    console.log('Element containing date:', $(el).prop('tagName'), $(el).attr('class'));
                    console.log('Parent:', $(el).parent().prop('tagName'), $(el).parent().attr('class'));
                    console.log('Grandparent:', $(el).parent().parent().prop('tagName'), $(el).parent().parent().attr('class'));
                }
            });
        } else {
            console.log(`"${searchString}" NOT FOUND in HTML.`);
        }

        console.log('Inspecting tournament containers (Hierarchy):');
        $('.cover-category-event').each((i, element) => {
            if (i > 0) return; // Only check first one
            const img = $(element);

            // Find the main article container
            const article = img.closest('article');
            console.log('Article HTML structure:');
            console.log(article.html()?.substring(0, 1000)); // Dump first 1000 chars of HTML

            console.log('Article Text:');
            console.log(article.text().replace(/\s+/g, ' ').trim());
        });

    } catch (e: any) {
        console.error('Error:', e.message);
    }
}

inspectTournamentDates();
