'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiLock, FiCheckCircle, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [showPass, setShowPass] = useState(false);

    useEffect(() => {
        if (!token) {
            toast.error('Invalid or missing reset token.');
            // router.push('/login');
        }
    }, [token, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }

        if (password.length < 8) {
            toast.error('Password must be at least 8 characters long.');
            return;
        }

        setLoading(true);

        try {
            const res = await api.post('/auth/reset-password', { token, password });

            if (res && res.ok) {
                setSubmitted(true);
                toast.success('Password reset successfully!');
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } else {
                const data = await res?.json();
                toast.error(data?.message || 'Failed to reset password.');
            }
        } catch (error) {
            toast.error('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#050505] p-4">
                <div className="max-w-md w-full bg-white dark:bg-[#121212] rounded-3xl shadow-xl p-10 text-center border border-gray-100 dark:border-gray-800">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                        <FiAlertCircle />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Invalid Request</h2>
                    <p className="text-gray-500 mb-8">The password reset link is invalid or has expired.</p>
                    <Link href="/forgot-password" title="Request new link" className="inline-block w-full py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-500/20">
                        Request New Link
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-[#050505] dark:via-[#0a0a0a] dark:to-[#050505] p-4">
            <div className="max-w-md w-full bg-white dark:bg-[#121212] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-8 md:p-10">
                {!submitted ? (
                    <>
                        <div className="mb-8">
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Set New Password</h2>
                            <p className="text-gray-500 text-sm">Please enter a new, secure password for your account.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                    New Password
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        <FiLock size={20} />
                                    </span>
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black dark:text-white focus:border-green-500 dark:focus:border-green-500 outline-none transition"
                                        placeholder="Min. 8 characters"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(!showPass)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPass ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        <FiLock size={20} />
                                    </span>
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black dark:text-white focus:border-green-500 dark:focus:border-green-500 outline-none transition"
                                        placeholder="Repeat new password"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold transition shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Updating Password...' : 'Reset Password'}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-6 animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                            <FiCheckCircle />
                        </div>
                        <h3 className="text-xl font-bold dark:text-white mb-2">Success!</h3>
                        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                            Your password has been reset successfully. Redirecting you to login...
                        </p>
                        <Link href="/login" className="inline-block w-full py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 transition">
                            Sign In Now
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
