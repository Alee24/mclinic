'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FiCalendar, FiPlusSquare, FiFileText, FiActivity, FiMapPin, FiClock, FiVideo, FiAlertCircle, FiGrid, FiMessageCircle, FiPhone } from 'react-icons/fi';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BookAppointmentModal from './appointments/BookAppointmentModal';
import ViewAppointmentDetailsModal from './appointments/ViewAppointmentDetailsModal';

export default function PatientView() {
    const { user } = useAuth();
    const router = useRouter();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [nextAppointment, setNextAppointment] = useState<any>(null);
    const [showBookingModal, setShowBookingModal] = useState(false);

    // Details Modal State
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [stats, setStats] = useState({
        pendingBills: 0,
        medicalRecords: 0,
        visitsThisYear: 0
    });

    const fetchPatientData = async () => {
        try {
            // Get Appointments
            const res = await api.get('/appointments');
            let appointmentsData = [];
            if (res?.ok) {
                appointmentsData = await res.json();
                setAppointments(appointmentsData);

                // Calculate next appointment
                const upcoming = appointmentsData
                    .filter((a: any) => new Date(a.appointment_date) >= new Date())
                    .sort((a: any, b: any) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());
                setNextAppointment(upcoming[0] || null);
            }

            // Get Ambulance Subscriptions
            const subRes = await api.get('/ambulance/my-subscriptions');
            if (subRes?.ok) {
                const subs = await subRes.json();
                setSubscriptions(subs);
            }

            // Re-calculating stats based on real data
            const visits = appointmentsData.filter((a: any) => new Date(a.appointment_date).getFullYear() === new Date().getFullYear()).length;

            setStats(prev => ({
                ...prev,
                visitsThisYear: visits,
                pendingBills: 0 // Placeholder logic preserved
            }));

        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchPatientData();
    }, []);

    const handleOpenDetails = (apt: any) => {
        setSelectedAppointment(apt);
        setShowDetailsModal(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-1000">
            {/* Hero Welcome - NEW PREMIUM DESIGN */}
            <div className="relative overflow-hidden rounded-[40px] bg-[#0A0A0A] p-8 md:p-12 text-white shadow-2xl shadow-black/20 group">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/20 via-transparent to-[#0ea5e9]/10 opacity-70"></div>
                <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-[#10b981]/10 blur-[100px] group-hover:bg-[#10b981]/20 transition-all duration-1000"></div>
                <div className="absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-[#0ea5e9]/10 blur-[80px] group-hover:bg-[#0ea5e9]/20 transition-all duration-1000"></div>

                <div className="relative z-10 grid grid-cols-1 gap-12 lg:grid-cols-12 items-center">
                    <div className="lg:col-span-7">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md mb-6 hover:bg-white/10 transition-colors cursor-default">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs font-bold uppercase tracking-widest text-green-300">System Active</span>
                        </div>

                        <h1 className="mb-4 text-4xl font-black leading-tight tracking-tight md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
                            Hello, {user?.fname}!
                        </h1>
                        <p className="mb-10 max-w-lg text-lg font-medium text-gray-400">
                            Your health dashboard is ready. {nextAppointment ? 'You have an upcoming consultation.' : 'Start by booking a checkup or ordering tests.'}
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => setShowBookingModal(true)}
                                className="group relative overflow-hidden rounded-2xl bg-white px-8 py-4 text-sm font-black uppercase tracking-widest text-black transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] active:scale-95"
                            >
                                <span className="relative z-10">Book Appointment</span>
                                <div className="absolute inset-0 -translate-x-full bg-gray-200 transition-transform duration-300 group-hover:translate-x-0"></div>
                            </button>
                            <Link
                                href="/dashboard/ambulance"
                                className="group flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-bold uppercase tracking-widest text-white backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/20 active:scale-95"
                            >
                                Emergency
                            </Link>
                        </div>
                    </div>

                    {/* Next Appointment Card - Floating Glass */}
                    <div className="lg:col-span-5">
                        {nextAppointment ? (
                            <div
                                onClick={() => handleOpenDetails(nextAppointment)}
                                className="group/card relative cursor-pointer overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:bg-white/10 hover:shadow-2xl hover:shadow-green-500/10"
                            >
                                <div className="mb-6 flex items-start justify-between">
                                    <div className="rounded-2xl bg-[#10b981] p-3 text-2xl text-black shadow-lg shadow-green-500/20">
                                        <FiCalendar />
                                    </div>
                                    <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-green-400">
                                        Upcoming
                                    </span>
                                </div>

                                <div className="mb-6">
                                    <h4 className="flex items-center gap-2 text-2xl font-bold text-white">
                                        Dr. {nextAppointment.doctor?.fname || 'Specialist'}
                                        <FiActivity className="text-green-500 text-lg opacity-0 group-hover/card:opacity-100 -translate-x-2 group-hover/card:translate-x-0 transition-all" />
                                    </h4>
                                    <p className="font-medium text-gray-400">{nextAppointment.doctor?.dr_type} • General Clinic</p>
                                </div>

                                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                                    <div className="flex items-center gap-2">
                                        <FiClock className="text-green-400" />
                                        <span className="text-sm font-bold text-gray-300">{nextAppointment.appointment_time}</span>
                                    </div>
                                    <div className="h-1 w-1 rounded-full bg-gray-700"></div>
                                    <div className="flex items-center gap-2">
                                        <FiMapPin className="text-green-400" />
                                        <span className="text-sm font-bold text-gray-300">Main Branch</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-[32px] border border-white/5 bg-white/5 p-8 text-center backdrop-blur-sm">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-3xl">
                                    👋
                                </div>
                                <h3 className="mb-2 text-xl font-bold text-white">No Upcoming Visits</h3>
                                <p className="text-sm text-gray-500">You are all caught up! Book a new appointment anytime.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Top Bar - Quick Actions */}
            <div className="bg-white dark:bg-[#111] rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Quick Actions</h2>
                    <Link href="/dashboard/services-hub" className="text-xs font-bold text-donezo-dark hover:underline">View All</Link>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                    {/* Book Appointment */}
                    <button
                        onClick={() => setShowBookingModal(true)}
                        className="flex flex-col items-center justify-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl font-bold transition-all active:scale-95 group border border-blue-100 dark:border-blue-800/50"
                    >
                        <div className="w-10 h-10 bg-white dark:bg-blue-500/20 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <FiCalendar className="text-xl" />
                        </div>
                        <span className="text-xs text-center">Book<br />Appointment</span>
                    </button>

                    {/* Order Lab Test */}
                    <Link
                        href="/dashboard/lab"
                        className="flex flex-col items-center justify-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-2xl font-bold transition-all active:scale-95 group border border-purple-100 dark:border-purple-800/50"
                    >
                        <div className="w-10 h-10 bg-white dark:bg-purple-500/20 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <FiActivity className="text-xl" />
                        </div>
                        <span className="text-xs text-center">Order Lab<br />Test</span>
                    </Link>

                    {/* Find Nearby Doctors */}
                    <Link
                        href="/dashboard/doctors"
                        className="flex flex-col items-center justify-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 rounded-2xl font-bold transition-all active:scale-95 group border border-green-100 dark:border-green-800/50"
                    >
                        <div className="w-10 h-10 bg-white dark:bg-green-500/20 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <FiMapPin className="text-xl" />
                        </div>
                        <span className="text-xs text-center">Find<br />Doctors</span>
                    </Link>

                    {/* Emergency Ambulance */}
                    <Link
                        href="/dashboard/ambulance"
                        className="flex flex-col items-center justify-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-2xl font-bold transition-all active:scale-95 group border border-red-100 dark:border-red-800/50"
                    >
                        <div className="w-10 h-10 bg-white dark:bg-red-500/20 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <FiAlertCircle className="text-xl" />
                        </div>
                        <span className="text-xs text-center">Emergency<br />Ambulance</span>
                    </Link>

                    {/* All Services */}
                    <Link
                        href="/dashboard/services-hub"
                        className="flex flex-col items-center justify-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-2xl font-bold transition-all active:scale-95 group border border-gray-100 dark:border-gray-700"
                    >
                        <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <FiGrid className="text-xl" />
                        </div>
                        <span className="text-xs text-center">All<br />Services</span>
                    </Link>
                </div>

                {/* Secondary Actions Row */}
                <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <Link
                        href="/dashboard/pharmacy"
                        className="flex items-center justify-center gap-2 py-2 text-gray-500 dark:text-gray-400 hover:text-donezo-dark dark:hover:text-white font-bold text-xs transition bg-gray-50 dark:bg-transparent dark:hover:bg-gray-800 rounded-xl"
                    >
                        <FiPlusSquare className="text-sm" />
                        Pharmacy
                    </Link>
                    <Link
                        href="/dashboard/support"
                        className="flex items-center justify-center gap-2 py-2 text-gray-500 dark:text-gray-400 hover:text-donezo-dark dark:hover:text-white font-bold text-xs transition bg-gray-50 dark:bg-transparent dark:hover:bg-gray-800 rounded-xl"
                    >
                        <FiMessageCircle className="text-sm" />
                        Support
                    </Link>
                    <a
                        href="tel:+254700448448"
                        className="flex items-center justify-center gap-2 py-2 text-gray-500 dark:text-gray-400 hover:text-donezo-dark dark:hover:text-white font-bold text-xs transition bg-gray-50 dark:bg-transparent dark:hover:bg-gray-800 rounded-xl"
                    >
                        <FiPhone className="text-sm" />
                        Call Us
                    </a>
                </div>
            </div>

            {/* Active Subscription Banner */}
            {subscriptions.find((s: any) => s.status === 'active') && (
                <div className="bg-red-500 rounded-[32px] p-6 text-white relative overflow-hidden shadow-xl shadow-red-500/20 flex items-center justify-between">
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl backdrop-blur-sm">🚑</div>
                        <div>
                            <h3 className="font-black text-2xl mb-1">Active Ambulance Plan</h3>
                            <p className="opacity-90 font-medium">Your <strong>{subscriptions.find((s: any) => s.status === 'active').package_type}</strong> is active until {new Date(subscriptions.find((s: any) => s.status === 'active').end_date).toLocaleDateString()}.</p>
                        </div>
                    </div>
                    <Link href="/dashboard/ambulance" className="hidden md:block bg-white text-red-600 px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-red-50 transition-colors">
                        Manage Plan
                    </Link>
                    <div className="absolute -right-10 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                </div>
            )}

            {/* Pending Subscription Banner */}
            {subscriptions.find((s: any) => s.status === 'pending_payment') && !subscriptions.find((s: any) => s.status === 'active') && (
                <div className="bg-orange-500 rounded-[32px] p-6 text-white relative overflow-hidden shadow-xl shadow-orange-500/20 flex items-center justify-between mb-8">
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl backdrop-blur-sm">⏳</div>
                        <div>
                            <h3 className="font-black text-2xl mb-1">Activation Pending</h3>
                            <p className="opacity-90 font-medium">Payment required to activate your <strong>{subscriptions.find((s: any) => s.status === 'pending_payment').package_type}</strong> plan.</p>
                        </div>
                    </div>
                    <Link href="/dashboard/invoices" className="hidden md:block bg-white text-orange-600 px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-orange-50 transition-colors">
                        Pay Now
                    </Link>
                    <div className="absolute -right-10 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                </div>
            )}

            {/* Quick Actions & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/dashboard/medical-records">
                    <QuickCard icon={<FiActivity />} label="Health Records" value={stats.medicalRecords} subLabel="Updated recently" color="blue" />
                </Link>
                <Link href="/dashboard/pharmacy">
                    <QuickCard icon={<FiPlusSquare />} label="My Pharmacy" value="Active" subLabel="View Prescriptions" color="green" />
                </Link>
                <div onClick={() => setShowBookingModal(true)}>
                    <QuickCard icon={<FiVideo />} label="Online Consults" value="Active" subLabel="Join tele-meeting" color="purple" />
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-[#161616] rounded-3xl p-8 border border-gray-100 dark:border-gray-800/60 shadow-sm">
                    <h3 className="text-xl font-black dark:text-white mb-6 flex items-center gap-3">
                        <span className="text-donezo-dark"><FiFileText /></span> Recent History
                    </h3>
                    <div className="space-y-6">
                        {appointments.length > 0 ? (
                            appointments.slice(0, 3).map((apt: any) => (
                                <HistoryItem
                                    key={apt.id}
                                    title={apt.reason || "General Consultation"}
                                    date={new Date(apt.appointment_date).toLocaleDateString()}
                                    time={apt.appointment_time}
                                    doctor={`Dr. ${apt.doctor?.lname || 'Unknown'}`}
                                    type={apt.isVirtual ? "Video Call" : "Physical"}
                                    status={apt.status}
                                    onView={() => handleOpenDetails(apt)}
                                />
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm italic">No appointment history found.</p>
                        )}
                    </div>
                    <Link href="/dashboard/appointments" className="block text-center mt-8 py-4 text-sm font-black text-gray-500 hover:text-donezo-dark border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl transition-all">
                        View All Activity
                    </Link>
                </div>

                <div className="relative bg-[#1A1A1A] rounded-[32px] p-8 text-white flex flex-col justify-end min-h-[300px] overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-1000"></div>
                    <div className="relative z-10">
                        <span className="text-green-500 font-black tracking-widest text-[10px] uppercase mb-4 block">Pharmacy Integration</span>
                        <h3 className="text-3xl font-black mb-4 leading-tight">Order your medications <br /> in one click.</h3>
                        <p className="text-gray-400 font-medium mb-8 max-w-sm">We've linked with local pharmacies to deliver your prescriptions directly to your doorstep.</p>
                        <button onClick={() => router.push('/dashboard/pharmacy')} className="bg-donezo-dark px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-donezo-dark/30 hover:shadow-donezo-dark/50 transition-all">Browse Store</button>
                    </div>
                </div>
            </div>

            {
                showBookingModal && (
                    <BookAppointmentModal
                        onClose={() => setShowBookingModal(false)}
                        onSuccess={() => {
                            setShowBookingModal(false);
                            fetchPatientData();
                        }}
                    />
                )
            }

            {showDetailsModal && selectedAppointment && (
                <ViewAppointmentDetailsModal
                    appointment={selectedAppointment}
                    onClose={() => setShowDetailsModal(false)}
                />
            )}
        </div >
    );
}

function QuickCard({ icon, label, value, subLabel, color }: any) {
    const colors: any = {
        blue: 'text-blue-500 border-blue-100 bg-blue-50/30',
        green: 'text-green-500 border-green-100 bg-green-50/30',
        purple: 'text-purple-500 border-purple-100 bg-purple-50/30',
    };
    return (
        <div className={`p-6 rounded-3xl border ${colors[color]} hover:scale-[1.03] transition-all cursor-pointer group h-full`}>
            <div className="flex justify-between items-start mb-4">
                <div className="text-2xl opacity-80 group-hover:scale-110 transition-transform">{icon}</div>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <span className="text-xl"><FiPlusSquare /></span>
                </div>
            </div>
            <h4 className="text-gray-900 dark:text-white font-black text-2xl mb-1">{value}</h4>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">{label}</p>
            <p className="text-gray-400 text-[10px] font-medium">{subLabel}</p>
        </div>
    );
}

function HistoryItem({ title, date, time, doctor, type, status, onView }: any) {
    return (
        <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-xl group-hover:bg-donezo-dark group-hover:text-white transition-all">
                {type === 'Physical' ? '🏥' : '💻'}
            </div>
            <div className="flex-1 min-w-0">
                <h5 className="font-bold text-gray-900 dark:text-white text-sm truncate">{title}</h5>
                <p className="text-xs text-gray-500 font-medium">{doctor} • {date} at {time}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                    {status}
                </span>
                <button onClick={onView} className="text-[10px] font-black text-donezo-dark uppercase tracking-widest group-hover:translate-x-1 transition-transform cursor-pointer hover:underline">View</button>
            </div>
        </div>
    );
}
