import { NextRequest, NextResponse } from 'next/server';
import { getPlayerExtendedProfile } from '@/lib/padel';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const team1Names = searchParams.get('team1')?.split(',') || [];
    const team2Names = searchParams.get('team2')?.split(',') || [];

    if (team1Names.length === 0 && team2Names.length === 0) {
        return NextResponse.json({ error: 'No teams provided' }, { status: 400 });
    }

    try {
        const [team1Profiles, team2Profiles] = await Promise.all([
            Promise.all(team1Names.map(name => getPlayerExtendedProfile(name))),
            Promise.all(team2Names.map(name => getPlayerExtendedProfile(name)))
        ]);

        return NextResponse.json({
            team1: team1Profiles.filter(Boolean),
            team2: team2Profiles.filter(Boolean)
        });
    } catch (error) {
        console.error('Error fetching match preview:', error);
        return NextResponse.json({ error: 'Failed to fetch match preview' }, { status: 500 });
    }
}
