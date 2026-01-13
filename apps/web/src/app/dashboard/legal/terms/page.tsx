import { IoMdDocument, IoMdInformationCircle, IoMdCalendar } from 'react-icons/io';

export default function TermsPage() {
    return (
        <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-gray-100 dark:border-gray-800 pb-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm border border-blue-200/50 dark:border-blue-700/30">
                        <IoMdDocument className="text-3xl" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Terms and Conditions</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Governing your use of M-Clinic services</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-800 self-start md:self-center">
                    <IoMdCalendar className="text-lg" />
                    <span>Effective Date: January 1, 2024</span>
                </div>
            </div>

            {/* Content Section */}
            <article className="prose prose-slate dark:prose-invert prose-lg max-w-none 
                prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-gray-100 
                prose-h3:text-primary prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 
                prose-p:leading-relaxed prose-p:text-gray-600 dark:prose-p:text-gray-300
                prose-li:text-gray-600 dark:prose-li:text-gray-300 prose-li:marker:text-primary
                prose-strong:text-gray-900 dark:prose-strong:text-white">

                <p className="lead text-lg md:text-xl text-gray-700 dark:text-gray-300 border-l-4 border-primary pl-6 py-2 bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-900/30 dark:to-transparent rounded-r-lg">
                    Welcome to <strong>M-Clinic Kenya</strong> (referred to as “we,” “us,” or “our”). These terms and conditions outline the rules and regulations for the use of our services. By accessing the M-Clinic application, website, or using any of our services, you confirm that you accept these terms completely.
                </p>

                <h3>1. Introduction</h3>
                <ul>
                    <li><strong>1.1. Acceptance of Terms:</strong> These terms govern your use of the M-Clinic Kenya website and associated healthcare services. By using our platform, you agree to comply with these terms.</li>
                    <li><strong>1.2. Eligibility:</strong> Our services are intended for individuals who are at least 18 years old or legally emancipated minors. If you are under 18, you may only use our services with the consent and supervision of a parent or guardian.</li>
                </ul>

                <h3>2. Privacy Policy & Data Protection</h3>
                <p>
                    <strong>2.1. Your Privacy Matters:</strong> We are committed to protecting your personal and medical data. Please refer to our <a href="/dashboard/legal/privacy" className="text-primary hover:text-primary/80 no-underline hover:underline font-semibold">Privacy Policy</a> to understand how we collect, use, store, and share your information in compliance with the Data Protection Act of Kenya.
                </p>

                <h3>3. Service Availability</h3>
                <p>
                    <strong>3.1. Geographical Scope:</strong> M-Clinic Kenya strives to provide healthcare services nationwide. However, availability of physical services (like ambulances or home visits) may vary by location. We do not guarantee service availability in all regions at all times.
                </p>

                <h3>4. Service Description</h3>
                <ul>
                    <li><strong>4.1. Personalized Care:</strong> Our mission is to provide expert, personalized healthcare tailored to your needs. We partner with licensed, esteemed local service providers to deliver high-quality care.</li>
                    <li><strong>4.2. Scope of Services:</strong> Our offerings include, but are not limited to:
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Virtual medical consultations (Telemedicine)</li>
                            <li>Medical home visits</li>
                            <li>Ambulance and medical evacuation services</li>
                            <li>Medical concierge and care coordination</li>
                            <li>Pharmacy delivery and laboratory testing coordination</li>
                        </ul>
                    </li>
                </ul>

                <h3>5. Accounts & Registration</h3>
                <ul>
                    <li><strong>5.1. Account Security:</strong> To access features, you must create a verified account. You are fully responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account.</li>
                    <li><strong>5.2. Accuracy of Information:</strong> You agree to provide accurate, current, and complete information during registration and to update your profile promptly if your details change.</li>
                </ul>

                <h3>6. User Conduct & Responsibilities</h3>
                <p>By using our platform, you agree to:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose my-6">
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                        <strong className="block text-gray-900 dark:text-white mb-1">✅ Lawful Use</strong>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Comply with all applicable Kenyan laws and regulations while using our services.</span>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                        <strong className="block text-gray-900 dark:text-white mb-1">🛡️ Accuracy</strong>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Provide truthful medical history and personal information to ensure safe treatment.</span>
                    </div>
                </div>
                <ul>
                    <li><strong>6.1. Respect:</strong> Treat all healthcare providers and support staff with respect and dignity.</li>
                    <li><strong>6.2. Non-Interference:</strong> Do not engage in any activity that harms, disrupts, or interferes with the operational integrity of our services.</li>
                </ul>

                <h3>7. Intellectual Property Rights</h3>
                <p>
                    <strong>7.1. Ownership:</strong> All content, including text, graphics, logos, software, and trademarks found on the M-Clinic application and website, is the exclusive property of MML Technologies Limited or its licensors and is protected by intellectual property laws. Unauthorized reproduction or distribution is strictly prohibited.
                </p>

                <h3>8. Limitation of Liability</h3>
                <p>
                    <strong>8.1. Disclaimer:</strong> M-Clinic Kenya, MML Technologies Limited, its directors, and affiliates shall not be liable for any direct, indirect, incidental, or consequential damages arising arising from your misuse of the service or failure to comply with Clause 6. While we vet our providers, medical outcomes are subject to clinical factors beyond our absolute control.
                </p>

                <h3>9. Termination of Services</h3>
                <ul>
                    <li><strong>9.1. Force Majeure:</strong> We reserve the right to suspend services without liability in events beyond our control, including natural disasters, pandemics, war, civil disorder, or utility failures.</li>
                    <li><strong>9.2. Breach of Terms:</strong> We may terminate or suspend your account immediately, without prior notice, if you breach these Terms and Conditions.</li>
                </ul>

                <h3>10. Dispute Resolution & Governing Law</h3>
                <p>
                    <strong>10.1. Jurisdiction:</strong> These terms are governed by and construed in accordance with the laws of the Republic of Kenya. Any disputes shall be subject to the exclusive jurisdiction of the Kenyan courts.
                </p>

                <h3>11. Contact & Support</h3>
                <p>
                    If you have questions regarding these Terms, please contact our legal team:
                </p>
                <div className="not-prose flex items-center gap-3 p-4 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/10 dark:border-primary/20 w-fit">
                    <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Email Support</p>
                        <a href="mailto:info@mclinic.co.ke" className="text-primary font-bold hover:underline">info@mclinic.co.ke</a>
                    </div>
                </div>
            </article>

            {/* Footer Disclaimer */}
            <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-4 items-start md:items-center">
                <IoMdInformationCircle className="text-2xl text-gray-400 flex-shrink-0 mt-1 md:mt-0" />
                <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                    <p className="font-semibold text-gray-700 dark:text-gray-300">Corporate Information</p>
                    <p>
                        M-Clinic is a product wholly owned and operated by <strong>MML Technologies Kenya Limited</strong>.
                        <br />
                        We are committed to providing you with safe, personalized, and expert healthcare services.
                    </p>
                </div>
            </div>
        </div>
    );
}
