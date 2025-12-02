
import { PlayerStats } from '@/lib/stats';

export function PartnerHistory({ partners }: { partners: PlayerStats['partners'] }) {
    if (!partners || partners.length === 0) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {partners.map((p) => (
                <div key={p.name} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-gray-500">{p.matches} matches</span>
                </div>
            ))}
        </div>
    );
}
