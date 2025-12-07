import { getPlayerStats, getHeadToHead, PlayerStats } from './stats';

export interface PredictionResult {
    team1WinProbability: number;
    team2WinProbability: number;
    confidence: 'low' | 'medium' | 'high';
    factors: {
        h2h: { team1: number; team2: number; weight: number };
        ranking: { team1: number; team2: number; weight: number };
        form: { team1: number; team2: number; weight: number };
        clutch: { team1: number; team2: number; weight: number };
    };
    insight: string;
}

interface TeamData {
    players: string[];
    avgRank?: number;
    recentWinRate?: number;
    clutchScore?: number;
}

export async function predictMatch(
    team1: string[],
    team2: string[],
    team1Rank?: number,
    team2Rank?: number
): Promise<PredictionResult> {
    // Default weights
    const weights = {
        h2h: 0.35,
        ranking: 0.25,
        form: 0.25,
        clutch: 0.15
    };

    // Initialize scores (0.5 = neutral)
    let team1Score = 0.5;
    let team2Score = 0.5;

    const factors: PredictionResult['factors'] = {
        h2h: { team1: 0.5, team2: 0.5, weight: weights.h2h },
        ranking: { team1: 0.5, team2: 0.5, weight: weights.ranking },
        form: { team1: 0.5, team2: 0.5, weight: weights.form },
        clutch: { team1: 0.5, team2: 0.5, weight: weights.clutch }
    };

    let dataPoints = 0;
    let insight = '';

    try {
        // 1. H2H Factor
        const h2h = await getHeadToHead(team1, team2);
        if (h2h.totalMatches > 0) {
            const team1H2HRate = h2h.team1Wins / h2h.totalMatches;
            const team2H2HRate = h2h.team2Wins / h2h.totalMatches;
            factors.h2h.team1 = team1H2HRate;
            factors.h2h.team2 = team2H2HRate;
            dataPoints++;

            if (h2h.totalMatches >= 5) {
                if (team1H2HRate > 0.6) {
                    insight = `Dominated H2H with ${h2h.team1Wins}-${h2h.team2Wins} record`;
                } else if (team2H2HRate > 0.6) {
                    insight = `Opponent leads H2H ${h2h.team2Wins}-${h2h.team1Wins}`;
                } else {
                    insight = 'Evenly matched rivalry';
                }
            }
        }

        // 2. Ranking Factor
        if (team1Rank && team2Rank) {
            // Lower rank = better
            const maxRank = Math.max(team1Rank, team2Rank);
            const minRank = Math.min(team1Rank, team2Rank);
            const rankDiff = maxRank - minRank;

            // Convert to 0-1 scale (higher = better for that team)
            const total = team1Rank + team2Rank;
            factors.ranking.team1 = team2Rank / total; // Inverse because lower rank is better
            factors.ranking.team2 = team1Rank / total;
            dataPoints++;

            if (rankDiff > 10 && !insight) {
                insight = rankDiff > 20
                    ? 'Significant ranking advantage'
                    : 'Slight ranking edge';
            }
        }

        // 3. Form Factor (recent win rate)
        const team1Stats = team1.length > 0 ? getPlayerStats(team1[0]) : null;
        const team2Stats = team2.length > 0 ? getPlayerStats(team2[0]) : null;

        if (team1Stats && team2Stats) {
            const team1WinRate = parseFloat(team1Stats.winRate) / 100;
            const team2WinRate = parseFloat(team2Stats.winRate) / 100;
            const totalWinRate = team1WinRate + team2WinRate;

            if (totalWinRate > 0) {
                factors.form.team1 = team1WinRate / totalWinRate;
                factors.form.team2 = team2WinRate / totalWinRate;
                dataPoints++;
            }

            // 4. Clutch Factor
            if (team1Stats.clutchStats && team2Stats.clutchStats) {
                const team1Clutch = team1Stats.clutchStats.clutchScore / 100;
                const team2Clutch = team2Stats.clutchStats.clutchScore / 100;
                const totalClutch = team1Clutch + team2Clutch;

                if (totalClutch > 0) {
                    factors.clutch.team1 = team1Clutch / totalClutch;
                    factors.clutch.team2 = team2Clutch / totalClutch;
                    dataPoints++;
                }

                if (Math.abs(team1Stats.clutchStats.clutchScore - team2Stats.clutchStats.clutchScore) > 20 && !insight) {
                    insight = 'Clutch performance could be decisive';
                }
            }
        }

        // Calculate weighted average
        team1Score =
            factors.h2h.team1 * weights.h2h +
            factors.ranking.team1 * weights.ranking +
            factors.form.team1 * weights.form +
            factors.clutch.team1 * weights.clutch;

        team2Score =
            factors.h2h.team2 * weights.h2h +
            factors.ranking.team2 * weights.ranking +
            factors.form.team2 * weights.form +
            factors.clutch.team2 * weights.clutch;

        // Normalize to probabilities
        const total = team1Score + team2Score;
        const team1Prob = Math.round((team1Score / total) * 100);
        const team2Prob = 100 - team1Prob;

        // Determine confidence based on data points
        let confidence: 'low' | 'medium' | 'high' = 'low';
        if (dataPoints >= 4) confidence = 'high';
        else if (dataPoints >= 2) confidence = 'medium';

        if (!insight) {
            insight = team1Prob > 55
                ? 'Slight favorite based on available data'
                : team2Prob > 55
                    ? 'Underdog role, but competitive match expected'
                    : 'Close match expected';
        }

        return {
            team1WinProbability: team1Prob,
            team2WinProbability: team2Prob,
            confidence,
            factors,
            insight
        };

    } catch (error) {
        console.error('Prediction error:', error);
        return {
            team1WinProbability: 50,
            team2WinProbability: 50,
            confidence: 'low',
            factors,
            insight: 'Insufficient data for prediction'
        };
    }
}
