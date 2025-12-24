'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { FiPlus, FiAlertCircle, FiCheckCircle, FiShield, FiEdit2 } from 'react-icons/fi';
import CreateDoctorModal from '@/components/dashboard/doctors/CreateDoctorModal';
import EditDoctorModal from '@/components/dashboard/doctors/EditDoctorModal';

export default function DoctorsPage() {
    const [doctors, setDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingDoctorId, setEditingDoctorId] = useState<number | null>(null);

    const fetchDoctors = async () => {
        try {
            const res = await api.get('/doctors/admin/all');
            if (res && res.ok) {
                const data = await res.json();
                setDoctors(data);
            }
        } catch (error) {
            console.error('Failed to fetch doctors', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    const handleVerify = async (id: number) => {
        if (!confirm('Verify and Activate this doctor?')) return;
        const res = await api.patch(`/doctors/${id}/verify`, { status: true });
        if (res && res.ok) fetchDoctors();
    };

    const handleReject = async (id: number) => {
        if (!confirm('Reject/Deactivate this doctor?')) return;
        const res = await api.patch(`/doctors/${id}/verify`, { status: false });
        if (res && res.ok) fetchDoctors();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white flex items-center gap-3">
                        <span className="text-primary"><FiShield size={24} /></span> Doctor Management
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage professional degrees, licenses and active status.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-primary text-black font-bold px-4 py-2 rounded-lg hover:opacity-90 transition"
                >
                    <FiPlus /> Add Doctor
                </button>
            </div>

            <div className="bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">Doctor</th>
                            <th className="px-6 py-4">Specialty</th>
                            <th className="px-6 py-4">Fee / Balance</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {doctors.map((doc) => {
                            const isVerified = doc.Verified_status === 1 || doc.verified_status === true;
                            return (
                                <tr key={doc.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition ${!doc.status ? 'opacity-70 grayscale-[0.5]' : ''}`}>
                                    <td className="px-6 py-4 dark:text-gray-300">
                                        <div className="font-bold text-gray-900 dark:text-white">{doc.fname} {doc.lname}</div>
                                        <div className="text-xs text-gray-500">ID: {doc.id}</div>
                                    </td>
                                    <td className="px-6 py-4 dark:text-gray-400">
                                        <div className="text-xs text-brand-500 font-medium bg-brand-50 dark:bg-brand-900/10 inline-block px-1.5 py-0.5 rounded">{doc.dr_type}</div>
                                        <div className="text-xs text-gray-500 mt-1 truncate max-w-[150px]">{doc.speciality || doc.qualification}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                        <div>Fee: KES {doc.fee}</div>
                                        <div className="text-xs text-gray-400">Bal: KES {doc.balance}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 items-start">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${isVerified ? 'bg-green-100 text-green-700 border-green-200' :
                                                'bg-yellow-100 text-yellow-700 border-yellow-200'
                                                }`}>
                                                {isVerified ? 'VERIFIED' : 'PENDING'}
                                            </span>
                                            {doc.status == 0 && <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest border border-red-500 px-1 rounded">Inactive</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setEditingDoctorId(doc.id)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                                title="Edit Profile"
                                            >
                                                <FiEdit2 size={16} />
                                            </button>
                                            {!isVerified && (
                                                <button
                                                    onClick={() => handleVerify(doc.id)}
                                                    className="text-[10px] bg-primary text-black font-bold px-2 py-1 rounded hover:opacity-90 transition shadow-sm"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                        {doctors.length === 0 && !loading && (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No doctors found. Add one to get started.</td></tr>
                        )}
                        {loading && (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading doctors compliance data...</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <CreateDoctorModal
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        fetchDoctors();
                    }}
                />
            )}

            {editingDoctorId && (
                <EditDoctorModal
                    doctorId={editingDoctorId}
                    onClose={() => setEditingDoctorId(null)}
                    onSuccess={() => {
                        setEditingDoctorId(null);
                        fetchDoctors();
                    }}
                />
            )}
        </div>
    );
}

