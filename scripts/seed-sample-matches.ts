/**
 * Seed sample match data for Premier Padel tournaments
 * Uses realistic player names and match results
 */

import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'tournaments');

// Top men's players
const MEN_PLAYERS = [
    'Arturo Coello', 'Agustin Tapia', 'Juan Lebron', 'Alejandro Galan',
    'Federico Chingotto', 'Alejandro Ruiz', 'Fernando Belasteguin', 'Sanyo Gutierrez',
    'Franco Stupaczuk', 'Martin Di Nenno', 'Paquito Navarro', 'Jorge Nieto',
    'Mike Yanguas', 'Coki Nieto', 'Javi Garrido', 'Lucas Bergamini',
    'Francisco Gil', 'Miguel Lamperti', 'Francisco Navarro', 'Alex Arroyo'
];

// Top women's players
const WOMEN_PLAYERS = [
    'Gemma Triay', 'Claudia Fernandez', 'Ari Sanchez', 'Paula Josemaria',
    'Delfi Brea', 'Beatriz Gonzalez', 'Marta Marrero', 'Marta Ortega',
    'Lucia Sainz', 'Patty Llaguno', 'Virginia Riera', 'Sofia Arauxo',
    'Tamara Icardo', 'Veronica Virseda', 'Carolina Navarro', 'Cata Tenorio'
];

const ROUNDS = ['Round of 32', 'Round of 16', 'Quarter Final', 'Semi Final', 'Final'];

interface Match {
    raw: string;
    team1: string[];
    team2: string[];
    score: string[];
    round: string;
    category: string;
    status: string;
    court?: string;
}

function generateScore(): string[] {
    const scores = [];
    let t1Sets = 0, t2Sets = 0;

    while (t1Sets < 2 && t2Sets < 2) {
        const t1Games = Math.floor(Math.random() * 3) + 5; // 5-7
        const t2Games = t1Games === 7 ? Math.floor(Math.random() * 2) + 5 : // 5-6 if t1 wins 7
            t1Games === 6 ? Math.floor(Math.random() * 5) : // 0-4 if t1 wins 6
                Math.floor(Math.random() * 3) + 5; // 5-7 if close

        if (t1Games > t2Games) t1Sets++;
        else t2Sets++;

        scores.push(`${t1Games}-${t2Games}`);
    }

    return scores;
}

function createTeam(players: string[], usedPlayers: Set<string>): string[] {
    const available = players.filter(p => !usedPlayers.has(p));
    if (available.length < 2) return [];

    const p1 = available[Math.floor(Math.random() * available.length)];
    usedPlayers.add(p1);
    const remaining = available.filter(p => p !== p1);
    const p2 = remaining[Math.floor(Math.random() * remaining.length)];
    usedPlayers.add(p2);

    return [p1, p2];
}

function generateMatches(category: string): Match[] {
    const players = category === 'Men' ? MEN_PLAYERS : WOMEN_PLAYERS;
    const matches: Match[] = [];

    // Create bracket
    const usedPlayers = new Set<string>();
    const teams: string[][] = [];

    // Create 8 teams for a quarter-final bracket
    for (let i = 0; i < 8; i++) {
        const team = createTeam(players, usedPlayers);
        if (team.length === 2) teams.push(team);
    }

    if (teams.length < 8) return matches;

    // Quarter Finals (4 matches)
    const qfWinners: string[][] = [];
    for (let i = 0; i < 4; i++) {
        const t1 = teams[i * 2];
        const t2 = teams[i * 2 + 1];
        const score = generateScore();
        const t1Wins = score.filter(s => parseInt(s[0]) > parseInt(s[2])).length >= 2;

        matches.push({
            raw: `${t1.join('/')} vs ${t2.join('/')} ${score.join(' ')}`,
            team1: t1,
            team2: t2,
            score,
            round: 'Quarter Final',
            category,
            status: 'finished',
            court: `Court ${i + 1}`
        });

        qfWinners.push(t1Wins ? t1 : t2);
    }

    // Semi Finals (2 matches)
    const sfWinners: string[][] = [];
    for (let i = 0; i < 2; i++) {
        const t1 = qfWinners[i * 2];
        const t2 = qfWinners[i * 2 + 1];
        const score = generateScore();
        const t1Wins = score.filter(s => parseInt(s[0]) > parseInt(s[2])).length >= 2;

        matches.push({
            raw: `${t1.join('/')} vs ${t2.join('/')} ${score.join(' ')}`,
            team1: t1,
            team2: t2,
            score,
            round: 'Semi Final',
            category,
            status: 'finished',
            court: 'Center Court'
        });

        sfWinners.push(t1Wins ? t1 : t2);
    }

    // Final
    const t1 = sfWinners[0];
    const t2 = sfWinners[1];
    const finalScore = generateScore();

    matches.push({
        raw: `${t1.join('/')} vs ${t2.join('/')} ${finalScore.join(' ')}`,
        team1: t1,
        team2: t2,
        score: finalScore,
        round: 'Final',
        category,
        status: 'finished',
        court: 'Center Court'
    });

    return matches;
}

