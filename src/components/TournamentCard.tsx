import Link from 'next/link';
import { Trophy } from 'lucide-react';
import Image from 'next/image';

interface TournamentProps {
    name: string;
    url: string;
    imageUrl: string;
    id: string;
}

export default function TournamentCard({ tournament }: { tournament: any }) {
    return (
        <Link href={`/tournament/${tournament.id}`} className="block group">
            <div className="bg-white dark:bg-[#202020] rounded-2xl overflow-hidden border border-gray-100 dark:border-white/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:shadow-none transition-all duration-300 transform hover:-translate-y-0.5">
                <div className="relative h-56 bg-gray-100 dark:bg-white/5 overflow-hidden">
                    {tournament.imageUrl ? (
                        <img
                            src={tournament.imageUrl}
                            alt={tournament.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-300 dark:text-white/10">
                            <Trophy className="w-12 h-12 opacity-20" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

                    {/* Live Badge - iOS style blur */}
                    <div className="absolute top-4 right-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-md text-red-500 text-[10px] font-bold tracking-wider uppercase rounded-full shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            Live
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <h3 className="font-semibold text-xl text-slate-900 dark:text-slate-100 leading-snug tracking-tight group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                        {tournament.name}
                    </h3>
                    <div className="mt-4 flex items-center text-sm font-medium text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors">
                        View Matches
                        <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </div>
        </Link>
    );
}
