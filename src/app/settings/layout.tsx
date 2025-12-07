import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Settings',
    description: 'Manage your Padel Tracker preferences, notifications, and appearance settings.',
};

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
