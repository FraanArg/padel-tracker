'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LiveMatchScoreProps {
    team1Scores: string[];
    team2Scores: string[];
    isLive?: boolean;
    status?: string;
}

// Flip digit component for animated score changes
function FlipDigit({ value, prevValue }: { value: string; prevValue: string }) {
    const hasChanged = value !== prevValue;

    return (
        <div className="relative w-7 h-9 overflow-hidden">
            <AnimatePresence mode="popLayout">
                <motion.div
                    key={value}
                    initial={hasChanged ? { y: -40, opacity: 0 } : false}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 40, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="absolute inset-0 flex items-center justify-center bg-slate-900 dark:bg-slate-800 rounded-lg text-white font-mono text-lg font-bold"
                >
                    {value}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

// Set score with win/loss coloring
function SetScore({ score, isWinning, animate }: { score: string; isWinning: boolean; animate: boolean }) {
    return (
        <motion.div
            initial={animate ? { scale: 1.5, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            className={`
                w-8 h-10 flex items-center justify-center rounded-lg font-mono text-xl font-bold
                ${isWinning
                    ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400'
                    : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400'}
            `}
        >
            {score}
        </motion.div>
    );
}

// Momentum indicator (last 3 points visual)
function MomentumBar({ momentum }: { momentum: number }) {
    // momentum: -3 to 3, negative = team2 winning, positive = team1 winning
    const bars = [
        { team: 2, intensity: Math.min(3, Math.max(0, -momentum)) },
        { team: 1, intensity: Math.min(3, Math.max(0, momentum)) }
    ];

    return (
        <div className="flex items-center gap-1">
            {/* Team 2 momentum (left) */}
            <div className="flex gap-0.5">
                {[3, 2, 1].map(i => (
                    <motion.div
                        key={`t2-${i}`}
                        animate={{
                            opacity: i <= bars[0].intensity ? 1 : 0.2,
                            scale: i <= bars[0].intensity ? 1 : 0.8
                        }}
                        className="w-1.5 h-4 rounded-full bg-red-500"
                    />
                ))}
            </div>

            {/* Center divider */}
            <div className="w-px h-4 bg-slate-300 dark:bg-white/20 mx-1" />

            {/* Team 1 momentum (right) */}
            <div className="flex gap-0.5">
                {[1, 2, 3].map(i => (
                    <motion.div
                        key={`t1-${i}`}
                        animate={{
                            opacity: i <= bars[1].intensity ? 1 : 0.2,
                            scale: i <= bars[1].intensity ? 1 : 0.8
                        }}
                        className="w-1.5 h-4 rounded-full bg-green-500"
                    />
                ))}
            </div>
        </div>
    );
}

export default function LiveMatchScore({
    team1Scores,
    team2Scores,
    isLive = false,
    status
}: LiveMatchScoreProps) {
    const [prevScores, setPrevScores] = useState({ t1: team1Scores, t2: team2Scores });
    const [showCelebration, setShowCelebration] = useState(false);
    const [momentum, setMomentum] = useState(0);

    // Track score changes for animations
    useEffect(() => {
        const t1Changed = JSON.stringify(team1Scores) !== JSON.stringify(prevScores.t1);
        const t2Changed = JSON.stringify(team2Scores) !== JSON.stringify(prevScores.t2);

        if (t1Changed || t2Changed) {
            // Check if a set was just won
            const wasSetWon = team1Scores.length !== prevScores.t1.length ||
                team2Scores.length !== prevScores.t2.length;

            if (wasSetWon && isLive) {
                setShowCelebration(true);
                setTimeout(() => setShowCelebration(false), 2000);
            }

            // Update momentum (simulated - in real app would come from API)
            if (t1Changed) {
                setMomentum(m => Math.min(3, m + 1));
            } else if (t2Changed) {
                setMomentum(m => Math.max(-3, m - 1));
            }

            setPrevScores({ t1: team1Scores, t2: team2Scores });
        }
    }, [team1Scores, team2Scores, prevScores, isLive]);

    // Calculate who's winning each set
    const getSetResult = (t1: string, t2: string) => {
        const s1 = parseInt(t1) || 0;
        const s2 = parseInt(t2) || 0;
        return { t1Winning: s1 > s2, t2Winning: s2 > s1 };
    };

    return (
        <div className="relative">
            {/* Set Won Celebration */}
            <AnimatePresence>
                {showCelebration && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
                    >
                        <div className="px-4 py-2 bg-green-500 text-white font-bold rounded-full text-sm shadow-lg">
                            SET! 🎾
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-2">
                {/* Team 1 Score Row */}
                <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                        {team1Scores.map((score, i) => {
                            const result = getSetResult(score, team2Scores[i] || '0');
                            const scoreChanged = prevScores.t1[i] !== score;
                            return (
                                <SetScore
                                    key={i}
                                    score={score}
                                    isWinning={result.t1Winning}
                                    animate={scoreChanged}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* Momentum bar (only show for live matches) */}
                {isLive && (
                    <div className="flex items-center justify-center py-1">
                        <MomentumBar momentum={momentum} />
                    </div>
                )}

                {/* Team 2 Score Row */}
                <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                        {team2Scores.map((score, i) => {
                            const result = getSetResult(team1Scores[i] || '0', score);
                            const scoreChanged = prevScores.t2[i] !== score;
                            return (
                                <SetScore
                                    key={i}
                                    score={score}
                                    isWinning={result.t2Winning}
                                    animate={scoreChanged}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Live pulsing indicator */}
            {isLive && (
                <div className="absolute -top-1 -right-1">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                </div>
            )}
        </div>
    );
}
