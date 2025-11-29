
import { NextRequest, NextResponse } from 'next/server';
import { getPlayerStats } from '@/lib/stats';
import { getPlayerExtendedProfile } from '@/lib/padel';

export async function GET(request: NextRequest, props: { params: Promise<{ name: string }> }) {
    const params = await props.params;
    const name = decodeURIComponent(params.name);

    try {
        console.log(`API: Fetching stats for ${name}`);
        console.log(`API: CWD is ${process.cwd()}`);

        // Check if data dir exists
        const fs = require('fs');
        const path = require('path');
        const dataDir = path.join(process.cwd(), 'data', 'tournaments');
        if (fs.existsSync(dataDir)) {
            const files = fs.readdirSync(dataDir);
            console.log(`API: Found ${files.length} files in ${dataDir}`);
        } else {
            console.log(`API: Data dir not found at ${dataDir}`);
        }

        // 1. Get Stats from local archive
        const stats = getPlayerStats(name);

        const { getDebugInfo } = require('@/lib/stats');
        const statsDebug = getDebugInfo(name);

        // 2. Get Profile (Rank, Points, Image) from external source/cache
        const profile = await getPlayerExtendedProfile(name);

        return NextResponse.json({
            stats,
            profile,
            debug: {
                cwd: process.cwd(),
                dataDirExists: fs.existsSync(dataDir),
                filesCount: fs.existsSync(dataDir) ? fs.readdirSync(dataDir).length : 0,
                statsLib: statsDebug
            }
        });
    } catch (error) {
        console.error('Error fetching player stats:', error);
        return NextResponse.json({ error: 'Failed to fetch player stats' }, { status: 500 });
    }
}
