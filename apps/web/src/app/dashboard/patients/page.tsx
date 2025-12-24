'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import CreatePatientModal from '@/components/dashboard/patients/CreatePatientModal';
import { FiPlus } from 'react-icons/fi';

export default function PatientsPage() {
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const fetchPatients = async () => {
        try {
            const res = await api.get('/patients');
            if (res && res.ok) {
                setPatients(await res.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold dark:text-white">Patients Directory</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-primary text-black font-bold px-4 py-2 rounded-lg hover:opacity-90 transition"
                >
                    <FiPlus />
                    New Patient
                </button>
            </div>

            <div className="bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Age/DOB</th>
                            <th className="px-6 py-4">Gender</th>
                            <th className="px-6 py-4">Phone</th>
                            <th className="px-6 py-4">Location</th>
                            <th className="px-6 py-4">Medical</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-4 text-center">Loading...</td></tr>
                        ) : patients.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">No patients found</td></tr>
                        ) : (
                            patients.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 group cursor-pointer">
                                    <td className="px-6 py-4 font-medium dark:text-white">
                                        <Link href={`/dashboard/patients/${p.id}`} className="block w-full h-full">
                                            <div>{p.fname} {p.lname}</div>
                                            <div className="text-xs text-gray-500">ID: {p.id}</div>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        <Link href={`/dashboard/patients/${p.id}`} className="block w-full h-full">
                                            <div>{p.dob ? new Date(p.dob).toLocaleDateString() : 'N/A'}</div>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 capitalize">
                                        <Link href={`/dashboard/patients/${p.id}`} className="block w-full h-full">
                                            {p.sex}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        <Link href={`/dashboard/patients/${p.id}`} className="block w-full h-full">
                                            {p.mobile}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                        <Link href={`/dashboard/patients/${p.id}`} className="block w-full h-full">
                                            {p.address}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                        <Link href={`/dashboard/patients/${p.id}`} className="block w-full h-full">
                                            <span className="text-xs text-gray-400">View History</span>
                                        </Link>
                                    </td>
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
        </div>
    );
}
