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

    const handleClearDatabase = async () => {
        const confirm1 = confirm("DANGER: This will delete ALL patients from the database permanently. Are you sure?");
        if (!confirm1) return;

        const confirm2 = prompt("To confirm, type 'DELETE ALL PATIENTS' in the box below:");
        if (confirm2 !== "DELETE ALL PATIENTS") {
            alert("Confirmation failed. Deletion cancelled.");
            return;
        }

        try {
            const res = await api.delete('/patients/admin/clear-all');
            if (res && res.ok) {
                alert("Database cleared successfully.");
                fetchPatients();
            } else {
                alert("Failed to clear patient data.");
            }
        } catch (e) {
            console.error(e);
            alert("Error clearing database.");
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        const file = e.target.files[0];

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/patients/admin/upload-csv', formData);
            if (res && res.ok) {
                const data = await res.json();
                alert(`Upload Complete. Created: ${data.count}. Errors: ${data.errors.length}`);
                if (data.errors.length > 0) console.log("Errors:", data.errors);
                fetchPatients();
            } else {
                alert("Upload failed.");
            }
        } catch (err) {
            console.error(err);
            alert("Upload error.");
        }
        e.target.value = '';
    };

    const downloadTemplate = () => {
        const csvContent = "fname,lname,email,mobile,dob,sex,blood_group,address\nJane,Doe,jane@example.com,0712345678,1990-01-01,Female,O+,Nairobi";
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'patients_template.csv';
        a.click();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold dark:text-white">Patients Directory</h1>
                {isAdmin && (
                    <div className="flex flex-wrap gap-3">
                        <button onClick={downloadTemplate} className="text-sm text-blue-600 hover:underline px-2">Download CSV Template</button>
                        <label className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 font-bold px-4 py-2 rounded-lg transition cursor-pointer hover:bg-gray-200">
                            <FiEdit2 /> Upload CSV
                            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                        </label>
                        <button
                            onClick={handleClearDatabase}
                            className="flex items-center gap-2 bg-red-100 text-red-700 hover:bg-red-200 border border-red-200 font-bold px-4 py-2 rounded-lg transition"
                        >
                            Clear All
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 bg-primary text-black font-bold px-4 py-2 rounded-lg hover:opacity-90 transition"
                        >
                            <FiPlus />
                            New Patient
                        </button>
                    </div>
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
