

import { NextRequest, NextResponse } from 'next/server';
import { getPlayerCareerStats } from '@/lib/stats';
import { getPlayerExtendedProfile } from '@/lib/padel';

export async function GET(request: NextRequest, props: { params: Promise<{ name: string }> }) {
    const params = await props.params;
    const name = decodeURIComponent(params.name);

    try {
        console.log(`API: Fetching stats for ${name}`);

        // 1. Get Career Stats (Stats + Timeline)
        const careerStats = await getPlayerCareerStats(name);

        const { getDebugInfo } = require('@/lib/stats');
        const statsDebug = getDebugInfo(name);

        // 2. Get Profile (Rank, Points, Image) from external source/cache
        const profile = await getPlayerExtendedProfile(name);

        return NextResponse.json({
            stats: careerStats.stats,
            timeline: careerStats.timeline,
            profile,
            debug: {
                cwd: process.cwd(),
                statsLib: statsDebug
            }
        });

    } catch (error) {
        console.error('Error fetching player stats:', error);
        return NextResponse.json({ error: 'Failed to fetch player stats' }, { status: 500 });
    }
}
