'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth, UserRole } from '@/lib/auth';
import { FiVideo } from 'react-icons/fi';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ViewAppointmentDetailsModal from '@/components/dashboard/appointments/ViewAppointmentDetailsModal';
import RateDoctorModal from '@/components/dashboard/appointments/RateDoctorModal';
import CreateAppointmentModal from '@/components/dashboard/appointments/CreateAppointmentModal';
import BookAppointmentModal from '@/components/dashboard/appointments/BookAppointmentModal';
import CompleteAppointmentModal from '@/components/dashboard/appointments/CompleteAppointmentModal';

export default function AppointmentsPage() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showBookModal, setShowBookModal] = useState(false);
    const [initialType, setInitialType] = useState<'PHYSICAL' | 'VIRTUAL'>('PHYSICAL');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showRateModal, setShowRateModal] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

    useEffect(() => {
        const book = searchParams.get('book');
        const type = searchParams.get('type');
        if (book === 'true') {
            if (type === 'VIRTUAL') setInitialType('VIRTUAL');
            else setInitialType('PHYSICAL');
            setShowBookModal(true);
        }
    }, [searchParams]);

    const [subscriptions, setSubscriptions] = useState<any[]>([]);

    const fetchData = async (isPolling = false) => {
        if (!isPolling) setLoading(true);
        try {
            const aptRes = await api.get('/appointments');
            if (aptRes?.ok) {
                let data = await aptRes.json();
                setAppointments(data);
            }

            // Also fetch subscriptions for patients
            const subRes = await api.get('/ambulance/my-subscriptions');
            if (subRes?.ok) {
                const subs = await subRes.json();
                setSubscriptions(subs);
            }
        } catch (err) {
            console.error(err);
        } finally {
            if (!isPolling) setLoading(false);
        }
    };

    const updateStatus = async (id: number, status: string) => {
        if (!confirm(`Are you sure you want to mark this appointment as ${status}?`)) return;
        try {
            await api.patch(`/appointments/${id}/status`, { status });
            fetchData(); // Refresh
        } catch (err) {
            console.error(err);
            alert('Failed to update status');
        }
    };

    const deleteAppointment = async (id: number) => {
        if (!confirm('Are you sure you want to PERMANENTLY DELETE this appointment? This action cannot be undone.')) return;
        try {
            const res = await api.delete(`/appointments/${id}`);
            if (res?.ok) {
                alert('Appointment deleted successfully');
                fetchData();
            } else {
                alert('Failed to delete appointment');
            }
        } catch (err) {
            console.error(err);
            alert('Error deleting appointment');
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
            const interval = setInterval(() => fetchData(true), 5000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const role = user?.role?.toLowerCase();
    const isAdmin = role === 'admin';
    const isDoctor = ['doctor', 'medic', 'nurse', 'clinician', 'lab_tech'].includes(role || '');
    const isPatient = role === 'patient';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold dark:text-white">Appointments</h1>
                {(isAdmin || isPatient || isDoctor) && (
                    <button
                        onClick={() => (isPatient || isDoctor) ? setShowBookModal(true) : setShowModal(true)}
                        className="bg-primary text-black font-bold px-4 py-2 rounded-lg hover:opacity-90 transition shadow-lg hover:translate-y-[-2px]"
                    >
                        {(isPatient || isDoctor) ? '+ Book Appointment' : '+ New Booking'}
                    </button>
                )}
            </div>

            {/* Active Subscriptions Display */}
            {subscriptions.some(s => s.status === 'active') && (
                <div className="flex flex-wrap gap-4 mb-6">
                    {subscriptions.filter(s => s.status === 'active').map(sub => (
                        <div key={sub.id} className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
                            <div className="w-10 h-10 bg-white dark:bg-emerald-500/20 rounded-xl flex items-center justify-center text-xl shadow-sm">
                                {sub.package_type?.toLowerCase().includes('concierge') ? '🏥' : '🚑'}
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Active Plan</div>
                                <div className="font-bold text-gray-900 dark:text-white text-sm">{sub.package_type}</div>
                                <div className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">Expires: {new Date(sub.end_date).toLocaleDateString()}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-gray-800 overflow-x-auto w-full">
                <table className="w-full text-left whitespace-nowrap text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-500 font-medium">
                        <tr>
                            {!isPatient && <th className="px-6 py-4">Patient</th>}
                            <th className="px-6 py-4">Medic/Nurse</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4">Service</th>
                            <th className="px-6 py-4">Date & Time</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Payment</th>
                            <th className="px-6 py-4">Charge</th>
                            {isAdmin && <th className="px-6 py-4 text-emerald-600">Comm.</th>}
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {loading ? (
                            <tr><td colSpan={isPatient ? 8 : 9} className="px-6 py-4 text-center">Loading...</td></tr>
                        ) : appointments.length === 0 ? (
                            <tr><td colSpan={isPatient ? 8 : 9} className="px-6 py-4 text-center text-gray-500">No appointments found</td></tr>
                        ) : (
                            appointments.map((apt) => (
                                <tr key={apt.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    {!isPatient && (
                                        <td className="px-6 py-4 font-medium dark:text-white">
                                            {apt.patient ? (
                                                apt.patient.fname ? `${apt.patient.fname} ${apt.patient.lname}` : 'Unknown'
                                            ) : 'Unknown'}
                                        </td>
                                    )}
                                    <td className="px-6 py-4 text-gray-500">
                                        {apt.doctor 
                                            ? `${apt.doctor.fname} ${apt.doctor.lname}` 
                                            : ((apt.isConcierge || apt.service?.name?.toLowerCase().includes('ambulance')) ? 'Mclinic Kenya' : 'Unassigned')}
                                    </td>
                                     <td className="px-6 py-4 text-gray-500">
                                        {/* Show the 'other' party's contact info */}
                                        {user?.id === apt.patientId 
                                            ? (apt.doctor?.mobile || 'N/A')
                                            : (apt.patient?.mobile || apt.patient?.user?.mobile || 'N/A')
                                        }
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{apt.service?.name || 'General Consultation'}</span>
                                            <span className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">
                                                {apt.isVirtual ? '💻 VIRTUAL' : '🏠 PHYSICAL VISIT'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {apt.appointment_date ? (
                                            <div>
                                                <div className="font-bold text-gray-800 dark:text-gray-200">{new Date(apt.appointment_date).toLocaleDateString()}</div>
                                                <div className="text-xs">{apt.appointment_time}</div>
                                            </div>
                                        ) : 'Pending Date'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-black uppercase w-fit ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                            apt.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                                apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    apt.status === 'missed' ? 'bg-red-100 text-red-700' :
                                                        apt.status === 'cancelled' ? 'bg-gray-100 text-gray-700' :
                                                            'bg-gray-100 text-gray-700'
                                            }`}>
                                            {apt.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className={`px-2 py-1 rounded font-black text-[10px] uppercase w-fit ${apt.invoice?.status === 'paid' || apt.invoice?.status === 'PAID'
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-rose-100 text-rose-600'
                                                }`}>
                                                {apt.invoice?.status === 'paid' || apt.invoice?.status === 'PAID' ? 'PAID' : 'PENDING'}
                                            </span>
                                            {isDoctor && (apt.invoice?.status !== 'paid' && apt.invoice?.status !== 'PAID') && (
                                                <span className="text-[9px] font-black text-rose-500 animate-pulse uppercase">
                                                    ⚠️ DO NOT PROCEED
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                        KES {apt.invoice?.totalAmount ? Number(apt.invoice.totalAmount).toLocaleString() : (apt.fee || 0).toLocaleString()}
                                    </td>
                                    {isAdmin && (
                                        <td className="px-6 py-4 font-black text-emerald-600">
                                            {apt.invoice?.commissionAmount ? `KES ${Number(apt.invoice.commissionAmount).toLocaleString()}` : '-'}
                                        </td>
                                    )}
                                    <td className="px-6 py-4">
                                         <div className="flex gap-2 items-center">
                                             {/* General Details button for everyone */}
                                             <button
                                                 onClick={() => {
                                                     setSelectedAppointment(apt);
                                                     setShowDetailsModal(true);
                                                 }}
                                                 className="text-[10px] font-black px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition uppercase tracking-tighter"
                                                 title="View Full Details"
                                             >
                                                 Details
                                             </button>

                                             {/* Patient-side Actions */}
                                             {user?.id === Number(apt.patientId) && (
                                                 <>
                                                     {apt.status === 'completed' && (
                                                         <button
                                                             onClick={() => {
                                                                 setSelectedAppointment(apt);
                                                                 setShowRateModal(true);
                                                             }}
                                                             className="text-[10px] font-black px-3 py-1.5 rounded-lg bg-yellow-400 text-black hover:bg-yellow-500 transition uppercase tracking-tighter"
                                                         >
                                                             Rate Medic
                                                         </button>
                                                     )}
                                                     {apt.meetingLink && apt.meetingId && apt.status === 'confirmed' && (
                                                         <Link
                                                             href={`/dashboard/meetings/${apt.meetingId}`}
                                                             className="flex items-center gap-1.5 bg-blue-600 text-white text-[10px] font-black px-3 py-1.5 rounded-lg hover:bg-blue-700 transition uppercase tracking-tighter"
                                                         >
                                                             <FiVideo /> Join Session
                                                         </Link>
                                                     )}
                                                     {['pending', 'confirmed'].includes(apt.status) && (
                                                         <button
                                                             onClick={() => updateStatus(apt.id, 'cancelled')}
                                                             className="text-[10px] font-black px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition uppercase tracking-tighter"
                                                         >
                                                             Cancel
                                                         </button>
                                                     )}
                                                 </>
                                             )}

                                             {/* Doctor-side Actions */}
                                             {isDoctor && Number(user?.doctorId) === Number(apt.doctorId) && (
                                                 <>
                                                     {apt.status === 'confirmed' && (
                                                         <>
                                                             <button
                                                                 onClick={() => {
                                                                     setSelectedAppointment(apt);
                                                                     setShowCompleteModal(true);
                                                                 }}
                                                                 className="text-[10px] font-black px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 uppercase tracking-tighter"
                                                             >
                                                                 Complete
                                                             </button>
                                                             {apt.meetingLink && (
                                                                 <Link
                                                                     href={`/dashboard/meetings/${apt.meetingId}`}
                                                                     className="flex items-center gap-1.5 bg-blue-600 text-white text-[10px] font-black px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
                                                                 >
                                                                     <FiVideo />
                                                                 </Link>
                                                             )}
                                                             <button
                                                                 onClick={() => updateStatus(apt.id, 'missed')}
                                                                 className="text-[10px] font-black px-3 py-1.5 bg-rose-100 text-rose-600 rounded-lg hover:bg-rose-200 uppercase tracking-tighter"
                                                             >
                                                                 Missed
                                                             </button>
                                                         </>
                                                     )}
                                                 </>
                                             )}

                                             {/* Admin Actions */}
                                             {isAdmin && (
                                                 <>
                                                     {apt.invoice && apt.invoice.status !== 'paid' && apt.invoice.status !== 'PAID' && (
                                                         <button
                                                             onClick={async () => {
                                                                 if (!confirm('Confirm payment for this appointment?')) return;
                                                                 try {
                                                                     const res = await api.post(`/financial/invoices/${apt.invoice.id}/confirm-payment`, {
                                                                         paymentMethod: 'MANUAL',
                                                                         transactionId: `ADMIN-${Date.now()}`
                                                                     });
                                                                     if (res?.ok) {
                                                                         alert('Payment confirmed!');
                                                                         fetchData();
                                                                     }
                                                                 } catch (err) {
                                                                     console.error(err);
                                                                 }
                                                             }}
                                                             className="text-[10px] font-black px-2 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition uppercase tracking-tighter"
                                                         >
                                                             Mark Paid
                                                         </button>
                                                     )}
                                                     
                                                     <button
                                                         onClick={() => {
                                                             setSelectedAppointment(apt);
                                                             setShowModal(true);
                                                         }}
                                                         className="text-[10px] font-black px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition uppercase tracking-tighter"
                                                     >
                                                         Edit
                                                     </button>

                                                     <button
                                                         onClick={() => deleteAppointment(apt.id)}
                                                         className="text-[10px] font-black px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition uppercase tracking-tighter"
                                                     >
                                                         Delete
                                                     </button>

                                                     {['pending', 'confirmed'].includes(apt.status) && (
                                                         <button
                                                             onClick={() => updateStatus(apt.id, 'cancelled')}
                                                             className="text-[10px] font-black px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition uppercase tracking-tighter"
                                                         >
                                                             Cancel
                                                         </button>
                                                     )}
                                                 </>
                                             )}
                                         </div>
                                     </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <CreateAppointmentModal
                    initialData={selectedAppointment}
                    onClose={() => {
                        setShowModal(false);
                        setSelectedAppointment(null);
                    }}
                    onSuccess={() => {
                        setShowModal(false);
                        setSelectedAppointment(null);
                        fetchData();
                    }}
                />
            )}

            {/* New Patient Booking Modal */}
            {showBookModal && (
                <BookAppointmentModal
                    onClose={() => setShowBookModal(false)}
                    initialType={initialType}
                    onSuccess={() => {
                        setShowBookModal(false);
                        fetchData();
                    }}
                />
            )}

            {showDetailsModal && selectedAppointment && (
                <ViewAppointmentDetailsModal
                    appointment={selectedAppointment}
                    onClose={() => setShowDetailsModal(false)}
                />
            )}

            {showRateModal && selectedAppointment && (
                <RateDoctorModal
                    appointment={selectedAppointment}
                    onClose={() => setShowRateModal(false)}
                    onSuccess={() => {
                        setShowRateModal(false);
                    }}
                />
            )}

            {showCompleteModal && selectedAppointment && (
                <CompleteAppointmentModal
                    appointment={selectedAppointment}
                    onClose={() => {
                        setShowCompleteModal(false);
                        setSelectedAppointment(null);
                    }}
                    onSuccess={() => {
                        setShowCompleteModal(false);
                        setSelectedAppointment(null);
                        fetchData();
                    }}
                />
            )}
        </div>
    );
}
