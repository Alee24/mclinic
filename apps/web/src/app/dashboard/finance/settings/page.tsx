'use client';

import { useAuth, UserRole } from '@/lib/auth';
import { FiSettings, FiCreditCard, FiDollarSign } from 'react-icons/fi';

export default function FinanceSettingsPage() {
    const { user } = useAuth();

    if (user?.role !== UserRole.ADMIN) {
        return <div className="p-8 text-center text-gray-500">Access Denied</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Finance Settings</h1>
                    <p className="text-gray-500 text-sm">Configure payment gateways, tax rates and billing preferences.</p>
                </div>
                <button className="bg-primary text-black font-bold px-4 py-2 rounded-lg hover:opacity-90 transition text-sm">
                    Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white">
                        <FiCreditCard /> Payment Methods
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <span className="font-medium dark:text-gray-300">M-PESA Integration</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Active</span>
                                <button className="text-sm text-blue-600 hover:underline">Configure</button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <span className="font-medium dark:text-gray-300">Stripe / Card</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Disabled</span>
                                <button className="text-sm text-blue-600 hover:underline">Enable</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white">
                        <FiDollarSign /> Billing Preferences
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-400">Default Currency</label>
                            <select className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white">
                                <option>KES (Kenyan Shilling)</option>
                                <option>USD (US Dollar)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-400">Tax Rate (%)</label>
                            <input type="number" defaultValue="16" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
