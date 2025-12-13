'use client';

import { motion } from 'framer-motion';

interface LiveBadgeProps {
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'subtle' | 'outline';
    pulse?: boolean;
    className?: string;
}

export default function LiveBadge({
    size = 'md',
    variant = 'default',
    pulse = true,
    className = ''
}: LiveBadgeProps) {
    const sizeClasses = {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm'
    };

    const dotSizes = {
        sm: 'w-1.5 h-1.5',
        md: 'w-2 h-2',
        lg: 'w-2.5 h-2.5'
    };

    const variantClasses = {
        default: 'bg-[var(--color-live)] text-white border-transparent',
        subtle: 'bg-[var(--color-live-bg)] text-[var(--color-live)] border-[var(--color-live)]/20',
        outline: 'bg-transparent text-[var(--color-live)] border-[var(--color-live)]'
    };

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`
                inline-flex items-center gap-1.5
                ${sizeClasses[size]}
                ${variantClasses[variant]}
                rounded-full border font-bold uppercase tracking-wider
                ${className}
            `}
        >
            {/* Pulsing dot */}
            <span className="relative flex">
                {pulse && (
                    <span
                        className={`
                            absolute inline-flex h-full w-full rounded-full 
                            ${variant === 'default' ? 'bg-white' : 'bg-[var(--color-live)]'}
                            opacity-75 animate-ping
                        `}
                    />
                )}
                <span
                    className={`
                        relative inline-flex rounded-full 
                        ${dotSizes[size]}
                        ${variant === 'default' ? 'bg-white' : 'bg-[var(--color-live)]'}
                    `}
                />
            </span>
            <span>Live</span>
        </motion.div>
    );
}
