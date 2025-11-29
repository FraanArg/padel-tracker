import { NextRequest, NextResponse } from 'next/server';
import { getHeadToHead, getCommonOpponents } from '@/lib/stats';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const team1Names = searchParams.get('team1')?.split(',') || [];
    const team2Names = searchParams.get('team2')?.split(',') || [];

    const yearParam = searchParams.get('year');
    const year = yearParam === 'all' ? 'all' : (yearParam ? parseInt(yearParam) : undefined);

    if (team1Names.length === 0 || team2Names.length === 0) {
        return NextResponse.json({ error: 'Both teams must be provided' }, { status: 400 });
    }

    try {
        const stats = await getHeadToHead(team1Names, team2Names, year);
        const commonOpponents = await getCommonOpponents(team1Names, team2Names);

        return NextResponse.json({
            ...stats,
            commonOpponents
        });
    } catch (error) {
        console.error('Error fetching H2H matches:', error);
        return NextResponse.json({ error: 'Failed to fetch H2H matches' }, { status: 500 });
    }
}
