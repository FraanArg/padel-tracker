import { getMatches } from '../src/lib/padel';

async function main() {
    const url = 'https://www.padelfip.com/events/premier-padel-gnp-acapulco-major-2025/';
    // We want to check the data for a specific day where the user sees issues.
    // The screenshot shows "NOV 26 WED" selected.
    // We'll let getMatches find the default day or we can try to find that specific one.

    console.log('Fetching matches...');
    const result = await getMatches(url);

    if ('matches' in result && result.matches) {
        console.log(`Found ${result.matches.length} matches.`);
        if (result.matches.length > 0) {
            console.log('First match structure:', JSON.stringify(result.matches[0], null, 2));

            // Check a match that might correspond to the screenshot
            // Screenshot has "M. Ortega Gallego / T. Icardo Alcorisa"
            const targetMatch = result.matches.find(m => m.raw.includes('Ortega'));
            if (targetMatch) {
                console.log('Target match structure:', JSON.stringify(targetMatch, null, 2));
            } else {
                console.log('Could not find match with "Ortega"');
                // Print first 3 matches
                result.matches.slice(0, 3).forEach((m, i) => {
                    console.log(`Match ${i}:`, JSON.stringify(m, null, 2));
                });
            }
        }
    } else {
        console.error('Error:', result.error);
    }
}

main().catch(console.error);
