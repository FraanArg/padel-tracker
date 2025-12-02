"use client"
import { signIn } from "next-auth/react"

export function LoginButton() {
    return (
        <button
            onClick={() => signIn()}
            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
        >
            Sign In
        </button>
    )
}
