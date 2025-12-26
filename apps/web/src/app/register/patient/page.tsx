'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function PatientRegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fname: '',
        lname: '',
        email: '',
        password: '',
        role: 'patient',
        status: true
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await api.post('/auth/register', formData);
            if (res.ok) {
                alert('Account created successfully! Please login.');
                router.push('/login');
            } else {
                alert('Registration failed. Email might be in use.');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1A1A1A] p-4">
            <div className="max-w-md w-full bg-white dark:bg-[#121212] p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
                <h2 className="text-2xl font-black mb-6 dark:text-white">Patient Registration</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">First Name</label>
                            <input
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black dark:text-white outline-none focus:ring-2 focus:ring-green-500"
                                onChange={(e) => setFormData({ ...formData, fname: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Last Name</label>
                            <input
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black dark:text-white outline-none focus:ring-2 focus:ring-green-500"
                                onChange={(e) => setFormData({ ...formData, lname: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black dark:text-white outline-none focus:ring-2 focus:ring-green-500"
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black dark:text-white outline-none focus:ring-2 focus:ring-green-500"
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-green-500 text-white font-black uppercase tracking-widest rounded-xl hover:bg-green-600 transition disabled:opacity-50"
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>

                    <div className="text-center text-sm text-gray-500">
                        <Link href="/login">Back to Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
