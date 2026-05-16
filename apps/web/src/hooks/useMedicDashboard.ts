import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import toast from 'react-hot-toast';

export interface DashboardStats {
    totalPatients: number;
    appointmentsToday: number;
    pendingReports: number;
    earningsAmount: number;
}

export function useMedicDashboard() {
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

    const fetchData = useCallback(async () => {
        if (!user?.email) return;

        // Prevent fetching if not a medic role (e.g. Admin/Patient)
        const role = (user?.role || '').toLowerCase();
        const isMedic = ['doctor', 'medic', 'nurse', 'clinician'].includes(role);
        if (!isMedic) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            // 1. Fetch Profile
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
            }

            // 2. Fetch Dashboard Stats (New Endpoint)
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

            // 3. Fetch Financials (Balance)
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

            // 4. Fetch Appointments for List
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

        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const toggleOnlineStatus = async () => {
        if (!doctorProfile) {
            if (!loading) {
                toast.error('Doctor profile not found. Please ensure you are registered as a medic.');
            } else {
                toast.error('Still loading profile... Please wait.');
            }
            return;
        }
        
        if (statusUpdating) return;

        const newStatus = !isOnline;
        setStatusUpdating(true);

        console.log(`[useMedicDashboard] Toggling online status to: ${newStatus}`);

        try {
            if (newStatus) {
                // Going Online - Get Location
                if (navigator.geolocation) {
                    // Set a safety timeout to prevent permanent "Locating..." state
                    const geoTimeout = setTimeout(() => {
                        console.warn('[useMedicDashboard] Geolocation timed out, proceeding with null coordinates');
                        finishOnlineUpdate(null, null);
                    }, 12000); // 12s timeout

                    navigator.geolocation.getCurrentPosition(
                        async (pos) => {
                            clearTimeout(geoTimeout);
                            const { latitude, longitude } = pos.coords;
                            console.log(`[useMedicDashboard] Location acquired: ${latitude}, ${longitude}`);
                            await finishOnlineUpdate(latitude, longitude);
                        },
                        async (err) => {
                            clearTimeout(geoTimeout);
                            console.error('[useMedicDashboard] Geolocation error:', err);
                            toast.error('Location access denied or unavailable. Going online without GPS.');
                            await finishOnlineUpdate(null, null);
                        },
                        {
                            enableHighAccuracy: false, // Faster results
                            timeout: 10000,
                            maximumAge: 60000
                        }
                    );
                } else {
                    console.warn('[useMedicDashboard] Geolocation not supported');
                    toast.error('Geolocation not supported. Going online without location.');
                    await finishOnlineUpdate(null, null);
                }
            } else {
                // Going Offline
                console.log('[useMedicDashboard] Going offline...');
                const res = await api.patch(`/doctors/${doctorProfile.id}/online-status`, { status: 0 });
                if (res && res.ok) {
                    setIsOnline(false);
                    toast.success('You are now Offline');
                } else {
                    throw new Error('Failed to update status on server');
                }
            }
        } catch (error) {
            console.error('[useMedicDashboard] Error toggling status:', error);
            toast.error('Failed to update status. Please try again.');
        } finally {
            // Ensure we only set statusUpdating to false if NOT going online (as finishOnlineUpdate handles it)
            if (!newStatus) {
                setStatusUpdating(false);
            }
        }
    };

    const finishOnlineUpdate = async (latitude: number | null, longitude: number | null) => {
        try {
            console.log(`[useMedicDashboard] Syncing online status to server...`);
            const res = await api.patch(`/doctors/${doctorProfile.id}/online-status`, { 
                status: 1, 
                latitude: latitude || 0, 
                longitude: longitude || 0 
            });
            
            if (res && res.ok) {
                setIsOnline(true);
                toast.success('You are now Online');
            } else {
                const errText = res ? await res.text() : 'Session expired';
                console.error('[useMedicDashboard] Server error going online:', errText);
                throw new Error('Server rejected status update');
            }
        } catch (e) {
            console.error('[useMedicDashboard] Error in finishOnlineUpdate:', e);
            toast.error('Failed to go online on server.');
            // Revert state if possible or just let the user try again
        } finally {
            setStatusUpdating(false);
        }
    };

    return {
        loading,
        doctorProfile,
        stats,
        upcomingAppointments,
        isOnline,
        statusUpdating,
        toggleOnlineStatus,
        refresh: fetchData
    };
}
