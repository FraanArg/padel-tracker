import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface CalendarEvent {
    title: string;
    startDate: Date;
    endDate: Date;
    description?: string;
    location?: string;
}

function formatICSDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/g, '');
}

function generateICS(events: CalendarEvent[]): string {
    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Padel Tracker//Calendar Export//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:Padel Tracker Events',
    ];

    events.forEach((event, idx) => {
        lines.push('BEGIN:VEVENT');
        lines.push(`UID:padel-tracker-${idx}-${Date.now()}@padeltracker.app`);
        lines.push(`DTSTAMP:${formatICSDate(new Date())}`);
        lines.push(`DTSTART:${formatICSDate(event.startDate)}`);
        lines.push(`DTEND:${formatICSDate(event.endDate)}`);
        lines.push(`SUMMARY:${event.title}`);
        if (event.description) {
            lines.push(`DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`);
        }
        if (event.location) {
            lines.push(`LOCATION:${event.location}`);
        }
        lines.push('END:VEVENT');
    });

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const tournamentName = searchParams.get('tournament');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const location = searchParams.get('location');
        const description = searchParams.get('description');

        if (!tournamentName || !startDate) {
            return NextResponse.json(
                { error: 'Tournament name and start date required' },
                { status: 400 }
            );
        }

        // Parse dates
        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000); // Default 7 days

        const events: CalendarEvent[] = [{
            title: `🏆 ${tournamentName}`,
            startDate: start,
            endDate: end,
            description: description || `World Padel Tour Event: ${tournamentName}`,
            location: location || undefined
        }];

        const icsContent = generateICS(events);

        // Return as downloadable file
        return new NextResponse(icsContent, {
            headers: {
                'Content-Type': 'text/calendar; charset=utf-8',
                'Content-Disposition': `attachment; filename="${tournamentName.replace(/[^a-zA-Z0-9]/g, '_')}.ics"`,
            },
        });
    } catch (error) {
        console.error('Calendar export error:', error);
        return NextResponse.json(
            { error: 'Failed to generate calendar file' },
            { status: 500 }
        );
    }
}
