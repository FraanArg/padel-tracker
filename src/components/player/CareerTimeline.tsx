
import { CareerTournament } from '@/lib/stats';
import Link from 'next/link';

export function CareerTimeline({ timeline }: { timeline: CareerTournament[] }) {
    if (!timeline || timeline.length === 0) {
        return <div className="text-gray-500 text-center py-8">No tournament history available.</div>;
    }

    return (
        <div className="space-y-4">
            {timeline.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                    <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{t.year}</div>
                        <Link href={`/tournament/${t.id}`} className="font-semibold hover:underline text-lg">
                            {t.name}
                        </Link>
                        <div className="text-sm text-gray-500">Partner: {t.partner}</div>
                    </div>
                    <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${t.result === 'Winner' ? 'bg-yellow-100 text-yellow-800' :
                                t.result === 'Finalist' ? 'bg-gray-100 text-gray-800' :
                                    'bg-blue-50 text-blue-600'
                            }`}>
                            {t.result}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
