
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const STORAGE_KEY = 'padel-intro-dismissed';

export default function IntroHero() {
    const [isDismissed, setIsDismissed] = useState(true); // Start hidden to prevent flash
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const dismissed = localStorage.getItem(STORAGE_KEY);
        setIsDismissed(dismissed === 'true');
    }, []);

    const handleDismiss = () => {
        setIsDismissed(true);
        localStorage.setItem(STORAGE_KEY, 'true');
    };

    // Don't render anything until mounted (prevents hydration mismatch)
    if (!mounted) return null;

    return (
        <AnimatePresence>
            {!isDismissed && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-48 rounded-2xl overflow-hidden relative mb-6 shadow-lg"
                >
                    {/* Background with abstract gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800">
                        <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

                        {/* Decorative Circles */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
                    </div>

                    {/* Dismiss Button */}
                    <button
                        onClick={handleDismiss}
                        className="absolute top-3 right-3 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        aria-label="Dismiss banner"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-12">
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
                            PADEL TRACKER
                        </h1>
                        <p className="text-slate-300 text-base font-medium max-w-xl">
                            Follow the best padel in the world. Live scores, stats, and real-time updates.
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
