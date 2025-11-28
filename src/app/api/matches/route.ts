import { NextResponse } from 'next/server';
import { getMatches } from '@/lib/padel';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const data = await getMatches(url);
    return NextResponse.json(data);
}
