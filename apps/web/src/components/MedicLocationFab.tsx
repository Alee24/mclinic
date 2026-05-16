'use client';

import { useAuth, UserRole } from '@/lib/auth';
import { useState, useEffect } from 'react';
import { FiMapPin, FiWifi } from 'react-icons/fi';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useMedicDashboard } from '@/hooks/useMedicDashboard';

export default function MedicLocationFab() {
    const { user } = useAuth();
    const { isOnline, toggleOnlineStatus, statusUpdating } = useMedicDashboard();
    const [isVisible, setIsVisible] = useState(false);

    // Derived status from hook to ensure consistency
    const status = statusUpdating ? 'locating' : (isOnline ? 'online' : 'offline');

    // Only show for medics
    const isMedic = user && (
        user.role === UserRole.DOCTOR ||
        user.role === UserRole.NURSE ||
        user.role === UserRole.CLINICIAN ||
        user.role === UserRole.MEDIC
    );

    useEffect(() => {
        setIsVisible(!!isMedic);
    }, [isMedic]);

    const handleToggle = async () => {
        await toggleOnlineStatus();
    };

    if (!isVisible) return null;

    if (status === 'online') {
        return null;
    }

    // Offline / Locating State - Prominent Animation
    return (
        <div className="fixed top-20 right-4 z-[99]">
            <button
                onClick={handleToggle}
                disabled={status === 'locating'}
                className="relative group bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-full shadow-xl flex items-center gap-3 transition-all transform hover:scale-105"
            >
                {/* Ping Animation Rings */}
                <span className="absolute -inset-1 rounded-full bg-red-500 opacity-75 animate-ping"></span>
                <span className="absolute -inset-3 rounded-full bg-red-400 opacity-20 animate-pulse"></span>

                <div className="relative flex items-center gap-2">
                    {status === 'locating' ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Locating...</span>
                        </>
                    ) : (
                        <>
                            <FiMapPin className="text-xl" />
                            <div className="text-left">
                                <div className="font-black text-sm uppercase">Go Online</div>
                                <div className="text-[10px] opacity-90 font-medium">Share Location</div>
                            </div>
                        </>
                    )}
                </div>
            </button>
        </div>
    );
}
