import { NextResponse } from 'next/server';
import { getTournaments } from '@/lib/padel';

export async function GET() {
    const tournaments = await getTournaments();
    return NextResponse.json(tournaments);
}
