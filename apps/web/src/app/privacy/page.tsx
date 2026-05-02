'use client';

import { FiShield, FiEye, FiLock, FiSettings, FiUserCheck, FiMail } from 'react-icons/fi';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiShield className="text-4xl text-primary" />
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">Privacy Policy</h1>
                    <p className="text-gray-500 text-lg">Last Updated: May 2, 2026</p>
                </div>

                {/* Main Content */}
                <div className="bg-white dark:bg-[#121212] rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 dark:border-gray-800 space-y-12">
                    
                    <section>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                            <FiEye className="text-primary" /> 1. Information We Collect
                        </h2>
                        <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                            <p>We collect information that you provide directly to us when you create an account, book an appointment, or use our medical services:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Personal Identification:</strong> Name, email address, phone number, and physical address.</li>
                                <li><strong>Medical Information:</strong> Health history, diagnoses, prescriptions, and lab results provided during consultations.</li>
                                <li><strong>Payment Information:</strong> M-Pesa transaction IDs and billing details (we do not store your M-Pesa PIN).</li>
                                <li><strong>Location Data:</strong> Precise GPS coordinates (with your permission) to facilitate home visits and ambulance services.</li>
                            </ul>
                        </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                            <FiLock className="text-primary" /> 2. How We Use Your Information
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            Your data is used exclusively to provide and improve our healthcare services. This includes:
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-600 dark:text-gray-400">
                            <li>Facilitating medical consultations and home visits.</li>
                            <li>Processing payments for services and medications.</li>
                            <li>Sending important notifications regarding your appointments and health records.</li>
                            <li>Ensuring the safety of our providers through our Panic System during home visits.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                            <FiSettings className="text-primary" /> 3. Data Storage and Security
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            We implement industry-standard encryption (AES-256) to protect your medical records. All data is stored on secure, local servers in Kenya and is only accessible to authorized medical personnel directly involved in your care.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                            <FiUserCheck className="text-primary" /> 4. Your Rights and Deletion
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                            You have the right to access, correct, or delete your personal and medical data at any time. 
                        </p>
                        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                            <p className="text-gray-900 dark:text-white font-bold mb-2">Request Data Deletion</p>
                            <p className="text-sm text-gray-500 mb-4">You can request the permanent deletion of your account and all associated data through our dedicated portal.</p>
                            <Link href="/data-deletion" className="text-primary font-bold hover:underline">Go to Data Deletion Page &rarr;</Link>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                            <FiMail className="text-primary" /> 5. Contact Us
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            If you have any questions about this Privacy Policy or our data practices, please contact our Data Protection Officer at:
                        </p>
                        <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/20">
                            <p className="font-bold text-gray-900 dark:text-white">M-Clinic Kenya</p>
                            <p className="text-gray-500">Email: privacy@mclinic.co.ke</p>
                            <p className="text-gray-500">Phone: 0700 448 448</p>
                        </div>
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
