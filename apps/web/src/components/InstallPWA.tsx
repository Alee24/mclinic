'use client';

import { useState, useEffect } from 'react';
import { FiDownload } from 'react-icons/fi';

export default function InstallPWA() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setIsVisible(false);
        }
        setDeferredPrompt(null);
    };

    if (!isVisible) return null;

    return (
        <button
            onClick={handleInstall}
            className="fixed bottom-6 right-6 z-50 bg-[#C2003F] text-white px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2 hover:bg-[#A00033] transition-all animate-bounce"
        >
            <FiDownload /> Install App
        </button>
    );
}
