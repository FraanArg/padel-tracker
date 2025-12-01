
import { Suspense } from 'react';
import TournamentContent from '@/components/TournamentContent';
import TournamentSkeleton from '@/components/TournamentSkeleton';

export const revalidate = 300; // Revalidate every 5 minutes

export default async function TournamentPage({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ day?: string, view?: string }>
}) {
    const { id } = await params;
    const { day, view } = await searchParams;

    return (
        <Suspense fallback={<TournamentSkeleton />}>
            <TournamentContent id={id} day={day} view={view} />
        </Suspense>
    );
}
