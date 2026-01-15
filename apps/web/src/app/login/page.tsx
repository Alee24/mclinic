'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { FiUser, FiHeart, FiArrowRight } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

type UserType = 'patient' | 'provider';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [userType, setUserType] = useState<UserType>('patient');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const email = formData.get('email');
        const password = formData.get('password');

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://portal.mclinic.co.ke/api';
            const apiUrl = `${API_URL}/auth/login`;
            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, userType }),
            });

            if (res && res.ok) {
                const data = await res.json();

                // Validate user type matches selection
                const userRole = data.user.role.toLowerCase();
                const isProvider = ['doctor', 'nurse', 'clinician', 'medic', 'lab_tech', 'admin', 'pharmacist'].includes(userRole);

                if (userType === 'provider' && !isProvider) {
                    toast.error('This account is registered as a Patient. Please switch to Patient login.');
                    setLoading(false);
                    return;
                }

                if (userType === 'patient' && isProvider && userRole !== 'admin') {
                    toast.error('This account is registered as a Healthcare Provider. Please switch to Provider login.');
                    setLoading(false);
                    return;
                }

                // Success toast? usually redirect is enough, but 'Login Successful' is nice.
                toast.success(`Welcome back, ${data.user.fname || 'User'}!`);
                login(data.user, data.access_token);
            } else {
                const errorData = await res.json().catch(() => ({}));
                const errorMessage = errorData.message || res.statusText || 'Login failed';
                toast.error(`Login Failed: ${errorMessage}`);
            }
        } catch (err) {
            toast.error('Connection error. Please check your internet connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-[#050505] dark:via-[#0a0a0a] dark:to-[#050505] p-4">
            <div className="max-w-5xl w-full bg-white dark:bg-[#121212] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col md:flex-row">

                {/* Left Side - Branding */}
                <div className="md:w-5/12 bg-gradient-to-br from-green-600 to-green-700 dark:from-green-900/40 dark:to-green-900/20 p-12 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <Link href="/" className="flex items-center gap-2 mb-12 group">
                            <div className="w-12 h-12 bg-white text-green-600 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg group-hover:scale-110 transition-transform">
                                M
                            </div>
                            <span className="font-bold text-2xl">M-Clinic</span>
                        </Link>

                        <h2 className="text-4xl font-black mb-4">Welcome Back</h2>
                        <p className="opacity-90 leading-relaxed text-green-50 mb-8">
                            Sign in to access your {userType === 'patient' ? 'health records and book appointments' : 'provider dashboard and manage patients'}.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 opacity-90 bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                                <span className="bg-white/20 p-3 rounded-lg">🔒</span>
                                <div>
                                    <div className="font-bold">Secure Access</div>
                                    <div className="text-xs text-green-100">Your data is encrypted</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 opacity-90 bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                                <span className="bg-white/20 p-3 rounded-lg">⚡</span>
                                <div>
                                    <div className="font-bold">Instant Access</div>
                                    <div className="text-xs text-green-100">Get started in seconds</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
                </div>

                {/* Right Side - Login Form */}
                <div className="flex-1 p-8 md:p-12">
                    <div className="mb-8">
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Sign In</h2>
                        <p className="text-gray-500 text-sm">Choose your account type to continue</p>
                    </div>

                    {/* User Type Toggle */}
                    <div className="mb-8">
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setUserType('patient')}
                                className={`relative p-6 rounded-2xl border-2 transition-all ${userType === 'patient'
                                    ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-800'
                                    }`}
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 transition-colors ${userType === 'patient'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                        }`}>
                                        <FiUser className="text-2xl" />
                                    </div>
                                    <div className={`font-bold transition-colors ${userType === 'patient'
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-gray-700 dark:text-gray-300'
                                        }`}>
                                        Patient
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">Book appointments</div>
                                </div>
                                {userType === 'patient' && (
                                    <div className="absolute top-3 right-3 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setUserType('provider')}
                                className={`relative p-6 rounded-2xl border-2 transition-all ${userType === 'provider'
                                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-800'
                                    }`}
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 transition-colors ${userType === 'provider'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                        }`}>
                                        <FiHeart className="text-2xl" />
                                    </div>
                                    <div className={`font-bold transition-colors ${userType === 'provider'
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : 'text-gray-700 dark:text-gray-300'
                                        }`}>
                                        Provider
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">Doctors & Medics</div>
                                </div>
                                {userType === 'provider' && (
                                    <div className="absolute top-3 right-3 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white focus:border-green-500 dark:focus:border-green-500 outline-none transition"
                                placeholder={userType === 'patient' ? 'patient@example.com' : 'doctor@mclinic.com'}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                required
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white focus:border-green-500 dark:focus:border-green-500 outline-none transition"
                                placeholder="Enter your password"
                            />
                        </div>

                        <div className="flex justify-between items-center">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
                            </label>
                            <Link href="/forgot-password" className="text-sm text-green-600 hover:text-green-700 font-bold hover:underline">
                                Forgot Password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-bold text-white transition shadow-lg flex items-center justify-center gap-2 group ${userType === 'patient'
                                ? 'bg-green-600 hover:bg-green-700 shadow-green-500/30'
                                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {loading ? (
                                'Signing in...'
                            ) : (
                                <>
                                    Sign In as {userType === 'patient' ? 'Patient' : 'Provider'}
                                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Register Link */}
                    <div className="mt-8 text-center text-sm text-gray-500 pt-6 border-t dark:border-gray-800">
                        Don't have an account?{' '}
                        <Link
                            href={userType === 'patient' ? '/register/patient' : '/register/doctor'}
                            className={`font-bold hover:underline ${userType === 'patient' ? 'text-green-600' : 'text-blue-600'
                                }`}
                        >
                            Register as {userType === 'patient' ? 'Patient' : 'Provider'}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
