'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FiDollarSign, FiTrendingUp, FiCreditCard, FiCheckCircle, FiClock, FiDownload } from 'react-icons/fi';

export default function FinanceView() {
    const [stats, setStats] = useState<any>(null);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch Stats
                const statsRes = await api.get('/financial/stats');
                if (statsRes && statsRes.ok) setStats(await statsRes.json());

                // Fetch Recent Invoices
                const invRes = await api.get('/financial/invoices');
                if (invRes && invRes.ok) setInvoices(await invRes.json());

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleConfirmPayment = async (invoiceId: number) => {
        if (!confirm("Confirm manual payment receipt for this invoice?")) return;
        try {
            await api.post(`/financial/invoices/${invoiceId}/confirm-payment`, { paymentMethod: 'CASH' });
            alert("Payment Confirmed");
            // Reload
            window.location.reload();
        } catch (e) {
            alert("Failed to confirm payment");
        }
    }

    if (loading) return <div className="p-8 text-center">Loading Financial Data...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold dark:text-white">Finance Dashboard</h1>
                    <p className="text-gray-500">Overview of clinic revenue, invoices, and payouts.</p>
                </div>
                <button className="flex items-center gap-2 bg-primary text-black px-4 py-2 rounded-lg font-bold">
                    <FiDownload /> Export Reports
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard label="Total Revenue" value={`KES ${(stats?.totalRevenue || 0).toLocaleString()}`} icon={<FiTrendingUp />} color="green" />
                <StatCard label="Pending Invoices" value={stats?.invoices?.pending || 0} icon={<FiClock />} color="orange" />
                <StatCard label="Net Income (40%)" value={`KES ${(stats?.netRevenue || 0).toLocaleString()}`} icon={<FiDollarSign />} color="blue" />
                <StatCard label="Doctor Payouts Pending" value={`KES ${(stats?.pendingClearance || 0).toLocaleString()}`} icon={<FiCreditCard />} color="purple" />
            </div>

            {/* Recent Invoices Table */}
            <div className="bg-white dark:bg-[#161616] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="font-bold text-lg dark:text-white">Recent Invoices</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 font-bold uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Invoice #</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {invoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition">
                                    <td className="px-6 py-4 font-mono">{inv.invoiceNumber}</td>
                                    <td className="px-6 py-4 font-bold dark:text-gray-300">{inv.customerName}</td>
                                    <td className="px-6 py-4">{new Date(inv.dueDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-bold">KES {Number(inv.totalAmount).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${inv.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {inv.status !== 'PAID' && (
                                            <button
                                                onClick={() => handleConfirmPayment(inv.id)}
                                                className="text-primary hover:underline font-bold"
                                            >
                                                Mark Paid
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color }: any) {
    const colors: any = {
        green: 'bg-green-100 text-green-600',
        blue: 'bg-blue-100 text-blue-600',
        purple: 'bg-purple-100 text-purple-600',
        orange: 'bg-orange-100 text-orange-600',
    };
    return (
        <div className="bg-white dark:bg-[#161616] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${colors[color]}`}>
                {icon}
            </div>
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
                <p className="text-xl font-black text-gray-900 dark:text-white">{value}</p>
            </div>
        </div>
    );
}
