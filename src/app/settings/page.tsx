'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
    ArrowLeft,
    Bell,
    Moon,
    Sun,
    Trash2,
    Globe,
    Shield,
    Smartphone
} from 'lucide-react';

export default function SettingsPage() {
    const { data: session } = useSession();
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
    const [timezone, setTimezone] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Load saved preferences
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
        if (savedTheme) setTheme(savedTheme);

        const savedNotifications = localStorage.getItem('notificationsEnabled');
        if (savedNotifications) setNotificationsEnabled(savedNotifications === 'true');

        // Get browser timezone
        setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }, []);

    const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);

        // Apply theme
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else if (newTheme === 'light') {
            document.documentElement.classList.remove('dark');
        } else {
            // System preference
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    };

    const handleNotificationToggle = async () => {
        if (!notificationsEnabled) {
            // Request permission
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                setNotificationsEnabled(true);
                localStorage.setItem('notificationsEnabled', 'true');
            }
        } else {
            setNotificationsEnabled(false);
            localStorage.setItem('notificationsEnabled', 'false');
        }
    };

    const handleClearFavorites = () => {
        if (confirm('Are you sure you want to clear all favorites? This cannot be undone.')) {
            localStorage.removeItem('favoritePlayers');
            window.location.reload();
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#141414]">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </Link>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h1>
                    </div>
                </div>
            </div>

            <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Account Section */}
                {session?.user && (
                    <div className="bg-white dark:bg-[#202020] rounded-2xl border border-slate-100 dark:border-white/5 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-white/5">
                            <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Shield className="w-5 h-5 text-blue-500" />
                                Account
                            </h2>
                        </div>
                        <div className="p-4">
                            <div className="flex items-center gap-4">
                                {session.user.image && (
                                    <img
                                        src={session.user.image}
                                        alt={session.user.name || ''}
                                        className="w-12 h-12 rounded-full"
                                    />
                                )}
                                <div>
                                    <div className="font-medium text-slate-900 dark:text-white">
                                        {session.user.name}
                                    </div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">
                                        {session.user.email}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notifications */}
                <div className="bg-white dark:bg-[#202020] rounded-2xl border border-slate-100 dark:border-white/5 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-white/5">
                        <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Bell className="w-5 h-5 text-yellow-500" />
                            Notifications
                        </h2>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-medium text-slate-900 dark:text-white">
                                    Push Notifications
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                    Get notified when your favorite players have matches
                                </div>
                            </div>
                            <button
                                onClick={handleNotificationToggle}
                                className={`relative w-12 h-7 rounded-full transition-colors ${notificationsEnabled
                                        ? 'bg-blue-500'
                                        : 'bg-slate-200 dark:bg-white/10'
                                    }`}
                            >
                                <div
                                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Appearance */}
                <div className="bg-white dark:bg-[#202020] rounded-2xl border border-slate-100 dark:border-white/5 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-white/5">
                        <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Moon className="w-5 h-5 text-purple-500" />
                            Appearance
                        </h2>
                    </div>
                    <div className="p-4">
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => handleThemeChange('light')}
                                className={`p-3 rounded-xl border-2 transition-colors ${theme === 'light'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/20'
                                        : 'border-transparent bg-slate-100 dark:bg-white/5'
                                    }`}
                            >
                                <Sun className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                                <div className="text-xs text-slate-600 dark:text-slate-400">Light</div>
                            </button>
                            <button
                                onClick={() => handleThemeChange('dark')}
                                className={`p-3 rounded-xl border-2 transition-colors ${theme === 'dark'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/20'
                                        : 'border-transparent bg-slate-100 dark:bg-white/5'
                                    }`}
                            >
                                <Moon className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                                <div className="text-xs text-slate-600 dark:text-slate-400">Dark</div>
                            </button>
                            <button
                                onClick={() => handleThemeChange('system')}
                                className={`p-3 rounded-xl border-2 transition-colors ${theme === 'system'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/20'
                                        : 'border-transparent bg-slate-100 dark:bg-white/5'
                                    }`}
                            >
                                <Smartphone className="w-5 h-5 mx-auto mb-1 text-slate-500" />
                                <div className="text-xs text-slate-600 dark:text-slate-400">System</div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Timezone */}
                <div className="bg-white dark:bg-[#202020] rounded-2xl border border-slate-100 dark:border-white/5 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-white/5">
                        <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Globe className="w-5 h-5 text-green-500" />
                            Timezone
                        </h2>
                    </div>
                    <div className="p-4">
                        <div className="text-slate-600 dark:text-slate-400">
                            Your detected timezone: <span className="font-medium text-slate-900 dark:text-white">{timezone}</span>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white dark:bg-[#202020] rounded-2xl border border-red-200 dark:border-red-500/20 overflow-hidden">
                    <div className="p-4 border-b border-red-100 dark:border-red-500/10">
                        <h2 className="font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                            <Trash2 className="w-5 h-5" />
                            Danger Zone
                        </h2>
                    </div>
                    <div className="p-4">
                        <button
                            onClick={handleClearFavorites}
                            className="px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-500/20 dark:hover:bg-red-500/30 text-red-700 dark:text-red-400 rounded-xl text-sm font-medium transition-colors"
                        >
                            Clear All Favorites
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
