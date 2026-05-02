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

    const fetchData = async (isPolling = false) => {
        // ... (existing)
        if (!isPolling) setLoading(true);
        try {
            const aptRes = await api.get('/appointments');
            if (aptRes?.ok) {
                let data = await aptRes.json();
                setAppointments(data);
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

            <div className="bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <table className="w-full text-left">
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
                                        {apt.doctor ? `${apt.doctor.fname} ${apt.doctor.lname}` : 'Unassigned'}
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
                                        <div className="flex gap-2 items-center flex-wrap">
                                            {/* Patient-side Actions (Available if you are the patient in this apt) */}
                                            {user?.id === Number(apt.patientId) && (
                                                <>
                                                    {apt.status === 'completed' && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedAppointment(apt);
                                                                setShowRateModal(true);
                                                            }}
                                                            className="text-xs font-bold px-3 py-1.5 rounded bg-yellow-400 text-black hover:bg-yellow-500 transition"
                                                        >
                                                            Rate Medic
                                                        </button>
                                                    )}
                                                    {apt.meetingLink && apt.meetingId && apt.status === 'confirmed' && (
                                                        <Link
                                                            href={`/dashboard/meetings/${apt.meetingId}`}
                                                            className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded hover:bg-blue-700 transition"
                                                        >
                                                            <FiVideo /> Join
                                                        </Link>
                                                    )}
                                                </>
                                            )}

                                            {/* Doctor-side Actions (Available if you are the doctor assigned to this apt) */}
                                            {isDoctor && Number(user?.doctorId) === Number(apt.doctorId) && (
                                                <>
                                                    {apt.status === 'confirmed' && (
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={() => updateStatus(apt.id, 'completed')}
                                                                className="text-xs font-bold px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                                                title="Mark Completed & Release Funds"
                                                            >
                                                                Complete
                                                            </button>
                                                            {apt.meetingLink && (
                                                                <Link
                                                                    href={`/dashboard/meetings/${apt.meetingId}`}
                                                                    className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded hover:bg-blue-700 transition"
                                                                >
                                                                    <FiVideo />
                                                                </Link>
                                                            )}
                                                        </div>
                                                    )}
                                                    {apt.status === 'confirmed' && (
                                                        <button
                                                            onClick={() => updateStatus(apt.id, 'missed')}
                                                            className="text-xs font-bold px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                                        >
                                                            Missed
                                                        </button>
                                                    )}
                                                </>
                                            )}

                                            {/* General Details button for everyone */}
                                            <button
                                                onClick={() => {
                                                    setSelectedAppointment(apt);
                                                    setShowDetailsModal(true);
                                                }}
                                                className="text-xs font-bold px-3 py-1.5 rounded border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition"
                                            >
                                                Details
                                            </button>

                                            {/* Admin Actions */}
                                            {isAdmin && (
                                                <>
                                                    {apt.invoice && apt.invoice.status !== 'paid' && apt.invoice.status !== 'PAID' && (
                                                        <button
                                                            onClick={async () => {
                                                                if (!confirm('Confirm payment for this appointment? This will:\n- Mark invoice as PAID\n- Confirm the appointment\n- Credit the doctor\'s wallet (60%)')) return;
                                                                try {
                                                                    const res = await api.post(`/financial/invoices/${apt.invoice.id}/confirm-payment`, {
                                                                        paymentMethod: 'MANUAL',
                                                                        transactionId: `ADMIN-${Date.now()}`
                                                                    });
                                                                    if (res?.ok) {
                                                                        alert('Payment confirmed successfully! Wallet has been credited.');
                                                                        fetchData();
                                                                    } else {
                                                                        alert('Failed to confirm payment. Please try again.');
                                                                    }
                                                                } catch (err) {
                                                                    console.error(err);
                                                                    alert('Error confirming payment.');
                                                                }
                                                            }}
                                                            className="text-xs font-bold px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-700 transition"
                                                        >
                                                            ✓ Confirm Payment
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            setSelectedAppointment(apt);
                                                            setShowDetailsModal(true);
                                                        }}
                                                        className="text-xs font-bold px-3 py-1.5 rounded border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition"
                                                    >
                                                        View Details
                                                    </button>
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
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
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
        </div>
    );
}
