'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FiCheckCircle, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';

export default function TermsAndConditionsPage() {
    const [activeSection, setActiveSection] = useState(1);

    const sections = [
        { id: 1, title: 'Accepting the Terms', icon: '✓' },
        { id: 2, title: 'Account Registration', icon: '2' },
        { id: 3, title: 'Use of Services', icon: '3' },
        { id: 4, title: 'Wallet Funds', icon: '4' },
        { id: 5, title: 'User Content', icon: '5' },
        { id: 6, title: 'Privacy', icon: '6' },
        { id: 7, title: 'Termination', icon: '7' },
        { id: 8, title: 'Disclaimer of Warranties', icon: '8' },
        { id: 9, title: 'Limitation of Liability', icon: '9' },
        { id: 10, title: 'Changes to Terms', icon: '10' },
        { id: 11, title: 'Data Protection & GDPR', icon: '11' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Back Button */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold mb-6 transition"
                >
                    <FiArrowLeft /> Back to Home
                </Link>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <aside className="lg:w-64 shrink-0">
                        <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
                            <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Contents</h3>
                            <nav className="space-y-2">
                                {sections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${activeSection === section.id
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                                : 'hover:bg-gray-100 text-gray-600'
                                            }`}
                                    >
                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${activeSection === section.id ? 'bg-white/20' : 'bg-blue-100 text-blue-600'
                                            }`}>
                                            {section.icon}
                                        </span>
                                        <span className="text-sm font-medium">{section.title}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
                                <h1 className="text-4xl font-black mb-2">Terms & Conditions</h1>
                                <p className="text-blue-100">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>

                            {/* Welcome Message */}
                            <div className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                                <div className="flex items-start gap-4">
                                    <span className="text-4xl">👋</span>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 mb-2">Hey there!</h2>
                                        <p className="text-gray-600 leading-relaxed">
                                            Before creating your account, please read and accept the following terms and conditions.
                                            These govern your use of M-Clinic's healthcare platform and services.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Content Sections */}
                            <div className="p-8 space-y-8">
                                {/* Section 1: Accepting the Terms */}
                                <section id="section-1" className={activeSection === 1 ? 'animate-in fade-in slide-in-from-bottom-4' : ''}>
                                    <h2 className="text-2xl font-black text-blue-600 mb-4 flex items-center gap-2">
                                        <FiCheckCircle /> 1. Accepting the Terms
                                    </h2>
                                    <div className="prose prose-blue max-w-none">
                                        <p className="text-gray-700 leading-relaxed mb-4">
                                            These Terms and Conditions (the "Terms") govern your access to and use of the <strong>M-Clinic</strong> mobile
                                            and web application (the "App") and the healthcare services provided therein (the "Services"). By downloading,
                                            accessing, or using the App or Services, you agree to be bound by these Terms.
                                        </p>
                                        <p className="text-gray-700 leading-relaxed mb-4">
                                            <strong>If you do not agree to these Terms, please do not use the App or Services.</strong>
                                        </p>
                                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-xl">
                                            <p className="text-sm text-yellow-800">
                                                <strong>Important:</strong> By clicking "I Accept" or by using our services, you acknowledge that you have
                                                read, understood, and agree to be bound by these Terms and our Privacy Policy.
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                {/* Section 2: Account Registration */}
                                <section id="section-2" className={activeSection === 2 ? 'animate-in fade-in slide-in-from-bottom-4' : ''}>
                                    <h2 className="text-2xl font-black text-blue-600 mb-4">2. Account Registration</h2>
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 rounded-xl p-6">
                                            <h3 className="font-bold text-gray-900 mb-3">2.1 Account Creation</h3>
                                            <p className="text-gray-700 leading-relaxed">
                                                In order to use the App and Services, you must create an account and provide accurate and complete
                                                information as prompted during the registration process. You must be at least 18 years old to create
                                                an account, or have parental/guardian consent if under 18.
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-6">
                                            <h3 className="font-bold text-gray-900 mb-3">2.2 Account Security</h3>
                                            <p className="text-gray-700 leading-relaxed">
                                                You are responsible for maintaining the confidentiality of your account credentials and for all activities
                                                that occur under your account. You must use a strong, unique password and enable two-factor authentication
                                                where available.
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-6">
                                            <h3 className="font-bold text-gray-900 mb-3">2.3 Unauthorized Access</h3>
                                            <p className="text-gray-700 leading-relaxed">
                                                You agree to notify us immediately of any unauthorized use of your account or any other breach of security.
                                                M-Clinic will not be liable for any loss or damage arising from your failure to comply with this security obligation.
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                {/* Section 3: Use of Services */}
                                <section id="section-3" className={activeSection === 3 ? 'animate-in fade-in slide-in-from-bottom-4' : ''}>
                                    <h2 className="text-2xl font-black text-blue-600 mb-4">3. Use of Services</h2>
                                    <div className="space-y-4">
                                        <p className="text-gray-700 leading-relaxed">
                                            M-Clinic provides a platform connecting patients with licensed healthcare professionals for consultations,
                                            home visits, virtual appointments, pharmacy services, and laboratory services.
                                        </p>
                                        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                                            <h3 className="font-bold text-blue-900 mb-3">You agree to:</h3>
                                            <ul className="space-y-2 text-gray-700">
                                                <li className="flex items-start gap-2">
                                                    <FiCheckCircle className="text-green-500 mt-1 shrink-0" />
                                                    <span>Use the Services only for lawful purposes and in accordance with these Terms</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <FiCheckCircle className="text-green-500 mt-1 shrink-0" />
                                                    <span>Provide accurate and truthful medical information to healthcare providers</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <FiCheckCircle className="text-green-500 mt-1 shrink-0" />
                                                    <span>Respect the professional relationship with healthcare providers</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <FiCheckCircle className="text-green-500 mt-1 shrink-0" />
                                                    <span>Pay all fees for services rendered in a timely manner</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <FiCheckCircle className="text-green-500 mt-1 shrink-0" />
                                                    <span>Not misuse or abuse the platform or services</span>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                                            <h3 className="font-bold text-red-900 mb-3">You agree NOT to:</h3>
                                            <ul className="space-y-2 text-gray-700">
                                                <li className="flex items-start gap-2">
                                                    <FiAlertCircle className="text-red-500 mt-1 shrink-0" />
                                                    <span>Use the Services for any illegal or unauthorized purpose</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <FiAlertCircle className="text-red-500 mt-1 shrink-0" />
                                                    <span>Attempt to gain unauthorized access to any portion of the App</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <FiAlertCircle className="text-red-500 mt-1 shrink-0" />
                                                    <span>Harass, abuse, or harm healthcare providers or other users</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <FiAlertCircle className="text-red-500 mt-1 shrink-0" />
                                                    <span>Share prescription medications obtained through the platform</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </section>

                                {/* Section 4: Wallet Funds */}
                                <section id="section-4" className={activeSection === 4 ? 'animate-in fade-in slide-in-from-bottom-4' : ''}>
                                    <h2 className="text-2xl font-black text-blue-600 mb-4">4. Wallet Funds & Payments</h2>
                                    <div className="space-y-4">
                                        <p className="text-gray-700 leading-relaxed">
                                            M-Clinic operates a digital wallet system for managing payments for services.
                                        </p>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="bg-gray-50 rounded-xl p-6">
                                                <h3 className="font-bold text-gray-900 mb-3">4.1 Wallet Top-Up</h3>
                                                <p className="text-gray-700 text-sm leading-relaxed">
                                                    You may add funds to your wallet using approved payment methods including M-Pesa, credit/debit cards,
                                                    or bank transfers. All transactions are processed securely through our payment partners.
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 rounded-xl p-6">
                                                <h3 className="font-bold text-gray-900 mb-3">4.2 Service Payments</h3>
                                                <p className="text-gray-700 text-sm leading-relaxed">
                                                    Funds are deducted from your wallet when you book and receive services. Consultation fees, transport
                                                    fees, and service charges are clearly displayed before confirmation.
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 rounded-xl p-6">
                                                <h3 className="font-bold text-gray-900 mb-3">4.3 Refunds</h3>
                                                <p className="text-gray-700 text-sm leading-relaxed">
                                                    Refunds are processed according to our Refund Policy. Cancelled appointments may be eligible for
                                                    refunds if cancelled at least 24 hours before the scheduled time.
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 rounded-xl p-6">
                                                <h3 className="font-bold text-gray-900 mb-3">4.4 Wallet Withdrawal</h3>
                                                <p className="text-gray-700 text-sm leading-relaxed">
                                                    You may request withdrawal of unused wallet funds to your M-Pesa account or bank account, subject
                                                    to verification and applicable fees.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Section 5: User Content */}
                                <section id="section-5" className={activeSection === 5 ? 'animate-in fade-in slide-in-from-bottom-4' : ''}>
                                    <h2 className="text-2xl font-black text-blue-600 mb-4">5. User Content & Medical Records</h2>
                                    <div className="space-y-4">
                                        <p className="text-gray-700 leading-relaxed">
                                            You may upload medical records, prescriptions, lab results, and other health-related content to the platform.
                                        </p>
                                        <div className="bg-gray-50 rounded-xl p-6">
                                            <h3 className="font-bold text-gray-900 mb-3">5.1 Ownership</h3>
                                            <p className="text-gray-700 leading-relaxed">
                                                You retain all rights to your medical records and personal health information. M-Clinic does not claim
                                                ownership of your content but requires a license to store, process, and share it with your healthcare
                                                providers as necessary to deliver services.
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-6">
                                            <h3 className="font-bold text-gray-900 mb-3">5.2 Accuracy</h3>
                                            <p className="text-gray-700 leading-relaxed">
                                                You are responsible for ensuring that all medical information you provide is accurate and up-to-date.
                                                Providing false or misleading information may result in account suspension and could endanger your health.
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                {/* Section 6: Privacy */}
                                <section id="section-6" className={activeSection === 6 ? 'animate-in fade-in slide-in-from-bottom-4' : ''}>
                                    <h2 className="text-2xl font-black text-blue-600 mb-4">6. Privacy & Data Protection</h2>
                                    <div className="space-y-4">
                                        <p className="text-gray-700 leading-relaxed">
                                            Your privacy is important to us. Our collection, use, and disclosure of your personal information is
                                            governed by our <Link href="/privacy-policy" className="text-blue-600 font-bold hover:underline">Privacy Policy</Link>,
                                            which is incorporated into these Terms by reference.
                                        </p>
                                        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                                            <h3 className="font-bold text-blue-900 mb-3">Key Privacy Points:</h3>
                                            <ul className="space-y-2 text-gray-700 text-sm">
                                                <li>• We collect only necessary personal and medical information</li>
                                                <li>• Your data is encrypted both in transit and at rest</li>
                                                <li>• We comply with Kenya's Data Protection Act, 2019 and GDPR where applicable</li>
                                                <li>• You have the right to access, correct, or delete your personal data</li>
                                                <li>• We do not sell your personal information to third parties</li>
                                                <li>• Medical information is shared only with your authorized healthcare providers</li>
                                            </ul>
                                        </div>
                                    </div>
                                </section>

                                {/* Section 7: Termination */}
                                <section id="section-7" className={activeSection === 7 ? 'animate-in fade-in slide-in-from-bottom-4' : ''}>
                                    <h2 className="text-2xl font-black text-blue-600 mb-4">7. Account Termination</h2>
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 rounded-xl p-6">
                                            <h3 className="font-bold text-gray-900 mb-3">7.1 Termination by You</h3>
                                            <p className="text-gray-700 leading-relaxed mb-3">
                                                You may terminate your account at any time through the account settings. Upon termination:
                                            </p>
                                            <ul className="space-y-2 text-gray-700 text-sm">
                                                <li>• Your account will be deactivated immediately</li>
                                                <li>• You will have 7 days to cancel the deletion request</li>
                                                <li>• After 7 days, your personal data will be permanently deleted</li>
                                                <li>• Medical records may be retained for legal compliance (up to 7 years)</li>
                                                <li>• Unused wallet funds will be refunded to your registered payment method</li>
                                            </ul>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-6">
                                            <h3 className="font-bold text-gray-900 mb-3">7.2 Termination by M-Clinic</h3>
                                            <p className="text-gray-700 leading-relaxed">
                                                We reserve the right to suspend or terminate your account if you violate these Terms, engage in
                                                fraudulent activity, or misuse the platform. We will provide notice where possible, except in cases
                                                of serious violations.
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                {/* Section 8: Disclaimer */}
                                <section id="section-8" className={activeSection === 8 ? 'animate-in fade-in slide-in-from-bottom-4' : ''}>
                                    <h2 className="text-2xl font-black text-blue-600 mb-4">8. Disclaimer of Warranties</h2>
                                    <div className="bg-yellow-50 rounded-xl p-6 border-2 border-yellow-300">
                                        <p className="text-gray-700 leading-relaxed mb-4">
                                            <strong>THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND.</strong>
                                        </p>
                                        <p className="text-gray-700 leading-relaxed text-sm">
                                            M-Clinic does not guarantee that the Services will be uninterrupted, error-free, or secure. We do not
                                            warrant the accuracy, completeness, or reliability of any content or medical advice provided through the platform.
                                            Healthcare providers are independent professionals, and M-Clinic does not guarantee their qualifications,
                                            performance, or the outcomes of their services.
                                        </p>
                                    </div>
                                </section>

                                {/* Section 9: Limitation of Liability */}
                                <section id="section-9" className={activeSection === 9 ? 'animate-in fade-in slide-in-from-bottom-4' : ''}>
                                    <h2 className="text-2xl font-black text-blue-600 mb-4">9. Limitation of Liability</h2>
                                    <div className="bg-red-50 rounded-xl p-6 border-2 border-red-300">
                                        <p className="text-gray-700 leading-relaxed mb-4">
                                            To the maximum extent permitted by law, M-Clinic shall not be liable for any indirect, incidental, special,
                                            consequential, or punitive damages, including but not limited to:
                                        </p>
                                        <ul className="space-y-2 text-gray-700 text-sm">
                                            <li>• Loss of profits, data, or goodwill</li>
                                            <li>• Service interruption or system failures</li>
                                            <li>• Medical malpractice by healthcare providers</li>
                                            <li>• Errors in diagnosis or treatment</li>
                                            <li>• Unauthorized access to your account</li>
                                        </ul>
                                        <p className="text-gray-700 leading-relaxed mt-4 text-sm">
                                            Our total liability shall not exceed the amount you paid to M-Clinic in the 12 months preceding the claim.
                                        </p>
                                    </div>
                                </section>

                                {/* Section 10: Changes to Terms */}
                                <section id="section-10" className={activeSection === 10 ? 'animate-in fade-in slide-in-from-bottom-4' : ''}>
                                    <h2 className="text-2xl font-black text-blue-600 mb-4">10. Changes to Terms</h2>
                                    <div className="space-y-4">
                                        <p className="text-gray-700 leading-relaxed">
                                            We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting
                                            to the App. We will notify you of material changes via email or in-app notification.
                                        </p>
                                        <div className="bg-gray-50 rounded-xl p-6">
                                            <p className="text-gray-700 leading-relaxed">
                                                Your continued use of the Services after changes are posted constitutes your acceptance of the modified Terms.
                                                If you do not agree to the changes, you must stop using the Services and may terminate your account.
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                {/* Section 11: Data Protection & GDPR */}
                                <section id="section-11" className={activeSection === 11 ? 'animate-in fade-in slide-in-from-bottom-4' : ''}>
                                    <h2 className="text-2xl font-black text-blue-600 mb-4">11. Data Protection & GDPR Compliance</h2>
                                    <div className="space-y-4">
                                        <p className="text-gray-700 leading-relaxed">
                                            M-Clinic is committed to protecting your personal data in accordance with the Kenya Data Protection Act, 2019
                                            and the EU General Data Protection Regulation (GDPR) where applicable.
                                        </p>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="bg-gray-50 rounded-xl p-6">
                                                <h3 className="font-bold text-gray-900 mb-3">Your Rights</h3>
                                                <ul className="space-y-2 text-gray-700 text-sm">
                                                    <li>✓ Right to access your data</li>
                                                    <li>✓ Right to rectification</li>
                                                    <li>✓ Right to erasure ("right to be forgotten")</li>
                                                    <li>✓ Right to data portability</li>
                                                    <li>✓ Right to object to processing</li>
                                                    <li>✓ Right to withdraw consent</li>
                                                </ul>
                                            </div>
                                            <div className="bg-gray-50 rounded-xl p-6">
                                                <h3 className="font-bold text-gray-900 mb-3">Data Deletion</h3>
                                                <p className="text-gray-700 text-sm leading-relaxed">
                                                    You can request deletion of your account and personal data at any time. We provide a 7-day grace
                                                    period during which you can cancel the deletion request. After this period, your data will be
                                                    permanently deleted, except where retention is required by law.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                                            <h3 className="font-bold text-blue-900 mb-3">Contact Our Data Protection Officer</h3>
                                            <p className="text-gray-700 text-sm">
                                                For any data protection concerns or to exercise your rights, contact our Data Protection Officer at:
                                            </p>
                                            <p className="text-blue-600 font-mono text-sm mt-2">dpo@mclinic.co.ke</p>
                                        </div>
                                    </div>
                                </section>

                                {/* Contact & Governing Law */}
                                <section className="border-t pt-8">
                                    <h2 className="text-2xl font-black text-gray-900 mb-4">Contact Information</h2>
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <p className="text-gray-700 mb-4">
                                            If you have any questions about these Terms, please contact us:
                                        </p>
                                        <div className="space-y-2 text-sm">
                                            <p><strong>Email:</strong> <a href="mailto:info@mclinic.co.ke" className="text-blue-600 hover:underline">info@mclinic.co.ke</a></p>
                                            <p><strong>Phone:</strong> <a href="tel:+254700448448" className="text-blue-600 hover:underline">+254 700 448 448</a></p>
                                            <p><strong>Address:</strong> M-Clinic Kenya, Nairobi, Kenya</p>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-6 mt-4">
                                        <h3 className="font-bold text-gray-900 mb-2">Governing Law</h3>
                                        <p className="text-gray-700 text-sm">
                                            These Terms shall be governed by and construed in accordance with the laws of the Republic of Kenya.
                                            Any disputes arising out of or relating to these Terms shall be subject to the exclusive jurisdiction
                                            of the courts of Kenya.
                                        </p>
                                    </div>
                                </section>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-8 bg-gray-50 border-t flex flex-col sm:flex-row gap-4 justify-between items-center">
                                <p className="text-sm text-gray-500">
                                    By using M-Clinic, you acknowledge that you have read and understood these Terms.
                                </p>
                                <div className="flex gap-4">
                                    <Link
                                        href="/"
                                        className="px-6 py-3 border-2 border-gray-300 rounded-xl font-bold hover:bg-gray-100 transition"
                                    >
                                        I Decline
                                    </Link>
                                    <Link
                                        href="/register/patient"
                                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30"
                                    >
                                        I Accept
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
