'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import toast from 'react-hot-toast';

export interface DashboardStats {
    totalPatients: number;
    appointmentsToday: number;
    pendingReports: number;
    earningsAmount: number;
}

interface MedicDashboardContextType {
    loading: boolean;
    doctorProfile: any;
    stats: DashboardStats;
    upcomingAppointments: any[];
    isOnline: boolean;
    statusUpdating: boolean;
    toggleOnlineStatus: () => Promise<void>;
    refresh: () => Promise<void>;
}

const MedicDashboardContext = createContext<MedicDashboardContextType | undefined>(undefined);

export function MedicDashboardProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [doctorProfile, setDoctorProfile] = useState<any>(null);
    const [stats, setStats] = useState<DashboardStats>({
        totalPatients: 0,
        appointmentsToday: 0,
        pendingReports: 0,
        earningsAmount: 0
    });
    const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
    const [isOnline, setIsOnline] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState(false);
    
    // To prevent multiple error toasts for the same underlying issue
    const errorToastRef = useRef<number>(0);

    const fetchData = useCallback(async () => {
        if (!user?.email) {
            setLoading(false);
            setDoctorProfile(null);
            return;
        }

        const role = (user?.role || '').toLowerCase();
        const isMedic = ['doctor', 'medic', 'nurse', 'clinician'].includes(role);
        if (!isMedic) {
            setLoading(false);
            setDoctorProfile(null);
            return;
        }

        setLoading(true);
        try {
            // 1. Fetch Profile
            console.log('[MedicDashboardProvider] Fetching profile...');
            const profileRes = await api.get('/doctors/profile/me');
            if (profileRes?.ok) {
                const text = await profileRes.text();
                if (text) {
                    try {
                        const profile = JSON.parse(text);
                        setDoctorProfile(profile);
                        setIsOnline(profile?.is_online === 1);
                    } catch (e) {
                        console.error('Failed to parse profile JSON', e);
                    }
                }
            } else if (profileRes?.status === 404) {
                 console.warn('[MedicDashboardProvider] Profile not found (404)');
                 setDoctorProfile(null);
            }

            // 2. Fetch Dashboard Stats
            const statsRes = await api.get('/doctors/dashboard-stats');
            let dashboardStats = { totalPatients: 0, appointmentsToday: 0, pendingReports: 0 };
            if (statsRes?.ok) {
                const statsText = await statsRes.text();
                if (statsText) {
                    try {
                        dashboardStats = JSON.parse(statsText);
                    } catch (e) {
                        console.error('Failed to parse stats JSON', e);
                    }
                }
            }

            // 3. Fetch Financials
            const finRes = await api.get('/financial/stats');
            let finances = { balance: 0 };
            if (finRes?.ok) {
                const finText = await finRes.text();
                if (finText) {
                    try {
                        finances = JSON.parse(finText);
                    } catch (e) {
                        console.error('Failed to parse financial JSON', e);
                    }
                }
            }

            setStats({
                ...dashboardStats,
                earningsAmount: finances.balance || 0
            });

            // 4. Fetch Appointments
            const aptRes = await api.get('/appointments');
            if (aptRes?.ok) {
                const aptText = await aptRes.text();
                if (aptText) {
                    try {
                        const allAppointments = JSON.parse(aptText);
                        setUpcomingAppointments(Array.isArray(allAppointments) ? allAppointments.slice(0, 5) : []);
                    } catch (e) {
                        console.error('Failed to parse appointments JSON', e);
                    }
                }
            }

        } catch (error: any) {
            console.error('[MedicDashboardProvider] Fetch Error:', error);
            // Throttle error toasts
            const now = Date.now();
            if (now - errorToastRef.current > 10000) {
                toast.error('Dashboard sync issue. Please check your connection.');
                errorToastRef.current = now;
            }
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const finishOnlineUpdate = async (latitude: number | null, longitude: number | null) => {
        if (!doctorProfile?.id) {
            toast.error('Unable to sync location: Doctor record not identified.');
            setStatusUpdating(false);
            return;
        }
        
        try {
            console.log(`[MedicDashboardProvider] Syncing status to server for doc ${doctorProfile.id}`);
            const res = await api.patch(`/doctors/${doctorProfile.id}/online-status`, { 
                status: 1, 
                latitude: latitude || 0, 
                longitude: longitude || 0 
            });
            
            if (res && res.ok) {
                setIsOnline(true);
                toast.success('You are now Online');
            } else {
                const errText = await res?.text();
                throw new Error(errText || 'Server rejection');
            }
        } catch (e: any) {
            console.error('[MedicDashboardProvider] Online Update Error:', e);
            toast.error(`Failed to go online: ${e.message}`);
        } finally {
            setStatusUpdating(false);
        }
    };

    const toggleOnlineStatus = async () => {
        // Prevent action if still initializing to avoid "null profile" errors
        if (loading) {
            toast.loading('Initializing profile... please wait.', { id: 'medic-init' });
            return;
        }
        toast.dismiss('medic-init');

        if (!doctorProfile) {
            toast.error('Doctor profile not loaded. Please ensure your account is activated.');
            // Try one last sync attempt
            fetchData();
            return;
        }
        
        if (statusUpdating) return;

        const newStatus = !isOnline;
        setStatusUpdating(true);

        try {
            if (newStatus) {
                console.log('[MedicDashboardProvider] Requesting geolocation...');
                if (navigator.geolocation) {
                    const geoTimeout = setTimeout(() => {
                        console.warn('[MedicDashboardProvider] Geolocation timed out');
                        finishOnlineUpdate(null, null);
                    }, 12000);

                    navigator.geolocation.getCurrentPosition(
                        async (pos) => {
                            clearTimeout(geoTimeout);
                            await finishOnlineUpdate(pos.coords.latitude, pos.coords.longitude);
                        },
                        async (err) => {
                            clearTimeout(geoTimeout);
                            console.warn('[MedicDashboardProvider] Geo error:', err.message);
                            toast.error('Location unavailable. Going online without GPS.');
                            await finishOnlineUpdate(null, null);
                        },
                        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
                    );
                } else {
                    toast.error('Geolocation not supported. Going online without location.');
                    await finishOnlineUpdate(null, null);
                }
            } else {
                console.log('[MedicDashboardProvider] Going offline...');
                const res = await api.patch(`/doctors/${doctorProfile.id}/online-status`, { status: 0 });
                if (res && res.ok) {
                    setIsOnline(false);
                    toast.success('You are now Offline');
                } else {
                    throw new Error('Failed to update status');
                }
                setStatusUpdating(false);
            }
        } catch (error: any) {
            console.error('[MedicDashboardProvider] Toggle Error:', error);
            toast.error(`Status update failed: ${error.message}`);
            setStatusUpdating(false);
        }
    };

    return (
        <MedicDashboardContext.Provider value={{
            loading,
            doctorProfile,
            stats,
            upcomingAppointments,
            isOnline,
            statusUpdating,
            toggleOnlineStatus,
            refresh: fetchData
        }}>
            {children}
        </MedicDashboardContext.Provider>
    );
}

export function useMedicDashboard() {
    const context = useContext(MedicDashboardContext);
    if (context === undefined) {
        // Return a dummy state or throw error
        // Throwing is safer to ensure layout is correctly wrapped
        throw new Error('useMedicDashboard must be used within a MedicDashboardProvider');
    }
    return context;
}
