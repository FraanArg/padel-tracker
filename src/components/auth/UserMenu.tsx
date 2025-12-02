"use client"
import { signOut, useSession } from "next-auth/react"
import { useState, useRef, useEffect } from "react"
import { LoginButton } from "./LoginButton"

export function UserMenu() {
    const { data: session } = useSession()
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    if (!session?.user) {
        return <LoginButton />
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 hover:ring-2 ring-blue-500 transition-all"
            >
                {session.user.image ? (
                    <img src={session.user.image} alt={session.user.name || "User"} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">
                        {session.user.name?.[0]?.toUpperCase() || "U"}
                    </div>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-white/5">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {session.user.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {session.user.email}
                        </p>
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                    >
                        Log out
                    </button>
                </div>
            )}
        </div>
    )
}
