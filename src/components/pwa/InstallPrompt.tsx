"use client"
import { useState, useEffect } from "react"
import { Share, X, PlusSquare } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function InstallPrompt() {
    const [showPrompt, setShowPrompt] = useState(false)
    const [isIOS, setIsIOS] = useState(false)

    useEffect(() => {
        // Check if standalone
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone
        if (isStandalone) return

        // Check if iOS
        const userAgent = window.navigator.userAgent.toLowerCase()
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent)
        setIsIOS(isIosDevice)

        // Check if already dismissed
        const dismissed = localStorage.getItem('pwa-prompt-dismissed')
        if (!dismissed) {
            // Show after a delay
            const timer = setTimeout(() => setShowPrompt(true), 3000)
            return () => clearTimeout(timer)
        }
    }, [])

    const dismiss = () => {
        setShowPrompt(false)
        localStorage.setItem('pwa-prompt-dismissed', 'true')
    }

    if (!showPrompt) return null

    return (
        <AnimatePresence>
            {showPrompt && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-20 left-4 right-4 z-50 md:hidden"
                >
                    <div className="bg-white dark:bg-[#202020] rounded-2xl p-4 shadow-2xl border border-slate-200 dark:border-white/10 relative">
                        <button
                            onClick={dismiss}
                            className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-start gap-4 pr-6">
                            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
                                <img src="/icons/icon-192x192.png" alt="App Icon" className="w-full h-full rounded-xl object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Install Padel Tracker</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Add to Home Screen for the best experience.
                                </p>
                            </div>
                        </div>

                        {isIOS ? (
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 space-y-2">
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                    <span className="flex items-center justify-center w-6 h-6 bg-slate-100 dark:bg-white/10 rounded-full text-xs font-bold">1</span>
                                    <span>Tap the <Share className="w-4 h-4 inline mx-1" /> Share button</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                    <span className="flex items-center justify-center w-6 h-6 bg-slate-100 dark:bg-white/10 rounded-full text-xs font-bold">2</span>
                                    <span>Select <PlusSquare className="w-4 h-4 inline mx-1" /> Add to Home Screen</span>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    Tap the menu button and select "Install App" or "Add to Home Screen".
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
