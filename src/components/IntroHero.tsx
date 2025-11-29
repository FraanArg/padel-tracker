
'use client';

import { motion } from 'framer-motion';

export default function IntroHero() {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full h-48 rounded-3xl overflow-hidden relative mb-8 shadow-xl"
        >
            {/* Background with abstract gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800">
                <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

                {/* Decorative Circles */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
            </div>

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-12">
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
                    PADEL TRACKER
                </h1>
                <p className="text-slate-300 text-lg font-medium max-w-xl">
                    Follow the best padel in the world. Live scores, stats, and real-time updates from every major tournament.
                </p>
            </div>
        </motion.div>
    );
}
