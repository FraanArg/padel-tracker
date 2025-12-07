import { NextRequest, NextResponse } from 'next/server';
import { predictMatch } from '@/lib/predictions';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const team1 = searchParams.get('team1')?.split(',').filter(Boolean) || [];
        const team2 = searchParams.get('team2')?.split(',').filter(Boolean) || [];
        const team1Rank = searchParams.get('team1Rank') ? parseInt(searchParams.get('team1Rank')!) : undefined;
        const team2Rank = searchParams.get('team2Rank') ? parseInt(searchParams.get('team2Rank')!) : undefined;

        if (team1.length === 0 || team2.length === 0) {
            return NextResponse.json({ error: 'Both teams required' }, { status: 400 });
        }

        const prediction = await predictMatch(team1, team2, team1Rank, team2Rank);

        return NextResponse.json(prediction);
    } catch (error) {
        console.error('Prediction API error:', error);
        return NextResponse.json({ error: 'Prediction failed' }, { status: 500 });
    }
}
