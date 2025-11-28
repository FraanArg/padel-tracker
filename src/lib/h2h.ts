import { getAllMatches, getPlayerExtendedProfile, Match, TournamentResult } from './padel';
import axios from 'axios';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function checkUrl(url: string) {
    try {
        const res = await axios.head(url, {
            headers: { 'User-Agent': USER_AGENT },
            validateStatus: () => true,
            timeout: 3000 // Short timeout for checking
        });
        return res.status === 200;
    } catch (e) {
        return false;
    }
}

async function guessTournamentUrl(name: string, dateStr: string): Promise<string | null> {
    const slugBase = name.toLowerCase().replace(/\s+/g, '-');
    // dateStr is DD/MM/YYYY
    const parts = dateStr.split('/');
    const year = parts.length === 3 ? parts[2] : new Date().getFullYear().toString();

    const candidates = [
        `https://www.padelfip.com/events/${slugBase}-${year}/`,
        `https://www.padelfip.com/events/${slugBase}/`,
        `https://www.padelfip.com/events/${slugBase}-premier-padel-${year}/`,
        `https://www.padelfip.com/events/${slugBase}-premier-padel-p1-${year}/`,
        `https://www.padelfip.com/events/${slugBase}-major-${year}/`,
        `https://www.padelfip.com/events/${slugBase}-p1-${year}/`,
        `https://www.padelfip.com/events/${slugBase}-p2-${year}/`
    ];

    for (const url of candidates) {
        if (await checkUrl(url)) {
            return url;
        }
    }
    return null;
}

export async function findH2HMatches(team1: string[], team2: string[]) {
    try {
        // 1. Fetch profiles for all players
        const allPlayers = [...team1, ...team2];
        const profiles = await Promise.all(allPlayers.map(name => getPlayerExtendedProfile(name)));

        // Filter out nulls
        const validProfiles = profiles.filter(p => p !== null);
        if (validProfiles.length < 2) return [];

        // 2. Collect all tournaments for each team
        // A tournament is "played by team" if BOTH players have it in their recent results
        // Actually, simpler: just collect ALL tournaments from ALL players and count occurrences?
        // No, we want tournaments where Team 1 played AND Team 2 played.

        // Let's get the set of tournaments for Team 1
        // Assuming Team 1 is profiles[0] and profiles[1] (if doubles)
        const t1Profiles = profiles.slice(0, team1.length).filter(p => p !== null);
        const t2Profiles = profiles.slice(team1.length).filter(p => p !== null);

        if (t1Profiles.length === 0 || t2Profiles.length === 0) return [];

        const getTeamTournaments = (teamProfiles: any[]) => {
            if (teamProfiles.length === 0) return [];
            // If single player, just return their results
            if (teamProfiles.length === 1) return teamProfiles[0].recentResults || [];

            // If doubles, find intersection of tournaments (Name + Date)
            const p1Results = teamProfiles[0].recentResults || [];
            const p2Results = teamProfiles[1].recentResults || [];

            return p1Results.filter((r1: TournamentResult) =>
                p2Results.some((r2: TournamentResult) => r2.tournament === r1.tournament && r2.date === r1.date)
            );
        };

        const t1Tournaments = getTeamTournaments(t1Profiles);
        const t2Tournaments = getTeamTournaments(t2Profiles);

        // 3. Find common tournaments between Team 1 and Team 2
        const commonTournaments = t1Tournaments.filter((r1: TournamentResult) =>
            t2Tournaments.some((r2: TournamentResult) => r2.tournament === r1.tournament && r2.date === r1.date)
        );

        // Deduplicate common tournaments
        const uniqueCommon = commonTournaments.filter((v: TournamentResult, i: number, a: TournamentResult[]) =>
            a.findIndex((t: TournamentResult) => t.tournament === v.tournament && t.date === v.date) === i
        );

        console.log(`Found ${uniqueCommon.length} common tournaments`);

        // 4. For each common tournament, fetch matches and look for H2H
        // Limit to last 5 common tournaments to save time
        const recentCommon = uniqueCommon.slice(0, 5);

        const h2hMatches: Match[] = [];

        for (const t of recentCommon) {
            const url = await guessTournamentUrl(t.tournament, t.date);
            if (url) {
                console.log(`Checking ${t.tournament} at ${url}`);
                const { matches } = await getAllMatches(url);

                // Find match between Team 1 and Team 2
                // We need to be loose with name matching
                const targetMatch = matches.find((m: Match | undefined) => {
                    if (!m || !m.team1 || !m.team2) return false;

                    // Check if Team 1 is m.team1 AND Team 2 is m.team2
                    // OR Team 1 is m.team2 AND Team 2 is m.team1

                    const checkTeam = (matchTeam: string[], targetTeam: string[]) => {
                        // All target players must be in match team (fuzzy match)
                        return targetTeam.every(targetP =>
                            matchTeam.some(matchP => matchP.toLowerCase().includes(targetP.toLowerCase()) || targetP.toLowerCase().includes(matchP.toLowerCase()))
                        );
                    };

                    const t1VsT1 = checkTeam(m.team1, team1);
                    const t2VsT2 = checkTeam(m.team2, team2);

                    if (t1VsT1 && t2VsT2) return true;

                    const t1VsT2 = checkTeam(m.team2, team1);
                    const t2VsT1 = checkTeam(m.team1, team2);

                    if (t1VsT2 && t2VsT1) return true;

                    return false;
                });

                if (targetMatch) {
                    h2hMatches.push({
                        ...targetMatch,
                        tournament: { name: t.tournament }
                    });
                }
            }
        }

        return h2hMatches;

    } catch (error) {
        console.error('Error finding H2H matches:', error);
        return [];
    }
}
