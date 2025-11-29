
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getResultBadgeColor(result: string) {
    switch (result) {
        case 'W': return 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400';
        case 'L': return 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400';
        case 'F': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400';
        case 'SF': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400';
        case 'QF': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400';
        default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
}

export function getResultShort(round: string) {
    if (!round) return '-';
    const r = round.toLowerCase();
    if (r.includes('final') && !r.includes('semi') && !r.includes('quarter')) return 'F';
    if (r.includes('semi')) return 'SF';
    if (r.includes('quarter')) return 'QF';
    if (r.includes('16')) return 'R16';
    if (r.includes('32')) return 'R32';
    return 'R';
}
