'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FiCalendar, FiUsers, FiClock, FiActivity, FiDollarSign, FiPlus, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '@/lib/auth';

export default function DoctorView() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalPatients: 0,
        appointmentsToday: 0,
        pendingReports: 0,
        earningsAmount: 0,
        upcomingAppointments: [] as any[]
    });

    useEffect(() => {
        const fetchDoctorData = async () => {
            try {
                // Fetch Appointments
                const aptRes = await api.get('/appointments');
                let appointments = [];
                if (aptRes?.ok) {
                    appointments = await aptRes.json();
                }

                // Fetch Financials
                const finRes = await api.get('/financial/stats');
                let financials = { balance: 0, earningsAmount: 0 };
                if (finRes?.ok) {
                    financials = await finRes.json();
                }

                setStats(prev => ({
                    ...prev,
                    appointmentsToday: appointments.filter((a: any) => {
                        return new Date(a.appointment_date).toDateString() === new Date().toDateString();
                    }).length,
                    upcomingAppointments: appointments.slice(0, 5),
                    earningsAmount: financials.balance || 0
                }));
            } catch (err) {
                console.error(err);
            }
        };
        fetchDoctorData();
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-bold dark:text-white">Welcome back, Dr. {user?.fname}</h1>
                    <p className="text-gray-500 font-medium tracking-tight">You have {stats.appointmentsToday} appointments scheduled for today.</p>
                </div>
                <button className="bg-donezo-dark text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-donezo-dark/30 hover:scale-[1.02] transition-transform">
                    <FiPlus /> Start Session
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DrStatCard label="Wallet Balance" value={`KES ${stats.earningsAmount.toLocaleString()}`} icon={<FiDollarSign />} color="green" />
                <DrStatCard label="Today's Appointments" value={stats.appointmentsToday} icon={<FiCalendar />} color="blue" />
                <DrStatCard label="Patient Reviews" value="4.9/5" icon={<FiActivity />} color="purple" />
                <DrStatCard label="Pending Reports" value={stats.pendingReports} icon={<FiClock />} color="orange" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-[#161616] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg dark:text-white">Upcoming Appointments</h3>
                        <button className="text-sm font-bold text-donezo-dark hover:underline">View Schedule</button>
                    </div>
                    <div className="space-y-4">
                        {stats.upcomingAppointments.length === 0 ? (
                            <div className="py-12 text-center text-gray-400 italic">No appointments found.</div>
                        ) : stats.upcomingAppointments.map((apt, i) => (
                            <div key={apt.id} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 dark:bg-black/20 border border-gray-100 dark:border-gray-800/50 hover:border-donezo-dark/30 transition-colors group">
                                <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center font-bold text-donezo-dark shadow-sm group-hover:bg-donezo-dark group-hover:text-white transition-colors capitalize">
                                    {apt.patient?.fname?.[0] || 'P'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 dark:text-white">{apt.patient?.fname || 'Guest Patient'}</h4>
                                    <p className="text-xs text-gray-500 font-medium">{apt.appointment_time} • {new Date(apt.appointment_date).toDateString()}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1.5">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                        }`}>
                                        {apt.status}
                                    </span>
                                    <button className="text-[10px] font-bold text-donezo-dark hover:underline">Open Records</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-donezo-dark rounded-3xl p-6 text-white flex flex-col justify-between shadow-xl shadow-donezo-dark/20 relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-1000"></div>
                    <div>
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl mb-6">
                            <FiCheckCircle />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Telemedicine Ready</h3>
                        <p className="text-sm text-green-100/70 mb-6 font-medium leading-relaxed">Your virtual room is active. Patients can join using the link in their portal.</p>
                        <div className="p-3 bg-white/10 rounded-xl border border-white/20 text-xs font-mono break-all mb-4">
                            mclinic.com/meet/dr-{user?.fname?.toLowerCase()}
                        </div>
                    </div>
                    <button className="w-full py-3 bg-white text-donezo-dark font-black rounded-xl hover:bg-green-50 transition-colors">Go Live Now</button>
                </div>
            </div>
        </div>
    );
}

function DrStatCard({ label, value, icon, color }: any) {
    const colors: any = {
        green: 'bg-green-50 text-green-600 dark:bg-green-900/20',
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20',
        orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20',
    };
    return (
        <div className="bg-white dark:bg-[#161616] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4 group hover:border-primary/50 transition-all">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-transform group-hover:scale-110 duration-500 ${colors[color] || 'bg-gray-50'}`}>
                {icon}
            </div>
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white leading-tight">{value}</p>
            </div>
        </div>
    );
}
