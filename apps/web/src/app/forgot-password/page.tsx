'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiMail, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [input, setInput] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [isSms, setIsSms] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const isPhone = !input.includes('@') && input.replace(/\D/g, '').length >= 9;
            setIsSms(isPhone);

            const res = await api.post('/auth/forgot-password', { input, email: input });

            if (res && res.ok) {
                setSubmitted(true);
                toast.success(isPhone ? 'Reset link sent to your phone via SMS.' : 'Reset link sent to your email.');
            } else {
                const data = await res?.json().catch(() => ({}));
                toast.error(data?.message || 'Failed to process request.');
            }
        } catch (error) {
            toast.error('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-[#050505] dark:via-[#0a0a0a] dark:to-[#050505] p-4">
            <div className="max-w-md w-full bg-white dark:bg-[#121212] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-8 md:p-10">
                <div className="flex justify-center mb-8">
                    <Link href="/">
                        <img 
                            src="/logo.png" 
                            alt="M-Clinic Logo" 
                            className="h-16 w-auto object-contain"
                        />
                    </Link>
                </div>
                <div className="mb-8">
                    <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-green-600 transition-colors mb-6">
                        <FiArrowLeft /> Back to Login
                    </Link>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Forgot Password?</h2>
                    <p className="text-gray-500 text-sm">Enter your email or phone number and we'll send you a link to reset your password.</p>
                </div>

                {!submitted ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                Email or Phone Number
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <FiMail size={20} />
                                </span>
                                <input
                                    type="text"
                                    required
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black dark:text-white focus:border-green-500 dark:focus:border-green-500 outline-none transition"
                                    placeholder="Enter email or phone number"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold transition shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? 'Processing...' : 'Send Reset Link'}
                        </button>
                    </form>
                ) : (
                    <div className="text-center py-6 animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                            <FiCheckCircle />
                        </div>
                        <h3 className="text-xl font-bold dark:text-white mb-2">{isSms ? 'Check Your Phone' : 'Check Your Email'}</h3>
                        <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                            We've sent a password reset link to <span className="font-bold text-gray-900 dark:text-gray-200">{input}</span>. 
                        </p>
                        {isSms ? (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 p-4 rounded-xl mb-8">
                                <p className="text-green-800 dark:text-green-400 text-xs font-bold uppercase tracking-tight">
                                    SMS SENT
                                </p>
                                <p className="text-green-700 dark:text-green-500 text-sm mt-1">
                                    Please check your text messages / SMS inbox on your phone for the reset link.
                                </p>
                            </div>
                        ) : (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 p-4 rounded-xl mb-8">
                                <p className="text-amber-800 dark:text-amber-400 text-xs font-bold uppercase tracking-tight">
                                    IMPORTANT NOTE
                                </p>
                                <p className="text-amber-700 dark:text-amber-500 text-sm mt-1">
                                    Please check your <span className="font-black underline">SPAM/JUNK</span> folder if you don't see it in your inbox.
                                </p>
                            </div>
                        )}
                        <button 
                            onClick={() => setSubmitted(false)}
                            className="text-sm font-bold text-green-600 hover:underline"
                        >
                            Didn't receive it? Try again
                        </button>
                    </div>
                )}

                <div className="mt-10 pt-6 border-t dark:border-gray-800 text-center">
                    <p className="text-sm text-gray-400">
                        Remembered your password? <Link href="/login" className="text-green-600 font-bold hover:underline">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
