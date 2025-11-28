
import { Skeleton } from "@/components/ui/Skeleton"

export default function Loading() {
    return (
        <main className="min-h-screen pb-32">
            <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

                {/* Hero Skeleton */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-8 md:py-12">
                    <div className="flex-1 space-y-6 text-center md:text-left w-full">
                        <Skeleton className="h-12 w-3/4 mx-auto md:mx-0" />
                        <Skeleton className="h-6 w-full mx-auto md:mx-0" />
                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
                            <Skeleton className="h-14 w-40 rounded-full" />
                            <Skeleton className="h-14 w-40 rounded-full" />
                        </div>
                    </div>
                    <div className="flex-1 flex justify-center w-full max-w-sm">
                        <Skeleton className="w-72 h-96 rounded-2xl rotate-6" />
                    </div>
                </div>

                {/* Live Section Skeleton */}
                <div className="space-y-6">
                    <div className="space-y-1 px-2">
                        <Skeleton className="h-8 w-32" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Skeleton className="w-full aspect-[3/4] rounded-2xl" />
                        <Skeleton className="w-full aspect-[3/4] rounded-2xl" />
                    </div>
                </div>

                {/* Upcoming Section Skeleton */}
                <div className="space-y-6">
                    <div className="space-y-1 px-2">
                        <Skeleton className="h-8 w-48" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Skeleton className="w-full aspect-[3/4] rounded-2xl" />
                        <Skeleton className="w-full aspect-[3/4] rounded-2xl" />
                        <Skeleton className="w-full aspect-[3/4] rounded-2xl" />
                        <Skeleton className="w-full aspect-[3/4] rounded-2xl" />
                    </div>
                </div>
            </div>
        </main>
    )
}
