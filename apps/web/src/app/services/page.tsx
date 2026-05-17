'use client';

import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import Link from 'next/link';
import { 
    FiHome, 
    FiHeart, 
    FiTruck, 
    FiActivity, 
    FiShield, 
    FiUserCheck, 
    FiArrowRight, 
    FiPhoneCall 
} from 'react-icons/fi';

export default function ServicesPage() {
    const services = [
        {
            icon: <FiHome className="text-5xl" />,
            title: "Medical Home Visit",
            description: "Basic and general medical examinations, diagnostic assessments, and clinical care delivered by fully certified doctors and nurses in your home.",
            features: ["General Consultation", "Pediatric Visits", "Elderly Care Support", "Wound Dressings"],
            color: "text-emerald-600",
            bg: "bg-emerald-50"
        },
        {
            icon: <FiHeart className="text-5xl" />,
            title: "Prenatal Care Visits",
            description: "Routine maternal vitals checkup, blood pressure profiling, weight track, and fetal development assessments managed by experienced midwives.",
            features: ["Fetal Heart Monitoring", "Maternal Vitals Profile", "Dietary Consultation", "Post-Natal Advising"],
            color: "text-emerald-600",
            bg: "bg-emerald-50"
        },
        {
            icon: <FiTruck className="text-5xl" />,
            title: "Medical Evacuation",
            description: "Critically optimized emergency transit with specialized incubator or ventilation configuration for neonates and delicate cases.",
            features: ["ICU Ambulance Dispatch", "Neonatal Evacuation", "Advanced Cardiac Life Support", "Hospital Syncing"],
            color: "text-emerald-600",
            bg: "bg-emerald-50"
        },
        {
            icon: <FiActivity className="text-5xl" />,
            title: "Checkups & Monitoring",
            description: "Proactive healthcare monitoring including routine clinical testing, cholesterol tracking, and comprehensive vital examinations.",
            features: ["Biochemistry Screenings", "Blood Glucose Tracking", "Kidney Function Tests", "Annual Wellness Checks"],
            color: "text-emerald-600",
            bg: "bg-emerald-50"
        },
        {
            icon: <FiShield className="text-5xl" />,
            title: "Specialized Care",
            description: "Clinical coordination programs supporting chronic conditions like diabetes, hypertension, and direct physical therapy assistance.",
            features: ["Diabetes Management", "Hypertension Control", "Home Physiotherapy", "Medication Adherence Tracking"],
            color: "text-emerald-600",
            bg: "bg-emerald-50"
        },
        {
            icon: <FiUserCheck className="text-5xl" />,
            title: "Post Hospitalization Support",
            description: "Structured recovery care post-discharge facilitating home transition comfortably with scheduled nursing assistance.",
            features: ["Suture Removal", "Drain Management", "Physical Rehab Sync", "Home Safety Setup"],
            color: "text-emerald-600",
            bg: "bg-emerald-50"
        }
    ];

    const stats = [
        { label: "Professionalism", value: 98 },
        { label: "Affordability", value: 70 },
        { label: "Convenience", value: 44 },
        { label: "Customer Care", value: 53 }
    ];

    return (
        <main className="bg-white min-h-screen font-sans text-mc-dark">
            <Header />

            {/* --- HERO SECTION --- */}
            <section className="relative bg-gradient-to-b from-[#0B6E40]/10 via-white to-white py-24 overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#0B6E40]/5 rounded-full blur-[100px]" />
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center space-y-6">
                    <div className="inline-flex items-center gap-2 bg-[#0B6E40]/10 text-[#0B6E40] px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider">
                        Tailored Healthcare Solutions
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-heading font-black tracking-tight leading-tight">
                        Our Home-Based <br />
                        <span className="text-[#0B6E40]">Medical Services</span>
                    </h1>
                    <p className="text-lg lg:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        Redefining how healthcare is delivered in Kenya. Bringing clinical excellence, certified medics, and diagnostic services directly to your living space.
                    </p>
                </div>
            </section>

            {/* --- CORE METRICS SECTION --- */}
            <section className="py-12 bg-gray-50">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-10">
                        <h4 className="text-xs uppercase font-black tracking-widest text-gray-400">System Performance Metrics</h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((st, i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center space-y-3">
                                <div className="text-3xl font-black text-[#0B6E40]">{st.value}%</div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">{st.label}</div>
                                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-[#0B6E40] h-full rounded-full transition-all duration-1000" 
                                        style={{ width: `${st.value}%` }} 
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- SERVICES GRID --- */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((service, idx) => (
                            <div 
                                key={idx} 
                                className="group bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between"
                            >
                                <div className="space-y-6">
                                    <div className={`w-20 h-20 rounded-2xl ${service.bg} ${service.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        {service.icon}
                                    </div>
                                    <h3 className="text-2xl font-black text-mc-dark group-hover:text-[#0B6E40] transition-colors">{service.title}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">
                                        {service.description}
                                    </p>
                                    <div className="pt-4 border-t border-gray-50 space-y-2">
                                        {service.features.map((feature, fIdx) => (
                                            <div key={fIdx} className="flex items-center gap-2 text-xs text-gray-600 font-bold">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#0B6E40]" />
                                                {feature}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="pt-8">
                                    <Link 
                                        href="/register/patient" 
                                        className="w-full py-4 bg-gray-50 hover:bg-[#0B6E40] hover:text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                                    >
                                        Request Service <FiArrowRight />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- EMERGENCY & CALLING CTA --- */}
            <section className="py-20 bg-gradient-to-r from-[#0B6E40] to-emerald-950 text-white">
                <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto text-3xl animate-pulse">
                        <FiPhoneCall />
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-heading font-black">Need a Licensed Medic Visit?</h2>
                    <p className="text-lg opacity-90 max-w-xl mx-auto">
                        Our qualified doctors and registered nurses are standing by 24/7 to attend to your medical consultations or home visits.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/register/patient" className="inline-flex items-center justify-center gap-2 bg-white text-[#0B6E40] hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-base shadow-xl">
                            Register Patient Profile <FiArrowRight />
                        </Link>
                        <a href="tel:+254700448448" className="inline-flex items-center justify-center gap-2 border border-white/20 hover:bg-white/10 px-8 py-4 rounded-xl font-bold text-base">
                            Call Emergency Dispatch
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
