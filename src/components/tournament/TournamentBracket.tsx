'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Match } from '@/lib/types';
import { ZoomIn, ZoomOut, RotateCcw, User } from 'lucide-react';

interface TournamentBracketProps {
    matches: Match[];
}

export function TournamentBracket({ matches }: TournamentBracketProps) {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [highlightedPlayer, setHighlightedPlayer] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const dragStart = useRef({ x: 0, y: 0 });

    if (!matches || matches.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 dark:border-white/10">
                <div className="text-slate-400 mb-2">Draw not available</div>
                <p className="text-sm text-slate-500 max-w-xs">
                    Match data has not been populated for this tournament yet.
                </p>
            </div>
        );
    }

    // Group by Round
    const rounds: Record<string, Match[]> = {};
    const roundOrder = ['Final', 'Semi-Final', 'Quarter-Final', 'Round of 16', 'Round of 32', 'Round of 64'];

    matches.forEach(m => {
        if (!m.round) return;
        let r = m.round;
        // Normalize
        if (r.toLowerCase().includes('final') && !r.toLowerCase().includes('semi') && !r.toLowerCase().includes('quarter')) r = 'Final';
        else if (r.toLowerCase().includes('semi')) r = 'Semi-Final';
        else if (r.toLowerCase().includes('quarter')) r = 'Quarter-Final';

        if (!rounds[r]) rounds[r] = [];
        rounds[r].push(m);
    });

    // Filter to only existing rounds and sort (reverse for bracket layout)
    const activeRounds = roundOrder.filter(r => rounds[r] && rounds[r].length > 0).reverse();
    // Add any other rounds found
    Object.keys(rounds).forEach(r => {
        if (!activeRounds.includes(r)) activeRounds.push(r);
    });

    // Get all player names for highlighting
    const allPlayers = useMemo(() => {
        const players = new Set<string>();
        matches.forEach(m => {
            m.team1?.forEach(p => players.add(p));
            m.team2?.forEach(p => players.add(p));
        });
        return Array.from(players).sort();
    }, [matches]);

    // Check if a player is in a match
    const isPlayerInMatch = (match: Match, player: string) => {
        return match.team1?.includes(player) || match.team2?.includes(player);
    };

    // Zoom controls
    const handleZoomIn = () => setScale(s => Math.min(s + 0.2, 2));
    const handleZoomOut = () => setScale(s => Math.max(s - 0.2, 0.5));
    const handleReset = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
        setHighlightedPlayer(null);
    };

    // Mouse/touch drag handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.current.x,
            y: e.clientY - dragStart.current.y
        });
    };

    const handleMouseUp = () => setIsDragging(false);

    // Wheel zoom
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setScale(s => Math.max(0.5, Math.min(2, s + delta)));
    };

    return (
        <div className="relative">
            {/* Controls */}
            <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                <button
                    onClick={handleZoomIn}
                    className="p-2 bg-white dark:bg-[#202020] rounded-xl shadow-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors btn-interactive"
                    title="Zoom In"
                >
                    <ZoomIn className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
                <button
                    onClick={handleZoomOut}
                    className="p-2 bg-white dark:bg-[#202020] rounded-xl shadow-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors btn-interactive"
                    title="Zoom Out"
                >
                    <ZoomOut className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
                <button
                    onClick={handleReset}
                    className="p-2 bg-white dark:bg-[#202020] rounded-xl shadow-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors btn-interactive"
                    title="Reset View"
                >
                    <RotateCcw className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
            </div>

            {/* Player Selector */}
            <div className="mb-4 flex items-center gap-2 flex-wrap">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-500">Highlight player:</span>
                <select
                    value={highlightedPlayer || ''}
                    onChange={(e) => setHighlightedPlayer(e.target.value || null)}
                    className="text-sm px-3 py-1.5 bg-white dark:bg-[#202020] border border-slate-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    <option value="">None</option>
                    {allPlayers.map(player => (
                        <option key={player} value={player}>{player}</option>
                    ))}
                </select>
            </div>

            {/* Bracket Container */}
            <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 cursor-grab active:cursor-grabbing"
                style={{ height: '600px' }}
            >
                <motion.div
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transformOrigin: 'center center'
                    }}
                    className="min-w-max p-8"
                >
                    {/* Horizontal bracket layout */}
                    <div className="flex gap-8 items-center">
                        {activeRounds.map((round, roundIndex) => (
                            <div key={round} className="flex flex-col gap-4">
                                {/* Round header */}
                                <div className="text-center mb-2">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        {round}
                                    </span>
                                </div>

                                {/* Matches in this round */}
                                <div
                                    className="flex flex-col justify-around"
                                    style={{
                                        gap: `${Math.pow(2, roundIndex) * 20}px`,
                                        paddingTop: `${Math.pow(2, roundIndex) * 10}px`
                                    }}
                                >
                                    {rounds[round].map((m, i) => {
                                        const isHighlighted = highlightedPlayer && isPlayerInMatch(m, highlightedPlayer);
                                        const winner = determineWinner(m);

                                        return (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: roundIndex * 0.1 + i * 0.05 }}
                                                className={`
                                                    relative bg-white dark:bg-[#202020] p-3 rounded-xl border shadow-sm
                                                    min-w-[200px] transition-all duration-300
                                                    ${isHighlighted
                                                        ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-blue-500/20 shadow-lg'
                                                        : 'border-slate-100 dark:border-white/5'}
                                                `}
                                            >
                                                {/* Team 1 */}
                                                <div
                                                    className={`flex justify-between items-center py-1 px-2 rounded-lg mb-1 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${highlightedPlayer && m.team1?.includes(highlightedPlayer)
                                                            ? 'bg-blue-50 dark:bg-blue-500/10'
                                                            : ''
                                                        }`}
                                                    onClick={() => m.team1?.[0] && setHighlightedPlayer(m.team1[0])}
                                                >
                                                    <span className={`text-sm font-medium truncate max-w-[140px] ${winner === 1
                                                            ? 'text-slate-900 dark:text-white font-bold'
                                                            : 'text-slate-500'
                                                        }`}>
                                                        {m.team1?.join(' / ') || 'TBD'}
                                                    </span>
                                                    {m.score && m.score.length > 0 && (
                                                        <div className="flex gap-1 text-xs font-mono">
                                                            {m.score.map((s, si) => {
                                                                const parts = s.replace(/[\(\)]/g, '').split('-');
                                                                return (
                                                                    <span
                                                                        key={si}
                                                                        className={`w-4 text-center ${winner === 1 ? 'font-bold' : ''}`}
                                                                    >
                                                                        {parts[0]}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Divider */}
                                                <div className="h-px bg-slate-100 dark:bg-white/10 mx-2" />

                                                {/* Team 2 */}
                                                <div
                                                    className={`flex justify-between items-center py-1 px-2 rounded-lg mt-1 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${highlightedPlayer && m.team2?.includes(highlightedPlayer)
                                                            ? 'bg-blue-50 dark:bg-blue-500/10'
                                                            : ''
                                                        }`}
                                                    onClick={() => m.team2?.[0] && setHighlightedPlayer(m.team2[0])}
                                                >
                                                    <span className={`text-sm font-medium truncate max-w-[140px] ${winner === 2
                                                            ? 'text-slate-900 dark:text-white font-bold'
                                                            : 'text-slate-500'
                                                        }`}>
                                                        {m.team2?.join(' / ') || 'TBD'}
                                                    </span>
                                                    {m.score && m.score.length > 0 && (
                                                        <div className="flex gap-1 text-xs font-mono">
                                                            {m.score.map((s, si) => {
                                                                const parts = s.replace(/[\(\)]/g, '').split('-');
                                                                return (
                                                                    <span
                                                                        key={si}
                                                                        className={`w-4 text-center ${winner === 2 ? 'font-bold' : ''}`}
                                                                    >
                                                                        {parts[1]}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Connection line to next round */}
                                                {roundIndex < activeRounds.length - 1 && (
                                                    <div className="absolute right-0 top-1/2 w-8 h-px bg-slate-300 dark:bg-white/20 translate-x-full" />
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Zoom level indicator */}
            <div className="absolute bottom-4 left-4 text-xs text-slate-400 bg-white/80 dark:bg-black/50 px-2 py-1 rounded-lg">
                {Math.round(scale * 100)}%
            </div>
        </div>
    );
}

// Helper duplicated from stats.ts
function determineWinner(match: Match): 1 | 2 | null {
    if (!match.score || match.score.length === 0) return null;
    let t1Sets = 0;
    let t2Sets = 0;
    for (const setScore of match.score) {
        let clean = setScore.replace(/[\(\)]/g, '').trim();
        const parts = clean.split('-');
        if (parts.length !== 2) continue;
        let s1 = parseInt(parts[0]);
        let s2 = parseInt(parts[1]);
        if (s1 > 7 || s2 > 7) { s1 = parseInt(parts[0][0]); s2 = parseInt(parts[1][0]); }
        if (!isNaN(s1) && !isNaN(s2)) {
            if (s1 > s2) t1Sets++;
            if (s2 > s1) t2Sets++;
        }
    }
    if (t1Sets > t2Sets) return 1;
    if (t2Sets > t1Sets) return 2;
    return null;
}
