'use client';

import { useEffect, useState } from 'react';
import { useAuth, UserRole } from '@/lib/auth';
import Link from 'next/link';
import { api } from '@/lib/api';
import CreatePatientModal from '@/components/dashboard/patients/CreatePatientModal';
import { FiPlus, FiEdit2 } from 'react-icons/fi';
import EditPatientModal from '@/components/dashboard/patients/EditPatientModal';

export default function PatientsPage() {
    const { user } = useAuth();
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPatientId, setEditingPatientId] = useState<number | null>(null);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            if (user?.role === UserRole.ADMIN) {
                const res = await api.get('/patients');
                if (res && res.ok) {
                    setPatients(await res.json());
                }
            } else if (user?.role === UserRole.DOCTOR) {
                // Fetch appointments to find connected patients
                const res = await api.get('/appointments');
                if (res && res.ok) {
                    const appts = await res.json();
                    const myAppts = appts.filter((a: any) => a.doctor?.user?.email === user.email);
                    const myPatients = myAppts.map((a: any) => a.patient).filter((p: any, i: number, self: any[]) =>
                        p && self.findIndex((sp: any) => sp.id === p.id) === i
                    );
                    setPatients(myPatients);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchPatients();
        }
    }, [user]);

    const isAdmin = user?.role === UserRole.ADMIN;

    if (user?.role === UserRole.PATIENT) {
        return <div className="p-8 text-center text-gray-500">Access Denied</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold dark:text-white">Patients Directory</h1>
                {isAdmin && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-primary text-black font-bold px-4 py-2 rounded-lg hover:opacity-90 transition"
                    >
                        <FiPlus />
                        New Patient
                    </button>
                )}
            </div>

            <div className="bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden text-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Age/DOB</th>
                            <th className="px-6 py-4">Gender</th>
                            <th className="px-6 py-4">Blood Group</th>
                            <th className="px-6 py-4">Phone</th>
                            <th className="px-6 py-4">Location</th>
                            {isAdmin && <th className="px-6 py-4 text-center">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {loading ? (
                            <tr><td colSpan={isAdmin ? 6 : 5} className="px-6 py-4 text-center">Loading...</td></tr>
                        ) : patients.length === 0 ? (
                            <tr><td colSpan={isAdmin ? 6 : 5} className="px-6 py-4 text-center text-gray-500">No patients found</td></tr>
                        ) : (
                            patients.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 group">
                                    <td className="px-6 py-4 font-medium dark:text-white">
                                        <div className="flex flex-col">
                                            <Link href={`/dashboard/patients/${p.id}`} className="hover:underline">
                                                {p.fname} {p.lname}
                                            </Link>
                                            <span className="text-xs text-gray-500">ID: {p.id}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {p.dob ? new Date(p.dob).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 capitalize">
                                        {p.sex}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 font-bold">
                                        {p.blood_group || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {p.mobile}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 truncate max-w-[200px]">
                                        {p.address}
                                    </td>
                                    {isAdmin && (
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => setEditingPatientId(p.id)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                                title="Edit Patient"
                                            >
                                                <FiEdit2 size={16} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <CreatePatientModal
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        fetchPatients();
                    }}
                />
            )}

            {editingPatientId && (
                <EditPatientModal
                    patientId={editingPatientId}
                    onClose={() => setEditingPatientId(null)}
                    onSuccess={() => {
                        setEditingPatientId(null);
                        fetchPatients();
                    }}
                />
            )}
        </div>
    );
}
