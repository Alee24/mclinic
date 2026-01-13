import { IoMdLock, IoMdMail } from 'react-icons/io';

export default function PrivacyPage() {
    return (
        <>
            <div className="flex items-center gap-3 mb-8 border-b border-gray-100 dark:border-gray-800 pb-6">
                <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400">
                    <IoMdLock className="text-2xl" />
                </div>
                <div>
                    <h1 className="!mb-1 !text-2xl sm:!text-3xl">Privacy Policy</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Last Updated: January 2024</p>
                </div>
            </div>

            <h3>1. Information We Collect</h3>
            <p>
                1.1. <strong>Personal Information:</strong> We collect personal information, such as your name, date of birth, contact details, medical history, and other information necessary for providing healthcare services.
            </p>
            <p>
                1.2. <strong>Usage Data:</strong> We collect information about how you use our services, including IP addresses, device information, and browsing activities on our website and application.
            </p>
            <p>
                1.3. <strong>Health Data:</strong> We may collect your health data, such as symptoms, diagnoses, treatment plans, and other medical information necessary for providing personalized healthcare services.
            </p>

            <h3>2. How We Use Your Information</h3>
            <p>
                2.1. <strong>Providing Healthcare Services:</strong> We use your information to deliver personalized healthcare services, such as virtual medical consultations and medical home visits.
            </p>
            <p>
                2.2. <strong>Communication:</strong> We may use your information to communicate with you about your healthcare, appointments, billing, and updates to our services.
            </p>
            <p>
                2.3. <strong>Research and Analysis:</strong> We may use your information for research and analysis purposes to improve our services and develop new healthcare offerings.
            </p>
            <p>
                2.4. <strong>Compliance:</strong> We may use your information to comply with legal obligations and regulatory requirements.
            </p>

            <h3>3. Information Sharing</h3>
            <p>
                3.1. <strong>Healthcare Providers:</strong> We may share your information with healthcare providers involved in your care to facilitate the provision of medical services.
            </p>
            <p>
                3.2. <strong>Third-Party Service Providers:</strong> We may share your information with trusted third-party service providers who assist us in delivering our services, such as technology partners and payment processors.
            </p>
            <p>
                3.3. <strong>Legal Requirements:</strong> We may disclose your information when required by law or in response to legal process.
            </p>

            <h3>4. Data Security</h3>
            <p>
                4.1. <strong>Security Measures:</strong> We implement technical, administrative, and physical safeguards to protect your information from unauthorized access, disclosure, alteration, or destruction.
            </p>
            <p>
                4.2. <strong>Access Control:</strong> Access to your information is restricted to authorized personnel who need it for legitimate business purposes.
            </p>

            <h3>5. Data Retention</h3>
            <p>
                5.1. <strong>Retention Period:</strong> We retain your information for as long as necessary to fulfill the purposes for which it was collected and to comply with legal and regulatory obligations.
            </p>

            <h3>6. Your Rights</h3>
            <p>
                6.1. <strong>Access and Correction:</strong> You have the right to request access to your information and request corrections to ensure its accuracy.
            </p>
            <p>
                6.2. <strong>Data Portability:</strong> You have the right to request a copy of your information in a structured, commonly used, and machine-readable format.
            </p>
            <p>
                6.3. <strong>Erasure:</strong> You have the right to request the erasure of your information when it is no longer needed for the purposes for which it was collected, unless legal or regulatory obligations require its retention.
            </p>

            <h3>7. Changes to the Privacy Policy</h3>
            <p>
                7.1. <strong>Updates:</strong> We may update this Privacy Policy from time to time. Any changes will be posted on our website and take effect upon posting.
            </p>

            <h3>8. Contact Information</h3>
            <p>
                8.1. <strong>Questions or Concerns:</strong> If you have any questions or concerns about this Privacy Policy, please contact us at <a href="mailto:info@mclinic.co.ke">info@mclinic.co.ke</a>.
            </p>

            <div className="mt-8 flex items-center justify-between p-6 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/30">
                <div>
                    <h4 className="!text-lg !mb-1 text-green-800 dark:text-green-300">Have specific privacy concerns?</h4>
                    <p className="!mb-0 text-sm text-green-700 dark:text-green-400">Our Data Protection Officer is available to address your inquiries.</p>
                </div>
                <a href="mailto:info@mclinic.co.ke" className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg shadow-sm hover:shadow text-sm font-medium transition-shadow no-underline border border-green-100 dark:border-green-800">
                    <IoMdMail /> Contact DPO
                </a>
            </div>
        </>
    );
}
