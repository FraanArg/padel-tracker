'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import clsx from 'clsx';

interface FavoriteButtonProps {
    playerName: string;
}

export default function FavoriteButton({ playerName }: FavoriteButtonProps) {
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const favorites = JSON.parse(localStorage.getItem('favoritePlayers') || '[]');
        setIsFavorite(favorites.includes(playerName));
    }, [playerName]);

    const toggleFavorite = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const favorites = JSON.parse(localStorage.getItem('favoritePlayers') || '[]');
        let newFavorites;

        if (favorites.includes(playerName)) {
            newFavorites = favorites.filter((p: string) => p !== playerName);
        } else {
            newFavorites = [...favorites, playerName];
        }

        localStorage.setItem('favoritePlayers', JSON.stringify(newFavorites));
        setIsFavorite(!isFavorite);
    };

    return (
        <button
            onClick={toggleFavorite}
            className={clsx(
                "p-1.5 rounded-full transition-all",
                isFavorite
                    ? "text-red-500 bg-red-50 dark:bg-red-500/10"
                    : "text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-white/10"
            )}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
            <Heart className={clsx("w-5 h-5", isFavorite && "fill-current")} />
        </button>
    );
}
