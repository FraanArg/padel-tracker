'use client';

import Link from 'next/link';
import SmartLink from './SmartLink';
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

    // Helper to get points based on tournament type
    const getPoints = (name: string) => {
        const n = name.toUpperCase();
        if (n.includes('MAJOR')) return '2000';
        if (n.includes('P1')) return '1000';
        if (n.includes('P2')) return '500';
        if (n.includes('PLATINUM')) return '250';
        if (n.includes('GOLD')) return '125';
        return '';
    };

    const points = getPoints(tournament.name);

    // Helper to get location
    const getLocation = (name: string) => {
        const n = name.toUpperCase();
        if (n.includes('ACAPULCO')) return 'Acapulco, Mexico';
        if (n.includes('DOHA')) return 'Doha, Qatar';
        if (n.includes('RIYADH')) return 'Riyadh, Saudi Arabia';
        if (n.includes('MAR DEL PLATA')) return 'Mar del Plata, Argentina';
        if (n.includes('ROME') || n.includes('ROMA')) return 'Rome, Italy';
        if (n.includes('PARIS')) return 'Paris, France';
        if (n.includes('MADRID')) return 'Madrid, Spain';
        if (n.includes('MALAGA')) return 'Malaga, Spain';
        if (n.includes('BARCELONA')) return 'Barcelona, Spain';

        // Fallback: First word
        return name.split(' ')[0];
    };

    return (
        <SmartLink
            href={`/tournament/${tournament.id}`}
            className="block relative w-full h-[280px] md:h-[400px] rounded-2xl overflow-hidden mb-8 shadow-lg group isolation-isolate bg-gray-900"
            style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}
        >
            {/* Background Layer */}
            {tournament.imageUrl ? (
                <div className="absolute inset-0">
                    <img
                        src={tournament.imageUrl}
                        alt={tournament.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 blur-[2px]"
                    />
                    {/* Gradient Overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20"></div>
                </div>
            ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90 transition-transform duration-700 group-hover:scale-105`}>
                    {/* Abstract Shapes/Pattern Overlay */}
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                </div>
            )}

            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-black/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Content Container */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 text-white">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Badge */}
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-wider mb-4 shadow-lg group-hover:bg-white/30 transition-colors">
                        <span className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
                        Live Now
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-none mb-4 drop-shadow-xl max-w-4xl group-hover:text-white/90 transition-colors">
                        {tournament.name}
                    </h1>

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-4 text-sm md:text-base font-medium text-white/90">
                        <div className="flex items-center bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 group-hover:bg-black/40 transition-colors">
                            <MapPin className="w-4 h-4 mr-2 text-blue-400" />
                            {getLocation(tournament.name)}
                        </div>
                        <div className="flex items-center bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 group-hover:bg-black/40 transition-colors">
                            <Calendar className="w-4 h-4 mr-2 text-emerald-400" />
                            {tournament.dateStart ? `${tournament.dateStart} - ${tournament.dateEnd}` : (tournament.month || 'Date TBD')}
                        </div>
                        <div className="flex items-center bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 group-hover:bg-black/40 transition-colors">
                            <Trophy className="w-4 h-4 mr-2 text-yellow-400" />
                            {points ? `${points} Points` : (tournament.name.includes('Major') ? 'Major Event' : 'Tournament')}
                        </div>
                    </div>
                </motion.div>
            </div>
        </SmartLink>
    );
}
