'use client';

import { Tournament } from '@/lib/padel';
import { MapPin, Calendar, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

interface TournamentHeroProps {
    tournament: Tournament;
}

export default function TournamentHero({ tournament }: TournamentHeroProps) {
    // Generate a deterministic gradient based on the tournament name
    const getGradient = (name: string) => {
        const colors = [
            'from-blue-600 to-purple-600',
            'from-emerald-600 to-teal-600',
            'from-orange-600 to-red-600',
            'from-pink-600 to-rose-600',
            'from-indigo-600 to-blue-600',
        ];
        const index = name.length % colors.length;
        return colors[index];
    };

    const gradient = getGradient(tournament.name);

    return (
        <div className="relative w-full h-[300px] rounded-3xl overflow-hidden mb-8 shadow-2xl group">
            {/* Background Layer */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90 transition-transform duration-700 group-hover:scale-105`}></div>

            {/* Abstract Shapes/Pattern Overlay */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>

            {/* Content Container */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 text-white">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Badge */}
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-wider mb-4">
                        <span className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
                        Live Now
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-none mb-4 drop-shadow-lg">
                        {tournament.name}
                    </h1>

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-4 text-sm md:text-base font-medium text-white/90">
                        <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1.5 opacity-75" />
                            {/* Extract city from name (e.g. "Acapulco Major" -> "Acapulco") */}
                            {tournament.name.split(' ')[0] || 'Unknown Location'}
                        </div>
                        <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1.5 opacity-75" />
                            {tournament.dateStart ? `${tournament.dateStart} - ${tournament.dateEnd}` : (tournament.month || 'Date TBD')}
                        </div>
                        <div className="flex items-center">
                            <Trophy className="w-4 h-4 mr-1.5 opacity-75" />
                            {tournament.name.includes('Major') ? 'Major Event' : 'Tournament'}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
