'use client';

import { useEffect, useState } from 'react';

interface EncryptionSpinnerProps {
    message?: string;
    subMessage?: string;
}

export default function EncryptionSpinner({
    message = "Encrypting connection...",
    subMessage = "Securing your data"
}: EncryptionSpinnerProps) {
    const [dots, setDots] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '' : prev + '.');
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
            <div className="flex flex-col items-center justify-center p-8 max-w-md">
                {/* Animated Lock Icon with Rotating Shield */}
                <div className="relative w-32 h-32 mb-8">
                    {/* Outer rotating ring */}
                    <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>

                    {/* Primary spinner */}
                    <div className="absolute inset-0 border-4 border-transparent border-t-[#00C65E] rounded-full animate-spin"
                        style={{ animationDuration: '1s' }}></div>

                    {/* Inner ring */}
                    <div className="absolute inset-3 border-4 border-gray-100 dark:border-gray-800 rounded-full"></div>

                    {/* Secondary counter-rotating spinner */}
                    <div className="absolute inset-3 border-4 border-transparent border-b-[#00C65E] rounded-full animate-spin"
                        style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>

                    {/* Center lock icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg
                            className="w-12 h-12 text-[#00C65E] animate-pulse"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                        </svg>
                    </div>

                    {/* Animated security badge */}
                    <div className="absolute -top-2 -right-2 bg-white dark:bg-gray-900 p-2 rounded-full border-2 border-gray-100 dark:border-gray-700 shadow-lg animate-bounce">
                        <svg
                            className="w-5 h-5 text-[#00C65E]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            />
                        </svg>
                    </div>
                </div>

                {/* Status indicator */}
                <div className="text-center space-y-3 w-full">
                    <div className="flex items-center justify-center gap-2 text-[#00C65E] font-bold tracking-wider text-sm uppercase">
                        <span className="w-2 h-2 bg-[#00C65E] rounded-full animate-ping"></span>
                        <span>SECURE</span>
                    </div>

                    {/* Main message with animated dots */}
                    <div className="h-8">
                        <p className="text-base font-semibold text-gray-800 dark:text-gray-200 font-mono">
                            {message}{dots}
                        </p>
                    </div>

                    {/* Sub message */}
                    {subMessage && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {subMessage}
                        </p>
                    )}
                </div>

                {/* Progress bar */}
                <div className="w-64 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-6 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#00C65E] to-[#00A850] animate-[shimmer_2s_infinite] w-full origin-left scale-x-0 animate-[progress_3s_ease-out_forwards]"></div>
                </div>

                {/* Encryption keys animation */}
                <div className="mt-8 flex gap-2 opacity-50">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="w-1.5 h-8 bg-[#00C65E] rounded-full animate-pulse"
                            style={{
                                animationDelay: `${i * 0.2}s`,
                                animationDuration: '1.5s'
                            }}
                        ></div>
                    ))}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes progress {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
      `}} />
        </div>
    );
}
