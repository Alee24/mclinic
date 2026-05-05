'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { FiUser, FiHeart, FiArrowRight, FiMessageSquare, FiEye, FiEyeOff, FiHome } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';
import Image from 'next/image';

type UserType = 'password' | 'otp';

export default function LoginPage() {
    const router = useRouter();
    const { user, login } = useAuth();
    const [loginMethod, setLoginMethod] = useState<UserType>('password');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    // Password State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // OTP State
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            router.push('/dashboard');
        }
    }, [user, router]);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mobile) return toast.error('Please enter your mobile number');
        setLoading(true);
        try {
            const res = await api.post('/auth/otp/send', { mobile });
            const data = res ? await res.json() : {};
            if (res && res.ok) {
                toast.success('Professional secure PIN sent to your registered mobile number.', {
                    icon: '🛡️',
                    duration: 5000,
                    style: {
                        borderRadius: '12px',
                        background: '#161616',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        border: '1px solid #22c55e'
                    }
                });
                setOtpSent(true);
            } else {
                toast.error(data.message || 'Verification failed. Please check your number.');
            }
        } catch (error) {
            toast.error('System synchronization failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/otp/login', { mobile, otp });
            if (res && res.ok) {
                const data = await res.json();
                toast.success(`Access Granted. Welcome, ${data.user.fname}!`, {
                    icon: '✅',
                    style: {
                        borderRadius: '12px',
                        background: '#161616',
                        color: '#fff',
                        fontWeight: 'bold',
                        border: '1px solid #22c55e'
                    }
                });
                login(data.user, data.access_token);
            } else {
                const errorData = res ? await res.json().catch(() => ({})) : {};
                toast.error(errorData?.message || 'Security PIN verification failed.');
            }
        } catch (error) {
            toast.error('System authentication error.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return toast.error('Credentials required.');
        setLoading(true);

        try {
            const res = await api.post('/auth/login', { email, password });

            if (res && res.ok) {
                const data = await res.json();
                toast.success(`Authenticated Successfully. Welcome back, ${data.user.fname}!`, {
                    icon: '🔓',
                    style: {
                        borderRadius: '12px',
                        background: '#161616',
                        color: '#fff',
                        fontWeight: 'bold',
                        border: '1px solid #22c55e'
                    }
                });
                login(data.user, data.access_token);
            } else {
                const errorData = res ? await res.json().catch(() => ({})) : {};
                toast.error(`Authentication Denied: ${errorData.message || 'Invalid Credentials'}`);
            }
        } catch (err) {
            toast.error('Secure connection failed. Verify your network.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-[#020202] dark:via-[#080808] dark:to-[#020202] p-4 font-inter relative">
            
            {/* Top Navigation / Back Button */}
            <div className="absolute top-8 left-8 right-8 flex justify-between items-center pointer-events-none">
                <Link href="/" className="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">
                    <FiHome size={14} /> Back to Home
                </Link>
            </div>

            <div className="max-w-5xl w-full bg-white dark:bg-[#0f0f0f] rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col md:flex-row min-h-[650px]">

                {/* Left Side - Branding */}
                <div className="md:w-5/12 bg-black p-12 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <Link href="/" className="flex items-center justify-center mb-16 group">
                            <div className="relative w-40 h-20 group-hover:scale-105 transition-transform duration-500">
                                <Image 
                                    src="https://mclinic.co.ke/wp-content/uploads/2025/04/M-Clinic-Logo.png" 
                                    alt="M-Clinic Logo" 
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        </Link>

                        <div className="space-y-6">
                            <h2 className="text-5xl font-black leading-tight tracking-tighter">
                                Secure<br />
                                <span className="text-green-500">Access</span> Portal
                            </h2>
                            <p className="text-gray-400 text-lg leading-relaxed max-w-xs">
                                Single unified gateway for patients, doctors, and medical staff.
                            </p>
                        </div>

                        <div className="mt-12 space-y-4">
                            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 group hover:bg-white/10 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-500">
                                    <FiUser size={20} />
                                </div>
                                <div>
                                    <div className="font-bold text-sm">Unified Identity</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Role Auto-Detection</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 group hover:bg-white/10 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500">
                                    <FiHeart size={20} />
                                </div>
                                <div>
                                    <div className="font-bold text-sm">Health Records</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Encrypted & Secure</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 pt-8 border-t border-white/5">
                        <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em]">
                            &copy; {new Date().getFullYear()} M-Clinic Global Health
                        </p>
                    </div>

                    {/* Aesthetic Gradients */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>
                </div>

                {/* Right Side - Unified Form */}
                <div className="flex-1 p-8 md:p-16 flex flex-col justify-center">
                    <div className="max-w-sm mx-auto w-full">
                        <div className="mb-10">
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Sign In</h2>
                            <p className="text-gray-500 text-sm mt-2 font-medium">Identity-based secure authentication</p>
                        </div>

                        {/* Login Method Toggle */}
                        <div className="inline-flex bg-gray-100 dark:bg-white/5 p-1 rounded-2xl mb-8">
                            <button
                                onClick={() => setLoginMethod('password')}
                                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${loginMethod === 'password'
                                    ? 'bg-white dark:bg-white/10 shadow-sm text-gray-900 dark:text-white'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                Password
                            </button>
                            <button
                                onClick={() => setLoginMethod('otp')}
                                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${loginMethod === 'otp'
                                    ? 'bg-white dark:bg-white/10 shadow-sm text-gray-900 dark:text-white'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                OTP PIN
                            </button>
                        </div>

                        <form onSubmit={loginMethod === 'password' ? handleLogin : (otpSent ? handleVerifyOtp : handleSendOtp)} className="space-y-6">
                            {loginMethod === 'password' ? (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                                            Registered Email
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 dark:text-white focus:border-green-500 dark:focus:border-green-500 outline-none transition-all placeholder:text-gray-400 text-sm font-medium"
                                            placeholder="name@example.com"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center ml-1">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                                Password
                                            </label>
                                            <Link href="/forgot-password" className="text-[10px] font-black text-green-600 hover:text-green-500 uppercase tracking-widest">
                                                Forgot?
                                            </Link>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type={showPass ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                className="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 dark:text-white focus:border-green-500 dark:focus:border-green-500 outline-none transition-all placeholder:text-gray-400 text-sm font-medium"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPass(!showPass)}
                                                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                                            Mobile Number
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            value={mobile}
                                            onChange={(e) => setMobile(e.target.value)}
                                            disabled={otpSent}
                                            className="w-full px-5 py-4 rounded-2xl border border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 dark:text-white focus:border-green-500 dark:focus:border-green-500 outline-none transition-all placeholder:text-gray-400 text-sm font-medium disabled:opacity-50"
                                            placeholder="0712 XXX XXX"
                                        />
                                    </div>

                                    {otpSent && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-4">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                                                Verification PIN
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                className="w-full px-5 py-6 rounded-2xl border-2 border-green-500 bg-green-500/5 dark:text-white outline-none transition-all text-center text-3xl tracking-[0.5em] font-black"
                                                placeholder="••••••"
                                                maxLength={6}
                                            />
                                            <div className="flex justify-between items-center px-1">
                                                <p className="text-[10px] font-bold text-green-600 uppercase">PIN Sent Successfully</p>
                                                <button type="button" onClick={() => setOtpSent(false)} className="text-[10px] font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest">Change Number</button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black text-xs uppercase tracking-[0.2em] hover:translate-y-[-2px] active:scale-[0.98] transition-all shadow-[0_10px_20px_rgba(0,0,0,0.1)] disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        {loginMethod === 'password' ? 'Verify Credentials' : (otpSent ? 'Confirm Access' : 'Request Secure PIN')}
                                        <FiArrowRight />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-white/5">
                            <div className="flex flex-col gap-4">
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">New to M-Clinic?</div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Link href="/register/patient" className="py-3 px-4 rounded-xl border border-gray-200 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        As Patient
                                    </Link>
                                    <Link href="/register/medic" className="py-3 px-4 rounded-xl border border-gray-200 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        As Medic
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 text-center">
                            <Link href="/support" className="text-[10px] font-black text-gray-400 hover:text-black dark:hover:text-white uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                                <FiMessageSquare size={14} /> System Support
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
