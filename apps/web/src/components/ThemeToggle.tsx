'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';

export function ThemeToggle() {
    const { setTheme, theme, systemTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="w-9 h-9 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-full" />
        );
    }

    const currentTheme = theme === 'system' ? systemTheme : theme;
    const isDark = resolvedTheme === 'dark' || currentTheme === 'dark';

    const toggleTheme = () => {
        const newTheme = isDark ? 'light' : 'dark';
        setTheme(newTheme);
    };

    return (
        <button
            onClick={toggleTheme}
            className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-all duration-300 group"
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            <div className="relative w-5 h-5">
                {/* Sun Icon (Light Mode) */}
                <FiSun
                    className={`absolute inset-0 w-5 h-5 text-amber-500 transition-all duration-500 ${isDark
                            ? 'rotate-90 scale-0 opacity-0'
                            : 'rotate-0 scale-100 opacity-100'
                        }`}
                />
                {/* Moon Icon (Dark Mode) */}
                <FiMoon
                    className={`absolute inset-0 w-5 h-5 text-slate-700 dark:text-slate-300 transition-all duration-500 ${isDark
                            ? 'rotate-0 scale-100 opacity-100'
                            : '-rotate-90 scale-0 opacity-0'
                        }`}
                />
            </div>

            {/* Tooltip */}
            <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {isDark ? 'Light mode' : 'Dark mode'}
            </span>
        </button>
    );
}
