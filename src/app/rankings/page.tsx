
import { getRankings } from '@/lib/padel';
import RankingsView from '@/components/RankingsView';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const revalidate = 3600; // Revalidate every hour

export default async function RankingsPage() {
    const { men, women } = await getRankings();

    return (
        <main className="min-h-screen bg-[var(--background)] pb-20">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--card-border)]">
                <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-4">
                    <Link
                        href="/"
                        className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-black dark:text-white" />
                    </Link>
                    <h1 className="font-bold text-lg text-black dark:text-white">
                        FIP Rankings
                    </h1>
                </div>
            </div>

            <div className="max-w-3xl mx-auto p-4">
                <RankingsView men={men} women={women} />
            </div>
        </main>
    );
}
