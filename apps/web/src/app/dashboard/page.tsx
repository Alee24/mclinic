'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { FiArrowUpRight, FiMoreHorizontal, FiClock, FiVideo, FiPlus, FiBriefcase, FiUsers, FiActivity, FiCalendar } from 'react-icons/fi';

export default function DashboardPage() {
    const [stats, setStats] = useState({
        patients: 0,
        doctors: 0,
        activeDoctors: 0,
        inactiveDoctors: 0,
        activeUsers: 0,
        appointments: 0,
        totalRevenue: 0,
        pendingDoctors: [] as any[],
        recentAppointments: [] as any[],
        invoices: { pending: 0, paid: 0, total: 0 },
        paymentStats: { mpesa: 0, visa: 0, paypal: 0, cash: 0, others: 0 }
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all raw data (in a real app, use dedicated dashboard stats endpoint)
                const [patientsRes, doctorsRes, appointmentsRes, financeRes, usersRes] = await Promise.all([
                    api.get('/patients'),
                    api.get('/doctors/admin/all'),
                    api.get('/appointments'),
                    api.get('/financial/stats'),
                    api.get('/users/count-active')
                ]);

                if (patientsRes?.ok && doctorsRes?.ok && appointmentsRes?.ok) {
                    const patients = await patientsRes.json();
                    const doctors = await doctorsRes.json();
                    const appointments = await appointmentsRes.json();
                    const finance = financeRes?.ok ? await financeRes.json() : { totalRevenue: 0, invoices: {}, paymentStats: {} };
                    const users = usersRes?.ok ? await usersRes.json() : { count: 0 };

                    const activeDocs = doctors.filter((d: any) => d.status || d.isWorking).length;

                    setStats({
                        patients: patients.length,
                        doctors: doctors.length,
                        activeDoctors: activeDocs,
                        inactiveDoctors: doctors.length - activeDocs,
                        activeUsers: users.count,
                        appointments: appointments.length,
                        totalRevenue: finance.totalRevenue,
                        pendingDoctors: doctors.filter((d: any) => !d.verified_status).slice(0, 5),
                        recentAppointments: appointments.slice(0, 3),
                        invoices: finance.invoices || { pending: 0, paid: 0, total: 0 },
                        paymentStats: finance.paymentStats || { mpesa: 0, visa: 0, paypal: 0, cash: 0, others: 0 }
                    });
                }
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 30000); // Polling every 30 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6">
            {/* Stat Cards Row 1: Users & General */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Total Patients" value={stats.patients} trend="vs last month" trendValue="12%" iconNode={<FiUsers />} />
                <StatCard label="Active Users" value={stats.activeUsers} trend="online now" trendValue="Live" iconNode={<FiActivity />} />
                <StatCard label="Total Doctors" value={stats.doctors} trend="Active / Inactive" trendValue={`${stats.activeDoctors}/${stats.inactiveDoctors}`} iconNode={<FiBriefcase />} />
                <StatCard dark label="Appointments" value={stats.appointments} trend="Upcoming" trendValue="+5" iconNode={<FiCalendar />} />
            </div>

            {/* Row 2: Finance & Payments */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Total Revenue & Invoices */}
                <div className="bg-white dark:bg-[#161616] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2">Total Revenue</h3>
                        <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-donezo-dark to-green-500">
                            KES {stats.totalRevenue.toLocaleString()}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Gross income from all sources</p>
                    </div>
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Invoices Paid: {stats.invoices.paid}</span>
                            <span>Pending: {stats.invoices.pending}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden flex">
                            <div className="h-full bg-green-500" style={{ width: `${(stats.invoices.paid / (stats.invoices.total || 1)) * 100}%` }}></div>
                            <div className="h-full bg-orange-400" style={{ width: `${(stats.invoices.pending / (stats.invoices.total || 1)) * 100}%` }}></div>
                        </div>
                        <div className="mt-2 text-xs text-right text-gray-400">Total Invoices: {stats.invoices.total}</div>
                    </div>
                </div>

                {/* Payment Methods Stats */}
                <div className="bg-white dark:bg-[#161616] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 lg:col-span-2">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">Payment Methods</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Mpesa */}
                        <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-2xl border border-green-100 dark:border-green-900/20">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-green-700 dark:text-green-400">M-PESA</span>
                                <span className="text-xs bg-white dark:bg-black/20 px-2 py-1 rounded text-green-600 font-bold">Mobile</span>
                            </div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white truncate">KES {stats.paymentStats.mpesa.toLocaleString()}</div>
                        </div>
                        {/* Visa/Card */}
                        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-blue-700 dark:text-blue-400">VISA / Card</span>
                                <span className="text-xs bg-white dark:bg-black/20 px-2 py-1 rounded text-blue-600 font-bold">Bank</span>
                            </div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white truncate">KES {stats.paymentStats.visa.toLocaleString()}</div>
                        </div>
                        {/* Paypal */}
                        <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/20">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-indigo-700 dark:text-indigo-400">PayPal</span>
                                <span className="text-xs bg-white dark:bg-black/20 px-2 py-1 rounded text-indigo-600 font-bold">Online</span>
                            </div>
                            <div className="text-lg font-bold text-gray-900 dark:text-white truncate">KES {stats.paymentStats.paypal.toLocaleString()}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pending Doctors */}
                <div className="bg-white dark:bg-[#161616] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-900 dark:text-white">Pending Doctors</h3>
                        <button className="text-xs font-bold border border-gray-200 px-3 py-1 rounded-full text-gray-600 hover:bg-gray-50">View All</button>
                    </div>
                    <div className="space-y-4">
                        {stats.pendingDoctors.length === 0 ? (
                            <p className="text-gray-500 text-sm">No pending verifications.</p>
                        ) : stats.pendingDoctors.map((doc, i) => (
                            <div key={doc.id} className="flex items-center gap-3">
                                <img src={doc.profile_image || `https://ui-avatars.com/api/?name=${doc.fname}+${doc.lname}&background=random`} alt={`${doc.fname} ${doc.lname}`} className="w-10 h-10 rounded-full object-cover" />
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm text-gray-900 dark:text-white truncate">{doc.fname} {doc.lname}</div>
                                    <div className="text-xs text-gray-500 truncate">Applying for {doc.dr_type}</div>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded border ${i % 2 === 0 ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-red-50 text-red-600 border-red-100'}`}>Pending</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Stats Section */}
                <div className="bg-donezo-dark rounded-3xl p-6 text-white relative overflow-hidden flex flex-col justify-end min-h-[200px] lg:col-span-2">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-green-500/20 rounded-full blur-xl"></div>

                    <div className="relative z-10 flex justify-between items-end">
                        <div className="w-full">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-sm font-medium mb-1 text-green-100">System Activity</h3>
                                    <p className="text-lg font-bold">All systems operational</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-mono font-bold">{new Date().toLocaleTimeString()}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-4">
                                <div>
                                    <div className="text-2xl font-bold">{stats.activeUsers}</div>
                                    <div className="text-xs text-green-200 uppercase tracking-widest">Active Users</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{stats.activeDoctors}</div>
                                    <div className="text-xs text-green-200 uppercase tracking-widest">Active Doctors</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{stats.inactiveDoctors}</div>
                                    <div className="text-xs text-green-200 uppercase tracking-widest">Offline Doctors</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, trend, trendValue, icon, iconNode, dark }: any) {
    return (
        <div className={`rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group hover:shadow-md transition-shadow ${dark ? 'bg-donezo-dark text-white' : 'bg-white dark:bg-[#161616] text-gray-900 dark:text-white'
            }`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex flex-col">
                    <span className={`text-sm font-medium mb-1 ${dark ? 'text-green-100' : 'text-gray-500'}`}>{label}</span>
                    <span className="text-4xl font-bold">{value}</span>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${dark ? 'bg-white/20 text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700'
                    }`}>
                    {iconNode ? iconNode : <FiArrowUpRight />}
                </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
                <span className={`px-1.5 py-0.5 rounded font-bold ${dark ? 'bg-green-500/20 text-white border border-white/20' : 'bg-green-100 text-green-700 border border-green-200'
                    }`}>
                    {dark ? <span className="inline mr-1"><FiBriefcase /></span> : '+'}{trendValue}
                </span>
                <span className={`${dark ? 'text-green-100' : 'text-gray-400'}`}>{trend}</span>
            </div>
        </div>
    );
}
