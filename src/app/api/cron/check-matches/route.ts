import { prisma } from "@/lib/prisma"
import { sendNotification } from "@/lib/notifications"
import { getTournaments, getMatches, Match } from "@/lib/padel"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

interface MatchNotification {
    playerId: string;
    matchInfo: string;
    tournament: string;
}

export async function GET(req: Request) {
    try {
        // Verify cron secret in production
        const authHeader = req.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            // Allow in development
            if (process.env.NODE_ENV === 'production') {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        // Get all users with push subscriptions and their favorites
        const subscriptions = await prisma.pushSubscription.findMany({
            include: {
                user: {
                    include: {
                        favorites: true
                    }
                }
            }
        });

        if (subscriptions.length === 0) {
            return NextResponse.json({ message: 'No subscriptions to notify' });
        }

        // Get current live matches
        let liveMatches: Match[] = [];
        try {
            const tournaments = await getTournaments();
            const activeTournament = tournaments.find(t => {
                if (!t.dateStart || !t.dateEnd) return false;
                const now = new Date();
                const start = new Date(t.dateStart);
                const end = new Date(t.dateEnd);
                return now >= start && now <= end;
            });

            if (activeTournament) {
                liveMatches = await getMatches(activeTournament.id);
            }
        } catch (e) {
            console.error('Failed to fetch live matches:', e);
        }

        // Track sent notifications to avoid duplicates
        const notificationsSent: { userId: string; matchId: string }[] = [];
        const today = new Date().toISOString().split('T')[0];

        for (const sub of subscriptions) {
            if (!sub.user || !sub.user.favorites || sub.user.favorites.length === 0) continue;

            const favoritePlayerIds = sub.user.favorites.map(f => f.playerId);

            // Find matches involving favorite players
            for (const match of liveMatches) {
                if (!match.team1 || !match.team2) continue;

                const allPlayers = [...match.team1, ...match.team2];
                const favoriteInMatch = allPlayers.find(player =>
                    favoritePlayerIds.some(fav =>
                        player.toLowerCase().includes(fav.toLowerCase()) ||
                        fav.toLowerCase().includes(player.toLowerCase())
                    )
                );

                if (!favoriteInMatch) continue;

                // Check if already notified today
                const matchId = `${match.team1.join('-')}-vs-${match.team2.join('-')}`;
                const alreadyNotified = await prisma.notificationLog.findFirst({
                    where: {
                        userId: sub.userId,
                        matchId: matchId,
                        sentAt: {
                            gte: new Date(today)
                        }
                    }
                });

                if (alreadyNotified) continue;

                // Send notification
                try {
                    await sendNotification(
                        {
                            endpoint: sub.endpoint,
                            p256dh: sub.p256dh,
                            auth: sub.auth
                        },
                        {
                            title: `🎾 ${favoriteInMatch} is playing!`,
                            body: `${match.team1.join(' / ')} vs ${match.team2.join(' / ')} - ${match.round || 'Match'}`,
                            url: '/'
                        }
                    );

                    // Log notification
                    await prisma.notificationLog.create({
                        data: {
                            userId: sub.userId,
                            matchId: matchId
                        }
                    });

                    notificationsSent.push({ userId: sub.userId, matchId });
                } catch (e) {
                    console.error('Failed to send notification:', e);
                }
            }
        }

        return NextResponse.json({
            message: 'Cron job completed',
            notificationsSent: notificationsSent.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Cron job error:', error);
        return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
    }
}
