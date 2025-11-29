import { NextRequest, NextResponse } from 'next/server';
import { getPlayerExtendedProfile } from '@/lib/padel';
import { getPlayerStats } from '@/lib/stats';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const team1Names = searchParams.get('team1')?.split(',') || [];
    const team2Names = searchParams.get('team2')?.split(',') || [];

    if (team1Names.length === 0 && team2Names.length === 0) {
        return NextResponse.json({ error: 'No teams provided' }, { status: 400 });
    }

    try {
        const fetchPlayerData = async (name: string) => {
            const [profile, stats] = await Promise.all([
                getPlayerExtendedProfile(name),
                Promise.resolve(getPlayerStats(name)) // Wrap sync call
            ]);

            if (!profile) return null;

            return {
                ...profile,
                winRate: stats.winRate,
                currentStreak: stats.currentStreak,
                totalMatches: stats.totalMatches,
                titles: stats.titles
            };
        };

        const [team1Profiles, team2Profiles] = await Promise.all([
            Promise.all(team1Names.map(name => fetchPlayerData(name))),
            Promise.all(team2Names.map(name => fetchPlayerData(name)))
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
