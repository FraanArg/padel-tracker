import axios from 'axios';
import * as fs from 'fs';

async function inspectWidget() {
    const url = 'https://widget.matchscorerlive.com/screen/tournamentlive/FIP-2025-4801?t=tol';
    console.log(`Fetching ${url}...`);
    const { data } = await axios.get(url);
    fs.writeFileSync('debug_widget.html', data);
    console.log('Saved to debug_widget.html');
}

inspectWidget();
