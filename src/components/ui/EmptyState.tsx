'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Search, Heart, Trophy, Calendar, AlertCircle } from 'lucide-react';

type EmptyStateType = 'favorites' | 'matches' | 'search' | 'tournament' | 'generic';

interface EmptyStateProps {
    type?: EmptyStateType;
    title?: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    children?: ReactNode;
}

const illustrations: Record<EmptyStateType, { icon: typeof Search; color: string }> = {
    favorites: { icon: Heart, color: 'text-red-400' },
    matches: { icon: Trophy, color: 'text-yellow-400' },
    search: { icon: Search, color: 'text-blue-400' },
    tournament: { icon: Calendar, color: 'text-purple-400' },
    generic: { icon: AlertCircle, color: 'text-slate-400' },
};

const defaults: Record<EmptyStateType, { title: string; description: string }> = {
    favorites: {
        title: 'No favorites yet',
        description: 'Start adding your favorite players and matches to keep track of them here.',
    },
    matches: {
        title: 'No matches today',
        description: 'Check back later or explore upcoming tournaments.',
    },
    search: {
        title: 'No results found',
        description: 'Try a different search term or browse players directly.',
    },
    tournament: {
        title: 'Tournament not started',
        description: 'This tournament hasn\'t begun yet. Check back when matches are scheduled.',
    },
    generic: {
        title: 'Nothing here',
        description: 'There\'s no content to display at the moment.',
    },
};

export default function EmptyState({
    type = 'generic',
    title,
    description,
    action,
    children
}: EmptyStateProps) {
    const { icon: Icon, color } = illustrations[type];
    const defaultContent = defaults[type];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-16 px-6 text-center"
        >
            {/* Animated Icon */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
                className="relative mb-6"
            >
                {/* Background circles */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-white/5 animate-pulse-soft" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-white/10" />
                </div>

                {/* Icon */}
                <div className="relative w-24 h-24 flex items-center justify-center">
                    <Icon className={`w-10 h-10 ${color}`} strokeWidth={1.5} />
                </div>
            </motion.div>

            {/* Title */}
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {title || defaultContent.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-6">
                {description || defaultContent.description}
            </p>

            {/* Action Button */}
            {action && (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={action.onClick}
                    className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors"
                >
                    {action.label}
                </motion.button>
            )}

            {/* Custom children */}
            {children}
        </motion.div>
    );
}
