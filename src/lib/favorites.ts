"use server"

import { auth } from "@/auth"
import { prisma, isDatabaseAvailable } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function toggleFavoriteAction(playerId: string, playerName: string) {
    if (!isDatabaseAvailable || !prisma) {
        throw new Error("Database not available")
    }

    const session = await auth()
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    const userId = session.user.id

    const existing = await prisma.favorite.findUnique({
        where: {
            userId_playerId: {
                userId,
                playerId,
            },
        },
    })

    if (existing) {
        await prisma.favorite.delete({
            where: {
                id: existing.id,
            },
        })
        return { added: false }
    } else {
        await prisma.favorite.create({
            data: {
                userId,
                playerId,
                playerName,
            },
        })
        return { added: true }
    }
}

export async function getFavoritesAction() {
    if (!isDatabaseAvailable || !prisma) {
        return []
    }

    const session = await auth()
    if (!session?.user?.id) {
        return []
    }

    const favorites = await prisma.favorite.findMany({
        where: {
            userId: session.user.id,
        },
        select: {
            playerId: true,
        },
    })

    return favorites.map((f: { playerId: string }) => f.playerId)
}

export async function syncFavoritesAction(localFavorites: { id: string, name: string }[]) {
    if (!isDatabaseAvailable || !prisma) {
        return
    }

    const session = await auth()
    if (!session?.user?.id) {
        return
    }

    const userId = session.user.id

    // Get existing DB favorites to avoid duplicates
    const dbFavorites = await prisma.favorite.findMany({
        where: {
            userId,
        },
    })
    const dbIds = new Set(dbFavorites.map((f: { playerId: string }) => f.playerId))

    // Filter local favorites that are not in DB
    const newFavorites = localFavorites.filter(f => !dbIds.has(f.id))

    if (newFavorites.length > 0) {
        await prisma.favorite.createMany({
            data: newFavorites.map(f => ({
                userId,
                playerId: f.id,
                playerName: f.name,
            })),
        })
    }
}

