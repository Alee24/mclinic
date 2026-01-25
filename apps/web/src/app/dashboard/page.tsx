'use client';

import { useAuth, UserRole } from '@/lib/auth';
import AdminView from '@/components/dashboard/AdminView';
import MedicView from '@/components/dashboard/MedicView';
import PatientView from '@/components/dashboard/PatientView';
import FinanceView from '@/components/dashboard/FinanceView';
import PharmacyView from '@/components/dashboard/PharmacyView';
import LabTechView from '@/components/dashboard/LabTechView';

export default function DashboardPage() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-donezo-dark"></div>
            </div>
        );
    }

    const normalizedRole = (user?.role || '').toLowerCase();

    if (normalizedRole === 'admin') {
        return <AdminView />;
    }

    // Unified Provider View
    if (['medic', 'doctor', 'nurse', 'clinician'].includes(normalizedRole)) {
        return <MedicView />;
    }

    if (normalizedRole === 'finance') {
        return <FinanceView />;
    }

    if (normalizedRole === 'pharmacist') {
        return <PharmacyView />;
    }

    if (['lab_tech', 'lab_technician'].includes(normalizedRole)) {
        return <LabTechView />;
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
