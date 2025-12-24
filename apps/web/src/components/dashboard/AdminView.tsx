'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FiUsers, FiActivity, FiBriefcase, FiCalendar, FiArrowUpRight, FiMail, FiBell } from 'react-icons/fi';

export default function AdminView() {
    const [stats, setStats] = useState({
        patients: 0,
        doctors: 0,
        activeDoctors: 0,
        inactiveDoctors: 0,
        activeUsers: 0,
        appointments: 0,
        totalRevenue: 345000,
        pendingDoctors: [] as any[],
        invoices: { pending: 12, paid: 45, total: 57 },
        paymentStats: { mpesa: 120000, visa: 85000, paypal: 140000, cash: 0, others: 0 }
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [patientsRes, doctorsRes, appointmentsRes, usersRes] = await Promise.all([
                    api.get('/patients'),
                    api.get('/doctors/admin/all'),
                    api.get('/appointments'),
                    api.get('/users/count-active')
                ]);

                if (patientsRes?.ok && doctorsRes?.ok && appointmentsRes?.ok) {
                    const patients = await patientsRes.json();
                    const doctors = await doctorsRes.json();
                    const appointments = await appointmentsRes.json();
                    const users = usersRes?.ok ? await usersRes.json() : { count: 0 };

                    const activeDocs = doctors.filter((d: any) => d.status || d.isWorking).length;

                    setStats(prev => ({
                        ...prev,
                        patients: patients.length,
                        doctors: doctors.length,
                        activeDoctors: activeDocs,
                        inactiveDoctors: doctors.length - activeDocs,
                        activeUsers: users.count,
                        appointments: appointments.length,
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
                <StatCard label="Total Doctors" value={stats.doctors} trend={`${stats.activeDoctors} Active`} iconNode={<FiBriefcase />} />
                <StatCard dark label="Appointments" value={stats.appointments} trend="Upcoming" iconNode={<FiCalendar />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#161616] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">Revenue Overview</h3>
                    <div className="text-4xl font-bold text-donezo-dark mb-2">KES {stats.totalRevenue.toLocaleString()}</div>
                    <p className="text-sm text-gray-500 mb-6 font-medium">Monthly Gross Revenue</p>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Invoices Paid</span>
                            <span className="font-bold text-green-500">{stats.invoices.paid}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Pending</span>
                            <span className="font-bold text-orange-500">{stats.invoices.pending}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
                            <div className="h-full bg-green-500" style={{ width: '70%' }}></div>
                            <div className="h-full bg-orange-400" style={{ width: '30%' }}></div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-[#161616] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-6">System Performance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Doctor Activity</div>
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
            </div>

            <div className="bg-white dark:bg-[#161616] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-900 dark:text-white">Pending verifications</h3>
                    <button className="text-sm font-bold text-donezo-dark">View all</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stats.pendingDoctors.length === 0 ? (
                        <p className="text-gray-400 italic text-sm py-4">All medics are currently verified.</p>
                    ) : stats.pendingDoctors.map(doc => (
                        <div key={doc.id} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20">
                            <img src={`https://ui-avatars.com/api/?name=${doc.fname}+${doc.lname}&background=random`} className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-700 shadow-sm" alt="Medic" />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm truncate">{doc.fname} {doc.lname}</h4>
                                <p className="text-xs text-gray-500 truncate">{doc.dr_type}</p>
                            </div>
                            <button className="px-3 py-1 bg-donezo-dark text-white text-[10px] font-bold rounded-lg shadow-sm shadow-donezo-dark/20">Review</button>
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
