import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Rankings',
    description: 'View the latest FIP padel rankings for men and women professional players.',
    openGraph: {
        title: 'Padel Rankings - FIP Tour',
        description: 'View the latest FIP padel rankings for men and women professional players.',
    },
};

export default function RankingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
