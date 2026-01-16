'use client';

import { useEffect, useState } from 'react';
import { useAuth, UserRole } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { FiShield } from 'react-icons/fi';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (user?.role === UserRole.ADMIN) {
                setIsAuthorized(true);
            } else {
                // Not an admin, redirect or show denied
                // We prefer showing denied to avoid infinite redirects if dashboard defaults to something else
                setIsAuthorized(false);
            }
        }
    }, [user, loading]);

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user || user.role !== UserRole.ADMIN) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 space-y-4">
                <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full">
                    <FiShield className="w-12 h-12 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold dark:text-white">Access Denied</h2>
                <p className="text-gray-500 max-w-md">
                    This area is restricted to System Administrators only.
                    If you believe you should have access, please contact support.
                </p>
                <button
                    onClick={() => router.push('/dashboard')}
                    className="px-6 py-2 bg-primary text-black font-bold rounded-lg hover:opacity-90 transition"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    // authorized
    return <>{children}</>;
}
