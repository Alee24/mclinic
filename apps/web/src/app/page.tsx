'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FiPhone, FiMail, FiClock, FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiMenu, FiX, FiCheckCircle } from 'react-icons/fi';
import InstallPWA from '../components/InstallPWA';
import InstallInstructions from '../components/InstallInstructions';
import { usePWA } from '@/providers/PWAProvider';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { install } = usePWA();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="font-sans text-gray-800 dark:text-gray-200 bg-white dark:bg-background transition-colors duration-300">
      {/* Top Bar */}
      <div className="bg-[#1D2B36] text-white text-xs py-3 px-6 hidden lg:flex justify-between items-center z-50 relative">
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
      <nav className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-white dark:bg-gray-900 shadow-md py-2 border-b dark:border-gray-800' : 'bg-white dark:bg-gray-900 py-4'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="text-2xl font-extrabold tracking-tight text-[#1D2B36] dark:text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-[#00C65E] rounded-full flex items-center justify-center text-white">M</div>
            M-Clinic
          </div>

          {/* Desktop Modules */}
          <div className="hidden lg:flex items-center gap-8 font-medium text-sm text-[#1D2B36] dark:text-gray-300">
            <Link href="/" className="hover:text-[#C2003F] dark:hover:text-[#00C65E] transition">Home</Link>
            <Link href="#about" className="hover:text-[#C2003F] dark:hover:text-[#00C65E] transition">About Us</Link>
            <Link href="#services" className="hover:text-[#C2003F] dark:hover:text-[#00C65E] transition">Our Services</Link>
            <Link href="#supplies" className="hover:text-[#C2003F] dark:hover:text-[#00C65E] transition">Supplies</Link>
            <Link href="#contact" className="hover:text-[#C2003F] dark:hover:text-[#00C65E] transition">Contact Us</Link>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login" className="font-bold text-sm hover:text-[#C2003F] dark:text-white dark:hover:text-[#00C65E] transition">
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
          <div className="flex items-center gap-4 lg:hidden">
            <ThemeToggle />
            <button className="text-2xl dark:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white dark:bg-gray-900 shadow-xl border-t dark:border-gray-800 p-6 flex flex-col gap-4 animate-in slide-in-from-top-2 z-50">
            <Link href="/" className="py-2 border-b dark:border-gray-800 dark:text-white">Home</Link>
            <Link href="#about" className="py-2 border-b dark:border-gray-800 dark:text-white">About Us</Link>
            <Link href="#services" className="py-2 border-b dark:border-gray-800 dark:text-white">Services</Link>
            <Link href="/login" className="py-2 border-b dark:border-gray-800 font-bold text-[#C2003F]">Provider Login</Link>

            {/* Install PWA Button */}
            <button
              onClick={install}
              className="bg-[#00C65E] text-white py-3 rounded-lg text-center font-bold flex items-center justify-center gap-2 hover:bg-[#00A850] transition-colors shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Install PWA App
            </button>

            <Link href="/register/patient" className="bg-[#C2003F] text-white py-3 rounded text-center font-bold">Book Appointment</Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gray-50 dark:bg-black min-h-[600px] flex items-center overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent dark:from-black dark:via-black/90 dark:to-transparent/50 z-10 transition-colors duration-300"></div>
          {/* Placeholder for Hero Image */}
          <img src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&q=80&w=2091" alt="Doctor" className="w-full h-full object-cover object-center opacity-80 dark:opacity-60" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-20 w-full">
          <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-block px-4 py-1 bg-green-100 dark:bg-green-900/30 text-[#00C65E] font-bold text-xs rounded-full mb-6 tracking-wide uppercase">
              Trusted Healthcare Provider in Kenya
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-[#1D2B36] dark:text-white leading-tight mb-6 transition-colors duration-300">
              Healthcare at your <br />
              <span className="text-[#C2003F]">Doorstep.</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed transition-colors duration-300">
              Professional, licensed medical care delivered to your home or office.
              Experience our compromising standard of healthcare with modern technology and compassion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register/patient" className="px-8 py-4 bg-[#C2003F] text-white rounded-full font-bold shadow-xl hover:bg-[#A00033] transition flex items-center justify-center gap-2">
                Book a Visit
              </Link>
              <Link href="#services" className="px-8 py-4 bg-white dark:bg-gray-800 text-[#1D2B36] dark:text-white border border-gray-200 dark:border-gray-700 rounded-full font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center justify-center">
                Our Services
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-8 opacity-80 grayscale hover:grayscale-0 transition-all duration-500 hidden sm:flex">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Trusted By</div>
              <div className="font-bold text-xl text-gray-300 dark:text-gray-600">Minet</div>
              <div className="font-bold text-xl text-gray-300 dark:text-gray-600">AAR</div>
              <div className="font-bold text-xl text-gray-300 dark:text-gray-600">Jubilee</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Already Dark */}
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

      {/* Verification Section */}
      <section className="py-16 bg-white dark:bg-background border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-[#1D2B36] dark:text-white mb-6">Verify a Medical Professional</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Enter the Serial Number (e.g., MCK-2025-001) found on the doctor's ID card to verify their status.</p>

          <VerificationWidget />
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-gray-50 dark:bg-[#050505] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-[#C2003F] font-bold uppercase tracking-widest text-sm mb-3">Our Services</h2>
            <h3 className="text-3xl lg:text-4xl font-black text-[#1D2B36] dark:text-white mb-6">Experience Top-Quality Health Care At Your Door Step</h3>
            <p className="text-gray-600 dark:text-gray-400">We offer a wide range of medical services to ensure you get the care you need, when you need it.</p>
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
              title="Ambulance Services"
              desc="24/7 rapid response ambulance services for emergencies and transfers."
              icon={<FiCheckCircle className="text-4xl text-[#C2003F]" />}
            />
            <ServiceCard
              title="Lab Tests"
              desc="Sample collection and laboratory testing services with quick results."
              icon={<FiCheckCircle className="text-4xl text-[#00C65E]" />}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#1D2B36] text-white/80 py-16 dark:border-t dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
          <div>
            <div className="text-2xl font-extrabold tracking-tight text-white mb-6 flex items-center gap-2">
              <div className="w-8 h-8 bg-[#00C65E] rounded-full flex items-center justify-center text-white">M</div>
              M-Clinic
            </div>
            <p className="mb-6 text-sm leading-relaxed">
              We are redefining healthcare accessibility in Kenya. By leveraging technology and a vast network of professionals,
              we ensure quality care is available to everyone, everywhere.
            </p>
            <h4 className="text-white font-bold mb-6">Follow Us</h4>
            <p className="text-sm mb-4">Stay connected with M-Clinic on social media</p>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/Mclinickenya/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition cursor-pointer"
                aria-label="Facebook"
              >
                <FiFacebook />
              </a>
              <a
                href="https://x.com/mclinickenya"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-[#1DA1F2] hover:text-white transition cursor-pointer"
                aria-label="Twitter"
              >
                <FiTwitter />
              </a>
              <a
                href="https://www.linkedin.com/company/m-clinic-kenya"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-[#0A66C2] hover:text-white transition cursor-pointer"
                aria-label="LinkedIn"
              >
                <FiLinkedin />
              </a>
              <a
                href="https://www.instagram.com/mclinickenya/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-gradient-to-br hover:from-[#833AB4] hover:via-[#FD1D1D] hover:to-[#F77737] hover:text-white transition cursor-pointer"
                aria-label="Instagram"
              >
                <FiInstagram />
              </a>
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

          <div>
            <h4 className="text-white font-bold mb-6">Download</h4>
            <p className="text-sm mb-4">Install our app for a better experience.</p>
            <button onClick={install} className="w-full bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.5 19C19.9853 19 22 16.9853 22 14.5C22 12.132 20.177 10.244 17.819 10.039C17.444 6.661 14.28 4 10.5 4C6.18 4 2.68 7.354 2.51 11.68C1.045 12.185 0 13.595 0 15.25C0 17.321 1.679 19 3.75 19H17.5ZM19 1c0 0 .7 0 1.25.13s1.25.38 1.25.38.5.5.9 1.15.5 1.55.5 1.55.13.55.13 1.1s-.13 1.1-.13 1.1-.1.7-.5 1.55-.9 1.15-.9 1.15-.7.25-1.25.38-1.25.13-1.25.13-1.25-.13-1.25-.38-.9-1.15-.9-1.15-.5-1.55-.5-1.55l.13-1.1s.13-.55.13-1.1.5-1.55.5-1.55.9-1.15.9-1.15L19 1z" /></svg>
              <span>Install PWA</span>
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 mt-12 border-t border-white/10 text-center text-xs opacity-60">
          &copy; {new Date().getFullYear()} M-Clinic Kenya. All rights reserved.
        </div>
      </footer>
      <InstallPWA />
      <InstallInstructions />
    </div>
  );
}

function VerificationWidget() {
  const [serial, setSerial] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleVerify = async (e: any) => {
    e.preventDefault();
    if (!serial) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Using fetch directly as we might not be authenticated on landing page
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://portal.mclinic.co.ke/api';
      const res = await fetch(`${API_URL}/doctors/verify-serial/${serial}`);
      const data = await res.json();

      if (data.valid) {
        setResult(data.doctor);
      } else {
        setError(data.message || 'Invalid Serial Number');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleVerify} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="MCK-2025-XXX"
          value={serial}
          onChange={(e) => setSerial(e.target.value.toUpperCase())}
          className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 font-mono uppercase focus:ring-2 focus:ring-[#C2003F] outline-none bg-white dark:bg-gray-800 dark:text-white transition-colors"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-[#1D2B36] text-white px-6 py-3 rounded-lg font-bold hover:bg-black transition disabled:opacity-50"
        >
          {loading ? '...' : 'Verify'}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg border border-red-100 dark:border-red-900 flex items-center justify-center gap-2">
          <FiX /> {error}
        </div>
      )}

      {result && (
        <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-900 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-4 text-left">
            <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full border-2 border-green-500 overflow-hidden flex-shrink-0">
              {result.profileImage ? (
                <img src={result.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-green-500 font-bold text-2xl">✓</div>
              )}
            </div>
            <div>
              <div className="font-bold text-[#1D2B36] dark:text-white text-lg">Dr. {result.fname} {result.lname}</div>
              <div className="text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-1">
                <FiCheckCircle /> Verified Professional
              </div>
              <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">{result.specialization || 'General Practitioner'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ServiceCard({ title, desc, icon }: any) {
  return (
    <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <div className="mb-6 bg-gray-50 dark:bg-gray-800 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-[#1D2B36] dark:text-white mb-3">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
        {desc}
      </p>
    </div>
  );
}
