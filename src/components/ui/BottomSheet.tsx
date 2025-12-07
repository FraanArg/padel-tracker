'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { motion, AnimatePresence, useDragControls, PanInfo } from 'framer-motion';
import { X } from 'lucide-react';

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    snapPoints?: ('half' | 'full')[];
    defaultSnap?: 'half' | 'full';
}

export default function BottomSheet({
    isOpen,
    onClose,
    title,
    children,
    snapPoints = ['half', 'full'],
    defaultSnap = 'half'
}: BottomSheetProps) {
    const sheetRef = useRef<HTMLDivElement>(null);
    const dragControls = useDragControls();

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const getSnapHeight = (snap: 'half' | 'full') => {
        if (typeof window === 'undefined') return 400;
        return snap === 'full' ? window.innerHeight * 0.9 : window.innerHeight * 0.5;
    };

    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const velocity = info.velocity.y;
        const offset = info.offset.y;

        // If dragged down fast or more than 100px, close
        if (velocity > 500 || offset > 100) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                    />

                    {/* Sheet */}
                    <motion.div
                        ref={sheetRef}
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        drag="y"
                        dragControls={dragControls}
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 0, bottom: 0.5 }}
                        onDragEnd={handleDragEnd}
                        className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#1c1c1e] rounded-t-3xl shadow-2xl"
                        style={{
                            maxHeight: `${getSnapHeight(defaultSnap)}px`,
                            height: 'auto',
                            touchAction: 'none'
                        }}
                    >
                        {/* Drag Handle */}
                        <div
                            className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
                            onPointerDown={(e) => dragControls.start(e)}
                        >
                            <div className="w-10 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
                        </div>

                        {/* Header */}
                        {title && (
                            <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-100 dark:border-white/5">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {title}
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 -mr-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>
                        )}

                        {/* Content */}
                        <div
                            className="overflow-y-auto overscroll-contain"
                            style={{ maxHeight: `calc(${getSnapHeight(defaultSnap)}px - 80px)` }}
                        >
                            <div className="p-4 pb-8">
                                {children}
                            </div>
                        </div>

                        {/* Safe area padding for iOS */}
                        <div className="pb-safe" />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
