'use client';

import { useEffect, useState } from 'react';
import { useAuth, UserRole } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { FiPlus, FiAlertCircle, FiCheckCircle, FiShield, FiEdit2, FiActivity } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import CreateDoctorModal from '@/components/dashboard/doctors/CreateDoctorModal';
import EditDoctorModal from '@/components/dashboard/doctors/EditDoctorModal';

export default function DoctorsPage() {
    const { user } = useAuth();
    const router = useRouter();
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
        if (user && user.role === UserRole.ADMIN) {
            fetchDoctors();
        } else {
            setLoading(false);
        }
    }, [user]);

    if (user?.role !== UserRole.ADMIN) {
        if (loading) return null; // Avoid flashing access denied while checking auth
        return <div className="p-8 text-center text-gray-500">Access Denied. Admin Only.</div>;
    }

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

    const [verifyingId, setVerifyingId] = useState<number | null>(null);

    const handleNckVerify = async (id: number) => {
        setVerifyingId(id);
        const tid = toast.loading('Syncing with NCK Portal...');
        try {
            const res = await api.post(`/doctors/${id}/verify-nck`, {});
            if (res && res.ok) {
                const data = await res.json();
                if (data.success) {
                    toast.success(`Success! Found ${data.nck.name}. Status: ${data.nck.status}`, { id: tid });
                    fetchDoctors();
                } else {
                    toast.error(`Verification Failed: ${data.message}`, { id: tid });
                }
            } else {
                toast.error('Could not connect to NCK portal.', { id: tid });
            }
        } catch (err) {
            console.error(err);
            toast.error('Sync error occurred.', { id: tid });
        } finally {
            setVerifyingId(null);
        }
    };

    const handleActivateAll = async () => {
        if (!confirm('This will activate and verify ALL currently inactive medics. Continue?')) return;
        try {
            const res = await api.post('/doctors/admin/activate-all', {});
            if (res && res.ok) {
                const data = await res.json();
                alert(`Success! Activated ${data.count} medics.`);
                fetchDoctors();
            } else {
                alert('Failed to activate medics.');
            }
        } catch (e) {
            console.error(e);
            alert('Error activating medics.');
        }
    };

    const handleClearDatabase = async () => {
        const confirm1 = confirm("DANGER: This will delete ALL medics from the database permanently. Are you sure?");
        if (!confirm1) return;

        const confirm2 = prompt("To confirm, type 'DELETE ALL MEDICS' in the box below:");
        if (confirm2 !== "DELETE ALL MEDICS") {
            alert("Confirmation failed. Deletion cancelled.");
            return;
        }

        try {
            const res = await api.delete('/doctors/admin/clear-all');
            if (res && res.ok) {
                alert("Database cleared successfully.");
                fetchDoctors();
            } else {
                alert("Failed to clear database.");
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
            const res = await api.post('/doctors/admin/upload-csv', formData);
            if (res && res.ok) {
                const data = await res.json();
                alert(`Upload Complete. Created: ${data.count}. Errors: ${data.errors.length}`);
                if (data.errors.length > 0) {
                    console.log("Errors:", data.errors);
                    alert("Check console for error details.");
                }
                fetchDoctors();
            } else {
                // Try to get error message
                const errData = res ? await res.json().catch(() => ({})) : {};
                alert(`Upload failed: ${errData.message || (res ? res.statusText : 'Connection Error')}`);
            }
        } catch (err: any) {
            console.error(err);
            alert(`Upload error: ${err.message}`);
        }
        // Reset input
        e.target.value = '';
    };

    const downloadTemplate = () => {
        const csvContent = "fname,lname,email,mobile,speciality,licenceNo,dr_type\nJohn,Doe,john@example.com,0712345678,General Practice,MED12345,Medic";
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'medics_template.csv';
        a.click();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white flex items-center gap-3">
                        <span className="text-primary"><FiShield size={24} /></span> Medic Management
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage professional degrees, licenses and active status.</p>
                </div>
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
                        onClick={handleActivateAll}
                        className="flex items-center gap-2 bg-green-100 text-green-700 hover:bg-green-200 border border-green-200 font-bold px-4 py-2 rounded-lg transition"
                    >
                        <FiCheckCircle /> Activate All
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-primary text-black font-bold px-4 py-2 rounded-lg hover:opacity-90 transition"
                    >
                        <FiPlus /> Add Medic
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">Medic</th>
                            <th className="px-6 py-4">Contact Info</th>
                            <th className="px-6 py-4">Professional</th>
                            <th className="px-6 py-4">Financial</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {doctors.map((doc) => {
                            const isVerified = doc.Verified_status === 1 || doc.verified_status === true;
                            return (
                                <tr
                                    key={doc.id}
                                    onClick={() => router.push(`/dashboard/doctors/${doc.id}`)}
                                    className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition cursor-pointer ${!doc.status ? 'opacity-70 grayscale-[0.5]' : ''}`}
                                >
                                    <td className="px-6 py-4 dark:text-gray-300">
                                        <div className="font-bold text-gray-900 dark:text-white">{doc.fname} {doc.lname}</div>
                                        <div className="text-xs text-gray-500">ID: {doc.id}</div>
                                        <div className="text-xs text-gray-400 mt-1">{doc.sex} • {doc.dob ? new Date(doc.dob).toLocaleDateString() : 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-xs">
                                        <div className="text-gray-900 dark:text-white font-medium">{doc.email}</div>
                                        <div className="text-gray-500">{doc.mobile}</div>
                                        <div className="text-gray-400 truncate max-w-[150px]" title={doc.address}>{doc.address}</div>
                                    </td>
                                    <td className="px-6 py-4 dark:text-gray-400">
                                        <div className="text-xs text-brand-500 font-medium bg-brand-50 dark:bg-brand-900/10 inline-block px-1.5 py-0.5 rounded mb-1">{doc.dr_type}</div>
                                        <div className="text-xs text-gray-500 font-bold">{doc.speciality || doc.qualification}</div>
                                        <div className="text-[10px] text-gray-400 mt-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <span>Lic: {doc.licenceNo || 'N/A'}</span>
                                                {doc.licenceNo && doc.licenceNo !== 'N/A' && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleNckVerify(doc.id); }}
                                                        disabled={verifyingId === doc.id}
                                                        className="text-[9px] bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded flex items-center gap-1 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition font-black uppercase"
                                                    >
                                                        <FiActivity size={10} />
                                                        {verifyingId === doc.id ? 'Syncing...' : 'Verify NCK'}
                                                    </button>
                                                )}
                                            </div>
                                            <div>Reg: {doc.reg_code || 'N/A'}</div>
                                            <div>NID: {doc.national_id || 'N/A'}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                        <div className="font-medium">Fee: KES {doc.fee}</div>
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
                                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setEditingDoctorId(doc.id); }}
                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                                                title="Edit Profile"
                                            >
                                                <FiEdit2 size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleNckVerify(doc.id); }}
                                                disabled={verifyingId === doc.id}
                                                className={`p-2 ${verifyingId === doc.id ? 'animate-pulse text-gray-400' : 'text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20'} rounded-lg transition`}
                                                title="Sync with NCK Portal"
                                            >
                                                <FiActivity size={18} />
                                            </button>
                                            {!isVerified && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleVerify(doc.id); }}
                                                    className="text-[10px] bg-primary text-black font-bold px-2 py-1 rounded hover:opacity-90 transition shadow-sm"
                                                    title="Approve & Verify"
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
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No medics found. Add one to get started.</td></tr>
                        )}
                        {loading && (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading medics compliance data...</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {
                showModal && (
                    <CreateDoctorModal
                        onClose={() => setShowModal(false)}
                        onSuccess={() => {
                            setShowModal(false);
                            fetchDoctors();
                        }}
                    />
                )
            }

            {
                editingDoctorId && (
                    <EditDoctorModal
                        doctorId={editingDoctorId}
                        onClose={() => setEditingDoctorId(null)}
                        onSuccess={() => {
                            setEditingDoctorId(null);
                            fetchDoctors();
                        }}
                    />
                )
            }
        </div >
    );
}

