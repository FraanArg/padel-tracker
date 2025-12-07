'use client';

import { Calendar, Download, ExternalLink } from 'lucide-react';

interface CalendarExportProps {
    tournamentName: string;
    startDate: string;
    endDate?: string;
    location?: string;
}

export default function CalendarExport({ tournamentName, startDate, endDate, location }: CalendarExportProps) {
    const handleDownloadICS = () => {
        const params = new URLSearchParams({
            tournament: tournamentName,
            startDate: startDate,
        });
        if (endDate) params.append('endDate', endDate);
        if (location) params.append('location', location);

        window.location.href = `/api/calendar/ics?${params.toString()}`;
    };

    const handleGoogleCalendar = () => {
        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);

        const formatGoogleDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

        const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: `🏆 ${tournamentName}`,
            dates: `${formatGoogleDate(start)}/${formatGoogleDate(end)}`,
            details: `World Padel Tour Event: ${tournamentName}`,
            location: location || '',
        });

        window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleDownloadICS}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 rounded-xl transition-colors"
                title="Download .ics file"
            >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
            </button>

            <button
                onClick={handleGoogleCalendar}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-500/20 dark:hover:bg-blue-500/30 dark:text-blue-400 rounded-xl transition-colors"
                title="Add to Google Calendar"
            >
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Google Cal</span>
            </button>
        </div>
    );
}
