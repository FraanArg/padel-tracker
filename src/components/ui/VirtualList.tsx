'use client';

import { useRef, useState, useEffect, ReactNode, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualListProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => ReactNode;
    estimateSize?: number;
    overscan?: number;
    className?: string;
    getItemKey?: (item: T, index: number) => string | number;
}

export default function VirtualList<T>({
    items,
    renderItem,
    estimateSize = 80,
    overscan = 5,
    className = '',
    getItemKey = (_, index) => index
}: VirtualListProps<T>) {
    const parentRef = useRef<HTMLDivElement>(null);
    const [parentHeight, setParentHeight] = useState(400);

    // Measure parent height
    useEffect(() => {
        if (parentRef.current) {
            const resizeObserver = new ResizeObserver(entries => {
                for (const entry of entries) {
                    setParentHeight(entry.contentRect.height);
                }
            });

            resizeObserver.observe(parentRef.current);
            return () => resizeObserver.disconnect();
        }
    }, []);

    const virtualizer = useVirtualizer({
        count: items.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => estimateSize,
        overscan,
        getItemKey: (index) => getItemKey(items[index], index)
    });

    const virtualItems = virtualizer.getVirtualItems();

    return (
        <div
            ref={parentRef}
            className={`overflow-auto ${className}`}
            style={{ height: parentHeight }}
        >
            <div
                style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative'
                }}
            >
                {virtualItems.map(virtualItem => (
                    <div
                        key={virtualItem.key}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: `${virtualItem.size}px`,
                            transform: `translateY(${virtualItem.start}px)`
                        }}
                    >
                        {renderItem(items[virtualItem.index], virtualItem.index)}
                    </div>
                ))}
            </div>
        </div>
    );
}

// Simple hook for infinite scroll
export function useInfiniteScroll(
    loadMore: () => Promise<void>,
    hasMore: boolean,
    threshold: number = 200
) {
    const [isLoading, setIsLoading] = useState(false);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef(loadMore);

    loadMoreRef.current = loadMore;

    const setRef = useCallback((node: HTMLDivElement | null) => {
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        if (node && hasMore) {
            observerRef.current = new IntersectionObserver(
                async (entries) => {
                    if (entries[0].isIntersecting && !isLoading && hasMore) {
                        setIsLoading(true);
                        await loadMoreRef.current();
                        setIsLoading(false);
                    }
                },
                { rootMargin: `${threshold}px` }
            );
            observerRef.current.observe(node);
        }
    }, [hasMore, isLoading, threshold]);

    return { setRef, isLoading };
}
