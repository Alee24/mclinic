'use client';

import { useAuth, UserRole } from '@/lib/auth';
import { FiUsers, FiDollarSign } from 'react-icons/fi';

export default function PayrollPage() {
    const { user } = useAuth();

    if (user?.role !== UserRole.ADMIN) {
        return <div className="p-8 text-center text-gray-500">Access Denied</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Staff Payroll</h1>
                    <p className="text-gray-500 text-sm">Manage salaries, payments and payslips.</p>
                </div>
                <button className="bg-primary text-black font-bold px-4 py-2 rounded-lg hover:opacity-90 transition text-sm">
                    Run Payroll
                </button>
            </div>

            <div className="bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-gray-800 p-12 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    {/* @ts-ignore */}
                    <FiUsers size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Payroll System</h3>
                <p className="text-gray-500 max-w-sm mb-6">
                    Payroll module implementation is pending. This section will allow managing doctor payouts and staff salaries.
                </p>
                <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                    <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                        <div className="text-2xl font-bold mb-1">0</div>
                        <div className="text-xs text-gray-500 uppercase">Active Staff</div>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                        <div className="text-2xl font-bold mb-1">KES 0</div>
                        <div className="text-xs text-gray-500 uppercase">Total Monthly Payout</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
