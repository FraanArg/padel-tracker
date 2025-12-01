'use client';

import { useState } from 'react';
import { PlayerRanking } from '@/lib/padel';
import { Trophy, Medal } from 'lucide-react';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';

const countryCodeMap: Record<string, string> = {
    // 3-letter codes
    'ARG': 'AR', 'ESP': 'ES', 'ITA': 'IT', 'BRA': 'BR', 'FRA': 'FR',
    'POR': 'PT', 'SWE': 'SE', 'BEL': 'BE', 'GBR': 'GB', 'GER': 'DE',
    'NED': 'NL', 'CHI': 'CL', 'MEX': 'MX', 'USA': 'US', 'SUI': 'CH',
    'AUT': 'AT', 'RUS': 'RU', 'POL': 'PL', 'FIN': 'FI', 'DEN': 'DK',
    'UAE': 'AE', 'QAT': 'QA', 'JPN': 'JP', 'CHN': 'CN', 'AUS': 'AU',

    // Full names (English/Spanish/Italian variations just in case)
    'ARGENTINA': 'AR', 'SPAIN': 'ES', 'ITALY': 'IT', 'BRAZIL': 'BR', 'FRANCE': 'FR',
    'PORTUGAL': 'PT', 'SWEDEN': 'SE', 'BELGIUM': 'BE', 'GREAT BRITAIN': 'GB', 'GERMANY': 'DE',
    'NETHERLANDS': 'NL', 'CHILE': 'CL', 'MEXICO': 'MX', 'UNITED STATES': 'US', 'SWITZERLAND': 'CH',
    'AUSTRIA': 'AT', 'RUSSIA': 'RU', 'POLAND': 'PL', 'FINLAND': 'FI', 'DENMARK': 'DK',
    'UNITED ARAB EMIRATES': 'AE', 'QATAR': 'QA', 'JAPAN': 'JP', 'CHINA': 'CN', 'AUSTRALIA': 'AU'
};

function getCountryCode(country: string): string | null {
    if (!country) return null;
    const normalized = country.toUpperCase().trim();
    return countryCodeMap[normalized] || (normalized.length === 2 ? normalized : null);
}

function getFlagEmoji(country: string) {
    const code = getCountryCode(country);
    if (!code) return '🏳️';
    const codePoints = code
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

function FlagImage({ url, country }: { url?: string, country: string }) {
    const [error, setError] = useState(false);
    const code = getCountryCode(country);

    // Prefer FlagCDN if we have a valid code
    const flagSrc = code ? `https://flagcdn.com/w40/${code.toLowerCase()}.png` : url;

    if (error || !flagSrc) {
        return <span className="text-base leading-none" title={country}>{getFlagEmoji(country)}</span>;
    }

    return (
        <div className="relative w-5 h-3.5 rounded-[2px] overflow-hidden shadow-sm bg-slate-100 dark:bg-slate-800">
            <Image
                src={flagSrc}
                alt={country}
                fill
                className="object-cover"
                sizes="20px"
                onError={() => setError(true)}
                unoptimized // FlagCDN is external
            />
        </div>
    );
}

export default function RankingsView({ men, women }: { men: PlayerRanking[], women: PlayerRanking[] }) {
    const [activeTab, setActiveTab] = useState<'men' | 'women'>('men');
    const [limit, setLimit] = useState(20);

    const rankings = activeTab === 'men' ? men : women;
    const visibleRankings = rankings.slice(0, limit);

    return (
        <div className="space-y-6">

            {/* Tabs */}
            <div className="flex justify-center">
                <div className="bg-slate-100 dark:bg-white/5 p-1 rounded-full inline-flex">
                    <button
                        onClick={() => setActiveTab('men')}
                        className={clsx(
                            "px-6 py-2 rounded-full text-sm font-bold transition-all",
                            activeTab === 'men'
                                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        )}
                    >
                        Men
                    </button>
                    <button
                        onClick={() => setActiveTab('women')}
                        className={clsx(
                            "px-6 py-2 rounded-full text-sm font-bold transition-all",
                            activeTab === 'women'
                                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        )}
                    >
                        Women
                    </button>
                </div>
            </div>

            {/* Rankings List */}
            <div className="bg-white dark:bg-[#202020] rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400">Rank</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400">Player</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400 text-right">Points</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {visibleRankings.map((player, index) => (
                                <tr key={`${player.name}-${index}`} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className={clsx(
                                            "font-bold text-lg w-8 h-8 flex items-center justify-center rounded-full",
                                            index === 0 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500" :
                                                index === 1 ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400" :
                                                    index === 2 ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-500" :
                                                        "text-slate-500 dark:text-slate-400"
                                        )}>
                                            {player.rank}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/player/${player.name}`} className="block group-hover:translate-x-1 transition-transform">
                                            <div className="flex items-center gap-4">
                                                {player.imageUrl ? (
                                                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-slate-100 dark:border-slate-700">
                                                        <Image
                                                            src={player.imageUrl}
                                                            alt={player.name}
                                                            fill
                                                            className="object-cover group-hover:scale-110 transition-transform"
                                                            sizes="48px"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-slate-200 dark:border-slate-700">
                                                        <Trophy className="w-5 h-5 text-slate-400" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-bold text-slate-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{player.name}</div>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                        <FlagImage url={player.flagUrl} country={player.country} />
                                                        {player.country}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="font-bold text-slate-900 dark:text-white">{player.points}</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>


            {
                limit < rankings.length && (
                    <div className="flex justify-center pt-4">
                        <button
                            onClick={() => setLimit(prev => prev + 50)}
                            className="px-6 py-2 bg-white dark:bg-white/10 text-slate-900 dark:text-white font-bold rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-white/20 transition-colors"
                        >
                            Show More
                        </button>
                    </div>
                )
            }
        </div >
    );
}
