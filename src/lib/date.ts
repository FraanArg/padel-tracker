
export const TOURNAMENT_METADATA: Record<string, { timezone: string, location: string }> = {
    'MEXICO': { timezone: 'America/Mexico_City', location: 'Acapulco, Mexico' },
    'ACAPULCO': { timezone: 'America/Mexico_City', location: 'Acapulco, Mexico' },
    'SPAIN': { timezone: 'Europe/Madrid', location: 'Spain' },
    'MADRID': { timezone: 'Europe/Madrid', location: 'Madrid, Spain' },
    'BARCELONA': { timezone: 'Europe/Madrid', location: 'Barcelona, Spain' },
    'SEVILLA': { timezone: 'Europe/Madrid', location: 'Sevilla, Spain' },
    'MALAGA': { timezone: 'Europe/Madrid', location: 'Malaga, Spain' },
    'VALLADOLID': { timezone: 'Europe/Madrid', location: 'Valladolid, Spain' },
    'ITALY': { timezone: 'Europe/Rome', location: 'Italy' },
    'ROME': { timezone: 'Europe/Rome', location: 'Rome, Italy' },
    'MILAN': { timezone: 'Europe/Rome', location: 'Milan, Italy' },
    'COMO': { timezone: 'Europe/Rome', location: 'Como, Italy' },
    'GENOVA': { timezone: 'Europe/Rome', location: 'Genova, Italy' },
    'FRANCE': { timezone: 'Europe/Paris', location: 'France' },
    'PARIS': { timezone: 'Europe/Paris', location: 'Paris, France' },
    'BORDEAUX': { timezone: 'Europe/Paris', location: 'Bordeaux, France' },
    'BELGIUM': { timezone: 'Europe/Brussels', location: 'Belgium' },
    'BRUSSELS': { timezone: 'Europe/Brussels', location: 'Brussels, Belgium' },
    'ROESELARE': { timezone: 'Europe/Brussels', location: 'Roeselare, Belgium' },
    'QATAR': { timezone: 'Asia/Qatar', location: 'Doha, Qatar' },
    'DOHA': { timezone: 'Asia/Qatar', location: 'Doha, Qatar' },
    'ARGENTINA': { timezone: 'America/Argentina/Buenos_Aires', location: 'Argentina' },
    'MENDOZA': { timezone: 'America/Argentina/Buenos_Aires', location: 'Mendoza, Argentina' },
    'MAR DEL PLATA': { timezone: 'America/Argentina/Buenos_Aires', location: 'Mar del Plata, Argentina' },
    'CHILE': { timezone: 'America/Santiago', location: 'Santiago, Chile' },
    'SANTIAGO': { timezone: 'America/Santiago', location: 'Santiago, Chile' },
    'MANAMA': { timezone: 'Asia/Bahrain', location: 'Manama, Bahrain' },
    'BAHRAIN': { timezone: 'Asia/Bahrain', location: 'Manama, Bahrain' },
    'KUWAIT': { timezone: 'Asia/Kuwait', location: 'Kuwait City, Kuwait' },
    'DUBAI': { timezone: 'Asia/Dubai', location: 'Dubai, UAE' },
    'UAE': { timezone: 'Asia/Dubai', location: 'Dubai, UAE' },
    'RIYADH': { timezone: 'Asia/Riyadh', location: 'Riyadh, Saudi Arabia' },
    'SAUDI': { timezone: 'Asia/Riyadh', location: 'Saudi Arabia' },
    'SWEDEN': { timezone: 'Europe/Stockholm', location: 'Sweden' },
    'GERMANY': { timezone: 'Europe/Berlin', location: 'Germany' },
    'DUSSELDORF': { timezone: 'Europe/Berlin', location: 'Dusseldorf, Germany' },
    'NETHERLANDS': { timezone: 'Europe/Amsterdam', location: 'Netherlands' },
    'ROTTERDAM': { timezone: 'Europe/Amsterdam', location: 'Rotterdam, Netherlands' },
    'EGYPT': { timezone: 'Africa/Cairo', location: 'Egypt' },
    'NEWGIZA': { timezone: 'Africa/Cairo', location: 'New Giza, Egypt' },
    'FINLAND': { timezone: 'Europe/Helsinki', location: 'Finland' },
    'VENEZUELA': { timezone: 'America/Caracas', location: 'Venezuela' },
    'PUERTO CABELLO': { timezone: 'America/Caracas', location: 'Puerto Cabello, Venezuela' },
    'PARAGUAY': { timezone: 'America/Asuncion', location: 'Paraguay' },
    'ASUNCION': { timezone: 'America/Asuncion', location: 'Asuncion, Paraguay' }
};

export function convertMatchTime(time: string, timezone: string): { local: string, yours: string } {
    if (!time || !timezone) return { local: time, yours: '' };

    try {
        const now = new Date();
        const [hours, minutes] = time.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes)) return { local: time, yours: '' };

        // Helper to get offset in minutes for a timezone
        const getOffset = (tz: string) => {
            const date = new Date();
            const str = date.toLocaleString('en-US', { timeZone: tz, timeZoneName: 'longOffset' });
            const match = str.match(/GMT([+-]\d{2}):?(\d{2})?/);
            if (!match) return 0;
            const h = parseInt(match[1], 10);
            const m = match[2] ? parseInt(match[2], 10) : 0;
            return h * 60 + (h < 0 ? -m : m);
        };

        const tournamentOffset = getOffset(timezone);
        const userOffset = -now.getTimezoneOffset(); // User's local offset in minutes

        // If offsets are same (within 1 min), no need to show "Yours"
        if (Math.abs(tournamentOffset - userOffset) < 1) {
            return { local: time, yours: '' };
        }

        const diffMinutes = userOffset - tournamentOffset;

        const matchDate = new Date();
        matchDate.setHours(hours, minutes, 0, 0);
        matchDate.setMinutes(matchDate.getMinutes() + diffMinutes);

        const yours = matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        return { local: time, yours };
    } catch (e) {
        console.error('Error converting time', e);
        return { local: time, yours: '' };
    }
}

export function addMinutes(timeStr: string, minutesToAdd: number): string {
    try {
        // Normalize whitespace
        timeStr = timeStr.trim();
        const match = timeStr.match(/(\d{1,2}):(\d{2})(\s*(?:AM|PM))?/i);
        if (!match) return timeStr;

        let hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const period = match[3] ? match[3].trim().toUpperCase() : null;

        if (period) {
            if (period === 'PM' && hours !== 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
        }

        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        date.setMinutes(date.getMinutes() + minutesToAdd);

        let newHours = date.getHours();
        const newMinutes = date.getMinutes();

        // Return in AM/PM format for consistency with UI
        const newPeriod = newHours >= 12 ? 'PM' : 'AM';
        if (newHours > 12) newHours -= 12;
        if (newHours === 0) newHours = 12;

        return `${newHours}:${newMinutes.toString().padStart(2, '0')} ${newPeriod}`;
    } catch (e) {
        return timeStr;
    }
}
