'use client';

import { useEffect, useState } from 'react';
import { Match } from '@/lib/padel';
import { Bell, BellOff } from 'lucide-react';

export function useNotifications() {
    const [permission, setPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async () => {
        const result = await Notification.requestPermission();
        setPermission(result);
        return result;
    };

    const sendNotification = (title: string, body: string) => {
        if (permission === 'granted') {
            new Notification(title, { body, icon: '/icon-192x192.png' });
        }
    };

    return { permission, requestPermission, sendNotification };
}

// Simple component to manage subscriptions (could be expanded)
export default function NotificationManager() {
    const { permission, requestPermission } = useNotifications();

    if (permission === 'granted') return null;

    return (
        <div className="fixed bottom-20 right-4 z-50">
            <button
                onClick={requestPermission}
                className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                title="Enable Notifications"
            >
                <Bell className="w-6 h-6" />
            </button>
        </div>
    );
}
