'use client';
import { Heart } from 'lucide-react';
import clsx from 'clsx';
import { useFavorites } from '@/context/FavoritesContext';
import { useHaptic } from '@/hooks/useHaptic';

interface FavoriteButtonProps {
    playerName: string;
}

export default function FavoriteButton({ playerName }: FavoriteButtonProps) {
    const { isFavorite, toggleFavorite } = useFavorites();
    const { success } = useHaptic();
    const favorite = isFavorite(playerName);

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        success();
        toggleFavorite(playerName, playerName);
    };

    return (
        <button
            onClick={handleToggle}
            className={clsx(
                "p-1.5 rounded-full transition-all",
                favorite
                    ? "text-red-500 bg-red-50 dark:bg-red-500/10"
                    : "text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-white/10"
            )}
            title={favorite ? "Remove from favorites" : "Add to favorites"}
        >
            <Heart className={clsx("w-5 h-5", favorite && "fill-current")} />
        </button>
    );
}
