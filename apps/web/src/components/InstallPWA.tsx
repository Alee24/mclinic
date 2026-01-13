'use client';
import { FiDownload } from 'react-icons/fi';
import { usePWA } from '@/providers/PWAProvider';

export default function InstallPWA() {
    const { isInstallable, install } = usePWA();

    if (!isInstallable) return null;

    return (
        <button
            onClick={install}
            className="fixed bottom-6 right-6 z-50 bg-[#C2003F] text-white px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2 hover:bg-[#A00033] transition-all animate-bounce"
        >
            <FiDownload /> Install App
        </button>
    );
}
