'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { 
  FiVideo, 
  FiPlus, 
  FiCalendar, 
  FiArrowRight, 
  FiInfo, 
  FiCompass, 
  FiCheckCircle, 
  FiClock, 
  FiSmartphone 
} from 'react-icons/fi';
import Link from 'next/link';

export default function MeetingsPage() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [manualRoom, setManualRoom] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/appointments');
            if (res?.ok) {
                const data = await res.json();
                // Filter only confirmed virtual appointments
                const virtuals = data.filter((apt: any) => 
                    apt.isVirtual && 
                    apt.status === 'confirmed'
                );
                setAppointments(virtuals);
            }
        } catch (err) {
            console.error('[MeetingsPage] error fetching appointments:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">
            {/* Header section with elegant gradient card */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">
                        M-Clinic Telehealth
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
                        Virtual Consultation Hub
                    </h1>
                    <p className="text-indigo-100 text-lg mb-0 font-medium">
                        Connect with qualified healthcare professionals instantly from the comfort of your home. Premium, secure, and fully private video consultations.
                    </p>
                </div>
                {/* Decorative design elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Columns: Active Sessions */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                        Active & Upcoming Virtual Consultations
                    </h2>

                    {loading ? (
                        <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center shadow-sm">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mb-4"></div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Loading consultations...</p>
                        </div>
                    ) : appointments.length === 0 ? (
                        <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-3xl p-10 text-center flex flex-col items-center justify-center shadow-sm">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-2xl flex items-center justify-center mb-6">
                                <FiVideo size={28} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">No Active Virtual Consultations</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6 text-sm">
                                You do not have any confirmed virtual consultation sessions scheduled for today.
                            </p>
                            <Link
                                href="/dashboard/appointments?book=true&type=VIRTUAL"
                                className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 text-sm"
                            >
                                <FiPlus /> Book Virtual Consultation
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {appointments.map((apt) => (
                                <div 
                                    key={apt.id}
                                    className="bg-white dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold uppercase">
                                                {apt.serviceType || 'General Consultation'}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs text-emerald-500 font-bold">
                                                <FiCheckCircle /> Confirmed
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                                            Session with {apt.doctorName || apt.patientName || 'Medical Professional'}
                                        </h3>
                                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <FiCalendar /> {new Date(apt.dateTime).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FiClock /> {new Date(apt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Link
                                            href={`/dashboard/meetings/${apt.meetingId}`}
                                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center gap-2"
                                        >
                                            <FiVideo /> Enter Call
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Utilities */}
                <div className="space-y-6">
                    {/* Join Manually Form */}
                    <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
                        <h3 className="font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                            <FiCompass className="text-indigo-500" />
                            Join Session Manually
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                            If you were given a direct Meeting Room ID, paste it below to enter the embedded room directly.
                        </p>
                        
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="e.g. mclinic-1778993075347-6136"
                                value={manualRoom}
                                onChange={(e) => setManualRoom(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-indigo-500 transition-colors"
                            />
                            <Link
                                href={manualRoom ? `/dashboard/meetings/${manualRoom}` : '#'}
                                className={`w-full py-3 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 ${
                                    !manualRoom ? 'opacity-50 pointer-events-none' : ''
                                }`}
                            >
                                Enter Embedded Room <FiArrowRight />
                            </Link>
                        </div>
                    </div>

                    {/* How It Works Card */}
                    <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
                        <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <FiInfo className="text-emerald-500" />
                            How it works
                        </h3>
                        <ul className="space-y-3 text-xs text-gray-500 dark:text-gray-400">
                            <li className="flex gap-2">
                                <span className="w-4 h-4 bg-emerald-50 dark:bg-emerald-950 text-emerald-500 rounded-full flex items-center justify-center shrink-0 font-bold">1</span>
                                <span>Complete booking process for virtual consult.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="w-4 h-4 bg-emerald-50 dark:bg-emerald-950 text-emerald-500 rounded-full flex items-center justify-center shrink-0 font-bold">2</span>
                                <span>Once confirmed, click "Enter Call" to start the session.</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="w-4 h-4 bg-emerald-50 dark:bg-emerald-950 text-emerald-500 rounded-full flex items-center justify-center shrink-0 font-bold">3</span>
                                <span>The call takes place safely embedded within this portal.</span>
                            </li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
}
