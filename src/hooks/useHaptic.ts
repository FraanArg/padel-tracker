"use client"

import { useCallback } from "react"

export function useHaptic() {
    const vibrate = useCallback((pattern: number | number[] = 10) => {
        if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(pattern)
        }
    }, [])

    const trigger = useCallback(() => {
        vibrate(10) // Light tap
    }, [vibrate])

    const success = useCallback(() => {
        vibrate([10, 30, 10]) // Double tap
    }, [vibrate])

    const error = useCallback(() => {
        vibrate([50, 30, 50, 30, 50]) // Long buzz
    }, [vibrate])

    return { trigger, success, error }
}
