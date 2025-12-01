
import { NextRequest, NextResponse } from 'next/server';
import { getMatchStats } from '@/lib/padel';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year');
    const tournamentId = searchParams.get('tournamentId');
    const organization = searchParams.get('organization');

    if (!id || !year || !tournamentId || !organization) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const stats = await getMatchStats(id, year, tournamentId, organization);

    if (!stats) {
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }

    return NextResponse.json(stats);
}
