'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth, UserRole } from '@/lib/auth';
import { FiVideo } from 'react-icons/fi';
import Link from 'next/link';
import CreateAppointmentModal from '@/components/dashboard/appointments/CreateAppointmentModal';

export default function AppointmentsPage() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const fetchData = async (isPolling = false) => {
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

    useEffect(() => {
        if (user) {
            fetchData();
            const interval = setInterval(() => fetchData(true), 5000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const isAdmin = user?.role === UserRole.ADMIN;
    const isPatient = user?.role === UserRole.PATIENT;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold dark:text-white">Appointments</h1>
                {isAdmin && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-primary text-black font-bold px-4 py-2 rounded-lg hover:opacity-90 transition"
                    >
                        + New Booking
                    </button>
                )}
            </div>

            <div className="bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-500 font-medium">
                        <tr>
                            {!isPatient && <th className="px-6 py-4">Patient</th>}
                            <th className="px-6 py-4">Medic/Nurse</th>
                            <th className="px-6 py-4">Service</th>
                            <th className="px-6 py-4">Date & Time</th>
                            <th className="px-6 py-4">Status</th>
                            {!isPatient && <th className="px-6 py-4">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {loading ? (
                            <tr><td colSpan={isPatient ? 4 : 6} className="px-6 py-4 text-center">Loading...</td></tr>
                        ) : appointments.length === 0 ? (
                            <tr><td colSpan={isPatient ? 4 : 6} className="px-6 py-4 text-center text-gray-500">No appointments found</td></tr>
                        ) : (
                            appointments.map((apt) => (
                                <tr key={apt.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    {!isPatient && (
                                        <td className="px-6 py-4 font-medium dark:text-white">
                                            {apt.patient ? (
                                                apt.patient.fname ? `${apt.patient.fname} ${apt.patient.lname}` :
                                                    apt.patient.user ? (apt.patient.user.fname ? `${apt.patient.user.fname} ${apt.patient.user.lname}` : apt.patient.user.email) :
                                                        'Unknown'
                                            ) : 'Unknown'}
                                        </td>
                                    )}
                                    <td className="px-6 py-4 text-gray-500">
                                        {apt.doctor ? `${apt.doctor.fname} ${apt.doctor.lname}` : 'Unassigned'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        <div className="text-sm font-medium">{apt.notes || 'General Consultation'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {apt.appointment_date ? (
                                            <div>
                                                <div>{new Date(apt.appointment_date).toLocaleDateString()}</div>
                                                <div className="text-xs">{apt.appointment_time}</div>
                                            </div>
                                        ) : 'Pending Date'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                            apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            {apt.status}
                                        </span>
                                    </td>
                                    {!isPatient && (
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2 items-center">
                                                {apt.meetingLink && apt.meetingId ? (
                                                    <Link
                                                        href={`/dashboard/meetings/${apt.meetingId}`}
                                                        className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded hover:bg-blue-700 transition"
                                                    >
                                                        <FiVideo /> Join Call
                                                    </Link>
                                                ) : (
                                                    <span className="text-xs text-gray-400">In-Person</span>
                                                )}
                                            </div>
                                        </td>
                                    )}
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
        </div>
    );
}
