'use client';

import Link from 'next/link';
import { FiArrowRight, FiPlay, FiStar, FiShield, FiHeart, FiZap, FiMapPin, FiCheckCircle } from 'react-icons/fi';
import Image from 'next/image';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import MedicSlider from '@/components/landing/MedicSlider';

export default function Home() {
  return (
    <div className="font-sans text-mc-dark bg-white selection:bg-mc-green/20">
      <Header />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-mc-green/5 blob-shape -z-10 translate-x-1/4 -translate-y-1/4 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-mc-crimson/5 blob-shape -z-10 -translate-x-1/4 translate-y-1/4" />

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-10">
              <div className="inline-flex items-center gap-2 bg-mc-green/10 text-mc-green px-4 py-2 rounded-full text-sm font-bold tracking-wide uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mc-green opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-mc-green"></span>
                </span>
                Professional Healthcare at Your Doorstep
              </div>

              <h1 className="text-6xl lg:text-8xl font-heading font-black leading-[1.05] tracking-tight">
                Discover the <br />
                <span className="text-mc-green">Comprehensive Care</span> <br />
                You Deserve.
              </h1>

              <p className="text-xl text-gray-500 leading-relaxed max-w-xl">
                Experience professional medical care delivered to your home by certified doctors and nurses. 
                Book appointments, get prescriptions, and access lab services—all from your phone.
              </p>

              <div className="flex flex-col sm:flex-row gap-6">
                <Link href="/register/patient" className="group bg-mc-crimson text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl shadow-mc-crimson/30 hover:bg-mc-dark transition-all flex items-center justify-center gap-3">
                  Book Appointment
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/services" className="group glass border-2 border-mc-dark/10 text-mc-dark px-10 py-5 rounded-2xl font-bold text-lg hover:bg-mc-dark hover:text-white transition-all flex items-center justify-center gap-3">
                  <FiPlay className="text-mc-crimson" />
                  How it Works
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-10 pt-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-mc-green/10 flex items-center justify-center text-mc-green">
                    <FiCheckCircle size={24} />
                  </div>
                  <div>
                    <div className="font-bold">Licensed Pros</div>
                    <div className="text-sm text-gray-400">Certified Experts</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-mc-crimson/10 flex items-center justify-center text-mc-crimson">
                    <FiShield size={24} />
                  </div>
                  <div>
                    <div className="font-bold">100% Secure</div>
                    <div className="text-sm text-gray-400">Privacy First</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Image - The Overlapping Blob Design */}
            <div className="relative">
              <div className="relative z-10 blob-shape overflow-hidden border-8 border-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)]">
                <img
                  src="file:///C:/Users/Metto/.gemini/antigravity/brain/de6d0fae-10f9-4104-961c-09ac16fa81c3/hero_medical_blob_1778089773313.png"
                  alt="M-Clinic Healthcare Professionals"
                  className="w-full aspect-square object-cover"
                />
              </div>
              {/* Floating Badge */}
              <div className="absolute top-10 -right-4 z-20 bg-mc-green text-white px-6 py-3 rounded-full font-black text-sm shadow-xl animate-bounce">
                DOCTOR ON CALL
              </div>
              {/* Background Shapes */}
              <div className="absolute -top-10 -left-10 w-full h-full bg-mc-crimson/10 blob-shape -z-10 rotate-12" />
              <div className="absolute -bottom-10 -right-10 w-full h-full bg-mc-green/10 blob-shape -z-10 -rotate-12" />
            </div>
          </div>
        </div>
      </section>

      {/* --- SERVICES SECTION --- */}
      <section className="py-32 bg-mc-light">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="space-y-4">
              <h2 className="text-mc-crimson font-black text-xl uppercase tracking-widest">Services</h2>
              <h3 className="text-5xl lg:text-6xl font-heading font-black">All-in-one healthcare.</h3>
            </div>
            <p className="text-xl text-gray-400 max-w-md leading-relaxed">
              M-Clinic provides complete provider enrollment and credentialing services to ensure you get the best care.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {[
              { title: 'Make an Appointment', icon: <FiHeart />, color: 'bg-mc-green', text: 'Appointments' },
              { title: 'Online Pharmacy', icon: <FiZap />, color: 'bg-mc-crimson', text: 'Pharmacy' },
              { title: "Doctor's Community", icon: <FiStar />, color: 'bg-mc-dark', text: 'Community' },
            ].map((s, i) => (
              <div key={i} className="group relative bg-white rounded-[3rem] p-12 h-[500px] flex flex-col justify-between overflow-hidden shadow-xl hover:shadow-2xl transition-all premium-card border border-gray-100">
                {/* Vertical Label */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-full flex items-center bg-mc-dark text-white p-4 uppercase font-black text-xs tracking-widest [writing-mode:vertical-lr] rotate-180 opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn More
                </div>

                <div className={`w-20 h-20 rounded-3xl ${s.color} text-white flex items-center justify-center text-4xl shadow-lg group-hover:scale-110 transition-transform`}>
                  {s.icon}
                </div>

                <div className="space-y-6">
                  <h4 className="text-4xl font-heading font-black leading-tight">
                    {s.title}
                  </h4>
                  <div className="flex items-center gap-4">
                    <button className="w-12 h-12 rounded-full border-2 border-mc-dark flex items-center justify-center group-hover:bg-mc-dark group-hover:text-white transition-all">
                      <FiHeart />
                    </button>
                    <button className="w-12 h-12 rounded-full border-2 border-mc-dark flex items-center justify-center group-hover:bg-mc-dark group-hover:text-white transition-all">
                      +
                    </button>
                  </div>
                </div>

                {/* Decorative Blob */}
                <div className={`absolute -bottom-10 -right-10 w-40 h-40 ${s.color} opacity-5 blob-shape group-hover:scale-150 transition-transform`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- DOCTORS SECTION --- */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h3 className="text-5xl lg:text-6xl font-heading font-black mb-20">All the top doctors in one place</h3>
          
          <MedicSlider />
        </div>
      </section>

      {/* --- TESTIMONIALS --- */}
      <section className="py-32 bg-mc-dark text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-mc-green/10 blob-shape" />
        
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <h3 className="text-5xl lg:text-7xl font-heading font-black leading-tight">
              Real Stories from <br /> Our Families.
            </h3>
            <p className="text-xl text-gray-400 leading-relaxed">
              Trusted by thousands of families across Kenya for professional, compassionate healthcare delivered right to their doorstep.
            </p>
            <div className="flex gap-4">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} className="w-12 h-12 rounded-full border-4 border-mc-dark" alt="User" />
                ))}
              </div>
              <div className="text-sm">
                <div className="font-bold">10k+ Happy Patients</div>
                <div className="flex text-yellow-400"><FiStar /><FiStar /><FiStar /><FiStar /><FiStar /></div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="glass p-12 rounded-[3rem] space-y-8 relative z-10 border-white/10">
              <div className="text-mc-green text-6xl font-serif">"</div>
              <p className="text-2xl font-medium leading-relaxed italic text-white/90">
                M-Clinic sent a nurse to my home within 2 hours. My elderly mother got the care she needed without any hospital stress. Truly lifesaving service!
              </p>
              <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                <div className="w-12 h-12 rounded-full bg-mc-green/20 overflow-hidden">
                  <img src="https://i.pravatar.cc/100?img=32" alt="Amina" />
                </div>
                <div>
                  <div className="font-black">Amina Wanjiku</div>
                  <div className="text-mc-green text-sm">Nairobi, Kenya</div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-full h-full bg-mc-crimson/20 blob-shape -z-10" />
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-r from-mc-crimson to-mc-accent rounded-[3.5rem] p-16 lg:p-24 text-white text-center relative overflow-hidden group">
            {/* Animated Blobs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blob-shape -z-10 animate-slow-pulse" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 blob-shape -z-10" />

            <div className="relative z-10 space-y-10">
              <h2 className="text-5xl lg:text-7xl font-heading font-black leading-tight">
                Ready to Experience <br /> Better Healthcare?
              </h2>
              <p className="text-xl opacity-80 max-w-2xl mx-auto">
                Join thousands of families who trust M-Clinic for their healthcare needs. Professional care is just a click away.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/register/patient" className="bg-white text-mc-crimson px-12 py-6 rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-xl">
                  Get Started Free
                </Link>
                <Link href="/contact" className="glass border-white/20 text-white px-12 py-6 rounded-2xl font-black text-xl hover:bg-white hover:text-mc-crimson transition-all">
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
