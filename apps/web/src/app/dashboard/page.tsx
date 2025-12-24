'use client';

import { useAuth, UserRole } from '@/lib/auth';
import AdminView from '@/components/dashboard/AdminView';
import DoctorView from '@/components/dashboard/DoctorView';
import PatientView from '@/components/dashboard/PatientView';

export default function DashboardPage() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-donezo-dark"></div>
            </div>
        );
    }

    if (user?.role === UserRole.ADMIN) {
        return <AdminView />;
    }

    if (user?.role === UserRole.DOCTOR) {
        return <DoctorView />;
    }

    if (user?.role === UserRole.PATIENT) {
        return <PatientView />;
    }

    return (
        <div className="p-8 text-center text-gray-500 italic">
            Unable to identifer your role. Please contact support.
        </div>
    );
}
