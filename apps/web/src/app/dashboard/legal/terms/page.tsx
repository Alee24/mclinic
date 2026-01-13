import { IoMdDocument, IoMdInformationCircle } from 'react-icons/io';

export default function TermsPage() {
    return (
        <>
            <div className="flex items-center gap-3 mb-8 border-b border-gray-100 dark:border-gray-800 pb-6">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <IoMdDocument className="text-2xl" />
                </div>
                <div>
                    <h1 className="!mb-1 !text-2xl sm:!text-3xl">Terms and Conditions</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Last Updated: January 2024</p>
                </div>
            </div>

            <p className="lead">
                Welcome to M-Clinic Kenya (referred to as “we,” “us,” or “our”). These terms and conditions outline the rules and regulations for the use of our services. By accessing the M-Clinic application, our website, or using our services, you accept these terms and conditions in full.
            </p>

            <h3>1. Introduction</h3>
            <p>
                1.1. These terms and conditions govern your use of M-Clinic Kenya’s website and services. By using our website or services, you agree to comply with these terms and conditions.
            </p>
            <p>
                1.2. Our services are intended for individuals who are at least 18 years old or have the consent of a parent or guardian.
            </p>

            <h3>2. Privacy Policy</h3>
            <p>
                2.1. Your privacy is important to us. Please refer to our <a href="/dashboard/legal/privacy">Privacy Policy</a> for information on how we may collect, use, and disclose your personal information.
            </p>

            <h3>3. Service Availability</h3>
            <p>
                3.1. M-Clinic Kenya provides healthcare services throughout the country. However, availability may vary depending on your location. We strive to extend our services to as many areas as possible, but we cannot guarantee availability in all regions.
            </p>

            <h3>4. Service Description</h3>
            <p>
                4.1. Our goal is to provide personalized and expert healthcare services to cater to your unique needs. We partner with esteemed service providers nationwide to bring you care that is tailored to your unique circumstances.
            </p>
            <p>
                4.2. Our services may include, but are not limited to, virtual medical consultations, medical home visits, medical concierge, and medical evacuations.
            </p>

            <h3>5. Registration and Account</h3>
            <p>
                5.1. To access our services, you will need to create an account and provide certain information. You are responsible for maintaining the confidentiality of your account and password.
            </p>
            <p>
                5.2. You agree to provide accurate and complete information when registering and using our services. Any changes to your information should be promptly updated.
            </p>

            <h3>6. User Responsibilities</h3>
            <p>
                6.1. By using our services, you agree to, among other things:
            </p>
            <ul>
                <li>6.1.1. Comply with all applicable laws and regulations.</li>
                <li>6.1.2. Use our services for lawful purposes only.</li>
                <li>6.1.3. Provide accurate and complete information.</li>
                <li>6.1.4. Respect the privacy and confidentiality of others.</li>
                <li>6.1.5. Not engage in any activity that may harm, disrupt, or interfere with our services.</li>
            </ul>

            <h3>7. Intellectual Property</h3>
            <p>
                7.1. The content on our application and website, including text, graphics, logos, and images, is protected by intellectual property laws. You may not reproduce, modify, distribute, or use the content without our prior written consent.
            </p>

            <h3>8. Limitation of Liability</h3>
            <p>
                8.1. The M-Clinic brand, MML Technologies Limited, its directors, and affiliates shall not be liable for any direct, indirect, incidental, or consequential harm or damages or legal proceedings arising out of your use of our services in a manner that is incompatible with the user responsibilities in clause 6 above.
            </p>

            <h3>9. Termination</h3>
            <p>
                9.1. We affirm our commitment to making our solutions and services available to you at all times. Nonetheless, in the event of a force majeure occurrence, we reserve the right to terminate or suspend your access to our services at any time, without prior notice or liability. Force majeure events include, but are not limited to, natural disasters, acts of war, terrorism, civil disorder, labor strikes or disputes, epidemics, pandemics, governmental actions or orders, and interruptions or failure of utility services.
            </p>
            <p>
                9.2. We further reserve the right to terminate or suspend your access to our services at any time without notice in the event that you breach the terms of clause 6 above.
            </p>

            <h3>10. Governing Law</h3>
            <p>
                10.1. These terms and conditions are governed by and construed in accordance with the laws of Kenya.
            </p>

            <h3>11. Changes to Terms and Conditions</h3>
            <p>
                11.1. These terms and conditions may be modified and/or replaced from time to time.
            </p>

            <h3>12. Contact Information</h3>
            <p>
                12.1. If you have any questions or concerns about these terms and conditions, please contact us at: <a href="mailto:info@mclinic.co.ke">info@mclinic.co.ke</a>.
            </p>

            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm text-gray-500 flex gap-2">
                <IoMdInformationCircle className="text-lg flex-shrink-0 mt-0.5" />
                <p className="!mb-0">
                    M-Clinic is wholly owned by MML Technologies Kenya Limited. Thank you for choosing M-Clinic Kenya. We are committed to providing you with personalized and expert healthcare services.
                </p>
            </div>
        </>
    );
}
