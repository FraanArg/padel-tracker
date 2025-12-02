
import { PlayerStats } from '@/lib/stats';

export function StatsDashboard({ stats }: { stats: PlayerStats }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Matches" value={stats.totalMatches} />
            <StatCard label="Win Rate" value={stats.winRate} />
            <StatCard label="Titles" value={stats.titles} />
            <StatCard label="Finals" value={stats.finals} />
        </div>
    );
}

function StatCard({ label, value }: { label: string, value: string | number }) {
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{value}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">{label}</div>
        </div>
    );
}
