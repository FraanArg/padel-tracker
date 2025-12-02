"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Bell, BellOff } from "lucide-react"

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export default function NotificationManager() {
    const { data: session } = useSession()
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [isSupported, setIsSupported] = useState(false)

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true)
            checkSubscription()
        }
    }, [])

    async function checkSubscription() {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        if (subscription) {
            setIsSubscribed(true)
        }
    }

    async function subscribe() {
        try {
            const registration = await navigator.serviceWorker.ready
            const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

            if (!vapidKey) {
                console.error("VAPID key not found")
                return
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidKey)
            })

            await fetch('/api/web-push/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ subscription }),
            })

            setIsSubscribed(true)
        } catch (error) {
            console.error('Error subscribing:', error)
        }
    }

    if (!isSupported || !session?.user) {
        return null
    }

    if (isSubscribed) {
        return null // Or show a "Notifications Enabled" indicator
    }

    return (
        <div className="fixed bottom-20 right-4 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="bg-white dark:bg-[#202020] p-4 rounded-xl shadow-xl border border-blue-100 dark:border-blue-900/30 max-w-xs">
                <div className="flex items-start gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full text-blue-600 dark:text-blue-400">
                        <Bell className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">Enable Notifications?</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Get notified when your favorite players start a match.
                        </p>
                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={subscribe}
                                className="text-xs font-bold bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Enable
                            </button>
                            <button
                                onClick={() => setIsSubscribed(true)} // Dismiss for now
                                className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 px-3 py-1.5"
                            >
                                Later
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
