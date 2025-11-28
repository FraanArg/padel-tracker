'use client';

import { motion } from 'framer-motion';
import { Trophy, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

import { Tournament } from '@/lib/padel';

export default function Hero({ nextTournament }: { nextTournament?: Tournament }) {
    return (
        <div className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 shadow-2xl mb-12">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 px-8 py-16 md:py-20 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left max-w-xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider text-blue-200 uppercase bg-blue-500/20 rounded-full border border-blue-400/20">
                            Premier Padel 2025
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6 tracking-tight">
                            The Ultimate <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                                Padel Tracker
                            </span>
                        </h1>
                        <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                            Follow live scores, check rankings, and compare your favorite players in real-time. The court is yours.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                            <Link
                                href="/rankings"
                                className="px-8 py-4 bg-white text-slate-900 rounded-full font-bold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
                            >
                                <Trophy className="w-5 h-5 mr-2 text-blue-600" />
                                View Rankings
                            </Link>
                            <Link
                                href="/compare"
                                className="px-8 py-4 bg-white/10 text-white rounded-full font-bold hover:bg-white/20 transition-all backdrop-blur-sm border border-white/10 flex items-center justify-center"
                            >
                                Compare Players
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* Decorative Element */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="hidden md:block relative"
                >
                    <div className="relative w-72 h-96 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-2xl rotate-6 shadow-2xl flex items-center justify-center border border-white/20 backdrop-blur-md overflow-hidden group hover:rotate-0 transition-all duration-500">
                        {/* Map Image Placeholder - Will be replaced by generated image */}
                        <div className="absolute inset-0 bg-blue-500/20"></div>

                        <Image
                            src="https://www.padelfip.com/wp-content/uploads/2024/02/LOGO-PREMIER-PADEL-2024-1.png"
                            alt="Premier Padel Logo"
                            fill
                            className="object-contain opacity-20 mix-blend-overlay z-0"
                        />

                        {/* Dynamic Tournament Image */}
                        {nextTournament?.imageUrl ? (
                            <div className="relative w-full h-full">
                                <Image
                                    src={nextTournament.imageUrl}
                                    alt={nextTournament.name}
                                    fill
                                    className="object-cover"
                                />
                                {/* Gradient Overlay for text readability at bottom */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                            </div>
                        ) : (
                            <Trophy className="w-32 h-32 text-white drop-shadow-lg relative z-10" />
                        )}
                        {nextTournament && (
                            <Link href={`/tournament/${nextTournament.id}`}>
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                    className="absolute -bottom-6 -left-6 bg-white p-3 rounded-xl shadow-xl flex items-center gap-3 hover:scale-105 transition-transform cursor-pointer z-20 max-w-[240px]"
                                >
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Calendar className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Next Event</div>
                                        <div className="text-xs font-bold text-slate-900 leading-tight line-clamp-2">{nextTournament.name}</div>
                                    </div>
                                </motion.div>
                            </Link>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
