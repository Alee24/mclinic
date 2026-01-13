'use client';
import { FiShield, FiLock, FiDatabase, FiCheck } from 'react-icons/fi';
import { useState, useEffect } from 'react';

export default function SecureLoader({ text = "Establishing Secure Connection" }: { text?: string }) {
    const [status, setStatus] = useState("Encrypting connection...");

    useEffect(() => {
        const steps = [
            "Verifying identity...",
            "Encrypting data stream (256-bit AES)...",
            "Handshake successful.",
            "Loading secure environment..."
        ];

        let i = 0;
        const interval = setInterval(() => {
            if (i < steps.length) {
                setStatus(steps[i]);
                i++;
            }
        }, 800);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center p-8">
            <div className="relative w-24 h-24 mb-6">
                {/* Outer Ring */}
                <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-800 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-transparent border-t-[#00C65E] rounded-full animate-spin" style={{ animationDuration: '1s' }}></div>

                {/* Inner Ring */}
                <div className="absolute inset-3 border-4 border-gray-100 dark:border-gray-900 rounded-full"></div>
                <div className="absolute inset-3 border-4 border-transparent border-b-[#00C65E] rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>

                {/* Center Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <FiShield className="text-3xl text-[#00C65E] animate-pulse" />
                </div>

                {/* Floating Lock */}
                <div className="absolute -top-2 -right-2 bg-white dark:bg-black p-1.5 rounded-full border border-gray-100 dark:border-gray-800 shadow-sm animate-bounce">
                    <FiLock className="text-xs text-[#00C65E]" />
                </div>
            </div>

            <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-[#00C65E] font-bold tracking-wider text-xs uppercase">
                    <span className="w-2 h-2 bg-[#00C65E] rounded-full animate-ping"></span>
                    SECURE
                </div>
                <div className="h-6">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 font-mono">
                        {status}
                    </p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-48 h-1 bg-gray-100 dark:bg-gray-800 rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-[#00C65E] animate-[shimmer_2s_infinite] w-full origin-left scale-x-0 animate-[progress_3s_ease-out_forwards]"></div>
            </div>
        </div>
    );
}
