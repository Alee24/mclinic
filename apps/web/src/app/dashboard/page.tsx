'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { FiArrowUpRight, FiMoreHorizontal, FiClock, FiVideo, FiPlus, FiBriefcase } from 'react-icons/fi';

export default function DashboardPage() {
    const [stats, setStats] = useState({
        patients: 0,
        doctors: 0,
        appointments: 0,
        pendingDoctors: [] as any[],
        recentAppointments: [] as any[],
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [patientsRes, doctorsRes, appointmentsRes] = await Promise.all([
                    api.get('/patients'),
                    api.get('/doctors/admin/all'),
                    api.get('/appointments')
                ]);

                if (patientsRes?.ok && doctorsRes?.ok && appointmentsRes?.ok) {
                    const patients = await patientsRes.json();
                    const doctors = await doctorsRes.json();
                    const appointments = await appointmentsRes.json();

                    setStats({
                        patients: patients.length,
                        doctors: doctors.length,
                        appointments: appointments.length,
                        pendingDoctors: doctors.filter((d: any) => d.verificationStatus === 'pending').slice(0, 5),
                        recentAppointments: appointments.slice(0, 3)
                    });
                }
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Dashboard</h1>
                    <p className="text-gray-500 text-sm">Plan, prioritize, and accomplish your tasks with ease.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-donezo-dark hover:bg-green-800 text-white rounded-xl text-sm font-medium transition-colors">
                        <FiPlus />
                        Add Doctor
                    </button>
                    <button className="px-4 py-2 bg-white dark:bg-[#161616] text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        Import Data
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Total Patients"
                    value={stats.patients}
                    trend="Included from last month"
                    trendValue="24"
                    icon={<FiBriefcase />}
                    dark={true}
                />
                <StatCard
                    label="Active Doctors"
                    value={stats.doctors}
                    trend="Increased from last month"
                    trendValue="10"
                />
                <StatCard
                    label="Appointments"
                    value={stats.appointments}
                    trend="Increased from last month"
                    trendValue="12"
                />
                <StatCard
                    label="Pending Verifications"
                    value={stats.pendingDoctors.length}
                    trend="On Discuss"
                    trendValue="2"
                />
            </div>

            {/* Middle Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Project Analytics (Bar Chart Placeholder) */}
                <div className="lg:col-span-2 bg-white dark:bg-[#161616] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-900 dark:text-white">Clinic Analytics</h3>
                        <button className="text-gray-400 hover:text-gray-600"><FiMoreHorizontal /></button>
                    </div>
                    <div className="h-48 flex items-end justify-between gap-2 px-2">
                        {[40, 70, 45, 90, 60, 50, 65].map((h, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 group w-full">
                                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-40 relative flex items-end overflow-hidden group-hover:bg-gray-200 transition-colors">
                                    <div
                                        style={{ height: `${h}%` }}
                                        className={`w-full rounded-full transition-all duration-500 ${i === 3 ? 'bg-donezo-dark' : 'bg-gray-300 dark:bg-gray-700 repeating-linear-gradient(45deg,transparent,transparent 5px,#fff 5px,#fff 10px)'}`}
                                    ></div>
                                </div>
                                <span className="text-xs text-gray-400 font-medium">{['S', 'M', 'T', 'W', 'T', 'F', 'S'][i]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reminders */}
                <div className="bg-white dark:bg-[#161616] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900 dark:text-white">Reminders</h3>
                        </div>
                        <h4 className="text-xl font-bold mb-1 text-gray-900 dark:text-white">Meeting with Health Ministry</h4>
                        <div className="text-sm text-gray-500 mb-6">Due date: Dec 25, 2024</div>

                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <FiClock /> <span>02:00 pm - 04:00 pm</span>
                        </div>
                    </div>

                    <button className="w-full py-3 bg-donezo-dark hover:bg-green-800 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
                        <FiVideo /> Start Meeting
                    </button>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Team Collaboration */}
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
                                <img src={`https://ui-avatars.com/api/?name=${doc.fullName}&background=random`} alt={doc.fullName} className="w-10 h-10 rounded-full" />
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm text-gray-900 dark:text-white truncate">{doc.fullName}</div>
                                    <div className="text-xs text-gray-500 truncate">Applying for {doc.specialization}</div>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded border ${i % 2 === 0 ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-red-50 text-red-600 border-red-100'}`}>Pending</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Progress (Donut Chart) */}
                <div className="bg-white dark:bg-[#161616] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-900 dark:text-white">Revenue Goal</h3>
                    </div>
                    <div className="relative flex items-center justify-center py-4">
                        {/* CSS-only Donut Chart approximation */}
                        <div className="w-40 h-40 rounded-full bg-gray-100 dark:bg-gray-800 relative flex items-center justify-center" style={{ background: `conic-gradient(var(--color-donezo-dark) 0% 75%, #f3f4f6 75% 100%)` }}>
                            <div className="w-28 h-28 bg-white dark:bg-[#161616] rounded-full flex flex-col items-center justify-center z-10">
                                <span className="text-4xl font-bold text-gray-900 dark:text-white">75%</span>
                                <span className="text-xs text-gray-500">Goal Reached</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                            <div className="w-2 h-2 rounded-full bg-donezo-dark"></div> Completed
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                            <div className="w-2 h-2 rounded-full bg-gray-200"></div> Remaining
                        </div>
                    </div>
                </div>

                {/* Time Tracker */}
                <div className="bg-donezo-dark rounded-3xl p-6 text-white relative overflow-hidden flex flex-col justify-end min-h-[200px]">
                    {/* Abstract waves */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-green-500/20 rounded-full blur-xl"></div>

                    <div className="relative z-10">
                        <h3 className="text-sm font-medium mb-1 text-green-100">Time Tracker</h3>
                        <div className="text-4xl font-bold mb-4 font-mono">01:24:08</div>
                        <div className="flex items-center gap-3">
                            <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-donezo-dark text-lg shadow-lg hover:scale-105 transition-transform">
                                <span className="w-3 h-4 border-l-2 border-r-2 border-current block"></span>
                            </button>
                            <button className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white text-lg shadow-lg hover:scale-105 transition-transform">
                                <div className="w-3 h-3 bg-white rounded-sm"></div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, trend, trendValue, icon, dark }: any) {
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
                    <FiArrowUpRight />
                </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
                <span className={`px-1.5 py-0.5 rounded font-bold ${dark ? 'bg-green-500/20 text-white border border-white/20' : 'bg-green-100 text-green-700 border border-green-200'
                    }`}>
                    {dark ? <FiBriefcase className="inline mr-1" /> : '+'}{trendValue}
                </span>
                <span className={`${dark ? 'text-green-100' : 'text-gray-400'}`}>{trend}</span>
            </div>
        </div>
    );
}
