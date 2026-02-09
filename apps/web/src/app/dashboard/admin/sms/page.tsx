'use client';

import { useState } from 'react';
import { FiSend, FiUsers, FiUser, FiActivity, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import SecureLoader from '@/components/SecureLoader';

export default function AdminSmsPage() {
    const [recipientType, setRecipientType] = useState<'medic' | 'patient' | 'all'>('medic');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<{ total: number; sent: number; failed: number } | null>(null);

    const handleSend = async () => {
        if (!message.trim()) {
            toast.error('Please enter a message');
            return;
        }

        setLoading(true);
        setStats(null);

        try {
            const res = await api.post('/sms/bulk', {
                recipientType,
                message
            });

            if (res && res.ok) {
                const data = await res.json();
                if (data.success) {
                    toast.success('Messages processed successfully');
                    setStats(data.stats);
                    setMessage(''); // Clear message on success
                } else {
                    toast.error(data.message || 'Failed to send messages');
                }
            } else {
                const errorData = res ? await res.json() : {};
                toast.error(errorData.message || 'Failed to send messages');
            }
        } catch (error: any) {
            console.error('SMS Send Error:', error);
            toast.error('An error occurred while sending messages');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Broadcast SMS</h1>
                <p className="text-gray-500 dark:text-gray-400">Send bulk SMS messages to users or medics.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Recipient Selection */}
                <div className="col-span-1 space-y-4">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300">Select Recipients</h3>

                    <div
                        onClick={() => setRecipientType('medic')}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${recipientType === 'medic'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${recipientType === 'medic' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                <FiActivity className="text-xl" />
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 dark:text-white">Medics Only</div>
                                <div className="text-xs text-gray-500">Doctors, Nurses, Clinicians</div>
                            </div>
                        </div>
                    </div>

                    <div
                        onClick={() => setRecipientType('patient')}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${recipientType === 'patient'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${recipientType === 'patient' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                <FiUser className="text-xl" />
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 dark:text-white">Patients Only</div>
                                <div className="text-xs text-gray-500">All registered patients</div>
                            </div>
                        </div>
                    </div>

                    <div
                        onClick={() => setRecipientType('all')}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${recipientType === 'all'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${recipientType === 'all' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                <FiUsers className="text-xl" />
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 dark:text-white">Everyone</div>
                                <div className="text-xs text-gray-500">Entire user database</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Message Composition */}
                <div className="md:col-span-2 space-y-4">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300">Compose Message</h3>
                    <div className="bg-white dark:bg-[#161616] border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message here..."
                            rows={6}
                            className="w-full bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 resize-none"
                            maxLength={160 * 3} // Reasonable limit
                        />
                        <div className="flex justify-between items-center mt-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                            <div className="text-xs text-gray-500">
                                {message.length} characters • {Math.ceil(message.length / 160)} SMS segment(s)
                            </div>
                            <button
                                onClick={handleSend}
                                disabled={loading || !message.trim()}
                                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                            >
                                {loading ? <SecureLoader size="sm" color="white" /> : <><FiSend /> Send Broadcast</>}
                            </button>
                        </div>
                    </div>

                    {/* Stats / Results */}
                    {stats && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 animate-fade-in">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full text-green-600 dark:text-green-400">
                                    <FiCheckCircle className="text-xl" />
                                </div>
                                <h4 className="font-bold text-green-900 dark:text-green-100">Broadcast Completed</h4>
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="p-3 bg-white dark:bg-black/20 rounded-lg">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Targeted</div>
                                    <div className="text-xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
                                </div>
                                <div className="p-3 bg-white dark:bg-black/20 rounded-lg">
                                    <div className="text-sm text-green-600 dark:text-green-400">Sent</div>
                                    <div className="text-xl font-bold text-green-600 dark:text-green-400">{stats.sent}</div>
                                </div>
                                <div className="p-3 bg-white dark:bg-black/20 rounded-lg">
                                    <div className="text-sm text-red-500">Failed</div>
                                    <div className="text-xl font-bold text-red-500">{stats.failed}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
