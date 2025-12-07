import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'My Favorites',
    description: 'Follow your favorite padel players and see their upcoming matches and recent results.',
    openGraph: {
        title: 'My Favorite Players',
        description: 'Follow your favorite padel players and see their upcoming matches and recent results.',
    },
};

export default function FavoritesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
