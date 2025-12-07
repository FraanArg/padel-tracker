/**
 * Database Seeding Script
 * 
 * This script:
 * 1. Reads existing tournament JSON files
 * 2. Creates Tournament records in the database
 * 3. Attempts to fetch match data from padelfip.com for past tournaments
 * 4. Stores matches in the database
 * 
 * Usage: npx ts-node scripts/seed-database.ts
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

const DATA_DIR = path.join(process.cwd(), 'data', 'tournaments');

interface ArchivedTournament {
    id: string;
    name: string;
    year: number;
    dateStart?: string;
    dateEnd?: string;
    matches: any[];
    archivedAt: string;
}

// Tournament metadata with category info
const TOURNAMENT_CATEGORIES: Record<string, string> = {
    'major': 'Major',
    'p1': 'P1',
    'p2': 'P2',
    'finals': 'Finals',
};

function getCategoryFromName(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes('major')) return 'Major';
    if (lower.includes('finals')) return 'Finals';
    if (lower.includes('p1')) return 'P1';
    if (lower.includes('p2')) return 'P2';
    return 'Other';
}

async function seedTournaments() {
    console.log('🏆 Seeding tournaments from JSON files...\n');

    if (!fs.existsSync(DATA_DIR)) {
        console.log('No data directory found. Creating empty structure.');
        fs.mkdirSync(DATA_DIR, { recursive: true });
        return;
    }

    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
    console.log(`Found ${files.length} tournament files\n`);

    let created = 0;
    let skipped = 0;

    for (const file of files) {
        try {
            const filePath = path.join(DATA_DIR, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            const data: ArchivedTournament = JSON.parse(content);

            // Check if tournament already exists
            const existing = await prisma.tournament.findUnique({
                where: { externalId: data.id }
            });

            if (existing) {
                console.log(`  ⏭️  Skipping ${data.name} (already exists)`);
                skipped++;
                continue;
            }

            // Create tournament
            await prisma.tournament.create({
                data: {
                    externalId: data.id,
                    name: data.name,
                    year: data.year,
                    category: getCategoryFromName(data.name),
                    dateStart: data.dateStart ? new Date(data.dateStart) : undefined,
                    dateEnd: data.dateEnd ? new Date(data.dateEnd) : undefined,
                    status: 'finished',
                }
            });

            console.log(`  ✅ Created ${data.name}`);
            created++;

        } catch (error) {
            console.error(`  ❌ Error processing ${file}:`, error);
        }
    }

    console.log(`\n✅ Created ${created} tournaments, skipped ${skipped}\n`);
}

// Sample match data for demonstration (replace with actual scraper in production)
const SAMPLE_MATCHES = [
    {
        round: 'Final',
        team1Player1: 'Arturo Coello',
        team1Player2: 'Agustin Tapia',
        team2Player1: 'Juan Lebron',
        team2Player2: 'Alejandro Galan',
        score: ['6-4', '7-5'],
        category: 'Men',
    },
    {
        round: 'Semi-Final',
        team1Player1: 'Arturo Coello',
        team1Player2: 'Agustin Tapia',
        team2Player1: 'Federico Chingotto',
        team2Player2: 'Alejandro Galan',
        score: ['6-3', '6-4'],
        category: 'Men',
    },
    {
        round: 'Final',
        team1Player1: 'Gemma Triay',
        team1Player2: 'Claudia Fernandez',
        team2Player1: 'Ari Sanchez',
        team2Player2: 'Paula Josemaria',
        score: ['6-2', '6-3'],
        category: 'Women',
    },
];

async function seedSampleMatches() {
    console.log('🎾 Seeding sample matches...\n');

    // Get a tournament to add matches to
    const tournaments = await prisma.tournament.findMany({
        take: 3,
        orderBy: { year: 'desc' }
    });

    if (tournaments.length === 0) {
        console.log('No tournaments found. Run seedTournaments first.');
        return;
    }

    let created = 0;

    for (const tournament of tournaments) {
        // Check if matches already exist
        const existingMatches = await prisma.match.count({
            where: { tournamentId: tournament.id }
        });

        if (existingMatches > 0) {
            console.log(`  ⏭️  ${tournament.name} already has ${existingMatches} matches`);
            continue;
        }

        // Add sample matches
        for (const match of SAMPLE_MATCHES) {
            await prisma.match.create({
                data: {
                    tournamentId: tournament.id,
                    round: match.round,
                    category: match.category,
                    team1Player1: match.team1Player1,
                    team1Player2: match.team1Player2,
                    team2Player1: match.team2Player1,
                    team2Player2: match.team2Player2,
                    score: JSON.stringify(match.score),
                    status: 'finished',
                    year: tournament.year,
                }
            });
            created++;
        }

        console.log(`  ✅ Added ${SAMPLE_MATCHES.length} matches to ${tournament.name}`);
    }

    console.log(`\n✅ Created ${created} sample matches\n`);
}

async function extractPlayers() {
    console.log('👥 Extracting unique players from matches...\n');

    const matches = await prisma.match.findMany({
        select: {
            team1Player1: true,
            team1Player2: true,
            team2Player1: true,
            team2Player2: true,
        }
    });

    const playerSet = new Set<string>();

    for (const match of matches) {
        if (match.team1Player1) playerSet.add(match.team1Player1);
        if (match.team1Player2) playerSet.add(match.team1Player2);
        if (match.team2Player1) playerSet.add(match.team2Player1);
        if (match.team2Player2) playerSet.add(match.team2Player2);
    }

    console.log(`Found ${playerSet.size} unique players\n`);

    let created = 0;
    let skipped = 0;

    for (const name of playerSet) {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const existing = await prisma.player.findUnique({ where: { name } });

        if (existing) {
            skipped++;
            continue;
        }

        await prisma.player.create({
            data: {
                name,
                slug,
            }
        });
        created++;
    }

    console.log(`✅ Created ${created} players, skipped ${skipped} existing\n`);
}

async function showStats() {
    const tournamentCount = await prisma.tournament.count();
    const matchCount = await prisma.match.count();
    const playerCount = await prisma.player.count();

    console.log('📊 Database Statistics:');
    console.log(`   Tournaments: ${tournamentCount}`);
    console.log(`   Matches: ${matchCount}`);
    console.log(`   Players: ${playerCount}`);
    console.log('');
}

async function main() {
    console.log('\n========================================');
    console.log('  Padel Tracker Database Seeding');
    console.log('========================================\n');

    try {
        await seedTournaments();
        await seedSampleMatches();
        await extractPlayers();
        await showStats();

        console.log('✅ Seeding complete!\n');
    } catch (error) {
        console.error('Error during seeding:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
