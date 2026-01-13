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
        if (theme === 'system') {
            setTheme('light');
        } else if (theme === 'light') {
            setTheme('dark');
        } else {
            setTheme('system');
        }
    };

    const getIcon = () => {
        if (theme === 'system') return (
            <div className="relative w-5 h-5 flex items-center justify-center">
                <span className="text-xs font-bold">A</span>
            </div>
        );
        if (theme === 'dark') return <FiMoon className="w-5 h-5" />;
        return <FiSun className="w-5 h-5 text-amber-500" />;
    };

    return (
        <button
            onClick={toggleTheme}
            className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
            aria-label="Toggle theme"
            title={`Current: ${theme === 'system' ? 'System (Auto)' : theme}`}
        >
            <div className={`transition-transform duration-500 ${theme === 'dark' ? 'rotate-0' : theme === 'light' ? 'rotate-180' : ''}`}>
                {getIcon()}
            </div>

            {/* Tooltip */}
            <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
                {theme === 'system' ? 'System Mode' : theme === 'light' ? 'Light Mode' : 'Dark Mode'}
            </span>
        </button>
    );
}
