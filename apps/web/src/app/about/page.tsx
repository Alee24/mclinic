'use client';

import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import Link from 'next/link';
import { FiTarget, FiUsers, FiAward, FiCheckCircle } from 'react-icons/fi';

export default function AboutPage() {
    return (
        <main className="bg-white min-h-screen font-sans">
            <Header />

            {/* Hero */}
            <section className="relative bg-[#1D2B36] text-white py-24 text-center">
                <div className="max-w-4xl mx-auto px-6">
                    <h1 className="text-5xl lg:text-7xl font-black mb-6">Redefining <span className="text-[#C2003F]">Healthcare</span></h1>
                    <p className="text-xl text-gray-300">
                        M-Clinic is Kenya's leading digital health platform, bridging the gap between patients and quality care through technology and compassion.
                    </p>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-bold text-sm">OUR MISSION</div>
                        <h2 className="text-4xl font-black text-[#1D2B36]">Accessible Quality Healthcare for Everyone</h2>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            We believe that quality healthcare is a fundamental right, not a privilege. By leveraging mobile technology and a network of dedicated professionals, we bring the hospital to your home, saving you time, money, and stress.
                        </p>
                        <div className="space-y-4 pt-4">
                            {[
                                "Reducing hospital congestion",
                                "Empowering patients with data",
                                "Ensuring fair compensation for medics",
                                "24/7 Availability nationwide"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <FiCheckCircle className="text-[#00C65E] text-xl" />
                                    <span className="font-medium text-gray-700">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-gray-100 rounded-3xl h-96 w-full flex items-center justify-center text-gray-400">
                        {/* Placeholder for About Image */}
                        <div className="text-center">
                            <div className="text-6xl mb-2">🏥</div>
                            Placeholder Image
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-20">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { label: "Active Patients", val: "10,000+", icon: <FiUsers /> },
                        { label: "Certified Doctors", val: "500+", icon: <FiAward /> },
                        { label: "Counties Covered", val: "47", icon: <FiTarget /> },
                        { label: "Consultations", val: "50k+", icon: <FiCheckCircle /> },
                    ].map((stat, i) => (
                        <div key={i} className="text-center p-6">
                            <div className="text-[#C2003F] text-3xl mb-4 flex justify-center">{stat.icon}</div>
                            <div className="text-4xl font-black text-[#1D2B36] mb-2">{stat.val}</div>
                            <div className="text-gray-500 font-bold uppercase tracking-wider text-sm">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Team (Simplified) */}
            <section className="py-20 text-center">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-4xl font-black text-[#1D2B36] mb-12">Led by Experts</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto mb-12">
                        Our leadership team combines decades of experience in clinical medicine, technology, and healthcare administration.
                    </p>
                </div>
            </section>

            <Footer />
        </main>
    );
}
