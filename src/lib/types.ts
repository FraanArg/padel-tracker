
export interface Tournament {
    name: string;
    url: string;
    imageUrl: string;
    id: string;
    dateStart?: string;
    dateEnd?: string;
    status?: 'live' | 'upcoming' | 'finished';
    month?: string;
    parsedDate?: Date;
}

export interface Player {
    name: string;
    rank?: number;
    points?: number;
    country?: string;
    matchesPlayed?: number;
    matchesWon?: number;
    winRate?: string;
    partner?: string;
    imageUrl?: string;
    profileUrl?: string;
}

export interface Match {
    raw: string;
    time?: string;
    timezone?: string;
    category?: string;
    round?: string;
    location?: string;
    court?: string;
    team1?: string[];
    team2?: string[];
    team1Flags?: string[];
    team2Flags?: string[];
    score?: string[];
    status?: string;
    team1Seed?: string;
    team2Seed?: string;
    tournament?: { name: string; dateStart?: string; dateEnd?: string; };
    nextMatch?: Match;
    id?: string;
    year?: string;
    tournamentId?: string;
    organization?: string;
}
