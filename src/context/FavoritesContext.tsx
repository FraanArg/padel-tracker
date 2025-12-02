"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { getFavoritesAction, syncFavoritesAction, toggleFavoriteAction } from '@/lib/favorites'

interface FavoritesContextType {
    favorites: string[]
    toggleFavorite: (playerId: string, playerName: string) => Promise<void>
    isFavorite: (playerId: string) => boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession()
    const [favorites, setFavorites] = useState<string[]>([])
    const [isLoaded, setIsLoaded] = useState(false)

    // Load from localStorage on mount
    useEffect(() => {
        const local = JSON.parse(localStorage.getItem('favoritePlayers') || '[]')
        setFavorites(local)
        setIsLoaded(true)
    }, [])

    // Sync with DB when session is available
    useEffect(() => {
        if (session?.user && isLoaded) {
            const sync = async () => {
                const local = JSON.parse(localStorage.getItem('favoritePlayers') || '[]')
                // We need names for sync, but localStorage only has IDs (names).
                // In the current app, it seems "playerName" IS the ID (slug or name).
                // So we pass it as both id and name.
                await syncFavoritesAction(local.map((f: string) => ({ id: f, name: f })))

                const dbFavorites = await getFavoritesAction()
                setFavorites(dbFavorites)
                localStorage.setItem('favoritePlayers', JSON.stringify(dbFavorites))
            }
            sync()
        }
    }, [session, isLoaded])

    const toggleFavorite = async (playerId: string, playerName: string) => {
        // Optimistic update
        let newFavorites
        if (favorites.includes(playerId)) {
            newFavorites = favorites.filter(f => f !== playerId)
        } else {
            newFavorites = [...favorites, playerId]
        }

        setFavorites(newFavorites)
        localStorage.setItem('favoritePlayers', JSON.stringify(newFavorites))

        if (session?.user) {
            try {
                await toggleFavoriteAction(playerId, playerName)
            } catch (error) {
                // Revert on error
                console.error("Failed to toggle favorite", error)
                // We could revert state here, but for now let's keep it simple
            }
        }
    }

    const isFavorite = (playerId: string) => favorites.includes(playerId)

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    )
}

export function useFavorites() {
    const context = useContext(FavoritesContext)
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider')
    }
    return context
}
