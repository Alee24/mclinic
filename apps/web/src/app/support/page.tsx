'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiSend, FiMessageSquare, FiUser, FiMail, FiPhone } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';

export default function SupportPage() {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/support', formData);
            if (res && res.ok) {
                toast.success('Support request submitted successfully!');
                setSubmitted(true);
            } else {
                toast.error('Failed to submit request. Please try again.');
            }
        } catch (error) {
            toast.error('Connection error.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#050505] p-4 font-sans">
                <div className="max-w-md w-full bg-white dark:bg-[#121212] p-8 rounded-3xl shadow-xl text-center border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                        <FiSend />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Request Sent!</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Thank you for reaching out. Our support team will review your request and get back to you shortly via SMS or email.
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-600/30"
                    >
                        <FiArrowLeft /> Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-[#050505] dark:via-[#0a0a0a] dark:to-[#050505] p-4 font-sans">
            <div className="max-w-2xl w-full bg-white dark:bg-[#121212] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col md:flex-row animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Visual Side */}
                <div className="md:w-5/12 bg-green-600 p-10 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <Link href="/login" className="inline-flex items-center gap-2 mb-12 opacity-80 hover:opacity-100 transition font-bold text-sm">
                            <FiArrowLeft /> Back
                        </Link>
                        <h1 className="text-4xl font-black mb-6">Need <span className="text-green-100">Help?</span></h1>
                        <p className="opacity-90 leading-relaxed text-green-50 mb-8">
                            If you're having trouble logging in or have any other challenges, send us a message and we'll help you out.
                        </p>
                    </div>

                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                            <FiMessageSquare className="text-xl" />
                            <div className="text-sm font-medium">Quick Response</div>
                        </div>
                    </div>

                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
                </div>

                {/* Form Side */}
                <div className="flex-1 p-8 md:p-12">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        Get Support
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Full Name</label>
                            <div className="relative">
                                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-black border-2 border-transparent focus:border-green-500 dark:text-white transition outline-none"
                                    placeholder="Enter your name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Email (Optional)</label>
                                <div className="relative">
                                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-black border-2 border-transparent focus:border-green-500 dark:text-white transition outline-none"
                                        placeholder="your@email.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Mobile Number</label>
                                <div className="relative">
                                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="tel"
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-black border-2 border-transparent focus:border-green-500 dark:text-white transition outline-none"
                                        placeholder="07XXXXXXXX"
                                        value={formData.mobile}
                                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">How can we help?</label>
                            <textarea
                                required
                                rows={4}
                                className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-black border-2 border-transparent focus:border-green-500 dark:text-white transition outline-none resize-none"
                                placeholder="Describe your issue in detail..."
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition shadow-xl shadow-green-600/20 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Submit Request'} <FiSend />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
