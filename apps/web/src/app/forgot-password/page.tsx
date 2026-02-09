'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';
import { FiMail, FiArrowLeft, FiSmartphone, FiArrowRight, FiCheckCircle, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Account {
    id: number;
    email: string;
    type: string;
    accountType: string;
}

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [method, setMethod] = useState<'email' | 'mobile'>('email');
    const [identifier, setIdentifier] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    // New state for account selection
    const [step, setStep] = useState<'input' | 'selection' | 'complete'>('input');
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

    const handleCheckAccounts = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (method === 'mobile') {
            try {
                const res = await api.post('/auth/check-accounts', { mobile: identifier });
                if (res && res.data.accounts) {
                    setAccounts(res.data.accounts);
                    if (res.data.accounts.length === 1) {
                        // Only one account, auto-select and proceed
                        await sendOtpToAccount(res.data.accounts[0]);
                    } else {
                        // Multiple accounts, show selection screen
                        setStep('selection');
                    }
                }
            } catch (e: any) {
                const msg = e.response?.data?.message || 'No accounts found.';
                toast.error(msg);
            } finally {
                setLoading(false);
            }
        } else {
            // Email flow (unchanged)
            try {
                await api.post('/auth/forgot-password', { email: identifier });
                setSent(true);
                toast.success('Reset link sent if email exists.');
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
            if (res) {
                toast.success(`OTP sent to ${account.email}`);
                router.push(`/reset-password?mobile=${encodeURIComponent(identifier)}&accountType=${account.accountType}&accountId=${account.id}`);
            }
        } catch (e: any) {
            const msg = e.response?.data?.message || e.message || 'Failed to send OTP.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleAccountSelect = (account: Account) => {
        setSelectedAccount(account);
    };

    const handleContinueWithAccount = () => {
        if (selectedAccount) {
            sendOtpToAccount(selectedAccount);
        }
    };

    // Success screen for email method
    if (sent) {
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

    // Account selection screen
    if (step === 'selection') {
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
                            Select Account
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            Multiple accounts found for <strong>{identifier}</strong>
                        </ p>
                    </div>

                    {/* Account Cards */}
                    <div className="space-y-4 mb-8">
                        {accounts.map((account) => (
                            <button
                                key={`${account.accountType}-${account.id}`}
                                onClick={() => handleAccountSelect(account)}
                                className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${selectedAccount?.id === account.id && selectedAccount?.accountType === account.accountType
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${account.type === 'patient'
                                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                                            : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
                                        }`}>
                                        <FiUser className="text-2xl" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white capitalize">
                                            {account.type} Account
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400">
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

                    {/* Continue Button */}
                    <button
                        onClick={handleContinueWithAccount}
                        disabled={!selectedAccount || loading}
                        className="w-full py-4 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-green-500/30 shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {loading ? 'Sending OTP...' : 'Send OTP'}
                        {!loading && <FiArrowRight className="group-hover:translate-x-1 transition-transform" />}
                    </button>

                    {/* Back */}
                    <div className="mt-8 text-center">
                        <button
                            onClick={() => { setStep('input'); setAccounts([]); setSelectedAccount(null); }}
                            className="inline-flex items-center gap-2 font-bold text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition"
                        >
                            <FiArrowLeft /> Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Main input screen
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

                <form className="space-y-6" onSubmit={handleCheckAccounts}>
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
                        {loading ? 'Processing...' : (method === 'email' ? 'Send Reset Link' : 'Check Accounts')}
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
