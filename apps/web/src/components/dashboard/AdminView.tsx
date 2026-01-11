'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { FiUsers, FiActivity, FiBriefcase, FiCalendar, FiArrowUpRight, FiMail, FiBell, FiDollarSign } from 'react-icons/fi';

import TransactionDetailsModal from './finance/TransactionDetailsModal';

export default function AdminView() {
    const [stats, setStats] = useState({
        patients: 0,
        doctors: 0,
        activeDoctors: 0,
        inactiveDoctors: 0,
        activeUsers: 0,
        appointments: 0,
        totalRevenue: 0,
        pendingDoctors: [] as any[],
        invoices: { pending: 12, paid: 45, total: 57 },
        paymentStats: { mpesa: 120000, visa: 85000, paypal: 140000, cash: 0, others: 0 },
        recentTransactions: [] as any[]
    });

    const [selectedTx, setSelectedTx] = useState<any>(null);
    const [showTxModal, setShowTxModal] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [patientsRes, doctorsRes, appointmentsRes, usersRes, financeRes] = await Promise.all([
                    api.get('/patients'),
                    api.get('/doctors/admin/all'),
                    api.get('/appointments'),
                    api.get('/users/count-active'),
                    api.get('/financial/stats') // Fetch real finance stats
                ]);

                if (patientsRes?.ok && doctorsRes?.ok && appointmentsRes?.ok) {
                    const patients = await patientsRes.json();
                    const doctors = await doctorsRes.json();
                    const appointments = await appointmentsRes.json();
                    const users = usersRes?.ok ? await usersRes.json() : { count: 0 };

                    // Assuming financeRes returns detailed stats or we fetch invoices to calc sum.
                    // If financeRes structure is { revenue: 0, activeInvoices: [], paidInvoices: [] }
                    // We need to support "Every invoice to add up".
                    // The current /financial/stats endpoint returns aggregated counts and totalRevenue (balance).
                    // We need to ensure totalRevenue is the SUM of all invoices or at least Paid ones.
                    const financials = financeRes?.ok ? await financeRes.json() : { revenue: 0, pending: 0, paid: 0, pendingCount: 0, paidCount: 0, pendingAmount: 0, paidAmount: 0 };

                    const activeDocs = doctors.filter((d: any) => d.status || d.isWorking).length;

                    setStats(prev => ({
                        ...prev,
                        patients: patients.length,
                        doctors: doctors.length,
                        activeDoctors: activeDocs,
                        inactiveDoctors: doctors.length - activeDocs,
                        activeUsers: users.count,
                        appointments: appointments.length,
                        totalRevenue: financials.totalRevenue || 0, // Matches service return key
                        invoices: {
                            pending: financials.invoices?.pendingAmount || 0, // Correctly accessing nested amount
                            paid: financials.invoices?.paidAmount || 0,       // Correctly accessing nested amount
                            total: (financials.invoices?.pending || 0) + (financials.invoices?.paid || 0) // Total count (optional usage)
                        },
                        pendingDoctors: doctors.filter((d: any) => !d.Verified_status).slice(0, 5),
                    }));
                }
            } catch (err) {
                console.error('Failed to fetch admin stats', err);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Total Patients" value={stats.patients} trend="+12%" iconNode={<FiUsers />} />
                <StatCard label="Active Users" value={stats.activeUsers} trend="Live" color="green" iconNode={<FiActivity />} />
                <StatCard label="Total Medics" value={stats.doctors} trend={`${stats.activeDoctors} Online`} iconNode={<FiBriefcase />} />
                <StatCard dark label="Appointments" value={stats.appointments} trend="Total" iconNode={<FiCalendar />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#161616] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">Revenue Overview</h3>
                    <div className="text-4xl font-bold text-donezo-dark mb-2">KES {stats.totalRevenue.toLocaleString()}</div>
                    <p className="text-sm text-gray-500 mb-6 font-medium">Monthly Gross Revenue</p>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Collected</span>
                            <span className="font-bold text-green-500">KES {stats.invoices.paid.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Pending</span>
                            <span className="font-bold text-orange-500">KES {stats.invoices.pending.toLocaleString()}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
                            <div className="h-full bg-green-500" style={{ width: `${(stats.invoices.paid / (stats.invoices.paid + stats.invoices.pending || 1)) * 100}%` }}></div>
                            <div className="h-full bg-orange-400" style={{ width: `${(stats.invoices.pending / (stats.invoices.paid + stats.invoices.pending || 1)) * 100}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-[#161616] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-6">System Performance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Medic Activity</div>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-3xl font-bold">{stats.activeDoctors}</span>
                                <span className="text-sm text-green-500 mb-1 font-bold">Online</span>
                            </div>
                            <div className="text-sm text-gray-500 italic">Medics currently available for consultation.</div>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Global Health</div>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-3xl font-bold">98.4%</span>
                                <span className="text-sm text-blue-500 mb-1 font-bold">Uptime</span>
                            </div>
                            <div className="text-sm text-gray-500 italic">System is running optimally with low latency.</div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-[#161616] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-lg mb-4 dark:text-white">Transaction History</h3>
                    {(stats?.recentTransactions?.length > 0 || (stats as any)?.transactions?.length > 0) ? (
                        <div className="space-y-4">
                            {(stats.recentTransactions || (stats as any).transactions).map((tx: any) => (
                                <div
                                    key={tx.id}
                                    onClick={() => {
                                        setSelectedTx(tx);
                                        setShowTxModal(true);
                                    }}
                                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-lg ${tx.source === 'WITHDRAWAL' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                            <FiDollarSign />
                                        </div>
                                        <div>
                                            <div className="font-bold dark:text-white">{tx.source}</div>
                                            <div className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div className={`font-bold ${tx.source === 'WITHDRAWAL' ? 'text-red-600' : 'text-green-600'}`}>
                                        {tx.source === 'WITHDRAWAL' ? '-' : '+'} KES {Number(tx.amount).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-8">No recent transactions found.</div>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-[#161616] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-900 dark:text-white">Action Items & Verifications</h3>
                    <Link href="/dashboard/doctors" className="text-sm font-bold text-donezo-dark hover:underline">View All Medics</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Shortcuts Group */}
                    <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        {/* Migration Shortcut */}
                        <div className="flex items-center gap-4 p-4 rounded-2xl border border-blue-50 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-100/50 transition-colors group">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <FiActivity />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm text-blue-900 dark:text-blue-100">Data Migration</h4>
                                <p className="text-xs text-blue-600/70 truncate">Import/Clear Data</p>
                            </div>
                            <Link href="/dashboard/migration" className="px-3 py-1 bg-white dark:bg-black text-blue-600 text-[10px] font-bold rounded-lg border border-blue-100 shadow-sm flex items-center">Go</Link>
                        </div>

                        {/* Financials Shortcut */}
                        <div className="flex items-center gap-4 p-4 rounded-2xl border border-green-50 dark:border-green-900/30 bg-green-50/50 dark:bg-green-900/10 hover:bg-green-100/50 transition-colors group">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all">
                                <FiBriefcase />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm text-green-900 dark:text-green-100">Invoices & Finance</h4>
                                <p className="text-xs text-green-600/70 truncate">Create Invoices / View Payouts</p>
                            </div>
                            <Link href="/dashboard/invoices" className="px-3 py-1 bg-white dark:bg-black text-green-600 text-[10px] font-bold rounded-lg border border-green-100 shadow-sm flex items-center">View</Link>
                        </div>

                        {/* Pharmacy Shortcut */}
                        <div className="flex items-center gap-4 p-4 rounded-2xl border border-purple-50 dark:border-purple-900/30 bg-purple-50/50 dark:bg-purple-900/10 hover:bg-purple-100/50 transition-colors group">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
                                <FiActivity />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm text-purple-900 dark:text-purple-100">Pharmacy Inventory</h4>
                                <p className="text-xs text-purple-600/70 truncate">Manage Stock & Pricing</p>
                            </div>
                            <Link href="/dashboard/admin/pharmacy" className="px-3 py-1 bg-white dark:bg-black text-purple-600 text-[10px] font-bold rounded-lg border border-purple-100 shadow-sm flex items-center">Open</Link>
                        </div>

                        {/* Pending Doctor Approvals Shortcut */}
                        <div className="flex items-center gap-4 p-4 rounded-2xl border border-yellow-50 dark:border-yellow-900/30 bg-yellow-50/50 dark:bg-yellow-900/10 hover:bg-yellow-100/50 transition-colors group">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-yellow-100 text-yellow-600 group-hover:bg-yellow-600 group-hover:text-white transition-all">
                                <FiUsers />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm text-yellow-900 dark:text-yellow-100">Pending Approvals</h4>
                                <p className="text-xs text-yellow-600/70 truncate">Review Medic Applications</p>
                            </div>
                            <Link href="/dashboard/admin/doctors/pending" className="px-3 py-1 bg-white dark:bg-black text-yellow-600 text-[10px] font-bold rounded-lg border border-yellow-100 shadow-sm flex items-center">Review</Link>
                        </div>
                    </div>

                    {stats.pendingDoctors.length === 0 ? (
                        <div className="md:col-span-2 lg:col-span-3 p-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-3xl mb-4">
                                😴
                            </div>
                            <p className="text-gray-500 font-medium">All caught up!</p>
                            <p className="text-gray-400 text-sm">No pending medic verifications at the moment.</p>
                        </div>
                    ) : stats.pendingDoctors.map(doc => (
                        <div key={doc.id} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20">
                            <img src={`https://ui-avatars.com/api/?name=${doc.fname}+${doc.lname}&background=random`} className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-700 shadow-sm" alt="Medic" />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm truncate">{doc.fname} {doc.lname}</h4>
                                <p className="text-xs text-gray-500 truncate">{doc.dr_type}</p>
                            </div>
                            <Link href="/dashboard/doctors" className="px-3 py-1 bg-donezo-dark text-white text-[10px] font-bold rounded-lg shadow-sm shadow-donezo-dark/20">Review</Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, trend, iconNode, dark, color }: any) {
    return (
        <div className={`rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group hover:shadow-md transition-shadow ${dark ? 'bg-donezo-dark text-white' : 'bg-white dark:bg-[#161616] text-gray-900 dark:text-white'
            }`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex flex-col">
                    <span className={`text-sm font-medium mb-1 ${dark ? 'text-green-100' : 'text-gray-500'}`}>{label}</span>
                    <span className="text-4xl font-bold">{value}</span>
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${dark ? 'bg-white/20 text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-primary/20 group-hover:text-primary transition-colors'
                    }`}>
                    {iconNode || <FiArrowUpRight />}
                </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
                <span className={`px-2 py-0.5 rounded-full font-bold ${dark ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'}`}>
                    {trend}
                </span>
                <span className={`${dark ? 'text-green-100/60' : 'text-gray-400'}`}>Since last month</span>
            </div>
        </div>
    );
}
