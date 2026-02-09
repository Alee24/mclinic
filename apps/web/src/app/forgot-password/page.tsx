'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';
import { FiMail, FiArrowLeft, FiSmartphone, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [method, setMethod] = useState<'email' | 'mobile'>('email');
    const [identifier, setIdentifier] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (method === 'email') {
            try {
                await api.post('/auth/forgot-password', { email: identifier });
                setSent(true);
                toast.success('Reset link sent if email exists.');
            } catch (e) {
                toast.error('Something went wrong.');
            } finally {
                setLoading(false);
            }
        } else {
            // Mobile OTP Flow
            try {
                const res = await api.post('/auth/otp/reset-password-request', { mobile: identifier });
                if (res) {
                    const data = res.data;

                    // Show masked email info to user
                    if (data.accounts && data.accounts.length > 0) {
                        const emailList = data.accounts.map((acc: any) => `${acc.email} (${acc.type})`).join(', ');
                        toast.success(`OTP sent to ${emailList}`);
                    } else if (data.email) {
                        toast.success(`OTP sent to ${data.email}`);
                    } else {
                        toast.success('OTP sent successfully.');
                    }

                    router.push(`/reset-password?mobile=${encodeURIComponent(identifier)}`);
                }
            } catch (e: any) {
                const msg = e.response?.data?.message || e.message || 'Failed to send OTP.';
                toast.error(msg);
            } finally {
                setLoading(false);
            }
        }
    }

    if (sent && method === 'email') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-[#050505] dark:via-[#0a0a0a] dark:to-[#050505] p-4">
                <div className="max-w-md w-full bg-white dark:bg-[#121212] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-8 text-center">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiCheckCircle className="text-4xl" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Check your email</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                        We have sent a password reset link to<br />
                        <strong className="text-gray-900 dark:text-white">{identifier}</strong>
                    </p>
                    <Link
                        href="/login"
                        className="w-full py-4 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-green-500/30 shadow-lg transition flex items-center justify-center gap-2"
                    >
                        Return to Login
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-[#050505] dark:via-[#0a0a0a] dark:to-[#050505] p-4">
            <div className="max-w-lg w-full bg-white dark:bg-[#121212] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-8 md:p-12">

                {/* Header */}
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
                        <div className="w-10 h-10 bg-green-600 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                            M
                        </div>
                        <span className="font-bold text-xl text-gray-900 dark:text-white">M-Clinic</span>
                    </Link>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                        Reset Password
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        Enter your details to receive a reset code
                    </p>
                </div>

                {/* Toggle */}
                <div className="flex justify-center mb-8">
                    <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex w-full">
                        <button
                            type="button"
                            onClick={() => { setMethod('email'); setIdentifier(''); }}
                            className={`flex-1 py-3 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${method === 'email'
                                ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            <FiMail className="text-lg" /> Via Email
                        </button>
                        <button
                            type="button"
                            onClick={() => { setMethod('mobile'); setIdentifier(''); }}
                            className={`flex-1 py-3 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${method === 'mobile'
                                ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            <FiSmartphone className="text-lg" /> Via SMS
                        </button>
                    </div>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                            {method === 'email' ? 'Email Address' : 'Mobile Number'}
                        </label>
                        <input
                            id="identifier"
                            name="identifier"
                            type={method === 'email' ? 'email' : 'tel'}
                            required
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white focus:border-green-500 dark:focus:border-green-500 outline-none transition"
                            placeholder={method === 'email' ? 'you@example.com' : '0712345678'}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-green-500/30 shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {loading ? 'Processing...' : (method === 'email' ? 'Send Reset Link' : 'Send One-Time PIN')}
                        {!loading && <FiArrowRight className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 font-bold text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition"
                    >
                        <FiArrowLeft /> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
