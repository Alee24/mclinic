'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { FiAlertTriangle, FiTrash2, FiX, FiCheckCircle, FiClock, FiShield, FiUser } from 'react-icons/fi';
import Link from 'next/link';

export default function PublicDataDeletionPage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [deletionStatus, setDeletionStatus] = useState<any>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [password, setPassword] = useState('');
    const [reason, setReason] = useState('');
    const [step, setStep] = useState(1);

    useEffect(() => {
        if (user) {
            checkDeletionStatus();
        }
    }, [user]);

    const checkDeletionStatus = async () => {
        if (!user) return;

        try {
            const res = await api.get(`/users/${user.id}/deletion-status`);
            if (res?.ok) {
                const data = await res.json();
                setDeletionStatus(data);
            }
        } catch (error) {
            console.error('Error checking deletion status:', error);
        }
    };

    const handleRequestDeletion = async () => {
        if (!user) return;

        if (!password) {
            alert('Please enter your password to confirm');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post(`/users/${user.id}/deletion-request`, {
                password,
            });

            if (res?.ok) {
                const data = await res.json();
                alert(data.message);
                checkDeletionStatus();
                setShowConfirmModal(false);
                setPassword('');
                setReason('');
            } else if (res) {
                const error = await res.json();
                alert(error.message || 'Failed to request deletion');
            }
        } catch (error) {
            console.error('Error requesting deletion:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelDeletion = async () => {
        if (!user) return;

        if (!confirm('Are you sure you want to cancel the deletion request and restore your account?')) {
            return;
        }

        setLoading(true);
        try {
            const res = await api.delete(`/users/${user.id}/deletion-request`);

            if (res?.ok) {
                const data = await res.json();
                alert(data.message);
                checkDeletionStatus();
            } else {
                alert('Failed to cancel deletion');
            }
        } catch (error) {
            console.error('Error cancelling deletion:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">Data Deletion Request</h1>
                    <p className="text-gray-500 text-lg">We value your privacy and provide a simple way to delete your data.</p>
                </div>

                {!user ? (
                    <div className="bg-white dark:bg-[#121212] rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-800 text-center">
                        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FiUser className="text-4xl text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4">Login Required</h2>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                            To protect your data and verify your identity, you must be logged in to request account deletion.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link 
                                href="/login?redirect=/delete-my-data" 
                                className="px-8 py-4 bg-primary text-black font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition"
                            >
                                Login to Manage Data
                            </Link>
                            <Link 
                                href="/" 
                                className="px-8 py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 transition"
                            >
                                Back to Home
                            </Link>
                        </div>
                    </div>
                ) : (
                    <>
                        {deletionStatus?.hasPendingDeletion ? (
                            /* Pending Deletion State */
                            <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-3xl p-8 border-2 border-red-200 dark:border-red-800">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 rounded-2xl flex items-center justify-center shrink-0">
                                        <FiClock className="text-3xl text-red-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-red-900 dark:text-red-300 mb-2">
                                            Deletion Scheduled
                                        </h2>
                                        <p className="text-red-700 dark:text-red-400">
                                            Your account and data are scheduled for permanent deletion
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <div className="text-sm font-bold text-gray-500 uppercase mb-1">Requested On</div>
                                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                                                {new Date(deletionStatus.requestedAt).toLocaleDateString('en-GB', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-500 uppercase mb-1">Deletion Date</div>
                                            <div className="text-lg font-bold text-red-600">
                                                {new Date(deletionStatus.scheduledFor).toLocaleDateString('en-GB', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                                        <div className="flex items-center gap-2 text-yellow-900 dark:text-yellow-300 font-bold mb-2">
                                            <FiAlertTriangle />
                                            <span>{deletionStatus.daysRemaining} days remaining</span>
                                        </div>
                                        <p className="text-sm text-yellow-800 dark:text-yellow-400">
                                            You have {deletionStatus.daysRemaining} days to cancel this request. After that, your data will be permanently deleted and cannot be recovered.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCancelDeletion}
                                    disabled={loading}
                                    className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <FiCheckCircle />
                                    {loading ? 'Cancelling...' : 'Cancel Deletion & Restore Account'}
                                </button>
                            </div>
                        ) : (
                            /* Normal State - No Pending Deletion */
                            <>
                                {/* Warning Banner */}
                                <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl p-6 border-2 border-red-200 dark:border-red-800 shadow-sm">
                                    <div className="flex items-start gap-4">
                                        <FiAlertTriangle className="text-3xl text-red-600 shrink-0 mt-1" />
                                        <div>
                                            <h3 className="text-xl font-black text-red-900 dark:text-red-300 mb-2">
                                                Permanent Data Deletion
                                            </h3>
                                            <p className="text-red-700 dark:text-red-400 leading-relaxed">
                                                This action will permanently delete your account and all associated data. This includes your medical records,
                                                appointments, prescriptions, and payment history. <strong>This action cannot be undone.</strong>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* What Gets Deleted */}
                                <div className="bg-white dark:bg-[#121212] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">What will be deleted?</h2>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {[
                                            { icon: '👤', title: 'Personal Information', desc: 'Name, email, phone, address' },
                                            { icon: '🏥', title: 'Medical Records', desc: 'Consultations, diagnoses, prescriptions' },
                                            { icon: '📅', title: 'Appointments', desc: 'Past and upcoming appointments' },
                                            { icon: '💳', title: 'Payment History', desc: 'Transaction records and invoices' },
                                            { icon: '🔬', title: 'Lab Results', desc: 'All laboratory test results' },
                                            { icon: '💊', title: 'Pharmacy Orders', desc: 'Medication orders and history' },
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                                <span className="text-2xl">{item.icon}</span>
                                                <div>
                                                    <div className="font-bold text-gray-900 dark:text-white">{item.title}</div>
                                                    <div className="text-sm text-gray-500">{item.desc}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Grace Period Info */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-start gap-4">
                                        <FiShield className="text-3xl text-blue-600 shrink-0" />
                                        <div>
                                            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-2">
                                                7-Day Grace Period
                                            </h3>
                                            <p className="text-blue-700 dark:text-blue-400 text-sm leading-relaxed">
                                                After requesting deletion, your account will be deactivated immediately, but your data will be retained for 7 days.
                                                During this period, you can cancel the deletion request and restore your account. After 7 days, all data will be
                                                permanently deleted and cannot be recovered.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Delete Button */}
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => setShowConfirmModal(true)}
                                        className="px-12 py-5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition shadow-xl shadow-red-500/30 flex items-center gap-2 transform hover:-translate-y-1"
                                    >
                                        <FiTrash2 />
                                        Request Data Deletion
                                    </button>
                                </div>
                            </>
                        )}
                    </>
                )}

                {/* FAQ / Info Section */}
                <div className="bg-white dark:bg-[#121212] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white mb-2">How long does it take to delete my data?</h4>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Once requested, your account is deactivated immediately. We keep your data for a 7-day grace period to allow for accidental requests. After 7 days, the data is purged from our active databases.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white mb-2">Can I download my data before deleting?</h4>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Yes, we recommend downloading any important medical records or invoices from your dashboard before requesting deletion.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white mb-2">What if I have an active appointment?</h4>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Requesting deletion will cancel any upcoming appointments. If you have paid for a service that hasn't been rendered, please contact support before deleting your account.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-2xl max-w-2xl w-full border border-gray-200 dark:border-gray-800 animate-in slide-in-from-bottom-4">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Confirm Data Deletion</h2>
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition"
                            >
                                <FiX className="text-xl" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {step === 1 && (
                                <>
                                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border-2 border-red-200 dark:border-red-800">
                                        <p className="text-red-900 dark:text-red-300 font-bold mb-3">
                                            ⚠️ Please read carefully before proceeding:
                                        </p>
                                        <ul className="space-y-2 text-sm text-red-800 dark:text-red-400">
                                            <li>• Your account will be deactivated immediately</li>
                                            <li>• All your data will be permanently deleted after 7 days</li>
                                            <li>• You will lose access to all medical records and history</li>
                                            <li>• This action cannot be undone after the 7-day period</li>
                                            <li>• You can cancel this request within 7 days</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                            Why are you leaving? (Optional)
                                        </label>
                                        <textarea
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white outline-none focus:border-blue-500 resize-none"
                                            placeholder="Your feedback helps us improve..."
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setShowConfirmModal(false)}
                                            className="flex-1 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => setStep(2)}
                                            className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition"
                                        >
                                            Continue
                                        </button>
                                    </div>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
                                        <p className="text-yellow-900 dark:text-yellow-300 font-bold mb-2">
                                            🔐 Password Confirmation Required
                                        </p>
                                        <p className="text-sm text-yellow-800 dark:text-yellow-400">
                                            To prevent accidental deletion, please enter your password to confirm this action.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                            Enter Your Password
                                        </label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white outline-none focus:border-red-500"
                                            placeholder="Your account password"
                                            autoFocus
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setStep(1)}
                                            className="flex-1 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleRequestDeletion}
                                            disabled={loading || !password}
                                            className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? 'Processing...' : 'Confirm Deletion'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
