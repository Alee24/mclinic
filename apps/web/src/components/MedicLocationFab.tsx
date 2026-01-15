'use client';

import { useAuth, UserRole } from '@/lib/auth';
import { useState, useEffect } from 'react';
import { FiMapPin, FiWifi } from 'react-icons/fi';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function MedicLocationFab() {
    const { user } = useAuth();
    const [status, setStatus] = useState<'offline' | 'locating' | 'online'>('offline');
    const [isVisible, setIsVisible] = useState(false);

    // Only show for medics
    const isMedic = user && (
        user.role === UserRole.DOCTOR ||
        user.role === UserRole.NURSE ||
        user.role === UserRole.CLINICIAN ||
        user.role === UserRole.MEDIC
    );

    useEffect(() => {
        if (isMedic) {
            // Reset to offline on mount (login/refresh) as requested ("always start at off state")
            setStatus('offline');
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [user, isMedic]);

    const handleGoOnline = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        setStatus('locating');
        toast.loading('Acquiring location...', { id: 'loc-status' });

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    // We need the doctorId. 
                    // Usually available in user object if Login response attached it (doctorId), 
                    // or we fetch profile. 
                    // Let's assume user.doctorId exists or we fetch /doctors/profile/me to be safe.

                    let doctorId = (user as any).doctorId;

                    if (!doctorId) {
                        const res = await api.get('/doctors/profile/me');
                        if (res && res.ok) {
                            const doc = await res.json();
                            doctorId = doc.id;
                        }
                    }

                    if (!doctorId) {
                        throw new Error('Doctor profile not found');
                    }

                    const res = await api.patch(`/doctors/${doctorId}/online-status`, {
                        status: 1, // Online
                        latitude,
                        longitude
                    });

                    if (res && res.ok) {
                        setStatus('online');
                        toast.success('You are now Online & Visible', { id: 'loc-status' });
                    } else {
                        throw new Error('Failed to update status');
                    }

                } catch (error) {
                    console.error(error);
                    setStatus('offline');
                    toast.error('Failed to go online. Check connection.', { id: 'loc-status' });
                }
            },
            (error) => {
                console.error(error);
                setStatus('offline');
                let msg = 'Unable to retrieve location.';
                if (error.code === 1) msg = 'Location permission denied. Please enable GPS.';
                if (error.code === 2) msg = 'Location unavailable.';
                if (error.code === 3) msg = 'Location timeout.';
                toast.error(msg, { id: 'loc-status' });
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    };

    if (!isVisible) return null;

    if (status === 'online') {
        // Show a subtle "Online" indicator that doesn't annoy
        return (
            <div className="fixed bottom-24 right-4 z-[40]">
                <div className="bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-bold animate-pulse">
                    <FiWifi /> You are Online
                </div>
            </div>
        );
    }

    // Offline / Locating State - Prominent Animation
    return (
        <div className="fixed bottom-24 right-4 z-[40]">
            <button
                onClick={handleGoOnline}
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
