'use client';

import Link from 'next/link';
import { FiCheckCircle, FiTruck, FiBox, FiTrendingUp, FiShield, FiDollarSign, FiActivity, FiArrowRight } from 'react-icons/fi';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';

export default function LogisticsPage() {
    return (
        <div className="font-sans text-mc-dark bg-white selection:bg-mc-green/20">
            <Header />

            {/* --- HERO SECTION --- */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-b from-[#0B6E40]/5 via-white to-white">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#0B6E40]/5 blob-shape -z-10 translate-x-1/4 -translate-y-1/4 animate-pulse" />
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left Content */}
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 bg-[#0B6E40]/10 text-[#0B6E40] px-4 py-2 rounded-full text-sm font-bold tracking-wide uppercase">
                                <FiTruck className="animate-bounce" />
                                Countrywide Logistics Network
                            </div>

                            <h1 className="text-5xl lg:text-7xl font-heading font-black leading-[1.1] tracking-tight">
                                Healthcare Supplies <br />
                                <span className="text-[#0B6E40]">& Safe Logistics</span>
                            </h1>

                            <p className="text-lg text-gray-500 leading-relaxed max-w-xl">
                                From pharmaceutical manufacturers to hospital shelves and patient doorsteps, M-Clinic ensures the timely, safe, and cold-chain regulated delivery of medical products across Kenya. 
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link 
                                    href="/contact" 
                                    className="bg-[#0B6E40] text-white px-8 py-4 rounded-xl font-bold text-base shadow-xl shadow-emerald-950/20 hover:bg-mc-dark transition-all flex items-center justify-center gap-3"
                                >
                                    Partner with Us
                                    <FiArrowRight />
                                </Link>
                                <a 
                                    href="#pillars" 
                                    className="border border-gray-200 text-mc-dark bg-gray-50 hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2"
                                >
                                    Explore Solutions
                                </a>
                            </div>
                        </div>

                        {/* Right Content - Visual Representation */}
                        <div className="relative">
                            <div className="relative z-10 rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80"
                                    alt="Medical logistics and supply warehouse"
                                    className="w-full aspect-[4/3] object-cover"
                                />
                            </div>
                            {/* Decorative Blobs */}
                            <div className="absolute -top-6 -left-6 w-full h-full bg-[#0B6E40]/10 rounded-[3rem] -z-10 rotate-3" />
                            <div className="absolute -bottom-6 -right-6 w-full h-full bg-gray-100 rounded-[3rem] -z-10 -rotate-3" />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- METRICS / STATS SECTION --- */}
            <section className="py-12 bg-[#0B6E40]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
                        <div className="space-y-2">
                            <div className="text-4xl lg:text-5xl font-black">100%</div>
                            <div className="text-xs uppercase font-bold text-emerald-100 tracking-wider">Cold-Chain Maintained</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-4xl lg:text-5xl font-black">38+</div>
                            <div className="text-xs uppercase font-bold text-emerald-100 tracking-wider">Counties Covered</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-4xl lg:text-5xl font-black">12-Hour</div>
                            <div className="text-xs uppercase font-bold text-emerald-100 tracking-wider">Average Turnaround</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-4xl lg:text-5xl font-black">WHO</div>
                            <div className="text-xs uppercase font-bold text-emerald-100 tracking-wider">MOH Standard Compliant</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- PILLARS SECTION --- */}
            <section id="pillars" className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
                        <h2 className="text-[#0B6E40] font-black text-sm uppercase tracking-widest">Our Operations</h2>
                        <h3 className="text-4xl lg:text-5xl font-heading font-black">Dynamic Supply Chain Pillars</h3>
                        <p className="text-gray-500">
                            We manage the entire lifecycle of pharmaceutical supply logistics using specialized handling protocols and advanced digital tracking tools.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <FiBox className="text-2xl" />,
                                title: "Product Flow Management",
                                desc: "Dynamic coordination from manufacturing units to hospitals, eliminating intermediate transfer lags and ensuring zero downtime on critical drugs."
                            },
                            {
                                icon: <FiActivity className="text-2xl" />,
                                title: "Specialized Storage & Handling",
                                desc: "Rigorous cold chain warehousing and transport monitoring for temperature-sensitive biologicals, vaccines, and insulin."
                            },
                            {
                                icon: <FiTrendingUp className="text-2xl" />,
                                title: "Inventory Management",
                                desc: "Smart tracking with live API notifications to prevent pharmaceutical stockouts and minimize operational overstock costs."
                            },
                            {
                                icon: <FiShield className="text-2xl" />,
                                title: "Risk Management & Security",
                                desc: "Comprehensive continuous vehicle tracking and proactive re-routing mechanisms to safeguard deliveries from transit anomalies."
                            },
                            {
                                icon: <FiDollarSign className="text-2xl" />,
                                title: "Cost-Efficiency Optimization",
                                desc: "Innovative path-finding algorithms and grouped shipping models that keep supply distribution extremely affordable."
                            },
                            {
                                icon: <FiCheckCircle className="text-2xl" />,
                                title: "Quality Assurance Compliance",
                                desc: "Strict alignment with Kenya Pharmacy and Poisons Board, MOH, and WHO guidelines for safe pharmaceutical storage and carriage."
                            }
                        ].map((pillar, i) => (
                            <div key={i} className="bg-white rounded-[2rem] p-8 border border-gray-100 hover:shadow-xl transition-all space-y-6">
                                <div className="w-14 h-14 rounded-2xl bg-[#0B6E40]/10 text-[#0B6E40] flex items-center justify-center">
                                    {pillar.icon}
                                </div>
                                <h4 className="text-xl font-bold">{pillar.title}</h4>
                                <p className="text-sm text-gray-500 leading-relaxed">{pillar.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- PARTNERSHIP CTA --- */}
            <section className="py-20">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="bg-[#0B6E40] rounded-[3rem] p-12 lg:p-20 text-white text-center space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 blob-shape -z-10" />
                        <h2 className="text-3xl lg:text-5xl font-heading font-black">Optimizing Medical Supply Lines</h2>
                        <p className="text-emerald-100/80 max-w-xl mx-auto text-base lg:text-lg leading-relaxed">
                            Are you a manufacturer, medical retailer, or hospital system looking for bulletproof medical logistics? Partner with M-Clinic for premium, technology-driven solutions.
                        </p>
                        <div className="flex justify-center">
                            <Link href="/contact" className="bg-white text-[#0B6E40] hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-base transition-all">
                                Request Partnership Consult
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
