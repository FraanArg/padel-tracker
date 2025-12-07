'use client';

import { useState, useRef, ReactNode } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';

interface SwipeableTabsProps {
    tabs: {
        id: string;
        label: string;
        content: ReactNode;
    }[];
    defaultTab?: string;
    onChange?: (tabId: string) => void;
}

// Haptic feedback utility
function triggerHaptic(style: 'light' | 'medium' | 'heavy' = 'light') {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        const duration = style === 'light' ? 10 : style === 'medium' ? 20 : 30;
        navigator.vibrate(duration);
    }
}

export default function SwipeableTabs({ tabs, defaultTab, onChange }: SwipeableTabsProps) {
    const [activeIndex, setActiveIndex] = useState(
        defaultTab ? tabs.findIndex(t => t.id === defaultTab) : 0
    );
    const containerRef = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const threshold = 50;
        const velocity = info.velocity.x;
        const offset = info.offset.x;

        if (offset < -threshold || velocity < -500) {
            // Swipe left - go to next tab
            if (activeIndex < tabs.length - 1) {
                triggerHaptic('medium');
                setActiveIndex(activeIndex + 1);
                onChange?.(tabs[activeIndex + 1].id);
            }
        } else if (offset > threshold || velocity > 500) {
            // Swipe right - go to previous tab
            if (activeIndex > 0) {
                triggerHaptic('medium');
                setActiveIndex(activeIndex - 1);
                onChange?.(tabs[activeIndex - 1].id);
            }
        }
    };

    const indicatorWidth = 100 / tabs.length;

    return (
        <div className="w-full overflow-hidden">
            {/* Tab Headers */}
            <div className="relative flex border-b border-slate-200 dark:border-white/10">
                {tabs.map((tab, index) => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            triggerHaptic('light');
                            setActiveIndex(index);
                            onChange?.(tab.id);
                        }}
                        className={`
                            flex-1 py-3 text-sm font-medium transition-colors
                            ${index === activeIndex
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}
                        `}
                    >
                        {tab.label}
                    </button>
                ))}

                {/* Sliding indicator */}
                <motion.div
                    className="absolute bottom-0 h-0.5 bg-blue-500"
                    initial={false}
                    animate={{
                        left: `${activeIndex * indicatorWidth}%`,
                        width: `${indicatorWidth}%`
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
            </div>

            {/* Tab Content with swipe */}
            <div ref={containerRef} className="overflow-hidden">
                <motion.div
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={handleDragEnd}
                    animate={{ x: `-${activeIndex * 100}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="flex"
                    style={{ x }}
                >
                    {tabs.map(tab => (
                        <div
                            key={tab.id}
                            className="w-full flex-shrink-0"
                            style={{ minWidth: '100%' }}
                        >
                            {tab.content}
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}

// Swipeable card for favorites
interface SwipeableCardProps {
    children: ReactNode;
    onSwipeRight?: () => void;
    onSwipeLeft?: () => void;
    rightAction?: { icon: ReactNode; label: string; color: string };
    leftAction?: { icon: ReactNode; label: string; color: string };
}

export function SwipeableCard({
    children,
    onSwipeRight,
    onSwipeLeft,
    rightAction = { icon: '❤️', label: 'Favorite', color: 'bg-red-500' },
    leftAction = { icon: '🗑️', label: 'Remove', color: 'bg-slate-500' }
}: SwipeableCardProps) {
    const x = useMotionValue(0);
    const opacity = useTransform(x, [-100, 0, 100], [1, 0, 1]);
    const rightBg = useTransform(x, [0, 100], ['transparent', rightAction.color]);
    const leftBg = useTransform(x, [-100, 0], [leftAction.color, 'transparent']);

    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const threshold = 80;

        if (info.offset.x > threshold && onSwipeRight) {
            triggerHaptic('heavy');
            onSwipeRight();
        } else if (info.offset.x < -threshold && onSwipeLeft) {
            triggerHaptic('heavy');
            onSwipeLeft();
        }
    };

    return (
        <div className="relative overflow-hidden rounded-xl">
            {/* Background actions */}
            <motion.div
                className="absolute inset-0 flex items-center justify-start px-4"
                style={{ backgroundColor: rightBg as any }}
            >
                <motion.div style={{ opacity }} className="text-white flex items-center gap-2">
                    <span>{rightAction.icon}</span>
                    <span className="text-sm font-medium">{rightAction.label}</span>
                </motion.div>
            </motion.div>

            <motion.div
                className="absolute inset-0 flex items-center justify-end px-4"
                style={{ backgroundColor: leftBg as any }}
            >
                <motion.div style={{ opacity }} className="text-white flex items-center gap-2">
                    <span className="text-sm font-medium">{leftAction.label}</span>
                    <span>{leftAction.icon}</span>
                </motion.div>
            </motion.div>

            {/* Card content */}
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.5}
                onDragEnd={handleDragEnd}
                style={{ x }}
                className="relative bg-white dark:bg-[#202020] cursor-grab active:cursor-grabbing"
            >
                {children}
            </motion.div>
        </div>
    );
}
