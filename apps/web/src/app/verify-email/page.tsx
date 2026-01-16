'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FiCheckCircle, FiAlertCircle, FiShield } from 'react-icons/fi';
import Link from 'next/link';

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('No verification token provided.');
            return;
        }

        const verify = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://portal.mclinic.co.ke/api';
                const res = await fetch(`${API_URL}/auth/verify-email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                });

                if (res.ok) {
                    setStatus('success');
                    setMessage('Your email has been successfully verified! You can now log in.');
                } else {
                    const data = await res.json().catch(() => ({}));
                    setStatus('error');
                    setMessage(data.message || 'Verification failed. The token may be invalid or expired.');
                }
            } catch (err) {
                setStatus('error');
                setMessage('Connection error. Please try again.');
            }
        };

        verify();
    }, [token]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8 text-center">
                <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 transition-colors duration-500 ${status === 'loading' ? 'bg-blue-100 text-blue-600' :
                        status === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                    {status === 'loading' && <FiShield className="text-4xl animate-pulse" />}
                    {status === 'success' && <FiCheckCircle className="text-4xl" />}
                    {status === 'error' && <FiAlertCircle className="text-4xl" />}
                </div>

                <h1 className="text-2xl font-black mb-2 text-gray-900">
                    {status === 'loading' ? 'Verifying...' :
                        status === 'success' ? 'Email Verified!' : 'Verification Failed'}
                </h1>

                <p className="text-gray-600 mb-8">
                    {message}
                </p>

                {status === 'success' ? (
                    <Link href="/login" className="block w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-500/30">
                        Continue to Login
                    </Link>
                ) : status === 'error' ? (
                    <Link href="/login" className="block w-full py-4 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition">
                        Back to Login
                    </Link>
                ) : null}
            </div>

            <div className="mt-8 text-sm text-gray-400">
                &copy; {new Date().getFullYear()} M-Clinic Health
            </div>
        </div>
    );
}
