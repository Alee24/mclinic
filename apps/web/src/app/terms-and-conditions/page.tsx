import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Terms and Conditions - M-Clinic',
    description: 'Terms and Conditions for using M-Clinic healthcare services',
};

export default function TermsAndConditionsPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-4xl mx-auto px-6 py-8">
                    <Link
                        href="/"
                        className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-primary mb-4"
                    >
                        ← Back to Home
                    </Link>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Terms and Conditions
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Last updated: January 14, 2026
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 space-y-8">

                    {/* Introduction */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            1. Introduction
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            Welcome to M-Clinic Kenya. These Terms and Conditions govern your use of our healthcare platform
                            and services. By accessing or using M-Clinic, you agree to be bound by these terms. If you do not
                            agree with any part of these terms, please do not use our services.
                        </p>
                    </section>

                    {/* Service Description */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            2. Service Description
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                            M-Clinic provides a comprehensive healthcare management platform that includes:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                            <li>Medical home visits by licensed healthcare professionals</li>
                            <li>Virtual consultations with qualified doctors</li>
                            <li>Pharmacy delivery services</li>
                            <li>Laboratory services and sample collection</li>
                            <li>Medical escort services</li>
                            <li>Healthcare supplies and equipment</li>
                        </ul>
                    </section>

                    {/* User Responsibilities */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            3. User Responsibilities
                        </h2>
                        <div className="space-y-4 text-gray-700 dark:text-gray-300">
                            <p className="leading-relaxed">
                                <strong className="text-gray-900 dark:text-white">3.1 Account Registration:</strong> You must provide
                                accurate, current, and complete information during registration and keep your account information updated.
                            </p>
                            <p className="leading-relaxed">
                                <strong className="text-gray-900 dark:text-white">3.2 Account Security:</strong> You are responsible
                                for maintaining the confidentiality of your account credentials and for all activities under your account.
                            </p>
                            <p className="leading-relaxed">
                                <strong className="text-gray-900 dark:text-white">3.3 Accurate Medical Information:</strong> You must
                                provide accurate medical history and current health information to ensure proper care and treatment.
                            </p>
                            <p className="leading-relaxed">
                                <strong className="text-gray-900 dark:text-white">3.4 Prohibited Uses:</strong> You may not use our
                                services for any illegal purposes or in violation of Kenyan healthcare regulations.
                            </p>
                        </div>
                    </section>

                    {/* Medical Professionals */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            4. Medical Professionals
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                            All medical professionals on our platform are:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                            <li>Licensed and registered with relevant Kenyan medical boards</li>
                            <li>Required to maintain professional indemnity insurance</li>
                            <li>Bound by the M-Clinic Kenya Code of Conduct</li>
                            <li>Prohibited from soliciting direct payments outside the platform</li>
                            <li>Subject to regular verification and compliance checks</li>
                        </ul>
                    </section>

                    {/* Payment Terms */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            5. Payment Terms
                        </h2>
                        <div className="space-y-4 text-gray-700 dark:text-gray-300">
                            <p className="leading-relaxed">
                                <strong className="text-gray-900 dark:text-white">5.1 Pricing:</strong> All prices are displayed in
                                Kenyan Shillings (KES) and are subject to change with prior notice.
                            </p>
                            <p className="leading-relaxed">
                                <strong className="text-gray-900 dark:text-white">5.2 Payment Methods:</strong> We accept payments via
                                M-PESA, credit/debit cards, and insurance coverage where applicable.
                            </p>
                            <p className="leading-relaxed">
                                <strong className="text-gray-900 dark:text-white">5.3 Cancellation Policy:</strong> Cancellations made
                                at least 2 hours before scheduled appointments may receive a full refund. Late cancellations may incur fees.
                            </p>
                            <p className="leading-relaxed">
                                <strong className="text-gray-900 dark:text-white">5.4 Insurance Claims:</strong> We assist with insurance
                                claims but do not guarantee approval or reimbursement by your insurance provider.
                            </p>
                        </div>
                    </section>

                    {/* Privacy and Data Protection */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            6. Privacy and Data Protection
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                            We are committed to protecting your privacy and personal health information in compliance with the
                            Kenya Data Protection Act, 2019:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                            <li>All medical records are encrypted and stored securely</li>
                            <li>Personal information is only shared with authorized healthcare providers</li>
                            <li>You have the right to access, correct, or delete your personal data</li>
                            <li>We do not sell or share your data with third parties for marketing purposes</li>
                        </ul>
                    </section>

                    {/* Liability and Disclaimers */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            7. Liability and Disclaimers
                        </h2>
                        <div className="space-y-4 text-gray-700 dark:text-gray-300">
                            <p className="leading-relaxed">
                                <strong className="text-gray-900 dark:text-white">7.1 Platform Availability:</strong> While we strive
                                for 24/7 availability, we do not guarantee uninterrupted access to our services.
                            </p>
                            <p className="leading-relaxed">
                                <strong className="text-gray-900 dark:text-white">7.2 Medical Advice:</strong> Our platform facilitates
                                connections with healthcare professionals but does not provide medical advice directly. Always consult
                                qualified professionals for medical decisions.
                            </p>
                            <p className="leading-relaxed">
                                <strong className="text-gray-900 dark:text-white">7.3 Emergency Services:</strong> M-Clinic is not a
                                substitute for emergency medical services. In case of emergency, call 999 or visit the nearest hospital.
                            </p>
                            <p className="leading-relaxed">
                                <strong className="text-gray-900 dark:text-white">7.4 Limitation of Liability:</strong> M-Clinic's
                                liability is limited to the amount paid for the specific service in question.
                            </p>
                        </div>
                    </section>

                    {/* Intellectual Property */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            8. Intellectual Property
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            All content, trademarks, logos, and intellectual property on the M-Clinic platform are owned by
                            M-Clinic Kenya or licensed to us. You may not reproduce, distribute, or create derivative works
                            without our express written permission.
                        </p>
                    </section>

                    {/* Dispute Resolution */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            9. Dispute Resolution
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                            In the event of any dispute arising from these terms or our services:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                            <li>First, contact our customer support at info@mclinic.co.ke</li>
                            <li>We will attempt to resolve disputes through good-faith negotiations</li>
                            <li>If unresolved, disputes shall be subject to mediation in Nairobi, Kenya</li>
                            <li>These terms are governed by the laws of the Republic of Kenya</li>
                        </ul>
                    </section>

                    {/* Modifications */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            10. Modifications to Terms
                        </h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            We reserve the right to modify these Terms and Conditions at any time. Changes will be effective
                            immediately upon posting to the platform. Your continued use of M-Clinic after changes constitutes
                            acceptance of the modified terms.
                        </p>
                    </section>

                    {/* Contact Information */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            11. Contact Information
                        </h2>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 space-y-2">
                            <p className="text-gray-700 dark:text-gray-300">
                                <strong className="text-gray-900 dark:text-white">M-Clinic Kenya</strong>
                            </p>
                            <p className="text-gray-700 dark:text-gray-300">
                                Email: <a href="mailto:info@mclinic.co.ke" className="text-primary hover:underline">info@mclinic.co.ke</a>
                            </p>
                            <p className="text-gray-700 dark:text-gray-300">
                                Phone: <a href="tel:+254700448448" className="text-primary hover:underline">+254 700 448 448</a>
                            </p>
                            <p className="text-gray-700 dark:text-gray-300">
                                Website: <a href="https://www.mclinic.co.ke" className="text-primary hover:underline">www.mclinic.co.ke</a>
                            </p>
                        </div>
                    </section>

                    {/* Acceptance */}
                    <section className="border-t border-gray-200 dark:border-gray-700 pt-8">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic">
                            By using M-Clinic services, you acknowledge that you have read, understood, and agree to be bound
                            by these Terms and Conditions.
                        </p>
                    </section>
                </div>

                {/* Back to Home */}
                <div className="mt-8 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                    >
                        Return to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
