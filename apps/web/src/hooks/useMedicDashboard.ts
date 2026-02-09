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

    const fetchData = useCallback(async () => {
        if (!user?.email) return;
        setLoading(true);
        try {
            // 1. Fetch Profile
            const profileRes = await api.get('/doctors/profile/me');
            if (profileRes?.ok) {
                const profile = await profileRes.json();
                setDoctorProfile(profile);
                setIsOnline(profile?.is_online === 1);
            }

            // 2. Fetch Dashboard Stats (New Endpoint)
            const statsRes = await api.get('/doctors/dashboard-stats');
            let dashboardStats = { totalPatients: 0, appointmentsToday: 0, pendingReports: 0 };
            if (statsRes?.ok) {
                dashboardStats = await statsRes.json();
            }

            // 3. Fetch Financials (Balance)
            const finRes = await api.get('/financial/stats');
            let finances = { balance: 0 };
            if (finRes?.ok) {
                finances = await finRes.json();
            }

            setStats({
                ...dashboardStats,
                earningsAmount: finances.balance || 0
            });

            // 4. Fetch Appointments for List
            const aptRes = await api.get('/appointments');
            if (aptRes?.ok) {
                const allAppointments = await aptRes.json();
                // Filter for upcoming (today onwards, not completed/cancelled) logic could be here, 
                // but let's just take top 5 recent ones or today's.
                // The existing view sorted by date DESC generally.
                // We want "Upcoming" so maybe future dates?
                // The current backend returns generic list. Let's filter for relevant display.
                // For now, mimic existing behavior: slice 0, 5.
                setUpcomingAppointments(allAppointments.slice(0, 5));
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
        if (!doctorProfile) return;

        const newStatus = !isOnline;
        try {
            if (newStatus) {
                // Going Online - Get Location
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(async (pos) => {
                        const { latitude, longitude } = pos.coords;
                        await api.patch(`/doctors/${doctorProfile.id}/online-status`, { status: 1, latitude, longitude });
                        setIsOnline(true);
                        toast.success('You are now Online');
                    }, (err) => {
                        toast.error('Location access required to go online.');
                    });
                } else {
                    toast.error('Geolocation not supported.');
                }
            } else {
                // Going Offline
                await api.patch(`/doctors/${doctorProfile.id}/online-status`, { status: 0 });
                setIsOnline(false);
                toast.success('You are now Offline');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to update status');
        }
    };

    return {
        loading,
        doctorProfile,
        stats,
        upcomingAppointments,
        isOnline,
        toggleOnlineStatus,
        refresh: fetchData
    };
}
