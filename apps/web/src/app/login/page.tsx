'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const email = formData.get('email');
        const password = formData.get('password');

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://portal.mclinic.co.ke/api';
            const apiUrl = `${API_URL}/auth/login`; // Define apiUrl here
            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (res && res.ok) {
                const data = await res.json();
                login(data.user, data.access_token);
            } else {
                const errorData = await res.json().catch(() => ({}));
                const errorMessage = errorData.message || res.statusText || 'Login failed';
                alert(`Login Failed: ${errorMessage} (Status: ${res.status})`);
            }
        } catch (err) {
            alert('Connection error. Is API running on port 3434?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1A1A1A]">
            <div className="max-w-md w-full p-8 bg-white dark:bg-[#121212] rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800">
                <h1 className="text-3xl font-bold text-center mb-2">
                    <span className="text-primary">M</span>
                    <span className="dark:text-white">-Clinic</span>
                </h1>
                <p className="text-center text-gray-500 mb-8">Provider Portal Login</p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            defaultValue="doctor@mclinic.com"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black dark:text-white focus:ring-2 focus:ring-primary outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Password</label>
                        <input
                            type="password"
                            name="password"
                            defaultValue="password"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black dark:text-white focus:ring-2 focus:ring-primary outline-none transition"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-black font-bold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                    >
                        {loading ? 'Logging in...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    Don't have an account? <Link href="/register" className="text-primary font-bold hover:underline">Register here</Link>
                </div>
            </div>
        </div>
    );
}
