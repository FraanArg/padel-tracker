import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Head to Head Compare',
    description: 'Compare padel players head-to-head. Analyze rivalry history, match stats, and performance metrics between professional padel players.',
    openGraph: {
        title: 'Player Comparison - Head to Head',
        description: 'Compare padel players head-to-head with detailed statistics and match history.',
    },
};

export default function CompareLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