function saveTournament(id: string, name: string, year: number) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const filename = `${slug}-${year}.json`;
    const filePath = path.join(DATA_DIR, filename);

    // Check if already has data
    if (fs.existsSync(filePath)) {
        try {
            const existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            if (existing.matches && existing.matches.length > 5) {
                console.log(`⏭️  Skip ${name} (already has ${existing.matches.length} matches)`);
                return existing.matches.length;
            }
        } catch (e) { }
    }

    // Generate matches for both categories
    const menMatches = generateMatches('Men');
    const womenMatches = generateMatches('Women');
    const allMatches = [...menMatches, ...womenMatches];

    const data = {
        id,
        name,
        year,
        matches: allMatches,
        archivedAt: new Date().toISOString()
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`✅ ${name}: ${allMatches.length} matches`);
    return allMatches.length;
}

// Tournaments to populate
const TOURNAMENTS = [
    // 2024
    { id: 'qatar-major-2024', name: 'Qatar Major', year: 2024 },
    { id: 'acapulco-major-2024', name: 'Acapulco Major', year: 2024 },
    { id: 'italy-major-2024', name: 'Italy Major', year: 2024 },
    { id: 'paris-major-2024', name: 'Paris Major', year: 2024 },
    { id: 'mexico-major-2024', name: 'Mexico Major', year: 2024 },
    { id: 'madrid-p1-2024', name: 'Madrid P1', year: 2024 },
    { id: 'argentina-p1-2024', name: 'Argentina P1', year: 2024 },
    { id: 'rotterdam-p1-2024', name: 'Rotterdam P1', year: 2024 },
    { id: 'milano-p1-2024', name: 'Milano P1', year: 2024 },
    { id: 'kuwait-p1-2024', name: 'Kuwait P1', year: 2024 },
    { id: 'dubai-p1-2024', name: 'Dubai P1', year: 2024 },
    { id: 'malaga-p1-2024', name: 'Malaga P1', year: 2024 },
    { id: 'sevilla-p2-2024', name: 'Sevilla P2', year: 2024 },
    { id: 'brussels-p2-2024', name: 'Brussels P2', year: 2024 },
    { id: 'bordeaux-p2-2024', name: 'Bordeaux P2', year: 2024 },

    // 2023
    { id: 'qatar-major-2023', name: 'Qatar Major', year: 2023 },
    { id: 'italy-major-2023', name: 'Italy Major', year: 2023 },
    { id: 'paris-major-2023', name: 'Paris Major', year: 2023 },
    { id: 'mexico-major-2023', name: 'Mexico Major', year: 2023 },
    { id: 'madrid-p1-2023', name: 'Madrid P1', year: 2023 },
    { id: 'mendoza-p1-2023', name: 'Mendoza P1', year: 2023 },
    { id: 'milano-p1-2023', name: 'Milano P1', year: 2023 },

    // 2022
    { id: 'qatar-major-2022', name: 'Qatar Major', year: 2022 },
    { id: 'italy-major-2022', name: 'Italy Major', year: 2022 },
    { id: 'paris-major-2022', name: 'Paris Major', year: 2022 },
    { id: 'mexico-major-2022', name: 'Mexico Major', year: 2022 },
    { id: 'madrid-p1-2022', name: 'Madrid P1', year: 2022 },
    { id: 'argentina-p1-2022', name: 'Argentina P1', year: 2022 },
];

async function main() {
    console.log('\n========================================');
    console.log('  Premier Padel Sample Data Generator');
    console.log('========================================\n');

    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    let total = 0;
    for (const t of TOURNAMENTS) {
        total += saveTournament(t.id, t.name, t.year);
    }

    console.log(`\n========================================`);
    console.log(`  Total: ${total} matches across ${TOURNAMENTS.length} tournaments`);
    console.log('========================================\n');
}

main().catch(console.error);
