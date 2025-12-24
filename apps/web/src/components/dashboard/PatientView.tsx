'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FiCalendar, FiPlusSquare, FiFileText, FiActivity, FiMapPin, FiClock, FiVideo } from 'react-icons/fi';
import { useAuth } from '@/lib/auth';

export default function PatientView() {
    const { user } = useAuth();
    const [nextAppointment, setNextAppointment] = useState<any>(null);
    const [stats, setStats] = useState({
        pendingBills: 0,
        medicalRecords: 2,
        visitsThisYear: 1
    });

    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                const res = await api.get('/appointments'); // Real app would filter
                if (res?.ok) {
                    const data = await res.json();
                    const next = data.find((a: any) => new Date(a.appointment_date) >= new Date());
                    setNextAppointment(next);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchPatientData();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-1000">
            {/* Hero Welcome */}
            <div className="relative bg-gradient-to-r from-donezo-dark to-green-600 rounded-[32px] p-8 md:p-12 text-white overflow-hidden shadow-2xl shadow-green-900/20">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse"></div>
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">Hello, {user?.fname}!</h1>
                        <p className="text-green-50 text-lg font-medium mb-8 max-w-md opacity-90">How are you feeling today? You have one upcoming visit scheduled soon.</p>
                        <div className="flex flex-wrap gap-4">
                            <button className="bg-white text-donezo-dark px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-green-50 transition-colors shadow-xl">Book Appointment</button>
                            <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-white/20 transition-colors">Emergency</button>
                        </div>
                    </div>
                    {nextAppointment && (
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[28px] p-6 text-white group hover:bg-white/20 transition-all cursor-pointer">
                            <div className="flex items-center justify-between mb-6">
                                <span className="bg-green-500/30 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border border-green-400/30">Next Appointment</span>
                                <FiCalendar className="text-2xl opacity-50" />
                            </div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-3xl">🧑‍⚕️</div>
                                <div>
                                    <h4 className="font-black text-xl">Dr. {nextAppointment.doctor?.fname || 'Specialist'}</h4>
                                    <p className="text-green-100/70 text-sm font-medium">{nextAppointment.doctor?.dr_type} • General Clinic</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                                <div className="flex items-center gap-2 text-sm font-bold">
                                    <FiClock className="text-green-300" />
                                    <span>{nextAppointment.appointment_time}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm font-bold">
                                    <FiMapPin className="text-green-300" />
                                    <span>Nairobi Branch</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <QuickCard icon={<FiActivity />} label="Health Records" value={stats.medicalRecords} subLabel="Updated 2 days ago" color="blue" />
                <QuickCard icon={<FiFileText />} label="Active Invoices" value={stats.pendingBills} subLabel="All bills settled" color="green" />
                <QuickCard icon={<FiVideo />} label="Online Consults" value="Active" subLabel="Join tele-meeting" color="purple" />
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-[#161616] rounded-3xl p-8 border border-gray-100 dark:border-gray-800/60 shadow-sm">
                    <h3 className="text-xl font-black dark:text-white mb-6 flex items-center gap-3">
                        <FiFileText className="text-donezo-dark" /> Recent History
                    </h3>
                    <div className="space-y-6">
                        <HistoryItem title="General Consultation" date="Nov 12, 2024" doctor="Dr. Emily Rose" type="Physical" />
                        <HistoryItem title="Dental Checkup" date="Oct 28, 2024" doctor="Dr. Michael Chen" type="Physical" />
                        <HistoryItem title="Fever Follow-up" date="Oct 15, 2024" doctor="Dr. Sarah Kent" type="Video Call" />
                    </div>
                    <button className="w-full mt-8 py-4 text-sm font-black text-gray-500 hover:text-donezo-dark border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl transition-all">View All Activity</button>
                </div>

                <div className="relative bg-[#1A1A1A] rounded-[32px] p-8 text-white flex flex-col justify-end min-h-[300px] overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-1000"></div>
                    <div className="relative z-10">
                        <span className="text-green-500 font-black tracking-widest text-[10px] uppercase mb-4 block">Pharmacy Integration</span>
                        <h3 className="text-3xl font-black mb-4 leading-tight">Order your medications <br /> in one click.</h3>
                        <p className="text-gray-400 font-medium mb-8 max-w-sm">We've linked with local pharmacies to deliver your prescriptions directly to your doorstep.</p>
                        <button className="bg-donezo-dark px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-donezo-dark/30 hover:shadow-donezo-dark/50 transition-all">Browse Store</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function QuickCard({ icon, label, value, subLabel, color }: any) {
    const colors: any = {
        blue: 'text-blue-500 border-blue-100 bg-blue-50/30',
        green: 'text-green-500 border-green-100 bg-green-50/30',
        purple: 'text-purple-500 border-purple-100 bg-purple-50/30',
    };
    return (
        <div className={`p-6 rounded-3xl border ${colors[color]} hover:scale-[1.03] transition-all cursor-pointer group`}>
            <div className="flex justify-between items-start mb-4">
                <div className="text-2xl opacity-80 group-hover:scale-110 transition-transform">{icon}</div>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <FiPlusSquare className="text-xl" />
                </div>
            </div>
            <h4 className="text-gray-900 dark:text-white font-black text-2xl mb-1">{value}</h4>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">{label}</p>
            <p className="text-gray-400 text-[10px] font-medium">{subLabel}</p>
        </div>
    );
}

function HistoryItem({ title, date, doctor, type }: any) {
    return (
        <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-xl group-hover:bg-donezo-dark group-hover:text-white transition-all">
                {type === 'Physical' ? '🏥' : '💻'}
            </div>
            <div className="flex-1 min-w-0">
                <h5 className="font-bold text-gray-900 dark:text-white text-sm truncate">{title}</h5>
                <p className="text-xs text-gray-500 font-medium">{doctor} • {date}</p>
            </div>
            <span className="text-[10px] font-black text-donezo-dark uppercase tracking-widest group-hover:translate-x-1 transition-transform cursor-pointer">View</span>
        </div>
    );
}
