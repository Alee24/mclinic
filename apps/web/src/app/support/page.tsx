'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    FiArrowLeft, FiSend, FiMessageSquare, FiUser,
    FiMail, FiPhone, FiCheckCircle, FiShield, FiClock, FiHeadphones
} from 'react-icons/fi';
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
                toast.success('Support request submitted! We\'ll be in touch shortly.', {
                    icon: '✅',
                    duration: 5000,
                    style: {
                        borderRadius: '12px',
                        background: '#087c46',
                        color: '#fff',
                        fontWeight: 'bold',
                    }
                });
                setSubmitted(true);
            } else {
                const data = res ? await res.json().catch(() => ({})) : {};
                toast.error(data.message || 'Failed to submit. Please try again.', {
                    style: { borderRadius: '12px' }
                });
            }
        } catch (error) {
            toast.error('Connection error. Please check your network and retry.', {
                style: { borderRadius: '12px' }
            });
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-[#030a06] dark:via-[#050505] dark:to-[#030a06] p-4">
                <div className="max-w-lg w-full animate-in fade-in zoom-in-95 duration-500">
                    <div className="bg-white dark:bg-[#0f1a14] rounded-3xl shadow-2xl border border-green-100 dark:border-green-900/30 p-10 text-center">
                        {/* Success Icon */}
                        <div className="relative mx-auto mb-8 w-24 h-24">
                            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
                            <div className="relative w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                                <FiCheckCircle className="text-white" size={40} />
                            </div>
                        </div>

                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Request Received!</h2>
                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
                            Thank you for reaching out. Our support team has received your message and will respond within <strong className="text-green-600">24 hours</strong> via SMS or email.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-xs text-green-600 dark:text-green-400 font-bold uppercase tracking-widest mb-8">
                            <FiClock size={12} />
                            Average Response Time: Under 2 Hours
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link
                                href="/login"
                                className="flex-1 inline-flex items-center justify-center gap-2 bg-[#087c46] hover:bg-[#066535] text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-green-700/20 hover:shadow-green-700/30 hover:-translate-y-0.5 active:scale-[0.98]"
                            >
                                <FiArrowLeft size={16} /> Back to Login
                            </Link>
                            <button
                                onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', mobile: '', message: '' }); }}
                                className="flex-1 inline-flex items-center justify-center gap-2 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 px-6 py-4 rounded-2xl font-bold transition-all hover:bg-gray-50 dark:hover:bg-white/5 hover:-translate-y-0.5 active:scale-[0.98]"
                            >
                                Send Another
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-[#030a06] dark:via-[#050505] dark:to-[#030a06] p-4 font-sans">
            <div className="max-w-4xl w-full bg-white dark:bg-[#0b0f0d] rounded-[2.5rem] shadow-[0_25px_60px_rgba(8,124,70,0.12)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col lg:flex-row animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* ── Left Panel ── */}
                <div className="lg:w-[42%] bg-gradient-to-b from-[#087c46] to-[#065a33] p-10 text-white flex flex-col justify-between relative overflow-hidden">
                    {/* Decorative blobs */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />

                    <div className="relative z-10">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 mb-10 text-green-200 hover:text-white transition font-semibold text-sm group"
                        >
                            <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition">
                                <FiArrowLeft size={14} />
                            </span>
                            Back to Login
                        </Link>

                        {/* Headline */}
                        <div className="mb-8">
                            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest mb-4">
                                <FiHeadphones size={10} /> Support Center
                            </div>
                            <h1 className="text-4xl font-black leading-tight mb-4">
                                Need<br />
                                <span className="text-green-200">Help?</span>
                            </h1>
                            <p className="text-green-100/80 leading-relaxed text-[15px]">
                                Having trouble logging in or need assistance? Our dedicated support team is here to help you — quickly and professionally.
                            </p>
                        </div>

                        {/* Feature badges */}
                        <div className="space-y-3">
                            {[
                                { icon: FiClock, label: 'Quick Response', sub: 'Avg. under 2 hours' },
                                { icon: FiShield, label: 'Secure & Private', sub: 'Your data is protected' },
                                { icon: FiMessageSquare, label: 'SMS & Email Support', sub: 'Multiple contact channels' },
                            ].map(({ icon: Icon, label, sub }) => (
                                <div key={label} className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10 hover:bg-white/15 transition group">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition">
                                        <Icon size={18} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">{label}</div>
                                        <div className="text-[11px] text-green-200/70 font-medium">{sub}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10 pt-6 mt-6 border-t border-white/10">
                        <p className="text-[10px] text-green-200/50 font-black uppercase tracking-[0.2em]">
                            © {new Date().getFullYear()} M-Clinic Global Health
                        </p>
                    </div>
                </div>

                {/* ── Right Panel — Form ── */}
                <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
                    {/* Header */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Get Support</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1.5">
                            Fill in the form below and we'll get back to you as soon as possible.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                                Full Name <span className="text-red-400">*</span>
                            </label>
                            <div className="relative group">
                                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" size={16} />
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-11 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-green-500 dark:text-white text-gray-900 transition-all outline-none placeholder:text-gray-400 text-sm font-medium"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Email + Mobile Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                                    Email <span className="text-gray-400 text-[8px] normal-case font-medium">(optional)</span>
                                </label>
                                <div className="relative group">
                                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" size={16} />
                                    <input
                                        type="email"
                                        className="w-full pl-11 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-green-500 dark:text-white text-gray-900 transition-all outline-none placeholder:text-gray-400 text-sm font-medium"
                                        placeholder="your@email.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                                    Mobile Number <span className="text-red-400">*</span>
                                </label>
                                <div className="relative group">
                                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" size={16} />
                                    <input
                                        type="tel"
                                        required
                                        className="w-full pl-11 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-green-500 dark:text-white text-gray-900 transition-all outline-none placeholder:text-gray-400 text-sm font-medium"
                                        placeholder="07XXXXXXXX"
                                        value={formData.mobile}
                                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Issue Description */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                                How Can We Help? <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                required
                                rows={5}
                                className="w-full px-4 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-green-500 dark:text-white text-gray-900 transition-all outline-none resize-none placeholder:text-gray-400 text-sm font-medium"
                                placeholder="Describe your issue in detail — the more you share, the faster we can help..."
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-[#087c46] hover:bg-[#066535] text-white rounded-2xl font-black text-sm uppercase tracking-[0.15em] flex items-center justify-center gap-3 transition-all shadow-lg shadow-green-700/20 hover:shadow-green-700/30 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    Submit Request <FiSend size={16} />
                                </>
                            )}
                        </button>

                        {/* Privacy Note */}
                        <p className="text-center text-[11px] text-gray-400 dark:text-gray-600">
                            🔒 Your information is encrypted and used solely to resolve your support request.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
