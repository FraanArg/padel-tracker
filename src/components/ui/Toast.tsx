'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
};

const colors = {
    success: 'bg-green-50 dark:bg-green-500/20 border-green-200 dark:border-green-500/30 text-green-800 dark:text-green-400',
    error: 'bg-red-50 dark:bg-red-500/20 border-red-200 dark:border-red-500/30 text-red-800 dark:text-red-400',
    info: 'bg-blue-50 dark:bg-blue-500/20 border-blue-200 dark:border-blue-500/30 text-blue-800 dark:text-blue-400',
    warning: 'bg-yellow-50 dark:bg-yellow-500/20 border-yellow-200 dark:border-yellow-500/30 text-yellow-800 dark:text-yellow-400',
};

const iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    info: 'text-blue-500',
    warning: 'text-yellow-500',
};

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 3000) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type, duration }]);

        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Toast Container */}
            <div className="fixed bottom-24 left-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none md:left-auto md:right-6 md:max-w-sm">
                <AnimatePresence mode="popLayout">
                    {toasts.map(toast => {
                        const Icon = icons[toast.type];
                        return (
                            <motion.div
                                key={toast.id}
                                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                                className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${colors[toast.type]}`}
                            >
                                <Icon className={`w-5 h-5 flex-shrink-0 ${iconColors[toast.type]}`} />
                                <p className="text-sm font-medium flex-grow">{toast.message}</p>
                                <button
                                    onClick={() => dismissToast(toast.id)}
                                    className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}
