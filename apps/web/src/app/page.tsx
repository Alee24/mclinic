'use client';

import Link from 'next/link';
import { 
    FiArrowRight, 
    FiPlay, 
    FiStar, 
    FiShield, 
    FiHeart, 
    FiCheckCircle, 
    FiTruck, 
    FiMapPin, 
    FiActivity, 
    FiClock, 
    FiPhoneCall 
} from 'react-icons/fi';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import MedicSlider from '@/components/landing/MedicSlider';

export default function Home() {
    return (
        <div className="font-sans text-mc-dark bg-white selection:bg-emerald-500/20">
            <Header />

            {/* --- EMERGENCY BANNER --- */}
            <div className="fixed bottom-6 left-6 z-40 max-w-sm glass bg-white/90 border border-emerald-100 rounded-3xl p-6 shadow-2xl flex items-center gap-4 animate-fade-in group">
                <div className="w-12 h-12 rounded-2xl bg-[#0B6E40] text-white flex items-center justify-center flex-shrink-0 animate-pulse">
                    <FiPhoneCall size={20} />
                </div>
                <div className="flex-grow">
                    <div className="text-xs uppercase font-black tracking-widest text-[#0B6E40]">Emergency Call & Bookings</div>
                    <a href="tel:+254700448448" className="font-black text-lg hover:text-[#0B6E40] transition-colors">+254 700 448 448</a>
                </div>
            </div>

            {/* --- HERO SECTION --- */}
            <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-36 overflow-hidden bg-gradient-to-b from-[#0B6E40]/5 via-white to-white">
                {/* Visual Blobs */}
                <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-[#0B6E40]/5 blob-shape -z-10 translate-x-1/4 -translate-y-1/4 animate-slow-pulse" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-50 blob-shape -z-10 -translate-x-1/4 translate-y-1/4" />

                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-12 gap-16 items-center">
                        {/* Left Content */}
                        <div className="lg:col-span-7 space-y-8">
                            <div className="inline-flex items-center gap-2 bg-[#0B6E40]/10 text-[#0B6E40] px-4 py-2 rounded-full text-sm font-bold tracking-wide uppercase">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0B6E40]"></span>
                                </span>
                                Trusted Healthcare Provider in Kenya
                            </div>

                            <h1 className="text-5xl lg:text-7xl font-heading font-black leading-[1.05] tracking-tight text-mc-dark">
                                Comprehensive <br />
                                <span className="text-[#0B6E40]">Home-Based</span> <br />
                                Medical Care.
                            </h1>

                            <p className="text-lg lg:text-xl text-gray-500 leading-relaxed max-w-xl">
                                We are dedicated to providing you with the highest quality of healthcare, tailored to meet your individual needs right in the comfortable sanctuary of your home.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link 
                                    href="/register/patient" 
                                    className="group bg-[#0B6E40] text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl shadow-emerald-950/20 hover:bg-mc-dark transition-all flex items-center justify-center gap-3"
                                >
                                    Book Appointment
                                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link 
                                    href="/services" 
                                    className="group glass border border-gray-200 text-mc-dark px-10 py-5 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <FiPlay className="text-[#0B6E40]" />
                                    How It Works
                                </Link>
                            </div>

                            {/* Trust Badge Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-10 border-t border-gray-100">
                                <div>
                                    <div className="text-3xl font-black text-mc-dark">36+</div>
                                    <div className="text-xs text-gray-400 uppercase font-black tracking-wider mt-1">Specialties</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-black text-mc-dark">38+</div>
                                    <div className="text-xs text-gray-400 uppercase font-black tracking-wider mt-1">Counties Covered</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-black text-mc-dark">320+</div>
                                    <div className="text-xs text-gray-400 uppercase font-black tracking-wider mt-1">Ambulances</div>
                                </div>
                            </div>
                        </div>

                        {/* Right Content - Visual Representation */}
                        <div className="lg:col-span-5 relative">
                            <div className="relative z-10 blob-shape overflow-hidden border-8 border-white shadow-[0_50px_100px_-20px_rgba(11,110,64,0.15)] bg-emerald-50">
                                <img
                                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80"
                                    alt="Expert Medical Consultation"
                                    className="w-full aspect-square object-cover mix-blend-multiply"
                                />
                            </div>
                            {/* Float Badges */}
                            <div className="absolute top-10 -right-4 z-20 bg-[#0B6E40] text-white px-6 py-3 rounded-full font-black text-sm shadow-xl flex items-center gap-2 animate-bounce">
                                <FiActivity /> DOCTOR ON CALL
                            </div>
                            <div className="absolute bottom-10 -left-6 z-20 bg-white border border-emerald-100 px-6 py-4 rounded-3xl shadow-xl flex items-center gap-3">
                                <FiClock className="text-[#0B6E40]" size={24} />
                                <div>
                                    <div className="font-black text-sm">24/7 Service</div>
                                    <div className="text-xs text-gray-400">Always active for you</div>
                                </div>
                            </div>
                            <div className="absolute -top-10 -left-10 w-full h-full bg-[#0B6E40]/10 blob-shape -z-10 rotate-12" />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CORE SERVICES SECTION --- */}
            <section className="py-28 bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                        <div className="space-y-4">
                            <h2 className="text-[#0B6E40] font-black text-sm uppercase tracking-widest">Medical Solutions</h2>
                            <h3 className="text-4xl lg:text-5xl font-heading font-black">Our Home-Based Care</h3>
                        </div>
                        <p className="text-lg text-gray-500 max-w-md leading-relaxed">
                            Empowering individuals by bringing standard clinical expertise and hospital-level procedures to the comfort of your living space.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Medical Home Visit",
                                desc: "Comprehensive primary clinical checks, blood tests, and general medical therapy administered by fully registered medics.",
                                link: "/register/patient"
                            },
                            {
                                title: "Prenatal Care Visits",
                                desc: "Dedicated home follow-ups monitoring maternal vitals, weight cycles, and fetal development curves safely.",
                                link: "/register/patient"
                            },
                            {
                                title: "Medical Evacuation",
                                desc: "Swift, safe emergency transfer with ICU configuration for neonatal and critical patients to prime hospitals.",
                                link: "/register/patient"
                            },
                            {
                                title: "Routine Checkups & Monitoring",
                                desc: "Proactive, routine laboratory screening and health metrics tracking for aged patients or chronic conditions.",
                                link: "/register/patient"
                            },
                            {
                                title: "Specialized Care",
                                desc: "Advanced physical therapy, post-operative clinical assistance, and specific chronic care programs.",
                                link: "/register/patient"
                            },
                            {
                                title: "Post Hospitalization Support",
                                desc: "Ensuring structured comfort recovery at home post-discharge with scheduled clinical nurse visitations.",
                                link: "/register/patient"
                            }
                        ].map((srv, idx) => (
                            <div key={idx} className="group bg-white rounded-[2rem] p-10 border border-gray-100 hover:shadow-2xl transition-all space-y-6 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="w-12 h-12 rounded-xl bg-[#0B6E40]/10 text-[#0B6E40] flex items-center justify-center text-xl font-black">
                                        0{idx + 1}
                                    </div>
                                    <h4 className="text-2xl font-bold group-hover:text-[#0B6E40] transition-colors">{srv.title}</h4>
                                    <p className="text-sm text-gray-500 leading-relaxed">{srv.desc}</p>
                                </div>
                                <div className="pt-4">
                                    <Link href={srv.link} className="inline-flex items-center gap-2 font-bold text-sm text-[#0B6E40] hover:text-mc-dark transition-colors">
                                        Book Services <FiArrowRight />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- MEDICS LOOPING CAROUSEL --- */}
            <section className="py-28 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <div className="max-w-2xl mx-auto mb-16 space-y-4">
                        <h2 className="text-[#0B6E40] font-black text-sm uppercase tracking-widest">Medical Professionals</h2>
                        <h3 className="text-4xl lg:text-5xl font-heading font-black">Top Verified Doctors & Nurses</h3>
                        <p className="text-gray-500">
                            Our network consists of certified and vetted nurses, clinicians, and specialists ready to provide premium healthcare.
                        </p>
                    </div>

                    <MedicSlider />
                </div>
            </section>

            {/* --- PARTNERS PAGE GRID --- */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                        <h2 className="text-[#0B6E40] font-black text-sm uppercase tracking-widest">Collaborations</h2>
                        <h3 className="text-4xl font-heading font-black">Our Esteemed Partners</h3>
                        <p className="text-gray-500 text-sm">
                            Working hand-in-hand with leading medical and legal entities in Kenya to ensure regulatory compliance and uncompromised care.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
                        {[
                            { name: "Nairobi West Hospital", type: "Clinical Partner" },
                            { name: "Marie Stopes Kenya", type: "Reproductive Health" },
                            { name: "NNAK", type: "Nurses Association" },
                            { name: "Equity Afia", type: "Medical Center" },
                            { name: "Analight Labs", type: "Diagnostic Lab" },
                            { name: "Lando Advocates", type: "Legal Counsel" },
                            { name: "Mother & Child", type: "Maternal Care" }
                        ].map((partner, i) => (
                            <div 
                                key={i} 
                                className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col justify-center items-center text-center space-y-3 hover:shadow-lg transition-all"
                            >
                                <div className="w-12 h-12 rounded-full bg-[#0B6E40]/10 text-[#0B6E40] flex items-center justify-center font-black text-lg">
                                    {partner.name[0]}
                                </div>
                                <div>
                                    <div className="font-bold text-xs text-mc-dark leading-tight">{partner.name}</div>
                                    <div className="text-[10px] text-gray-400 mt-1">{partner.type}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- LOGISTICS HIGHLIGHT --- */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="relative">
                            <div className="relative z-10 rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl">
                                <img 
                                    src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80" 
                                    alt="M-Clinic Medical Logistics"
                                    className="w-full aspect-[4/3] object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-6 -left-6 w-full h-full bg-[#0B6E40]/15 rounded-[3rem] -z-10 rotate-3" />
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-[#0B6E40] font-black text-sm uppercase tracking-widest">Supply Chain & Logistics</h2>
                            <h3 className="text-4xl lg:text-5xl font-heading font-black">Cold Chain Pharmaceutical Delivery</h3>
                            <p className="text-gray-500 leading-relaxed">
                                We manage the seamless transit of critical therapeutics and essential laboratory equipment countrywide. Under rigorous temperature control and continuous tracking, we ensure complete quality preservation from manufacturer to consumer.
                            </p>
                            <div className="space-y-4 pt-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-6 h-6 rounded-full bg-[#0B6E40]/10 text-[#0B6E40] flex items-center justify-center flex-shrink-0 mt-1"><FiCheckCircle size={14} /></div>
                                    <p className="text-sm font-bold text-gray-600">WHO & MoH Certified Cold-Chain Storage</p>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-6 h-6 rounded-full bg-[#0B6E40]/10 text-[#0B6E40] flex items-center justify-center flex-shrink-0 mt-1"><FiCheckCircle size={14} /></div>
                                    <p className="text-sm font-bold text-gray-600">Proactive Route Management & Dispatch Security</p>
                                </div>
                            </div>
                            <div className="pt-6">
                                <Link href="/healthcare-supplies-logistics" className="bg-[#0B6E40] text-white px-8 py-4 rounded-xl font-bold hover:bg-mc-dark transition-all inline-flex items-center gap-2">
                                    View Logistics Details <FiArrowRight />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- TESTIMONIALS --- */}
            <section className="py-28 bg-mc-dark text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#0B6E40]/10 blob-shape -z-10" />
                
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-6">
                        <h3 className="text-4xl lg:text-6xl font-heading font-black leading-tight text-white">
                            What Our Patients Say
                        </h3>
                        <p className="text-lg text-gray-400 leading-relaxed">
                            M-Clinic is trusted by hundreds of families across Kenya to deliver compassionate, high-quality, and completely seamless clinical support in their homes.
                        </p>
                        <div className="flex items-center gap-4 pt-4">
                            <div className="flex text-yellow-400"><FiStar /><FiStar /><FiStar /><FiStar /><FiStar /></div>
                            <span className="text-sm text-gray-400 font-bold">5.0 Star Rated Care</span>
                        </div>
                    </div>

                    <div className="glass p-12 rounded-[2.5rem] border border-white/10 relative">
                        <p className="text-xl font-medium leading-relaxed italic text-white/95">
                            "I loved the service, it was very seamless and my mom received her care comfortably at home. The Doctor was professional, compassionate, and arrived within 24 hours!"
                        </p>
                        <div className="flex items-center gap-4 pt-8 mt-8 border-t border-white/10">
                            <div className="w-12 h-12 rounded-full bg-[#0B6E40]/20 flex items-center justify-center font-black text-[#0B6E40]">
                                NB
                            </div>
                            <div>
                                <div className="font-black text-white">N. B. (Patient's Child)</div>
                                <div className="text-[#0B6E40] text-sm font-bold">Nairobi, Kenya</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FINAL CALL TO ACTION --- */}
            <section className="py-24">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="bg-gradient-to-r from-[#0B6E40] to-emerald-950 rounded-[3.5rem] p-16 lg:p-24 text-white text-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 blob-shape -z-10" />
                        <div className="relative z-10 space-y-8">
                            <h2 className="text-4xl lg:text-6xl font-heading font-black">
                                Ready to Experience <br /> Better Healthcare?
                            </h2>
                            <p className="text-lg text-emerald-100 max-w-xl mx-auto leading-relaxed">
                                Join our rapidly expanding technology-powered care network. Professional, compassionate clinical visits are only a few clicks away.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                                <Link href="/register/patient" className="bg-white text-[#0B6E40] px-10 py-5 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-xl">
                                    Register & Book Now
                                </Link>
                                <Link href="/contact" className="glass border-white/20 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white hover:text-[#0B6E40] transition-all">
                                    Contact Us
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
