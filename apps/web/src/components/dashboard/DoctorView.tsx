'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FiCalendar, FiUsers, FiClock, FiActivity, FiDollarSign, FiPlus, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import ApprovalStatusBanner from '../ApprovalStatusBanner';

import EditDoctorProfileModal from './doctors/EditDoctorProfileModal';
import ViewAppointmentDetailsModal from './appointments/ViewAppointmentDetailsModal';

export default function DoctorView() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalPatients: 0,
        appointmentsToday: 0,
        pendingReports: 0,
        earningsAmount: 0,
        upcomingAppointments: [] as any[]
    });

    const [isOnline, setIsOnline] = useState(false);
    const [profileWarning, setProfileWarning] = useState(false);
    const [doctorProfile, setDoctorProfile] = useState<any>(null); // Store full doctor profile

    // Modal States
    const [showEditProfileModal, setShowEditProfileModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

    useEffect(() => {
        const fetchDoctorData = async () => {
            try {
                // Fetch Doctor Profile
                if (user?.email) {
                    const allDocsRes = await api.get('/doctors/admin/all');
                    if (allDocsRes && allDocsRes.ok) {
                        const allDocs = await allDocsRes.json();
                        const myDoc = allDocs.find((d: any) => d.email === user.email);
                        if (myDoc) {
                            setDoctorProfile(myDoc);
                            setIsOnline(myDoc.is_online === 1);

                            if (!myDoc.about || !myDoc.speciality || !myDoc.qualification || !myDoc.latitude) {
                                setProfileWarning(true);
                            } else {
                                setProfileWarning(false);
                            }
                        }
                    }
                }

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
    }, [user, showEditProfileModal]); // Re-fetch when modal closes (profile updated)

    const handleToggleOnline = async () => {
        const newStatus = !isOnline;

        if (newStatus) {
            // Going Online - Get Location
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    await updateStatusAPI(newStatus ? 1 : 0, latitude, longitude);
                }, (err) => {
                    alert('Location access is required to go online.');
                });
            } else {
                alert('Geolocation is not supported by this browser.');
            }
        } else {
            // Going Offline
            await updateStatusAPI(0);
        }
    };

    const updateStatusAPI = async (status: number, lat?: number, lng?: number) => {
        if (doctorProfile) {
            await api.patch(`/doctors/${doctorProfile.id}/online-status`, { status, latitude: lat, longitude: lng });
            setIsOnline(status === 1);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {profileWarning && (
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-xl flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <FiActivity className="text-orange-500 text-xl" />
                        <div>
                            <p className="font-bold text-orange-800">Action Required: Complete your Profile</p>
                            <p className="text-sm text-orange-700">You must update your bio, speciality, and location to appear in search results.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowEditProfileModal(true)}
                        className="text-sm font-bold bg-white text-orange-600 px-4 py-2 rounded-lg border border-orange-200 hover:bg-orange-100 transition"
                    >
                        Edit Profile
                    </button>
                </div>
            )}

            {/* Approval Status Banner */}
            {doctorProfile && (
                <ApprovalStatusBanner
                    status={doctorProfile.approvalStatus || 'pending'}
                    rejectionReason={doctorProfile.rejectionReason}
                    licenseStatus={doctorProfile.licenseStatus || 'valid'}
                    licenseExpiryDate={doctorProfile.licenseExpiryDate}
                />
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-bold dark:text-white">Welcome back, {user?.role === 'doctor' ? 'Dr.' : ''} {user?.fname}</h1>
                    <p className="text-gray-500 font-medium tracking-tight">You have {stats.appointmentsToday} appointments scheduled for today.</p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowEditProfileModal(true)}
                        className="text-sm font-bold text-gray-500 hover:text-black dark:hover:text-white underline"
                    >
                        Edit Profile
                    </button>
                    <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-2 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <span className={`text-sm font-bold ${isOnline ? 'text-green-600' : 'text-gray-400'}`}>
                            {isOnline ? 'ONLINE' : 'OFFLINE'}
                        </span>
                        <button
                            onClick={handleToggleOnline}
                            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isOnline ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    <button
                        onClick={() => {
                            const roomName = `Dr-${user?.fname}-${user?.id}`;
                            const url = `https://virtual.mclinic.co.ke/${roomName}`;
                            window.open(url, '_blank');
                        }}
                        className="bg-donezo-dark text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-donezo-dark/30 hover:scale-[1.02] transition-transform"
                    >
                        <FiPlus /> Start Session
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link href="/dashboard/finance/transactions">
                    <DrStatCard label="Wallet Balance" value={`KES ${stats.earningsAmount.toLocaleString()}`} icon={<FiDollarSign />} color="green" />
                </Link>
                <Link href="/dashboard/appointments">
                    <DrStatCard label="Today's Appointments" value={stats.appointmentsToday} icon={<FiCalendar />} color="blue" />
                </Link>
                {/* Changed from Reviews to My Patients for better utility */}
                <Link href="/dashboard/patients">
                    <DrStatCard label="My Patients" value={doctorProfile?.patients_count || "View"} icon={<FiUsers />} color="purple" />
                </Link>
                <Link href="/dashboard/appointments">
                    <DrStatCard label="Pending Reports" value={stats.pendingReports} icon={<FiClock />} color="orange" />
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-[#161616] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg dark:text-white">Upcoming Appointments</h3>
                        <Link href="/dashboard/appointments" className="text-sm font-bold text-donezo-dark hover:underline">View Schedule</Link>
                    </div>
                    <div className="space-y-4">
                        {stats.upcomingAppointments.length === 0 ? (
                            <div className="py-12 text-center text-gray-400 italic">No appointments found.</div>
                        ) : stats.upcomingAppointments.map((apt, i) => (
                            <div
                                key={apt.id}
                                onClick={() => {
                                    setSelectedAppointment(apt);
                                    setShowDetailsModal(true);
                                }}
                                className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 dark:bg-black/20 border border-gray-100 dark:border-gray-800/50 hover:border-donezo-dark/30 transition-colors group cursor-pointer"
                            >
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
                                    <button className="text-[10px] font-bold text-donezo-dark hover:underline">View Details</button>
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
                            {`virtual.mclinic.co.ke/Dr-${user?.fname}-${user?.id || 'me'}`}
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            const roomName = `Dr-${user?.fname}-${user?.id}`;
                            const url = `https://virtual.mclinic.co.ke/${roomName}`;
                            window.open(url, '_blank');
                            if (!isOnline) handleToggleOnline();
                        }}
                        className="w-full py-3 bg-white text-donezo-dark font-black rounded-xl hover:bg-green-50 transition-colors"
                    >
                        Go Live Now
                    </button>
                </div>
            </div>

            {showEditProfileModal && doctorProfile && (
                <EditDoctorProfileModal
                    doctor={doctorProfile}
                    onClose={() => setShowEditProfileModal(false)}
                    onSuccess={() => {
                        // Trigger re-fetch via dependency array if needed, but handled by useEffect based on showEditProfileModal possibly?
                        // Actually I added showEditProfileModal as deep dependency so it should re-fetch when modal closes if I toggle it?
                        // Wait, I toggled it to false. 
                        // Let's rely on standard re-fetch or I can manually trigger.
                        // For now reliance on setDoctorProfile might need manual update or re-fetch.
                        // The dependency [user, showEditProfileModal] will trigger when modal closes?
                        // Only if showEditProfileModal changes. It changes from true to false. So yes.
                    }}
                />
            )}

            {showDetailsModal && selectedAppointment && (
                <ViewAppointmentDetailsModal
                    appointment={selectedAppointment}
                    onClose={() => setShowDetailsModal(false)}
                />
            )}
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
        <div className="bg-white dark:bg-[#161616] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4 group hover:border-primary/50 transition-all cursor-pointer h-full">
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
