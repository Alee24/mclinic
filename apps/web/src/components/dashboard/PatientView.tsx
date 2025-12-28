'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FiCalendar, FiPlusSquare, FiFileText, FiActivity, FiMapPin, FiClock, FiVideo, FiAlertCircle } from 'react-icons/fi';
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
        <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-1000">
            {/* Hero Welcome */}
            <div className="relative bg-gradient-to-r from-donezo-dark to-green-600 rounded-[32px] p-8 md:p-12 text-white overflow-hidden shadow-2xl shadow-green-900/20">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse"></div>
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">Hello, {user?.fname}!</h1>
                        <p className="text-green-50 text-lg font-medium mb-8 max-w-md opacity-90">How are you feeling today? {nextAppointment ? 'You have an upcoming visit.' : 'No upcoming visits scheduled.'}</p>
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => setShowBookingModal(true)}
                                className="bg-white text-donezo-dark px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-green-50 transition-colors shadow-xl"
                            >
                                Book Appointment
                            </button>
                            <Link href="/dashboard/ambulance" className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-white/20 transition-colors flex items-center justify-center">
                                Emergency
                            </Link>
                        </div>
                    </div>
                    {nextAppointment && (
                        <div
                            onClick={() => handleOpenDetails(nextAppointment)}
                            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[28px] p-6 text-white group hover:bg-white/20 transition-all cursor-pointer"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <span className="bg-green-500/30 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border border-green-400/30">Next Appointment</span>
                                <span className="text-2xl opacity-50"><FiCalendar /></span>
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
                                    <span className="text-green-300"><FiClock /></span>
                                    <span>{nextAppointment.appointment_time}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm font-bold">
                                    <span className="text-green-300"><FiMapPin /></span>
                                    <span>Nairobi Branch</span>
                                </div>
                            </div>
                        </div>
                    )}
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
