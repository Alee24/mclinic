'use client';

import React, { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { FiLock, FiSmartphone } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Link from 'next/link';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    const mobile = searchParams.get('mobile');
    const accountType = searchParams.get('accountType');
    const accountId = searchParams.get('accountId');

    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Load state from localStorage on mount
    useEffect(() => {
        const savedState = localStorage.getItem('reset-password-state');
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                setOtp(parsed.otp || '');
                setPassword(parsed.password || '');
                setConfirmPassword(parsed.confirmPassword || '');
            } catch (e) {
                console.error('Failed to parse saved state:', e);
            }
        }
    }, []);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        if (otp || password || confirmPassword) {
            localStorage.setItem('reset-password-state', JSON.stringify({
                otp,
                password,
                confirmPassword,
                token,
                mobile,
                accountType,
                accountId,
                timestamp: Date.now()
            }));
        }
    }, [otp, password, confirmPassword, token, mobile, accountType, accountId]);

    // Clear localStorage on successful password reset
    const clearSavedState = () => {
        localStorage.removeItem('reset-password-state');
    };

    if (!token && !mobile) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white p-8 rounded-lg shadow text-center">
                    <h2 className="text-xl font-bold text-red-600 mb-2">Invalid Link</h2>
                    <p className="text-gray-600 mb-4">This password reset link is invalid or missing information.</p>
                    <Link href="/forgot-password" className="text-blue-600 font-medium hover:underline">
                        Request a new link
                    </Link>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            let res;
            if (mobile) {
                // OTP Flow - include account selection if provided
                const body: any = { mobile, otp, newPass: password };
                if (accountType && accountId) {
                    body.accountType = accountType;
                    body.accountId = parseInt(accountId);
                }
                res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://portal.mclinic.co.ke/api'}/auth/otp/reset-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
            } else {
                // Token Flow
                res = await api.post('/auth/reset-password', { token, password });
            }

            if (res && (res.ok || (res.status === 201 || res.status === 200))) {
                clearSavedState();
                toast.success('Password reset successfully!');
                setTimeout(() => router.push('/login'), 2000);
            } else {
                const data = res ? await res.json().catch(() => ({})) : {};
                toast.error(data.message || 'Failed to reset password. Code/Link may have expired.');
            }
        } catch (e) {
            toast.error('Something went wrong.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center gap-3 mb-8 group">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#C2003F] to-[#FF4D6D] rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform text-2xl font-black">
                        M
                    </div>
                    <span className="text-3xl font-black bg-gradient-to-r from-[#1D2B36] to-[#C2003F] bg-clip-text text-transparent">
                        M-Clinic
                    </span>
                </Link>

                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-3">
                        Reset Password
                    </h2>
                    {mobile && (
                        <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                            <FiSmartphone className="text-blue-600" />
                            Code sent to <span className="font-bold text-gray-900 dark:text-white">{mobile}</span>
                        </p>
                    )}
                    {!mobile && (
                        <p className="text-gray-600 dark:text-gray-400">
                            Enter your new password below
                        </p>
                    )}
                </div>
            </div>

            {/* Form Card */}
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-gray-800 py-10 px-6 shadow-2xl rounded-3xl border border-gray-100 dark:border-gray-700">
                    <form className="space-y-6" onSubmit={handleSubmit}>

                        {mobile && (
                            <div>
                                <label htmlFor="otp" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    One-Time Password (OTP)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FiSmartphone className="text-blue-600" />
                                    </div>
                                    <input
                                        id="otp"
                                        name="otp"
                                        type="text"
                                        required
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="appearance-none block w-full pl-12 pr-4 py-4 border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-xl placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-lg tracking-widest font-mono text-center text-gray-900 dark:text-white transition"
                                        placeholder="123456"
                                        maxLength={6}
                                    />
                                </div>
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    Enter the 6-digit code sent to your phone
                                </p>
                            </div>
                        )}

                        <div>
                            <label htmlFor="pass" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <FiLock className="text-gray-400" />
                                </div>
                                <input
                                    id="pass"
                                    name="pass"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 dark:text-white transition"
                                    placeholder="••••••••"
                                />
                            </div>
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                At least 6 characters
                            </p>
                        </div>

                        <div>
                            <label htmlFor="confirmPass" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <FiLock className="text-gray-400" />
                                </div>
                                <input
                                    id="confirmPass"
                                    name="confirmPass"
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="appearance-none block w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-xl placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 dark:text-white transition"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-gradient-to-r from-[#1D2B36] to-[#2a3f4f] hover:from-[#C2003F] hover:to-[#FF4D6D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Resetting Password...
                                    </>
                                ) : (
                                    <>
                                        <FiLock />
                                        Reset Password
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="text-center pt-4">
                            <Link
                                href="/login"
                                className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition"
                            >
                                ← Back to Login
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Security Note */}
                <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <p className="text-xs text-center text-gray-600 dark:text-gray-400">
                        🔒 Your password is encrypted and secure
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
