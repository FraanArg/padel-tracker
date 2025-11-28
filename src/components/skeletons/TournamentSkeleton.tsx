export default function TournamentSkeleton() {
    return (
        <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse border border-gray-100 dark:border-white/5">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-md w-3/4" />
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded-md w-1/2" />
            </div>
        </div>
    );
}
