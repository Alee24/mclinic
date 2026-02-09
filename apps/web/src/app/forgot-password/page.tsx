'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';
import { FiMail, FiArrowLeft, FiSmartphone, FiArrowRight, FiCheckCircle, FiUser, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Account {
    id: number;
    email: string;
    type: string;
    accountType: string;
}

type StepString = 'method' | 'input' | 'selection' | 'success';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<StepString>('method');
    const [method, setMethod] = useState<'email' | 'mobile'>('email');
    const [identifier, setIdentifier] = useState('');
    const [loading, setLoading] = useState(false);

    // Account selection state
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

    const handleMethodSelect = (selectedMethod: 'email' | 'mobile') => {
        setMethod(selectedMethod);
        setIdentifier('');
        setStep('input');
    };

    const handleCheckAccounts = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (method === 'mobile') {
            try {
                // Ensure mobile format is cleaner if needed, but backend should handle standard inputs
                const res = await api.post('/auth/check-accounts', { mobile: identifier });
                if (res && res.ok) {
                    const data = await res.json();
                    if (data.accounts && data.accounts.length > 0) {
                        setAccounts(data.accounts);
                        if (data.accounts.length === 1) {
                            // Only one account, auto-select and proceed
                            await sendOtpToAccount(data.accounts[0]);
                        } else {
                            // Multiple accounts, show selection screen
                            setStep('selection');
                        }
                    } else {
                        toast.error('No accounts found linked to this number.');
                    }
                } else {
                    const errorData = res ? await res.json() : {};
                    toast.error(errorData.message || 'No accounts found.');
                }
            } catch (e: any) {
                toast.error('Connection failed. Please check your internet.');
            } finally {
                setLoading(false);
            }
        } else {
            // Email flow
            try {
                const res = await api.post('/auth/forgot-password', { email: identifier });
                if (res && res.ok) {
                    setStep('success'); // Show success screen
                    toast.success('Reset link sent if email exists.');
                } else {
                    // Start generic error or success to prevent enumeration? 
                    // For now, let's just say "If account exists..."
                    setStep('success');
                    toast.success('Reset link sent if email exists.');
                }
            } catch (e) {
                toast.error('Something went wrong.');
            } finally {
                setLoading(false);
            }
        }
    };

    const sendOtpToAccount = async (account: Account) => {
        setLoading(true);
        try {
            const res = await api.post('/auth/otp/reset-password-request', {
                mobile: identifier,
                accountType: account.accountType,
                accountId: account.id
            });

            if (res && res.ok) {
                toast.success(`OTP sent successfully to ${identifier}`);
                // Redirect to reset password page with query params
                router.push(`/reset-password?mobile=${encodeURIComponent(identifier)}&accountType=${account.accountType}&accountId=${account.id}`);
            } else {
                const errorData = res ? await res.json() : {};
                toast.error(errorData.message || 'Failed to send OTP.');
            }
        } catch (e: any) {
            toast.error('Connection failed.');
        } finally {
            setLoading(false);
        }
    };

    // --- RENDER STEPS ---

    // 1. Success Screen (Email only)
    if (step === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-[#050505] dark:via-[#0a0a0a] dark:to-[#050505] p-4">
                <div className="max-w-md w-full bg-white dark:bg-[#121212] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-8 text-center animate-in fade-in zoom-in-95 duration-300">
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
        );
    }

    // 2. Account Selection Screen (Mobile only)
    if (step === 'selection') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-[#050505] dark:via-[#0a0a0a] dark:to-[#050505] p-4">
                <div className="max-w-lg w-full bg-white dark:bg-[#121212] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-8 md:p-12 animate-in fade-in slide-in-from-right-8 duration-300">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Select Account</h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            We found multiple accounts for <strong className="text-gray-900 dark:text-white">{identifier}</strong>.
                            Select one to proceed.
                        </p>
                    </div>

                    <div className="space-y-4 mb-8">
                        {accounts.map((account) => (
                            <button
                                key={`${account.accountType}-${account.id}`}
                                onClick={() => setSelectedAccount(account)}
                                className={`w-full p-6 rounded-2xl border-2 transition-all text-left group ${selectedAccount?.id === account.id && selectedAccount?.accountType === account.accountType
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg'
                                        : 'border-gray-100 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 bg-white dark:bg-gray-800'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${account.type === 'patient'
                                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                                            : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
                                        }`}>
                                        <FiUser />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white capitalize">
                                            {account.type} Account
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {account.email}
                                        </p>
                                    </div>
                                    {selectedAccount?.id === account.id && selectedAccount?.accountType === account.accountType && (
                                        <FiCheckCircle className="text-2xl text-green-600" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => selectedAccount && sendOtpToAccount(selectedAccount)}
                        disabled={!selectedAccount || loading}
                        className="w-full py-4 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-green-500/30 shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group mb-4"
                    >
                        {loading ? 'Sending OTP...' : 'Send OTP'}
                        {!loading && <FiArrowRight className="group-hover:translate-x-1 transition-transform" />}
                    </button>

                    <button
                        onClick={() => { setStep('input'); setAccounts([]); setSelectedAccount(null); }}
                        className="w-full py-3 rounded-xl font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition flex items-center justify-center gap-2"
                    >
                        <FiArrowLeft /> Back
                    </button>
                </div>
            </div>
        );
    }

    // 3. Input Screen (Email or Mobile)
    if (step === 'input') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-[#050505] dark:via-[#0a0a0a] dark:to-[#050505] p-4">
                <div className="max-w-lg w-full bg-white dark:bg-[#121212] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-8 md:p-12 animate-in fade-in slide-in-from-right-8 duration-300">
                    <div className="text-center mb-10">
                        <Link href="/login" className="inline-flex items-center gap-2 mb-6 opacity-50 hover:opacity-100 transition">
                            <FiArrowLeft /> Back to Login
                        </Link>
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">
                            {method === 'email' ? '📧' : '📱'}
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                            {method === 'email' ? 'Reset via Email' : 'Reset via SMS'}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            {method === 'email'
                                ? 'Enter your registered email address to receive a reset link.'
                                : 'Enter your registered mobile number to receive an OTP.'}
                        </p>
                    </div>

                    <form onSubmit={handleCheckAccounts} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                {method === 'email' ? 'Email Address' : 'Mobile Number'}
                            </label>
                            <input
                                autoFocus
                                type={method === 'email' ? 'email' : 'tel'}
                                required
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white focus:border-green-500 dark:focus:border-green-500 outline-none transition text-lg"
                                placeholder={method === 'email' ? 'you@example.com' : '0722000000'}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group ${method === 'email'
                                    ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
                                    : 'bg-green-600 hover:bg-green-700 shadow-green-500/30'
                                }`}
                        >
                            {loading ? 'Processing...' : 'Continue'}
                            {!loading && <FiArrowRight className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => { setStep('method'); setIdentifier(''); }}
                            className="text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
                        >
                            Choose another method
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 4. Initial Method Selection Screen
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-[#050505] dark:via-[#0a0a0a] dark:to-[#050505] p-4">
            <div className="max-w-4xl w-full bg-white dark:bg-[#121212] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-500">

                {/* Visual Side */}
                <div className="md:w-5/12 bg-gradient-to-br from-gray-900 to-black p-12 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <Link href="/login" className="inline-flex items-center gap-2 mb-12 opacity-70 hover:opacity-100 transition">
                            <FiArrowLeft /> Back to Login
                        </Link>
                        <h2 className="text-4xl font-black mb-6">Forgot Password?</h2>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            Don't worry, it happens. Choose a recovery method to regain access to your account.
                        </p>
                    </div>

                    {/* Decorative */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
                </div>

                {/* Selection Side */}
                <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center md:text-left">
                        Select Recovery Method
                    </h3>

                    <div className="grid gap-4">
                        <button
                            onClick={() => handleMethodSelect('mobile')}
                            className="relative flex items-center gap-6 p-6 rounded-2xl border-2 border-gray-100 dark:border-gray-800 hover:border-green-500 dark:hover:border-green-500 bg-white dark:bg-gray-900 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all group text-left"
                        >
                            <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                <FiSmartphone />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">Via SMS</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">We'll send an OTP to your mobile number</p>
                            </div>
                            <FiArrowRight className="absolute right-6 text-gray-300 group-hover:text-green-500 transition-colors transform group-hover:translate-x-1" />
                        </button>

                        <button
                            onClick={() => handleMethodSelect('email')}
                            className="relative flex items-center gap-6 p-6 rounded-2xl border-2 border-gray-100 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group text-left"
                        >
                            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                <FiMail />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">Via Email</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">We'll send a reset link to your inbox</p>
                            </div>
                            <FiArrowRight className="absolute right-6 text-gray-300 group-hover:text-blue-500 transition-colors transform group-hover:translate-x-1" />
                        </button>
                    </div>

                    <div className="mt-8 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl flex items-start gap-3">
                        <FiInfo className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            <strong>Tip:</strong> Use the SMS method if you want faster access via your mobile device. Email links may take a few minutes to arrive.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
