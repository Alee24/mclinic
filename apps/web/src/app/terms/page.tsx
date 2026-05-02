'use client';

import { FiFileText, FiCheckCircle, FiAlertCircle, FiInfo, FiActivity } from 'react-icons/fi';
import Link from 'next/link';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiFileText className="text-4xl text-primary" />
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">Terms & Conditions</h1>
                    <p className="text-gray-500 text-lg">Effective Date: May 2, 2026</p>
                </div>

                {/* Main Content */}
                <div className="bg-white dark:bg-[#121212] rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 dark:border-gray-800 space-y-12">
                    
                    <section>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                            <FiCheckCircle className="text-primary" /> 1. Acceptance of Terms
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            By downloading, installing, or using the M-Clinic application and portal, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                            <FiActivity className="text-primary" /> 2. Medical Services Disclaimer
                        </h2>
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-2xl border border-amber-100 dark:border-amber-800/50 mb-6">
                            <p className="text-amber-800 dark:text-amber-400 font-bold mb-2 flex items-center gap-2">
                                <FiAlertCircle /> EMERGENCY NOTICE
                            </p>
                            <p className="text-sm text-amber-700 dark:text-amber-500">
                                M-Clinic provides telemedicine and scheduled medical services. In the event of a life-threatening emergency, please contact national emergency services immediately or visit the nearest hospital.
                            </p>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Telemedicine is not a substitute for all in-person medical care. Our healthcare providers will determine if your condition is suitable for remote consultation.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                            <FiInfo className="text-primary" /> 3. User Accounts
                        </h2>
                        <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                            <li>You must provide accurate and complete information during registration.</li>
                            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                            <li>You must be at least 18 years old or have parental/guardian consent to use the app.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                            <FiCheckCircle className="text-primary" /> 4. Payments and Refunds
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            All payments for consultations and medications are processed via M-Pesa or other integrated payment gateways. Fees are non-refundable once the service (consultation or prescription fulfillment) has commenced.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                            <FiAlertCircle className="text-primary" /> 5. Limitation of Liability
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            M-Clinic acts as a platform connecting patients with licensed healthcare professionals. While we verify all practitioners' credentials, the final medical responsibility lies with the treating professional.
                        </p>
                    </section>

                    <section className="pt-8 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-sm text-gray-500 text-center italic">
                            For information on how we handle your data, please review our 
                            <Link href="/privacy" className="text-primary hover:underline mx-1">Privacy Policy</Link> 
                            and 
                            <Link href="/data-deletion" className="text-primary hover:underline mx-1">Data Deletion Portal</Link>.
                        </p>
                    </section>
                </div>

                <div className="text-center pt-8">
                    <Link href="/" className="text-gray-500 hover:text-primary font-bold transition">
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
