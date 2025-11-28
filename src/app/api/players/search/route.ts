import { NextRequest, NextResponse } from 'next/server';
import { getRankings } from '@/lib/padel';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q')?.toLowerCase() || '';

    if (query.length < 2) {
        return NextResponse.json({ players: [] });
    }

    try {
        const { men, women } = await getRankings();
        const allPlayers = [...men, ...women];

        const filtered = allPlayers.filter(p =>
            p.name.toLowerCase().includes(query)
        ).slice(0, 10); // Limit to 10 results

        return NextResponse.json({ players: filtered });
    } catch (error) {
        console.error('Error searching players:', error);
        return NextResponse.json({ error: 'Failed to search players' }, { status: 500 });
    }
}
