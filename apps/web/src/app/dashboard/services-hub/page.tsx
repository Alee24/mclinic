'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiCalendar, FiPackage, FiActivity, FiTruck, FiMessageSquare, FiMail, FiPhone, FiGrid, FiUser, FiFileText } from 'react-icons/fi';

export default function ServicesHubPage() {
    const router = useRouter();

    const services = [
        {
            title: 'Book Appointment',
            description: 'Schedule a consultation with a General Practitioner or Specialist.',
            icon: <FiCalendar />,
            color: 'bg-blue-500',
            href: '/dashboard/appointments',
            action: () => router.push('/dashboard/appointments?book=true') // Assuming query param triggers modal or just nav
        },
        {
            title: 'Pharmacy Store',
            description: 'Order medications and health products delivered to you.',
            icon: <FiPackage />,
            color: 'bg-green-500',
            href: '/dashboard/pharmacy'
        },
        {
            title: 'Lab & Diagnostics',
            description: 'View your lab results or book a new test.',
            icon: <FiActivity />,
            color: 'bg-purple-500',
            href: '/dashboard/lab'
        },
        {
            title: 'Ambulance Service',
            description: 'Emergency response and medical transport services.',
            icon: <FiTruck />,
            color: 'bg-red-500',
            href: '/dashboard/ambulance'
        },
        {
            title: 'Medical Records',
            description: 'Access your complete medical history and reports.',
            icon: <FiFileText />,
            color: 'bg-orange-500',
            href: '/dashboard/records'
        },
        {
            title: 'My Profile',
            description: 'Update your personal details and account settings.',
            icon: <FiUser />,
            color: 'bg-gray-500',
            href: '/dashboard/profile'
        }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            <div>
                <h1 className="text-3xl font-black dark:text-white mb-2">Services Hub</h1>
                <p className="text-gray-500">Access all M-Clinic services and support in one place.</p>
            </div>

            {/* Quick Access Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service, index) => (
                    <div
                        key={index}
                        onClick={() => {
                            if (service.action) service.action();
                            else router.push(service.href);
                        }}
                        className="bg-white dark:bg-[#121212] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group"
                    >
                        <div className={`w-12 h-12 rounded-xl ${service.color} text-white flex items-center justify-center text-2xl mb-4 shadow-lg shadow-gray-200 dark:shadow-none`}>
                            {service.icon}
                        </div>
                        <h3 className="text-lg font-bold dark:text-white mb-2 group-hover:text-blue-500 transition-colors">{service.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{service.description}</p>
                    </div>
                ))}
            </div>

            {/* Support Center */}
            <div className="bg-[#1A1A1A] rounded-[32px] p-8 md:p-12 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                        <span className="text-green-500"><FiMessageSquare /></span> Help & Support Center
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Chat */}
                        <Link href="/dashboard/messages" className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:bg-white/20 transition text-center group">
                            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform">
                                💬
                            </div>
                            <h3 className="font-bold text-lg mb-1">Chat with Admin</h3>
                            <p className="text-xs text-gray-300">Instant messaging support</p>
                        </Link>

                        {/* Email */}
                        <a href="mailto:support@mclinic.co.ke" className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:bg-white/20 transition text-center group">
                            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform">
                                ✉️
                            </div>
                            <h3 className="font-bold text-lg mb-1">Email Support</h3>
                            <p className="text-xs text-gray-300">support@mclinic.co.ke</p>
                        </a>

                        {/* Call */}
                        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:bg-white/20 transition text-center group cursor-pointer" onClick={() => alert('Call +254 700 000 000')}>
                            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform">
                                📞
                            </div>
                            <h3 className="font-bold text-lg mb-1">Call Helpline</h3>
                            <p className="text-xs text-gray-300">+254 700 000 000</p>
                        </div>
                    </div>
                </div>

                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -ml-20 -mb-20"></div>
            </div>
        </div>
    );
}
