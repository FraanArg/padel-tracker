'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, ArrowLeftRight, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { href: '/', label: 'Home', icon: Home },
        { href: '/rankings', label: 'Rankings', icon: Trophy },
        { href: '/compare', label: 'Compare', icon: ArrowLeftRight },
        { href: '/favorites', label: 'Favorites', icon: Heart },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 pb-safe md:hidden">
            <div className="flex justify-around items-center h-16 px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="relative flex flex-col items-center justify-center w-full h-full active:scale-90 transition-transform duration-200"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="bottomNavIndicator"
                                    className="absolute -top-[1px] w-12 h-[2px] bg-blue-500 rounded-full"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                            <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'text-blue-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <span className={`text-[10px] font-medium mt-0.5 ${isActive ? 'text-blue-500' : 'text-slate-400'}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
