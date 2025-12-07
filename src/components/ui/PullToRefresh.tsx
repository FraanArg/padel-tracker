'use client';

import { useState, useRef, ReactNode, useCallback } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
    children: ReactNode;
    onRefresh: () => Promise<void>;
    threshold?: number;
    refreshingContent?: ReactNode;
}

export default function PullToRefresh({
    children,
    onRefresh,
    threshold = 80,
    refreshingContent
}: PullToRefreshProps) {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const touchStartY = useRef(0);
    const isAtTop = useRef(true);

    const y = useMotionValue(0);
    const opacity = useTransform(y, [0, threshold], [0, 1]);
    const rotate = useTransform(y, [0, threshold], [0, 360]);
    const scale = useTransform(y, [0, threshold / 2, threshold], [0.5, 0.8, 1]);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (containerRef.current) {
            isAtTop.current = containerRef.current.scrollTop <= 0;
            touchStartY.current = e.touches[0].clientY;
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isAtTop.current || isRefreshing) return;

        const currentY = e.touches[0].clientY;
        const diff = currentY - touchStartY.current;

        if (diff > 0) {
            // Apply resistance
            const resistance = 0.5;
            const distance = Math.min(diff * resistance, threshold * 1.5);
            setPullDistance(distance);
            y.set(distance);
        }
    };

    const handleTouchEnd = async () => {
        if (pullDistance >= threshold && !isRefreshing) {
            setIsRefreshing(true);

            // Haptic feedback
            if ('vibrate' in navigator) {
                navigator.vibrate(20);
            }

            try {
                await onRefresh();
            } finally {
                setIsRefreshing(false);
            }
        }

        setPullDistance(0);
        y.set(0);
    };

    const progress = Math.min(pullDistance / threshold, 1);

    return (
        <div
            ref={containerRef}
            className="relative overflow-auto h-full"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Pull indicator */}
            <motion.div
                className="absolute left-0 right-0 flex items-center justify-center z-10 pointer-events-none"
                style={{
                    top: -60,
                    y,
                    opacity
                }}
            >
                <motion.div
                    className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        ${isRefreshing
                            ? 'bg-blue-500'
                            : progress >= 1
                                ? 'bg-green-500'
                                : 'bg-slate-200 dark:bg-slate-700'}
                        transition-colors
                    `}
                    style={{ scale }}
                >
                    {isRefreshing ? (
                        refreshingContent || (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            >
                                <RefreshCw className="w-5 h-5 text-white" />
                            </motion.div>
                        )
                    ) : (
                        <motion.div style={{ rotate }}>
                            <RefreshCw
                                className={`w-5 h-5 ${progress >= 1 ? 'text-white' : 'text-slate-500'
                                    }`}
                            />
                        </motion.div>
                    )}
                </motion.div>
            </motion.div>

            {/* Progress ring */}
            {pullDistance > 0 && !isRefreshing && (
                <div className="absolute left-1/2 -translate-x-1/2 z-10" style={{ top: pullDistance - 40 }}>
                    <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
                        <circle
                            cx="20"
                            cy="20"
                            r="16"
                            fill="none"
                            stroke="rgba(0,0,0,0.1)"
                            strokeWidth="3"
                        />
                        <circle
                            cx="20"
                            cy="20"
                            r="16"
                            fill="none"
                            stroke={progress >= 1 ? '#22c55e' : '#3b82f6'}
                            strokeWidth="3"
                            strokeDasharray={`${progress * 100} 100`}
                            strokeLinecap="round"
                            className="transition-all"
                        />
                    </svg>
                </div>
            )}

            {/* Content */}
            <motion.div
                style={{
                    transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : 'none',
                    transition: pullDistance === 0 ? 'transform 0.3s ease-out' : 'none'
                }}
            >
                {children}
            </motion.div>
        </div>
    );
}
