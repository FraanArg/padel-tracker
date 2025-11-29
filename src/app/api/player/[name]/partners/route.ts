
import { NextRequest, NextResponse } from 'next/server';
import { getPartners } from '@/lib/stats';
import { getRankings } from '@/lib/padel';

export async function GET(request: NextRequest, { params }: { params: Promise<{ name: string }> }) {
    const name = (await params).name;

    if (!name) {
        return NextResponse.json({ error: 'Player name is required' }, { status: 400 });
    }

    try {
        const partnerNames = getPartners(decodeURIComponent(name));

        // Enrich with profile data (images, ranks) if available
        const { men, women } = await getRankings();
        const allPlayers = [...men, ...women];

        const enrichedPartners = partnerNames.map(partnerName => {
            const match = allPlayers.find(p =>
                p.name.toLowerCase().includes(partnerName.toLowerCase()) ||
                partnerName.toLowerCase().includes(p.name.toLowerCase())
            );

            if (match) {
                return match;
            }

            // Fallback for unranked partners
            return {
                name: partnerName,
                rank: '-',
                points: '-',
                country: 'Unknown',
                imageUrl: ''
            };
        });

        return NextResponse.json({ partners: enrichedPartners });
    } catch (error) {
        console.error('Error fetching partners:', error);
        return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 });
    }
}
