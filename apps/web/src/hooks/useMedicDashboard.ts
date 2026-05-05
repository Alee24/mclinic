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
        if (!doctorProfile || statusUpdating) return;

        const newStatus = !isOnline;
        setStatusUpdating(true);

        try {
            if (newStatus) {
                // Going Online - Get Location
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        async (pos) => {
                            try {
                                const { latitude, longitude } = pos.coords;
                                await api.patch(`/doctors/${doctorProfile.id}/online-status`, { status: 1, latitude, longitude });
                                setIsOnline(true);
                                toast.success('You are now Online');
                            } catch (e) {
                                console.error(e);
                                toast.error('Failed to update status');
                            } finally {
                                setStatusUpdating(false);
                            }
                        },
                        (err) => {
                            console.error('Geolocation error:', err);
                            toast.error('Location access required to go online.');
                            setStatusUpdating(false);
                        },
                        {
                            enableHighAccuracy: true,
                            timeout: 15000,
                            maximumAge: 0
                        }
                    );
                } else {
                    toast.error('Geolocation not supported.');
                    setStatusUpdating(false);
                }
            } else {
                // Going Offline
                await api.patch(`/doctors/${doctorProfile.id}/online-status`, { status: 0 });
                setIsOnline(false);
                toast.success('You are now Offline');
                setStatusUpdating(false);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to update status');
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
