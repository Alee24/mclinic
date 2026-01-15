'use client';
import { usePWA } from '@/providers/PWAProvider';
import { FiDownload, FiX } from 'react-icons/fi';
import { useState } from 'react';

export default function PWAInstallButton() {
    const { isInstallable, install } = usePWA();
    const [isVisible, setIsVisible] = useState(true);

    if (!isInstallable || !isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-2xl shadow-xl shadow-green-500/30 flex items-center justify-between border border-white/20 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <FiDownload className="text-xl" />
                    </div>
                    <div>
                        <div className="font-bold text-sm">Install M-Clinic App</div>
                        <div className="text-xs text-green-100">Better experience, offline access</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={install}
                        className="bg-white text-green-700 px-4 py-2 rounded-lg text-xs font-bold shadow hover:bg-green-50 transition"
                    >
                        Install
                    </button>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="p-2 hover:bg-white/20 rounded-lg transition"
                    >
                        <FiX />
                    </button>
                </div>
            </div>
        </div>
    );
}
