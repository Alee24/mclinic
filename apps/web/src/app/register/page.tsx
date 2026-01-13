'use client';

import Link from 'next/link';

import { ThemeToggle } from '@/components/ThemeToggle';

export default function RegisterSelectionPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background transition-colors duration-300 p-4">
            <div className="absolute top-6 right-6">
                <ThemeToggle />
            </div>
            <div className="max-w-2xl w-full text-center">
                <h1 className="text-4xl font-black mb-8 text-gray-900 dark:text-white">Join <span className="text-primary">M-Clinic</span></h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 mb-12">Choose how you want to use the platform.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Link href="/register/patient" className="group rounded-3xl p-8 bg-white dark:bg-card border border-gray-100 dark:border-gray-800 shadow-xl hover:-translate-y-2 transition-all">
                        <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">😷</div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">I am a Patient</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Find top doctors, book appointments, and manage your health records.</p>
                    </Link>

                    <Link href="/register/medic" className="group rounded-3xl p-8 bg-white dark:bg-card border border-gray-100 dark:border-gray-800 shadow-xl hover:-translate-y-2 transition-all">
                        <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">🩺</div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">I am a Medical Professional</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Join our network of specialists (Doctors, Nurses, Pharmacists, etc.), manage patients, and grow your practice.</p>
                    </Link>
                </div>

                <div className="mt-12 text-gray-500 dark:text-gray-400">
                    Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Sign In</Link>
                </div>
            </div>
        </div>
    );
}
