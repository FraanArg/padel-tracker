'use client';

import { ReactNode } from 'react';

interface StickyHeaderProps {
    children: ReactNode;
    className?: string;
    blur?: boolean;
    border?: boolean;
}

export default function StickyHeader({
    children,
    className = '',
    blur = true,
    border = true
}: StickyHeaderProps) {
    return (
        <div
            className={`
                sticky top-14 z-40
                py-3 -mx-4 px-4
                ${blur ? 'bg-slate-50/80 dark:bg-[#121212]/80 backdrop-blur-xl' : 'bg-slate-50 dark:bg-[#121212]'}
                ${border ? 'border-b border-slate-200/50 dark:border-white/5' : ''}
                transition-all duration-200
                ${className}
            `}
        >
            {children}
        </div>
    );
}
