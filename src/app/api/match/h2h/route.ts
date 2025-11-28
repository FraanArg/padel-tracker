import { NextRequest, NextResponse } from 'next/server';
import { findH2HMatches } from '@/lib/h2h';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const team1Names = searchParams.get('team1')?.split(',') || [];
    const team2Names = searchParams.get('team2')?.split(',') || [];

    if (team1Names.length === 0 || team2Names.length === 0) {
        return NextResponse.json({ error: 'Both teams must be provided' }, { status: 400 });
    }

    try {
        const matches = await findH2HMatches(team1Names, team2Names);
        return NextResponse.json({ matches });
    } catch (error) {
        console.error('Error fetching H2H matches:', error);
        return NextResponse.json({ error: 'Failed to fetch H2H matches' }, { status: 500 });
    }
}
