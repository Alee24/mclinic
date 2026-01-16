'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth, UserRole } from '@/lib/auth';
import { FiUser, FiMapPin, FiAward, FiCheckCircle, FiAlertCircle, FiDollarSign, FiBriefcase, FiClock, FiPhone, FiMail } from 'react-icons/fi';

export default function DoctorDetailsPage() {
    const { user } = useAuth();
    const params = useParams();
    const [doctor, setDoctor] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'profile' | 'appointments' | 'financials'>('profile');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Doctor Profile
                const docRes = await api.get(`/doctors/${params.id}`);
                if (docRes && docRes.ok) {
                    setDoctor(await docRes.json());
                }

                // Fetch Doctor Appointments
                const apptRes = await api.get(`/appointments/doctor/${params.id}`);
                if (apptRes && apptRes.ok) {
                    setAppointments(await apptRes.json());
                }

                // Simulate/Fetch Transactions (We can add a real endpoint later)
                // For now, derive from appointments or use empty
                setTransactions([]);

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) fetchData();
    }, [params.id]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading doctor profile...</div>;
    if (!doctor) return <div className="p-8 text-center text-red-500">Doctor not found</div>;

    const isAdmin = user?.role === UserRole.ADMIN;
    // Check if the current user is the doctor being viewed
    // Note: user.doctorId might be number or string, doctor.id is usually number
    const isOwner = user?.role === UserRole.DOCTOR && user?.doctorId == doctor.id;

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-white dark:bg-[#161616] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-6 items-start">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-4xl font-bold text-primary overflow-hidden border-2 border-gray-100 dark:border-gray-700">
                    <img src={`https://ui-avatars.com/api/?name=${doctor.fname}+${doctor.lname}&background=random`} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold dark:text-white">{doctor.fname} {doctor.lname}</h1>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${doctor.verified_status ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                            }`}>
                            {doctor.verified_status ? 'Verified' : 'Pending Verification'}
                        </span>
                        {/* Online Status */}
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${doctor.isWorking ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                            {doctor.isWorking ? 'Online' : 'Offline'}
                        </span>
                    </div>
                    <div className="text-lg text-gray-500 dark:text-gray-400 font-medium mt-1">{doctor.dr_type}</div>

                    <div className="flex flex-wrap items-center gap-6 mt-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                            <span className="text-primary"><FiAward /></span>
                            <span>{doctor.qualification}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-primary"><FiDollarSign /></span>
                            <span>Fee: KES {doctor.fee}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-primary"><FiBriefcase /></span>
                            <span>{doctor.isWorking ? 'Available (Working)' : 'Off Duty'}</span>
                        </div>
                        {doctor.latitude && (
                            <div className="flex items-center gap-2">
                                <span className="text-primary"><FiMapPin /></span>
                                <span className="text-green-600">Location Set</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Wallet - Only visible to Admin or the Doctor themselves */}
                {(isAdmin || isOwner) && (
                    <div className="flex flex-col gap-2 bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                        <div className="text-right">
                            <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Wallet Balance</div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">KES {doctor.balance}</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Admin Actions - STRICTLY ADMIN ONLY */}
            {isAdmin && (
                <div className="flex flex-wrap gap-3 p-4 bg-white dark:bg-[#161616] rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="text-sm font-bold uppercase text-gray-400 self-center mr-2">Admin Actions:</div>

                    {doctor.approvalStatus === 'pending' && (
                        <button
                            onClick={async () => {
                                if (!confirm('Approve this doctor?')) return;
                                try {
                                    await api.post(`/doctors/${doctor.id}/approve`, {});
                                    window.location.reload();
                                } catch (e) { alert('Failed to approve'); }
                            }}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold uppercase rounded-lg transition"
                        >
                            Approve
                        </button>
                    )}

                    {doctor.status === 1 ? (
                        <>
                            <button
                                onClick={async () => {
                                    if (!confirm('Deactivate this doctor? They will not be able to login.')) return;
                                    try {
                                        await api.patch(`/doctors/${doctor.id}/deactivate`, {});
                                        window.location.reload();
                                    } catch (e) { alert('Failed to deactivate'); }
                                }}
                                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold uppercase rounded-lg transition"
                            >
                                Deactivate
                            </button>
                            <button
                                onClick={async () => {
                                    const reason = prompt('Enter suspension reason:');
                                    if (!reason) return;
                                    try {
                                        await api.patch(`/doctors/${doctor.id}/suspend`, { reason });
                                        window.location.reload();
                                    } catch (e) { alert('Failed to suspend'); }
                                }}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold uppercase rounded-lg transition"
                            >
                                Suspend
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={async () => {
                                if (!confirm('Activate this doctorAccount?')) return;
                                try {
                                    await api.patch(`/doctors/${doctor.id}/activate`, {});
                                    window.location.reload();
                                } catch (e) { alert('Failed to activate'); }
                            }}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold uppercase rounded-lg transition"
                        >
                            Activate
                        </button>
                    )}

                    <button
                        onClick={async () => {
                            if (!confirm('PERMANENTLY DELETE doctor? This cannot be undone.')) return;
                            const confirmation = prompt("Type 'DELETE' to confirm:");
                            if (confirmation !== 'DELETE') return;

                            try {
                                await api.delete(`/doctors/${doctor.id}`);
                                window.location.href = '/dashboard/admin/doctors';
                            } catch (e) { alert('Failed to delete'); }
                        }}
                        className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold uppercase rounded-lg transition ml-auto"
                    >
                        Delete Account
                    </button>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-6 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
                {['profile', (isAdmin || isOwner) ? 'appointments' : null, (isAdmin || isOwner) ? 'financials' : null].filter(Boolean).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`pb-3 text-sm font-bold capitalize transition whitespace-nowrap ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        {tab} Details
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {activeTab === 'profile' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="lg:col-span-2 space-y-6">
                            <section className="bg-white dark:bg-[#161616] rounded-xl p-6 border border-gray-100 dark:border-gray-800">
                                <h3 className="text-lg font-bold dark:text-white mb-4">About Doctor</h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {doctor.bio || doctor.about || 'No detailed biography available for this doctor.'}
                                </p>
                            </section>

                            <section className="bg-white dark:bg-[#161616] rounded-xl p-6 border border-gray-100 dark:border-gray-800">
                                <h3 className="text-lg font-bold dark:text-white mb-4">Professional Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4 text-sm">
                                    <div>
                                        <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Qualification</div>
                                        <div className="font-medium dark:text-gray-200 text-base">{doctor.qualification}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Specialty</div>
                                        <div className="font-medium dark:text-gray-200 text-base">{doctor.dr_type}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">National ID</div>
                                        <div className="font-medium dark:text-gray-200 text-base">{doctor.national_id}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">License No.</div>
                                        <div className="font-medium dark:text-gray-200 text-base">{doctor.licenceNo || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Registration Code</div>
                                        <div className="font-medium dark:text-gray-200 text-base">{doctor.reg_code || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Account Status</div>
                                        <div className={`font-bold uppercase inline-block px-2 py-0.5 rounded text-xs ${doctor.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {doctor.status ? 'Active' : 'Inactive'}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                        <div className="space-y-6">
                            <section className="bg-white dark:bg-[#161616] rounded-xl p-6 border border-gray-100 dark:border-gray-800">
                                <h3 className="text-lg font-bold dark:text-white mb-4">Contact Information</h3>
                                {(isAdmin || isOwner || appointments.some(a => a.patient?.id === user?.id && ['completed', 'approved'].includes(a.status))) ? (
                                    <div className="space-y-4 text-sm">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 shrink-0"><FiPhone /></div>
                                            <div>
                                                <div className="text-xs text-gray-400">Mobile Number</div>
                                                <div className="font-medium dark:text-gray-200">{doctor.mobile}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 shrink-0"><FiMail /></div>
                                            <div>
                                                <div className="text-xs text-gray-400">Email Address</div>
                                                <div className="font-medium dark:text-gray-200">{doctor.email}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 shrink-0"><FiMapPin /></div>
                                            <div>
                                                <div className="text-xs text-gray-400">Address / Location</div>
                                                <div className="font-medium dark:text-gray-200">{doctor.address}</div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <FiUser className="text-gray-400" size={24} />
                                        </div>
                                        <div className="text-sm font-bold text-gray-600 dark:text-gray-300">Contact Details Hidden</div>
                                        <p className="text-xs text-gray-500 mt-1 mb-3">
                                            Book and pay for an appointment to view this medic's contact information.
                                        </p>
                                    </div>
                                )}
                            </section>
                        </div>
                    </div>
                )}

                {/* Appointments Tab - Only visible to Admin/Owner */}
                {(activeTab === 'appointments' && (isAdmin || isOwner)) && (
                    <div className="bg-white dark:bg-[#161616] rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <h3 className="font-bold dark:text-white">Appointment History</h3>
                            <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded-md">{appointments.length} Records</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-500 font-medium">
                                    <tr>
                                        <th className="px-6 py-4">Patient</th>
                                        <th className="px-6 py-4">Date & Time</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Fees</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {appointments.length === 0 ? (
                                        <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No appointments found for this doctor.</td></tr>
                                    ) : (
                                        appointments.map(appt => (
                                            <tr key={appt.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900 dark:text-white">{appt.patient?.fname || 'Guest'} {appt.patient?.lname || ''}</div>
                                                    <div className="text-xs text-gray-500">{appt.patient?.email}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-gray-900 dark:text-white">{new Date(appt.appointment_date).toLocaleDateString()}</div>
                                                    <div className="text-xs text-gray-500">{appt.appointment_time}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${appt.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                        appt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                            'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {appt.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-gray-600 dark:text-gray-400">
                                                    KES {doctor.fee}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'financials' && (
                    <div className="bg-white dark:bg-[#161616] rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 p-8 text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="max-w-md mx-auto">
                            <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center text-3xl mb-4 mx-auto">
                                <FiDollarSign />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Detailed Financials</h3>
                            <p className="text-gray-500 mb-6">
                                View detailed transaction history, payouts, and earnings reports.
                            </p>
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-left mb-6">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-500 text-sm">Total Earnings</span>
                                    <span className="font-bold dark:text-white">KES {doctor.balance}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 text-sm">Last Payout</span>
                                    <span className="font-bold dark:text-white">Never</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

