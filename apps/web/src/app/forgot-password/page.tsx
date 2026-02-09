'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';
import { FiMail, FiArrowLeft, FiSmartphone } from 'react-icons/fi';
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
                const res = await api.post('/auth/forgot-password', { email: identifier });
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
                // Check if response is ok (fetch wrapper usually throws or returns response)
                // Assuming api.post keeps response structure or throws
                if (res) {
                    toast.success('OTP sent successfully.');
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
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
                        <FiMail className="mx-auto h-12 w-12 text-blue-500 mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Check your email</h2>
                        <p className="text-gray-600 mb-6">
                            We have sent a password reset link to <strong>{identifier}</strong>.
                        </p>
                        <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                            Return to Login
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="mx-auto h-12 w-auto text-center font-bold text-3xl text-blue-600">M-Clinic</div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Reset your password
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Choose a method to reset your password.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">

                    {/* Toggle */}
                    <div className="flex rounded-md shadow-sm mb-6">
                        <button
                            type="button"
                            onClick={() => { setMethod('email'); setIdentifier(''); }}
                            className={`flex-1 py-3 text-sm font-medium rounded-l-md border flex items-center justify-center gap-2 ${method === 'email' ? 'bg-blue-50 border-blue-500 text-blue-700 z-10' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <FiMail /> Via Email
                        </button>
                        <button
                            type="button"
                            onClick={() => { setMethod('mobile'); setIdentifier(''); }}
                            className={`flex-1 py-3 text-sm font-medium rounded-r-md border-t border-b border-r flex items-center justify-center gap-2 ${method === 'mobile' ? 'bg-blue-50 border-blue-500 text-blue-700 z-10' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <FiSmartphone /> Via SMS
                        </button>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                                {method === 'email' ? 'Email Address' : 'Mobile Number'}
                            </label>
                            <div className="mt-1">
                                <input
                                    id="identifier"
                                    name="identifier"
                                    type={method === 'email' ? 'email' : 'tel'}
                                    required
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder={method === 'email' ? 'you@example.com' : '0712345678'}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {loading ? 'Sending...' : (method === 'email' ? 'Send Reset Link' : 'Send OTP')}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    Or
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 flex items-center justify-center gap-2">
                                <FiArrowLeft /> Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
