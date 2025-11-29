import { NextRequest, NextResponse } from 'next/server';
import { getPlayerExtendedProfile } from '@/lib/padel';
import { getPlayerStats } from '@/lib/stats';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const team1Names = searchParams.get('team1')?.split(',') || [];
    const team2Names = searchParams.get('team2')?.split(',') || [];
    const yearParam = searchParams.get('year');
    const year = yearParam && yearParam !== 'all' ? parseInt(yearParam) : 'all';

    if (team1Names.length === 0 && team2Names.length === 0) {
        return NextResponse.json({ error: 'No teams provided' }, { status: 400 });
    }

    try {
        const fetchPlayerData = async (name: string) => {
            const [profile, stats] = await Promise.all([
                getPlayerExtendedProfile(name),
                Promise.resolve(getPlayerStats(name, year as number | 'all')) // Wrap sync call
            ]);

            if (!profile) return null;

            // If a specific year is selected (and it's not the current year), 
            // we should probably hide the *current* rank/points as they are misleading.
            // However, we don't have historical rank/points.
            // Let's set them to '-' if year is not 2025 (assuming 2025 is current)
            // Actually, let's just return what we have, but maybe the UI should handle the display.
            // But the user requested "ranking... should be the one those players ended up ranked that year".
            // Since we don't have it, we should probably return null/empty for them to indicate missing data.

            const isHistorical = year !== 'all' && year !== 2025;

            return {
                ...profile,
                rank: isHistorical ? '-' : profile.rank,
                points: isHistorical ? '-' : profile.points,
                winRate: stats.winRate,
                currentStreak: stats.currentStreak,
                totalMatches: stats.totalMatches,
                titles: stats.titles,
                // Override recent results with historical matches if year is selected
                recentResults: isHistorical && stats.recentMatches ? stats.recentMatches : profile.recentResults
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
