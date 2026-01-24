'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { CheckCircle, XCircle, Clock, User, Mail, Phone, FileText, Calendar } from 'lucide-react';

interface PendingDoctor {
    id: number;
    fname: string;
    lname: string;
    email: string;
    mobile: string;
    reg_code: string;
    dr_type: string;
    speciality: string;
    qualification: string;
    licenceNo: string;
    licenceExpiry: string;
    created_at: string;
    approvalStatus: string;
}

export default function PendingDoctorsPage() {
    const [pendingDoctors, setPendingDoctors] = useState<PendingDoctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoctor, setSelectedDoctor] = useState<PendingDoctor | null>(null);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchPendingDoctors();
    }, []);

    const fetchPendingDoctors = async () => {
        try {
            const res = await api.get('/doctors/admin/pending');
            if (res && res.ok) {
                const data = await res.json();
                setPendingDoctors(data);
            }
        } catch (error) {
            console.error('Failed to fetch pending doctors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (doctorId: number) => {
        setProcessing(true);
        try {
            const res = await api.post(`/doctors/${doctorId}/approve`, {});
            if (res && res.ok) {
                alert('Medic approved successfully! Approval email sent.');
                fetchPendingDoctors();
                setShowApproveModal(false);
                setSelectedDoctor(null);
            } else {
                alert('Failed to approve medic');
            }
        } catch (error) {
            console.error('Error approving doctor:', error);
            alert('Error approving doctor');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async (doctorId: number) => {
        if (!rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }

        setProcessing(true);
        try {
            const res = await api.post(`/doctors/${doctorId}/reject`, {
                reason: rejectionReason,
            });
            if (res && res.ok) {
                alert('Medic rejected. Rejection email sent.');
                fetchPendingDoctors();
                setShowRejectModal(false);
                setSelectedDoctor(null);
                setRejectionReason('');
            } else {
                alert('Failed to reject medic');
            }
        } catch (error) {
            console.error('Error rejecting doctor:', error);
            alert('Error rejecting doctor');
        } finally {
            setProcessing(false);
        }
    };

    const handleResetAllPasswords = async () => {
        const confirmed = confirm(
            'Are you sure you want to reset ALL doctor passwords to the default password "Mclinic@2025"?\n\nThis will affect all registered doctors in the system.'
        );

        if (!confirmed) return;

        setProcessing(true);
        try {
            const res = await api.post('/doctors/admin/reset-all-passwords', {});
            if (res && res.ok) {
                const data = await res.json();
                alert(`Success! ${data.message}\n\nAll doctors can now login with: Mclinic@2025`);
            } else {
                alert('Failed to reset passwords');
            }
        } catch (error) {
            console.error('Error resetting passwords:', error);
            alert('Error resetting passwords');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold dark:text-white">Pending Medic Approvals</h1>
                    <p className="text-gray-500 mt-1">Review and approve medic applications</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleResetAllPasswords}
                        disabled={processing}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        title="Reset all doctor passwords to default"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        Reset All Passwords
                    </button>
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 px-4 py-2 rounded-lg">
                        <span className="text-yellow-800 dark:text-yellow-200 font-bold">
                            {pendingDoctors.length} Pending
                        </span>
                    </div>
                </div>
            </div>

            {pendingDoctors.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold dark:text-white mb-2">All Caught Up!</h3>
                    <p className="text-gray-500">No pending medic approvals at the moment.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {pendingDoctors.map((doctor) => (
                        <div
                            key={doctor.id}
                            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-start gap-4">
                                    <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full">
                                        <User className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold dark:text-white">
                                            Dr. {doctor.fname} {doctor.lname}
                                        </h3>
                                        <p className="text-gray-500 text-sm">{doctor.dr_type} • {doctor.speciality}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-full">
                                    <Clock className="h-4 w-4 text-yellow-600" />
                                    <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Pending</span>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <Mail className="h-4 w-4" />
                                    <span className="text-sm">{doctor.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <Phone className="h-4 w-4" />
                                    <span className="text-sm">{doctor.mobile || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <FileText className="h-4 w-4" />
                                    <span className="text-sm">Reg: {doctor.reg_code}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <FileText className="h-4 w-4" />
                                    <span className="text-sm">License: {doctor.licenceNo || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <Calendar className="h-4 w-4" />
                                    <span className="text-sm">Applied: {new Date(doctor.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <Calendar className="h-4 w-4" />
                                    <span className="text-sm">License Expiry: {doctor.licenceExpiry ? new Date(doctor.licenceExpiry).toLocaleDateString() : 'N/A'}</span>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg mb-4">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    <strong>Qualification:</strong> {doctor.qualification || 'Not provided'}
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setSelectedDoctor(doctor);
                                        setShowApproveModal(true);
                                    }}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="h-5 w-5" />
                                    Approve
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedDoctor(doctor);
                                        setShowRejectModal(true);
                                    }}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
                                >
                                    <XCircle className="h-5 w-5" />
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Approve Modal */}
            {showApproveModal && selectedDoctor && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold dark:text-white mb-4">Approve Medic</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Are you sure you want to approve Dr. {selectedDoctor.fname} {selectedDoctor.lname}?
                            An approval email will be sent automatically.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleApprove(selectedDoctor.id)}
                                disabled={processing}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                            >
                                {processing ? 'Processing...' : 'Confirm Approval'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowApproveModal(false);
                                    setSelectedDoctor(null);
                                }}
                                disabled={processing}
                                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && selectedDoctor && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold dark:text-white mb-4">Reject Medic</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Rejecting Dr. {selectedDoctor.fname} {selectedDoctor.lname}. Please provide a reason:
                        </p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Enter rejection reason..."
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white mb-4 min-h-[100px]"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleReject(selectedDoctor.id)}
                                disabled={processing || !rejectionReason.trim()}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                            >
                                {processing ? 'Processing...' : 'Confirm Rejection'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setSelectedDoctor(null);
                                    setRejectionReason('');
                                }}
                                disabled={processing}
                                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
