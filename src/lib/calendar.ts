import { Match } from './padel';

export function generateICS(match: Match): string {
    const now = new Date();
    const formatDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    // Parse match time
    // If we don't have a date, assume today or upcoming
    // This is tricky without a full date object in Match, but we'll do our best
    let start = new Date();
    if (match.time) {
        const [h, m] = match.time.split(':').map(Number);
        start.setHours(h, m, 0, 0);
        // If time has passed today, maybe it's tomorrow? For now assume today/future based on context
        if (start < now && match.status !== 'live' && match.status !== 'finished') {
            start.setDate(start.getDate() + 1);
        }
    }

    // Duration 90 mins
    const end = new Date(start.getTime() + 90 * 60000);

    const title = `${match.team1?.join('/')} vs ${match.team2?.join('/')}`;
    const description = `Tournament: ${match.tournament?.name}\nRound: ${match.round}\nCourt: ${match.court}`;
    const location = match.location || match.court || '';

    const event = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Padel Tracker//EN',
        'BEGIN:VEVENT',
        `UID:${now.getTime()}@padeltracker.com`,
        `DTSTAMP:${formatDate(now)}`,
        `DTSTART:${formatDate(start)}`,
        `DTEND:${formatDate(end)}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${location}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    return event;
}

export function downloadICS(match: Match) {
    const ics = generateICS(match);
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'match.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
