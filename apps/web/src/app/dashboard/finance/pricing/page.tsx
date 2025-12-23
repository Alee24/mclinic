'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function PricingPage() {
    const [prices, setPrices] = useState<any[]>([]);
    const [formData, setFormData] = useState({ serviceName: '', amount: '' });
    const [loading, setLoading] = useState(false);

    const fetchPrices = async () => {
        const res = await api.get('/financial/prices');
        if (res && res.ok) {
            setPrices(await res.json());
        }
    };

    useEffect(() => {
        fetchPrices();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/financial/prices', {
                serviceName: formData.serviceName,
                amount: parseFloat(formData.amount),
            });
            if (res && res.ok) {
                setFormData({ serviceName: '', amount: '' });
                fetchPrices();
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                <h1 className="text-2xl font-bold mb-6 dark:text-white">Pricing Management</h1>

                <div className="bg-white dark:bg-[#121212] p-6 rounded-xl border border-gray-200 dark:border-gray-800 mb-8">
                    <h2 className="text-lg font-semibold mb-4 dark:text-gray-200">Set Service Price</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Service Name</label>
                            <input
                                type="text"
                                value={formData.serviceName}
                                onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                                placeholder="e.g. Consultation"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black dark:text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Amount (KES)</label>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                placeholder="0.00"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black dark:text-white"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-primary text-black font-bold px-6 py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Set Price'}
                        </button>
                    </form>
                </div>
            </div>

            <div>
                <h2 className="text-lg font-semibold mb-4 dark:text-gray-200 mt-0 lg:mt-14">Current Prices</h2>
                <div className="bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Service</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Type</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {prices.length === 0 ? (
                                <tr><td colSpan={3} className="px-6 py-4 text-center text-gray-500">No prices set</td></tr>
                            ) : (
                                prices.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-6 py-4 font-medium dark:text-white">{p.serviceName}</td>
                                        <td className="px-6 py-4 dark:text-gray-300">{p.currency} {p.amount}</td>
                                        <td className="px-6 py-4 text-xs text-gray-500">{p.doctorId ? 'Doctor Override' : 'Global'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
