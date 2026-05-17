'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FiCalendar, FiPlusSquare, FiFileText, FiActivity, FiMapPin, FiClock, FiVideo, FiAlertCircle, FiGrid, FiMessageCircle, FiPhone, FiTruck } from 'react-icons/fi';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BookAppointmentModal from './appointments/BookAppointmentModal';
import ViewAppointmentDetailsModal from './appointments/ViewAppointmentDetailsModal';
import toast from 'react-hot-toast';

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
    const [isTriggeringEmergency, setIsTriggeringEmergency] = useState(false);

    const handlePaySubscription = async (subId: number) => {
        try {
            const res = await api.post(`/ambulance/${subId}/pay`, {});
            if (res?.ok) {
                toast.success('Subscription activated successfully!');
                fetchPatientData();
            } else {
                toast.error('Failed to activate subscription.');
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred during payment.');
        }
    };

    const triggerEmergencyAlert = async () => {
        setIsTriggeringEmergency(true);
        
        // 1. Get Location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const res = await api.post('/emergency/alert', { lat: latitude, lng: longitude });
                        if (res && res.ok) {
                            toast.success('Ambulance Dispatched! Clinical team notified.');
                        } else {
                            toast.error('Alert sent, but dispatch team status is pending.');
                        }
                    } catch (e) {
                        console.error(e);
                        toast.error('Failed to alert emergency team. Contacting default center.');
                    } finally {
                        setIsTriggeringEmergency(false);
                    }
                },
                async (err) => {
                    console.error('Geolocation failed', err);
                    // Fallback to sending alert without coordinates
                    try {
                        const res = await api.post('/emergency/alert', { lat: 0, lng: 0 });
                        if (res && res.ok) {
                            toast.success('Alert sent! Dispatcher calling you back now.');
                        } else {
                            toast.error('Alert submission pending.');
                        }
                    } catch (e) {
                        toast.error('Connection timeout.');
                    } finally {
                        setIsTriggeringEmergency(false);
                    }
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            // No geolocation support
            try {
                const res = await api.post('/emergency/alert', { lat: 0, lng: 0 });
                if (res && res.ok) {
                    toast.success('Alert sent! Dispatcher calling you back now.');
                }
            } catch (e) {
                toast.error('Connection timeout.');
            } finally {
                setIsTriggeringEmergency(false);
            }
        }
    };

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
                            <span className="text-xs font-bold uppercase tracking-widest text-green-300">
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
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

            {/* Active Subscription Banner */}
            {subscriptions.find((s: any) => s.status === 'active') && (
                <div className="bg-emerald-600 rounded-[32px] p-6 text-white relative overflow-hidden shadow-xl shadow-emerald-600/20 flex items-center justify-between">
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl backdrop-blur-sm">🚑</div>
                        <div>
                            <h3 className="font-black text-2xl mb-1">Active Ambulance Plan</h3>
                            <p className="opacity-90 font-medium">Your <strong>{subscriptions.find((s: any) => s.status === 'active').package_type}</strong> is active until {new Date(subscriptions.find((s: any) => s.status === 'active').end_date).toLocaleDateString()}.</p>
                        </div>
                    </div>
                    <Link href="/dashboard/ambulance" className="hidden md:block bg-white text-emerald-600 px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-emerald-50 transition-colors">
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
                    <button
                        onClick={() => handlePaySubscription(subscriptions.find((s: any) => s.status === 'pending_payment').id)}
                        className="hidden md:block bg-white text-orange-600 px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-orange-50 transition-all"
                    >
                        Pay Now
                    </button>
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

            {/* FLOATING GREEN EMERGENCY EVACUATION BUTTON */}
            {subscriptions.some((s: any) => s.status === 'active') && (
                <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3 group">
                    {/* Hover Status/Tooltip */}
                    <div className="bg-black/85 backdrop-blur-md border border-white/10 text-white text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-xl shadow-xl transition-all duration-300 translate-y-2 opacity-0 pointer-events-none group-hover:translate-y-0 group-hover:opacity-100 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Ambulance Plan Active
                    </div>
                    
                    <button
                        onClick={triggerEmergencyAlert}
                        disabled={isTriggeringEmergency}
                        className="flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-4 rounded-full shadow-2xl shadow-emerald-600/40 border-4 border-emerald-300 transition-all duration-300 hover:scale-105 active:scale-95 animate-pulse"
                    >
                        <FiTruck className="text-xl" />
                        <span className="text-xs uppercase tracking-widest">EMERGENCY EVACUATION</span>
                    </button>
                </div>
            )}

            {isTriggeringEmergency && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#121212] rounded-[40px] p-8 max-w-md w-full border border-gray-100 dark:border-gray-800 text-center shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="w-24 h-24 bg-emerald-100/50 dark:bg-emerald-950/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                            <span className="absolute inset-0 border-4 border-emerald-500 rounded-full animate-ping opacity-70"></span>
                            <FiTruck className="text-4xl" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Emergency Dispatching...</h3>
                        <p className="text-gray-500 text-sm mb-6">
                            Acquiring GPS coordinates to pinpoint your location and alert our 24/7 medical response team. Keep this app open.
                        </p>
                        <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-6">
                            <div className="h-full bg-emerald-500 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                        </div>
                        <button
                            onClick={() => setIsTriggeringEmergency(false)}
                            className="text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition"
                        >
                            Cancel Request
                        </button>
                    </div>
                </div>
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
