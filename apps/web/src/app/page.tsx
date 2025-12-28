'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FiPhone, FiMail, FiClock, FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiMenu, FiX, FiCheckCircle } from 'react-icons/fi';

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="font-sans text-gray-800 bg-white">
      {/* Top Bar */}
      <div className="bg-[#1D2B36] text-white text-xs py-3 px-6 hidden lg:flex justify-between items-center">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2"><FiPhone className="text-[#00C65E]" /> +254 700 448 448</span>
          <span className="flex items-center gap-2"><FiMail className="text-[#00C65E]" /> info@mclinic.co.ke</span>
          <span className="flex items-center gap-2"><FiClock className="text-[#00C65E]" /> Always Open</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="opacity-80 hover:text-[#00C65E] cursor-pointer"><FiFacebook /></span>
          <span className="opacity-80 hover:text-[#00C65E] cursor-pointer"><FiTwitter /></span>
          <span className="opacity-80 hover:text-[#00C65E] cursor-pointer"><FiInstagram /></span>
          <span className="opacity-80 hover:text-[#00C65E] cursor-pointer"><FiLinkedin /></span>
        </div>
      </div>

      {/* Navbar */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-white py-4'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="text-2xl font-extrabold tracking-tight text-[#1D2B36] flex items-center gap-2">
            <div className="w-8 h-8 bg-[#00C65E] rounded-full flex items-center justify-center text-white">M</div>
            M-Clinic
          </div>

          {/* Desktop Modules */}
          <div className="hidden lg:flex items-center gap-8 font-medium text-sm text-[#1D2B36]">
            <Link href="/" className="hover:text-[#C2003F] transition">Home</Link>
            <Link href="#about" className="hover:text-[#C2003F] transition">About Us</Link>
            <Link href="#services" className="hover:text-[#C2003F] transition">Our Services</Link>
            <Link href="#supplies" className="hover:text-[#C2003F] transition">Supplies</Link>
            <Link href="#contact" className="hover:text-[#C2003F] transition">Contact Us</Link>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <Link href="/login" className="font-bold text-sm hover:text-[#C2003F] transition">
              Provider Login
            </Link>
            <Link href="/verify" className="font-bold text-sm text-[#00C65E] hover:text-[#009E4B] transition flex items-center gap-1">
              <FiCheckCircle /> Verify Rx
            </Link>
            <Link href="/register/patient" className="bg-[#C2003F] text-white px-6 py-3 rounded-full font-bold text-sm shadow-lg shadow-red-900/10 hover:bg-[#A00033] transition transform hover:scale-105">
              BOOK APPOINTMENT
            </Link>
          </div>

          {/* Mobile Menu Icon */}
          <button className="lg:hidden text-2xl" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t p-6 flex flex-col gap-4 animate-in slide-in-from-top-2">
            <Link href="/" className="py-2 border-b">Home</Link>
            <Link href="#about" className="py-2 border-b">About Us</Link>
            <Link href="#services" className="py-2 border-b">Services</Link>
            <Link href="/login" className="py-2 border-b font-bold text-[#C2003F]">Provider Login</Link>
            <Link href="/register/patient" className="bg-[#C2003F] text-white py-3 rounded text-center font-bold">Book Appointment</Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gray-50 min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent z-10"></div>
          {/* Placeholder for Hero Image */}
          <img src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&q=80&w=2091" alt="Doctor" className="w-full h-full object-cover object-center" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-20 w-full">
          <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-block px-4 py-1 bg-green-100 text-[#00C65E] font-bold text-xs rounded-full mb-6 tracking-wide uppercase">
              Trusted Healthcare Provider in Kenya
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-[#1D2B36] leading-tight mb-6">
              Healthcare at your <br />
              <span className="text-[#C2003F]">Doorstep.</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Professional, licensed medical care delivered to your home or office.
              Experience our compromising standard of healthcare with modern technology and compassion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register/patient" className="px-8 py-4 bg-[#C2003F] text-white rounded-full font-bold shadow-xl hover:bg-[#A00033] transition flex items-center justify-center gap-2">
                Book a Visit
              </Link>
              <Link href="#services" className="px-8 py-4 bg-white text-[#1D2B36] border border-gray-200 rounded-full font-bold hover:bg-gray-50 transition flex items-center justify-center">
                Our Services
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-8 opacity-80 grayscale hover:grayscale-0 transition-all duration-500 hidden sm:flex">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Trusted By</div>
              <div className="font-bold text-xl text-gray-300">Minet</div>
              <div className="font-bold text-xl text-gray-300">AAR</div>
              <div className="font-bold text-xl text-gray-300">Jubilee</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-[#1D2B36] text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center md:divide-x md:divide-white/10">
            <div className="p-4">
              <div className="text-4xl font-extrabold text-[#00C65E] mb-2">30+</div>
              <div className="text-sm uppercase tracking-widest opacity-80">Medical Specialties</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-extrabold text-[#00C65E] mb-2">47</div>
              <div className="text-sm uppercase tracking-widest opacity-80">Counties Covered</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-extrabold text-[#00C65E] mb-2">250+</div>
              <div className="text-sm uppercase tracking-widest opacity-80">Ambulances</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-extrabold text-[#00C65E] mb-2">13k+</div>
              <div className="text-sm uppercase tracking-widest opacity-80">Medical Pros</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-[#C2003F] font-bold uppercase tracking-widest text-sm mb-3">Our Services</h2>
            <h3 className="text-3xl lg:text-4xl font-black text-[#1D2B36] mb-6">Experience Top-Quality Health Care At Your Door Step</h3>
            <p className="text-gray-600">We offer a wide range of medical services to ensure you get the care you need, when you need it.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <ServiceCard
              title="Medical Home Visits"
              desc="Comprehensive medical consultations and treatments in the comfort of your home."
              icon={<FiCheckCircle className="text-4xl text-[#C2003F]" />}
            />
            <ServiceCard
              title="Virtual Consultations"
              desc="Secure, private, and convenient video consultations with top specialists."
              icon={<FiCheckCircle className="text-4xl text-[#00C65E]" />}
            />
            <ServiceCard
              title="Medical Escort"
              desc="Professional medical accompaniment for patients during travel and transfers."
              icon={<FiCheckCircle className="text-4xl text-[#C2003F]" />}
            />
            <ServiceCard
              title="Healthcare Supplies"
              desc="Quality medical equipment and consumables delivered to your facility."
              icon={<FiCheckCircle className="text-4xl text-[#00C65E]" />}
            />
            <ServiceCard
              title="Pharmacy Delivery"
              desc="Prescription medications delivered rapidly to your location."
              icon={<FiCheckCircle className="text-4xl text-[#C2003F]" />}
            />
            <ServiceCard
              title="Lab Services"
              desc="Professional sample collection and digital results delivery."
              icon={<FiCheckCircle className="text-4xl text-[#00C65E]" />}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#15202B] text-gray-400 py-20 px-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="text-white text-2xl font-bold mb-6 flex items-center gap-2">
              <div className="w-8 h-8 bg-[#00C65E] rounded-full flex items-center justify-center text-white text-base">M</div>
              M-Clinic
            </div>
            <p className="max-w-md leading-relaxed mb-8">
              We are redefining healthcare accessibility in Kenya. By leveraging technology and a vast network of professionals,
              we ensure quality care is available to everyone, everywhere.
            </p>
            <div className="flex gap-4">
              {/* Socials */}
              <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-[#C2003F] hover:text-white transition cursor-pointer"><FiFacebook /></div>
              <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-[#C2003F] hover:text-white transition cursor-pointer"><FiTwitter /></div>
              <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-[#C2003F] hover:text-white transition cursor-pointer"><FiInstagram /></div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Quick Links</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/" className="hover:text-[#00C65E] transition">Home</Link></li>
              <li><Link href="#about" className="hover:text-[#00C65E] transition">About Us</Link></li>
              <li><Link href="#services" className="hover:text-[#00C65E] transition">Our Services</Link></li>
              <li><Link href="/login" className="hover:text-[#00C65E] transition">Provider Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Contact Us</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <FiPhone className="mt-1 text-[#00C65E]" />
                <span>+254 700 448 448</span>
              </li>
              <li className="flex items-start gap-3">
                <FiMail className="mt-1 text-[#00C65E]" />
                <span>info@mclinic.co.ke</span>
              </li>
              <li className="flex items-start gap-3">
                <FiClock className="mt-1 text-[#00C65E]" />
                <span>Always Open (24/7)</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 pt-8 text-center text-sm">
          &copy; {new Date().getFullYear()} M-Clinic Kenya. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function ServiceCard({ title, desc, icon }: any) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <div className="mb-6 bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-[#1D2B36] mb-3">{title}</h3>
      <p className="text-gray-500 leading-relaxed text-sm">
        {desc}
      </p>
    </div>
  );
}
