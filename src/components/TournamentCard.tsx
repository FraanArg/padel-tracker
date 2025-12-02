import Link from 'next/link';
import SmartLink from './SmartLink';
import { Trophy } from 'lucide-react';
import Image from 'next/image';

interface TournamentProps {
    name: string;
    url: string;
    imageUrl: string;
    id: string;
}

export default function TournamentCard({ tournament }: { tournament: any }) {
    const isLive = tournament.status === 'live';

    return (
        <SmartLink href={`/tournament/${tournament.id}`} className="group block h-full">
            <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-sm transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] active:scale-95 active:shadow-inner">
                {/* Image Background */}
                <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800">
                    {tournament.imageUrl ? (
                        <Image
                            src={tournament.imageUrl}
                            alt={tournament.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <Trophy className="h-16 w-16 text-gray-300 dark:text-gray-600" />
                        </div>
                    )}
                </div>

                {/* Gradient Overlay - Full height for better text visibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90" />

                {/* Shine Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-700">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:animate-shine" />
                </div>

                {/* Live Badge */}
                {isLive && (
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-red-500/90 backdrop-blur-sm text-white text-[11px] font-bold uppercase tracking-wider shadow-lg animate-pulse z-10 border border-white/10">
                        Live
                    </div>
                )}

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-10">
                    <h3 className="text-lg md:text-xl font-bold leading-tight text-white mb-2 drop-shadow-md line-clamp-2 group-hover:text-blue-200 transition-colors">
                        {tournament.name}
                    </h3>

                    {/* Date Display */}
                    {(tournament.dateStart && tournament.dateEnd) && (
                        <div className="flex items-center text-xs font-medium text-gray-300 mb-3 md:mb-4">
                            <span className="bg-white/10 backdrop-blur-md px-2 py-1 rounded-md text-white border border-white/10">
                                {tournament.dateStart.split('/')[0]}/{tournament.dateStart.split('/')[1]} - {tournament.dateEnd.split('/')[0]}/{tournament.dateEnd.split('/')[1]}
                            </span>
                        </div>
                    )}

                    <div className="flex items-center text-sm font-bold text-white/90 group-hover:text-white transition-colors">
                        <span>View Matches</span>
                        <svg className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </div>
        </SmartLink>
    );
}
