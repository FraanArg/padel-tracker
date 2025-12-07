import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tournaments',
    description: 'Browse all padel tournaments including Premier Padel, FIP Tour, and more. Get schedules, brackets, and results.',
    openGraph: {
        title: 'Padel Tournaments',
        description: 'Browse all padel tournaments including Premier Padel, FIP Tour, and more.',
    },
};

export default function TournamentsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
