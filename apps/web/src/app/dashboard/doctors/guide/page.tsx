'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    FiUser, FiEdit3, FiFileText, FiDollarSign, FiCheckCircle, FiArrowRight,
    FiUpload, FiImage, FiLock, FiStar, FiBriefcase, FiTrendingUp, FiCalendar,
    FiChevronDown, FiChevronUp, FiAlertCircle, FiInfo, FiAward
} from 'react-icons/fi';

const steps = [
    {
        id: 1,
        icon: <FiUser />,
        color: 'from-blue-500 to-cyan-500',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        title: 'Complete Your Profile',
        summary: 'Set up your professional profile so patients know who you are',
        content: (
            <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Your profile is the first thing patients see before booking an appointment. A complete, professional profile builds trust and increases your booking rate.
                </p>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex gap-3">
                    <FiAlertCircle className="text-amber-600 text-xl shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                        <strong>Important:</strong> Your profile must be at least 80% complete before you can receive appointment bookings.
                    </p>
                </div>

                <h4 className="font-bold text-gray-800 dark:text-white">How to update your profile:</h4>
                <ol className="space-y-3">
                    {[
                        { step: '1', text: 'Go to <strong>My Profile</strong> from the left sidebar or top navigation.' },
                        { step: '2', text: 'Click the <strong>Edit Profile</strong> button in the top-right corner of the page.' },
                        { step: '3', text: 'Fill in all required fields: <strong>Full Name, Phone Number, Speciality, Qualification, Years of Experience, About Me, and Hospital Attachment</strong>.' },
                        { step: '4', text: 'Upload a <strong>professional profile photo</strong> — patients prefer doctors with a clear, friendly photo.' },
                        { step: '5', text: 'Set your <strong>consultation fee</strong> (minimum KES 500). This is what patients pay per appointment.' },
                        { step: '6', text: 'Enable <strong>Telemedicine</strong> if you offer video/phone consultations, or <strong>On-Call</strong> if you do home visits.' },
                        { step: '7', text: 'Click <strong>Save Changes</strong>.' },
                    ].map((item) => (
                        <li key={item.step} className="flex gap-3 items-start">
                            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{item.step}</span>
                            <p className="text-sm text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: item.text }} />
                        </li>
                    ))}
                </ol>

                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex gap-3">
                    <FiCheckCircle className="text-green-600 text-xl shrink-0 mt-0.5" />
                    <div className="text-sm text-green-800 dark:text-green-200">
                        <strong>Pro Tip:</strong> Doctors with complete profiles including a photo and detailed "About Me" section get <strong>3× more appointment bookings</strong> than those with incomplete profiles.
                    </div>
                </div>

                <Link
                    href="/dashboard/profile"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
                >
                    Go to My Profile <FiArrowRight />
                </Link>
            </div>
        ),
    },
    {
        id: 2,
        icon: <FiEdit3 />,
        color: 'from-purple-500 to-pink-500',
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        border: 'border-purple-200 dark:border-purple-800',
        title: 'Upload Your Signature',
        summary: 'Add your digital signature for prescriptions and medical records',
        content: (
            <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Your digital signature is automatically added to all <strong>prescriptions, medical records, and lab orders</strong> you create. It gives your documents a professional, legally valid appearance.
                </p>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex gap-3">
                    <FiInfo className="text-blue-600 text-xl shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                        Your signature will appear at the bottom of every prescription you write. Patients and pharmacies can verify it's authentic.
                    </p>
                </div>

                <h4 className="font-bold text-gray-800 dark:text-white">How to upload your signature:</h4>
                <ol className="space-y-3">
                    {[
                        { step: '1', text: 'Go to <strong>My Profile</strong> from the sidebar.' },
                        { step: '2', text: 'Scroll down to the <strong>"Signature & Stamp"</strong> section.' },
                        { step: '3', text: 'Click the <strong>Upload Signature</strong> button.' },
                        { step: '4', text: 'Choose a <strong>PNG or JPEG image</strong> of your handwritten signature on a white background. Make sure the background is clean and white for best results.' },
                        { step: '5', text: 'The system will automatically crop and process the image.' },
                        { step: '6', text: 'Click <strong>Save</strong> to confirm. Your signature will now appear on all future documents.' },
                    ].map((item) => (
                        <li key={item.step} className="flex gap-3 items-start">
                            <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{item.step}</span>
                            <p className="text-sm text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: item.text }} />
                        </li>
                    ))}
                </ol>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                        <div className="font-semibold text-green-800 dark:text-green-200 mb-2 flex items-center gap-2"><FiCheckCircle /> Good signature</div>
                        <ul className="space-y-1 text-sm text-green-700 dark:text-green-300">
                            <li>• Clean white background</li>
                            <li>• Dark ink, clearly visible</li>
                            <li>• PNG format, transparent preferred</li>
                            <li>• Minimum 400×150 pixels</li>
                        </ul>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                        <div className="font-semibold text-red-800 dark:text-red-200 mb-2 flex items-center gap-2"><FiAlertCircle /> Avoid</div>
                        <ul className="space-y-1 text-sm text-red-700 dark:text-red-300">
                            <li>• Blurry or low-resolution scans</li>
                            <li>• Signatures on coloured paper</li>
                            <li>• Very small files under 10KB</li>
                            <li>• Screenshots with other content</li>
                        </ul>
                    </div>
                </div>
            </div>
        ),
    },
    {
        id: 3,
        icon: <FiImage />,
        color: 'from-orange-500 to-red-500',
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        border: 'border-orange-200 dark:border-orange-800',
        title: 'Upload Your Official Stamp',
        summary: 'Add your clinic or professional stamp for official document authentication',
        content: (
            <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Your official stamp (rubber stamp) is added alongside your signature on prescriptions and referral letters. It authenticates your documents and is required by pharmacies and hospitals.
                </p>

                <h4 className="font-bold text-gray-800 dark:text-white">How to upload your stamp:</h4>
                <ol className="space-y-3">
                    {[
                        { step: '1', text: 'Go to <strong>My Profile</strong> from the sidebar.' },
                        { step: '2', text: 'Scroll down to the <strong>"Signature & Stamp"</strong> section.' },
                        { step: '3', text: 'Click the <strong>Upload Stamp</strong> button (next to the signature upload).' },
                        { step: '4', text: 'Scan or take a clear photo of your <strong>official stamp impression</strong> on white paper.' },
                        { step: '5', text: 'Upload the image. Supported formats: <strong>PNG, JPEG</strong>. Max size: 2MB.' },
                        { step: '6', text: 'Preview the stamp and click <strong>Save</strong>.' },
                    ].map((item) => (
                        <li key={item.step} className="flex gap-3 items-start">
                            <span className="w-6 h-6 rounded-full bg-orange-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{item.step}</span>
                            <p className="text-sm text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: item.text }} />
                        </li>
                    ))}
                </ol>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex gap-3">
                    <FiInfo className="text-amber-600 text-xl shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800 dark:text-amber-200">
                        <strong>No stamp yet?</strong> Contact the M-Clinic administration at <strong>support@mclinic.co.ke</strong> to request assistance in obtaining an official professional stamp.
                    </div>
                </div>
            </div>
        ),
    },
    {
        id: 4,
        icon: <FiDollarSign />,
        color: 'from-green-500 to-emerald-500',
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        title: 'How You Earn from Appointments',
        summary: 'Understand your earning model, wallet, and payout process',
        content: (
            <div className="space-y-6">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Every time a patient books an appointment with you, you earn money. Here's exactly how the earning process works from booking to payout.
                </p>

                {/* Earning Flow */}
                <div>
                    <h4 className="font-bold text-gray-800 dark:text-white mb-4">💰 The Earning Flow</h4>
                    <div className="grid md:grid-cols-4 gap-3">
                        {[
                            { icon: '📱', step: '1', title: 'Patient Books', desc: 'Patient pays the consultation fee upfront via M-Pesa or wallet.' },
                            { icon: '✅', step: '2', title: 'You Confirm', desc: 'You confirm the appointment through your dashboard.' },
                            { icon: '🩺', step: '3', title: 'Appointment Done', desc: 'You complete the visit/consultation and mark it as done.' },
                            { icon: '💵', step: '4', title: 'Funds Released', desc: 'Payment is transferred to your M-Clinic wallet within 24 hours.' },
                        ].map((item) => (
                            <div key={item.step} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center">
                                <div className="text-3xl mb-2">{item.icon}</div>
                                <div className="text-xs font-bold text-green-600 mb-1">STEP {item.step}</div>
                                <div className="font-bold text-gray-800 dark:text-white text-sm mb-1">{item.title}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Commission Structure */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                    <h4 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <FiTrendingUp className="text-green-600" /> Commission Structure
                    </h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                                    <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Appointment Type</th>
                                    <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">You Earn</th>
                                    <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Platform Fee</th>
                                    <th className="pb-3 font-semibold text-gray-600 dark:text-gray-400">Example (KES 1,500 fee)</th>
                                </tr>
                            </thead>
                            <tbody className="space-y-2">
                                {[
                                    { type: 'Home Visit', earn: '85%', fee: '15%', example: 'KES 1,275 to you' },
                                    { type: 'Telemedicine / Video Call', earn: '90%', fee: '10%', example: 'KES 1,350 to you' },
                                    { type: 'On-Call Emergency', earn: '88%', fee: '12%', example: 'KES 1,320 to you' },
                                ].map((row) => (
                                    <tr key={row.type} className="border-b border-gray-100 dark:border-gray-800">
                                        <td className="py-3 text-gray-800 dark:text-gray-200 font-medium">{row.type}</td>
                                        <td className="py-3 text-green-600 font-bold text-lg">{row.earn}</td>
                                        <td className="py-3 text-gray-500">{row.fee}</td>
                                        <td className="py-3 text-blue-600 font-semibold">{row.example}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Wallet & Withdrawal */}
                <div>
                    <h4 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <FiBriefcase className="text-green-600" /> Your Wallet & Withdrawals
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            {[
                                { icon: '👛', title: 'M-Clinic Wallet', desc: 'All earnings go into your M-Clinic digital wallet automatically after appointment completion.' },
                                { icon: '📊', title: 'Check Balance', desc: 'Go to Wallet & Earnings from the sidebar to see your current balance and full transaction history.' },
                                { icon: '📤', title: 'Request Payout', desc: 'Request a withdrawal to your M-Pesa at any time. Minimum payout is KES 500.' },
                                { icon: '⏱️', title: 'Processing Time', desc: 'Payouts are processed within 1–3 business days and sent directly to your registered M-Pesa number.' },
                            ].map((item) => (
                                <div key={item.title} className="flex gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                                    <span className="text-2xl">{item.icon}</span>
                                    <div>
                                        <div className="font-semibold text-sm text-gray-800 dark:text-white">{item.title}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                            <div className="text-4xl mb-3">💡</div>
                            <h5 className="font-bold text-lg mb-2">Maximize Your Earnings</h5>
                            <ul className="space-y-2 text-sm text-green-100">
                                <li className="flex gap-2 items-start"><FiCheckCircle className="shrink-0 mt-0.5" /> Complete your profile 100% to appear higher in patient searches</li>
                                <li className="flex gap-2 items-start"><FiCheckCircle className="shrink-0 mt-0.5" /> Enable both Telemedicine & On-Call to get more booking options</li>
                                <li className="flex gap-2 items-start"><FiCheckCircle className="shrink-0 mt-0.5" /> Respond quickly — patients often book the first doctor to respond</li>
                                <li className="flex gap-2 items-start"><FiCheckCircle className="shrink-0 mt-0.5" /> Maintain a 4.5+ star rating for priority placement</li>
                                <li className="flex gap-2 items-start"><FiCheckCircle className="shrink-0 mt-0.5" /> Keep your online status active during working hours</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <Link
                    href="/dashboard/finance/transactions"
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors"
                >
                    View My Wallet & Earnings <FiArrowRight />
                </Link>
            </div>
        ),
    },
    {
        id: 5,
        icon: <FiCalendar />,
        color: 'from-indigo-500 to-purple-500',
        bg: 'bg-indigo-50 dark:bg-indigo-900/20',
        border: 'border-indigo-200 dark:border-indigo-800',
        title: 'Managing Appointments',
        summary: 'How to confirm, complete, and manage your patient appointments',
        content: (
            <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Appointments are the core of your practice on M-Clinic. Here's how to manage them effectively.
                </p>

                <div className="grid md:grid-cols-3 gap-4">
                    {[
                        {
                            status: 'Pending', color: 'yellow', emoji: '⏳',
                            desc: 'New booking just received. Accept or decline within 2 hours to avoid cancellation.',
                            action: 'Click Confirm or Decline'
                        },
                        {
                            status: 'Confirmed', color: 'blue', emoji: '✅',
                            desc: 'You have accepted the appointment. Show up at the scheduled time.',
                            action: 'Prepare for the visit'
                        },
                        {
                            status: 'Completed', color: 'green', emoji: '🎉',
                            desc: 'Mark as completed after the visit. This triggers payment release.',
                            action: 'Click Mark as Completed'
                        },
                    ].map((item) => (
                        <div key={item.status} className={`p-4 rounded-xl border-2 border-${item.color}-200 dark:border-${item.color}-800 bg-${item.color}-50 dark:bg-${item.color}-900/20`}>
                            <div className="text-2xl mb-2">{item.emoji}</div>
                            <div className={`font-bold text-${item.color}-800 dark:text-${item.color}-200  mb-1`}>{item.status}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">{item.desc}</div>
                            <div className={`text-xs font-semibold text-${item.color}-700 dark:text-${item.color}-300`}>→ {item.action}</div>
                        </div>
                    ))}
                </div>

                <h4 className="font-bold text-gray-800 dark:text-white">After the appointment:</h4>
                <ol className="space-y-3">
                    {[
                        { step: '1', text: 'Mark the appointment as <strong>Completed</strong> from your appointments list.' },
                        { step: '2', text: 'Write a <strong>medical record</strong> documenting the diagnosis, notes, and recommendations.' },
                        { step: '3', text: 'If medications are needed, issue a <strong>prescription</strong> — it will automatically include your signature and stamp.' },
                        { step: '4', text: 'Your earnings will be credited to your wallet within <strong>24 hours</strong> of marking complete.' },
                    ].map((item) => (
                        <li key={item.step} className="flex gap-3 items-start">
                            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{item.step}</span>
                            <p className="text-sm text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: item.text }} />
                        </li>
                    ))}
                </ol>

                <Link
                    href="/dashboard/appointments"
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors"
                >
                    View My Appointments <FiArrowRight />
                </Link>
            </div>
        ),
    },
];

const faqs = [
    {
        q: 'When do I get paid after completing an appointment?',
        a: 'Earnings are credited to your M-Clinic wallet within 24 hours of marking an appointment as Completed. From there, you can request a payout to your M-Pesa at any time (minimum KES 500).',
    },
    {
        q: 'What happens if a patient cancels?',
        a: 'If a patient cancels more than 2 hours before the appointment, they receive a full refund and you receive no payment. If they cancel within 2 hours, you receive a 50% cancellation fee credited to your wallet.',
    },
    {
        q: 'Can I set my own consultation fee?',
        a: 'Yes! Go to My Profile → Edit Profile and set your consultation fee. The minimum is KES 500. You can change it at any time — it applies to all new bookings going forward.',
    },
    {
        q: 'What if I can\'t make an appointment I already confirmed?',
        a: 'Go to your Appointments page, find the appointment, and click "Reschedule" or "Cancel". The patient will be notified immediately. Too many cancellations may affect your ranking on the platform.',
    },
    {
        q: 'Is my digital signature legally valid?',
        a: 'Yes. Digital signatures on M-Clinic issued documents are legally recognized in Kenya under the Kenya Information & Communications Act. Prescriptions with your digital signature are accepted by registered pharmacies.',
    },
    {
        q: 'How many appointments can I receive per day?',
        a: 'There is no hard limit. You can set your working hours and the maximum number of daily appointments in your Profile settings under "Schedule". We recommend starting with 5–8 per day.',
    },
];

export default function MedicGuidePage() {
    const [openStep, setOpenStep] = useState<number | null>(1);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-16">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#1D2B36] to-[#C2003F] rounded-3xl p-8 md:p-12 text-white">
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
                        <FiAward /> Medic Getting Started Guide
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black mb-3">Welcome to M-Clinic 👋</h1>
                    <p className="text-white/80 text-lg max-w-2xl leading-relaxed">
                        Everything you need to know to set up your profile, start accepting appointments, and earn money through M-Clinic.
                    </p>

                    <div className="grid grid-cols-3 gap-4 mt-8">
                        {[
                            { value: '5', label: 'Steps to Full Setup', icon: '📋' },
                            { value: '24h', label: 'Payout Processing', icon: '⚡' },
                            { value: '85%+', label: 'Earnings Per Booking', icon: '💰' },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
                                <div className="text-2xl mb-1">{stat.icon}</div>
                                <div className="text-2xl font-black">{stat.value}</div>
                                <div className="text-xs text-white/70 leading-tight">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>

            {/* Progress Checklist */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                <h2 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <FiCheckCircle className="text-green-600" /> Setup Checklist
                </h2>
                <div className="grid md:grid-cols-2 gap-3">
                    {[
                        { label: 'Upload profile photo', link: '/dashboard/profile' },
                        { label: 'Fill in qualifications & speciality', link: '/dashboard/profile' },
                        { label: 'Set your consultation fee', link: '/dashboard/profile' },
                        { label: 'Upload digital signature', link: '/dashboard/profile' },
                        { label: 'Upload official stamp', link: '/dashboard/profile' },
                        { label: 'Enable telemedicine or on-call', link: '/dashboard/profile' },
                        { label: 'Add your M-Pesa number for payouts', link: '/dashboard/profile' },
                        { label: 'Go online (set status to Online)', link: '/dashboard' },
                    ].map((item, i) => (
                        <Link key={i} href={item.link} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors group">
                            <div className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 group-hover:border-green-500 transition-colors shrink-0" />
                            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-green-700 dark:group-hover:text-green-300">{item.label}</span>
                            <FiArrowRight className="ml-auto text-gray-400 group-hover:text-green-600 opacity-0 group-hover:opacity-100 transition-all" />
                        </Link>
                    ))}
                </div>
            </div>

            {/* Step-by-Step Guide */}
            <div>
                <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-6">Step-by-Step Setup Guide</h2>
                <div className="space-y-4">
                    {steps.map((step) => (
                        <div key={step.id} className={`border-2 rounded-2xl overflow-hidden transition-all ${step.border} ${openStep === step.id ? 'shadow-lg' : ''}`}>
                            <button
                                className={`w-full flex items-center gap-4 p-6 text-left ${step.bg}`}
                                onClick={() => setOpenStep(openStep === step.id ? null : step.id)}
                            >
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white text-xl shrink-0`}>
                                    {step.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Step {step.id}</span>
                                    </div>
                                    <div className="font-bold text-gray-800 dark:text-white text-lg">{step.title}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{step.summary}</div>
                                </div>
                                {openStep === step.id ? (
                                    <FiChevronUp className="text-gray-500 shrink-0 text-xl" />
                                ) : (
                                    <FiChevronDown className="text-gray-500 shrink-0 text-xl" />
                                )}
                            </button>

                            {openStep === step.id && (
                                <div className="p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                                    {step.content}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* FAQ Section */}
            <div>
                <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-6">Frequently Asked Questions</h2>
                <div className="space-y-3">
                    {faqs.map((faq, i) => (
                        <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                            <button
                                className="w-full flex items-center justify-between gap-4 p-5 text-left"
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                            >
                                <span className="font-semibold text-gray-800 dark:text-white text-sm">{faq.q}</span>
                                {openFaq === i ? (
                                    <FiChevronUp className="text-gray-500 shrink-0" />
                                ) : (
                                    <FiChevronDown className="text-gray-500 shrink-0" />
                                )}
                            </button>
                            {openFaq === i && (
                                <div className="px-5 pb-5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-4">
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Support CTA */}
            <div className="bg-gradient-to-r from-[#1D2B36] to-[#2a3d4d] rounded-2xl p-8 text-white text-center">
                <div className="text-4xl mb-4">🙋‍♂️</div>
                <h3 className="text-2xl font-black mb-2">Still need help?</h3>
                <p className="text-white/70 mb-6">Our support team is available 24/7 to assist you with any questions.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                        href="https://wa.me/254724454757"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                    >
                        💬 WhatsApp Support
                    </a>
                    <a
                        href="mailto:support@mclinic.co.ke"
                        className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                    >
                        ✉️ Email Support
                    </a>
                </div>
            </div>


        </div>
    );
}
