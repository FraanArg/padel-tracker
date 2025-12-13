'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';

export interface SegmentedControlOption {
    value: string;
    label: string;
    icon?: React.ReactNode;
}

interface SegmentedControlProps {
    options: SegmentedControlOption[];
    value: string;
    onChange: (value: string) => void;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export default function SegmentedControl({
    options,
    value,
    onChange,
    size = 'md',
    className = ''
}: SegmentedControlProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

    const selectedIndex = options.findIndex(opt => opt.value === value);

    // Update indicator position when value changes
    useEffect(() => {
        if (containerRef.current && selectedIndex >= 0) {
            const buttons = containerRef.current.querySelectorAll('button');
            const selectedButton = buttons[selectedIndex];
            if (selectedButton) {
                setIndicatorStyle({
                    left: selectedButton.offsetLeft,
                    width: selectedButton.offsetWidth
                });
            }
        }
    }, [value, selectedIndex, options]);

    // Handle keyboard navigation
    const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
        let newIndex = index;

        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                newIndex = index > 0 ? index - 1 : options.length - 1;
                break;
            case 'ArrowRight':
                e.preventDefault();
                newIndex = index < options.length - 1 ? index + 1 : 0;
                break;
            case 'Home':
                e.preventDefault();
                newIndex = 0;
                break;
            case 'End':
                e.preventDefault();
                newIndex = options.length - 1;
                break;
            default:
                return;
        }

        onChange(options[newIndex].value);
        // Focus the new button
        const buttons = containerRef.current?.querySelectorAll('button');
        buttons?.[newIndex]?.focus();
    };

    const sizeClasses = {
        sm: 'h-8 text-xs',
        md: 'h-10 text-sm',
        lg: 'h-12 text-base'
    };

    const paddingClasses = {
        sm: 'px-3',
        md: 'px-4',
        lg: 'px-5'
    };

    return (
        <div
            ref={containerRef}
            role="tablist"
            aria-label="View options"
            className={`
                relative inline-flex p-1 rounded-xl
                bg-slate-100 dark:bg-white/10
                ${className}
            `}
        >
            {/* Sliding indicator */}
            <motion.div
                className="absolute top-1 bottom-1 rounded-lg bg-white dark:bg-slate-700 shadow-sm"
                initial={false}
                animate={{
                    left: indicatorStyle.left,
                    width: indicatorStyle.width
                }}
                transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 35
                }}
            />

            {/* Options */}
            {options.map((option, index) => {
                const isSelected = option.value === value;
                return (
                    <button
                        key={option.value}
                        role="tab"
                        aria-selected={isSelected}
                        aria-controls={`panel-${option.value}`}
                        tabIndex={isSelected ? 0 : -1}
                        onClick={() => onChange(option.value)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className={`
                            relative z-10 flex items-center justify-center gap-1.5
                            ${sizeClasses[size]} ${paddingClasses[size]}
                            font-semibold rounded-lg
                            transition-colors duration-200
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                            ${isSelected
                                ? 'text-slate-900 dark:text-white'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }
                        `}
                    >
                        {option.icon}
                        <span>{option.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
