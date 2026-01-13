'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface PWAContextType {
    isInstallable: boolean;
    install: () => Promise<void>;
}

const PWAContext = createContext<PWAContextType>({
    isInstallable: false,
    install: async () => { },
});

export const usePWA = () => useContext(PWAContext);

export function PWAProvider({ children }: { children: React.ReactNode }) {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isInstallable, setIsInstallable] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
            console.log('[PWA] Install prompt captured');
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Check if installed
        if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstallable(false);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const install = async () => {
        if (!deferredPrompt) {
            console.log('[PWA] No deferred prompt available');
            return;
        }

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`[PWA] User response: ${outcome}`);

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsInstallable(false);
        }
    };

    return (
        <PWAContext.Provider value={{ isInstallable, install }}>
            {children}
        </PWAContext.Provider>
    );
}
