'use client';

import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import Link from 'next/link';
import { FiHome, FiVideo, FiActivity, FiPackage, FiHeart, FiPhone, FiCheck, FiArrowRight } from 'react-icons/fi';

export default function ServicesPage() {
    const services = [
        {
            icon: <FiHome className="text-5xl" />,
            title: "Home Visits",
            description: "Expert doctors and nurses come directly to your home for examinations, treatments, and care.",
            features: ["General Consultation", "Pediatric Care", "Post-op Care", "Geriatric Care"],
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            icon: <FiVideo className="text-5xl" />,
            title: "Virtual Consultations",
            description: "Connect with specialists instantly via secure high-quality video calls from anywhere.",
            features: ["Immediate Access", "Specialist Review", "Prescriptions", "Mental Health"],
            color: "text-purple-600",
            bg: "bg-purple-50"
        },
        {
            icon: <FiActivity className="text-5xl" />,
            title: "Laboratory Services",
            description: "We collect samples from your home and deliver results digitally. fast and hygienic.",
            features: ["Blood Tests", "Urine Analysis", "Check-ups", "Fast Results"],
            color: "text-red-600",
            bg: "bg-red-50"
        },
        {
            icon: <FiPackage className="text-5xl" />,
            title: "Pharmacy Delivery",
            description: "Prescribed medications delivered to your doorstep within hours.",
            features: ["Genuine Meds", "Fast Delivery", "Refill Management", "Consultation"],
            color: "text-green-600",
            bg: "bg-green-50"
        },
        {
            icon: <FiHeart className="text-5xl" />,
            title: "Chronic Disease Management",
            description: "Ongoing support and monitoring for conditions like Diabetes, Hypertension, and more.",
            features: ["Regular Monitoring", "Diet Plans", "Medication Managment", "Lifestyle Coaching"],
            color: "text-orange-600",
            bg: "bg-orange-50"
        },
        {
            icon: <FiPhone className="text-5xl" />,
            title: "Emergency Response",
            description: "24/7 access to ambulance services and emergency medical advice.",
            features: ["Ambulance Dispatch", "First Aid Advice", "Hospital Transfer", "24/7 Hotline"],
            color: "text-gray-800",
            bg: "bg-gray-100"
        }
    ];

    return (
        <main className="bg-white min-h-screen font-sans">
            <Header />

            {/* Hero */}
            <section className="relative bg-[#1D2B36] text-white py-20 overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#C2003F] rounded-full blur-[120px] opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-[120px] opacity-20"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <h1 className="text-5xl lg:text-6xl font-black mb-6 animate-in slide-in-from-bottom duration-700">
                        World-Class <span className="text-[#C2003F]">Services</span>
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
                        Comprehensive healthcare solutions designed around your life. Professional, convenient, and reliable.
                    </p>
                </div>
            </section>

            {/* Services Grid */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((service, idx) => (
                            <div key={idx} className="group bg-white rounded-3xl p-8 border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                                <div className={`w-20 h-20 rounded-2xl ${service.bg} ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    {service.icon}
                                </div>
                                <h3 className="text-2xl font-black text-[#1D2B36] mb-3">{service.title}</h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    {service.description}
                                </p>
                                <ul className="space-y-2">
                                    {service.features.map((feature, fIdx) => (
                                        <li key={fIdx} className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                            <span className={`w-1.5 h-1.5 rounded-full ${service.bg.replace('bg-', 'bg-slate-400 ')}`}></span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-gradient-to-r from-[#C2003F] to-[#FF4D6D] text-white">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-4xl font-black mb-6">Need Medical Doctor?</h2>
                    <p className="text-xl mb-8 opacity-90">
                        Our doctors are ready to see you now. Book an appointment in less than 2 minutes.
                    </p>
                    <Link href="/register/patient" className="inline-flex items-center gap-2 bg-white text-[#C2003F] px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-50 transition-colors shadow-2xl">
                        Book Now <FiArrowRight />
                    </Link>
                </div>
            </section>

            <Footer />
        </main>
    );
}
