'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FiPhone, FiMail, FiClock, FiMenu, FiX, FiCheckCircle, FiHeart, FiShield, FiZap, FiUsers, FiMapPin, FiStar, FiArrowRight, FiPlay } from 'react-icons/fi';
import InstallPWA from '../components/InstallPWA';
import { usePWA } from '@/providers/PWAProvider';
import Image from 'next/image';

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
    <div className="font-sans text-gray-800 bg-white">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-[#1D2B36] to-[#2a3f4f] text-white text-xs py-3 px-6 hidden lg:flex justify-between items-center">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2 hover:text-[#00C65E] transition cursor-pointer">
            <FiPhone className="text-[#00C65E]" /> +254 700 448 448
          </span>
          <span className="flex items-center gap-2 hover:text-[#00C65E] transition cursor-pointer">
            <FiMail className="text-[#00C65E]" /> info@mclinic.co.ke
          </span>
          <span className="flex items-center gap-2">
            <FiClock className="text-[#00C65E]" /> 24/7 Available
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="bg-[#00C65E] text-white px-4 py-1.5 rounded-full hover:bg-[#00a84d] transition font-medium">
            Login
          </Link>
        </div>
      </div>

      {/* Navbar */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-3' : 'bg-white py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="text-2xl font-black tracking-tight text-[#1D2B36] flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-[#C2003F] to-[#FF4D6D] rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
              M
            </div>
            <span className="bg-gradient-to-r from-[#1D2B36] to-[#C2003F] bg-clip-text text-transparent">M-Clinic</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8 font-semibold text-sm text-[#1D2B36]">
            <Link href="/" className="hover:text-[#C2003F] transition">Home</Link>
            <Link href="/services" className="hover:text-[#C2003F] transition">Services</Link>
            <Link href="/about" className="hover:text-[#C2003F] transition">About</Link>
            <Link href="/contact" className="hover:text-[#C2003F] transition">Contact</Link>
            <Link href="/register/patient" className="bg-gradient-to-r from-[#C2003F] to-[#FF4D6D] text-white px-6 py-2.5 rounded-full hover:shadow-lg hover:scale-105 transition-all">
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden text-[#1D2B36]">
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t shadow-lg">
            <div className="px-6 py-4 space-y-4">
              <Link href="/" className="block text-[#1D2B36] font-semibold hover:text-[#C2003F]">Home</Link>
              <Link href="/services" className="block text-[#1D2B36] font-semibold hover:text-[#C2003F]">Services</Link>
              <Link href="/about" className="block text-[#1D2B36] font-semibold hover:text-[#C2003F]">About</Link>
              <Link href="/contact" className="block text-[#1D2B36] font-semibold hover:text-[#C2003F]">Contact</Link>
              <Link href="/login" className="block text-[#1D2B36] font-semibold hover:text-[#C2003F]">Login</Link>
              <Link href="/register/patient" className="block bg-gradient-to-r from-[#C2003F] to-[#FF4D6D] text-white px-6 py-3 rounded-full text-center font-bold">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-green-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-in slide-in-from-left">
              <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-bold">
                🏥 Professional Healthcare at Your Doorstep
              </div>

              <h1 className="text-5xl lg:text-6xl font-black leading-tight">
                <span className="bg-gradient-to-r from-[#1D2B36] to-[#C2003F] bg-clip-text text-transparent">
                  Quality Healthcare
                </span>
                <br />
                <span className="text-[#00C65E]">In The Comfort</span>
                <br />
                <span className="text-[#1D2B36]">Of Your Home</span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                Experience professional medical care delivered to your home by certified doctors and nurses.
                Book appointments, get prescriptions, and access lab services—all from your phone.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register/patient" className="group bg-gradient-to-r from-[#C2003F] to-[#FF4D6D] text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2">
                  Book Appointment Now
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/services" className="bg-white border-2 border-[#1D2B36] text-[#1D2B36] px-8 py-4 rounded-full font-bold text-lg hover:bg-[#1D2B36] hover:text-white transition-all flex items-center justify-center gap-2">
                  <FiPlay /> Watch How It Works
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-green-600 text-2xl" />
                  <div>
                    <div className="font-bold text-[#1D2B36]">Licensed Professionals</div>
                    <div className="text-sm text-gray-500">Certified doctors & nurses</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FiShield className="text-blue-600 text-2xl" />
                  <div>
                    <div className="font-bold text-[#1D2B36]">Secure & Private</div>
                    <div className="text-sm text-gray-500">Your data is protected</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Image - Hero Image */}
            <div className="relative animate-in slide-in-from-right">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                {/* Placeholder for generated image */}
                <div className="aspect-[4/3] bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="text-6xl mb-4">👨‍⚕️👨‍👩‍👧</div>
                    <p className="text-gray-600 font-medium">
                      Replace with: hero_home_visit.png
                      <br />
                      <span className="text-sm">(African family being served by M-Clinic medical professional)</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating Stats */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-6 border-4 border-green-100">
                <div className="text-4xl font-black text-[#C2003F]">10,000+</div>
                <div className="text-sm font-bold text-gray-600">Happy Patients</div>
              </div>

              <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-6 border-4 border-blue-100">
                <div className="flex items-center gap-2">
                  <FiStar className="text-yellow-500 text-2xl" />
                  <div className="text-4xl font-black text-[#C2003F]">4.9</div>
                </div>
                <div className="text-sm font-bold text-gray-600">Average Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-200 rounded-full blur-3xl opacity-20 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20 -z-10"></div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-[#1D2B36] mb-4">
              Why Families Trust <span className="text-[#C2003F]">M-Clinic</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Professional healthcare delivered with care, compassion, and convenience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <FiHeart className="text-4xl" />,
                title: 'Compassionate Care',
                description: 'Our medical professionals treat you like family',
                color: 'from-red-500 to-pink-500'
              },
              {
                icon: <FiShield className="text-4xl" />,
                title: 'Licensed Experts',
                description: 'All our doctors and nurses are certified professionals',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: <FiZap className="text-4xl" />,
                title: 'Fast Response',
                description: 'Same-day appointments available for urgent care',
                color: 'from-yellow-500 to-orange-500'
              },
              {
                icon: <FiMapPin className="text-4xl" />,
                title: 'Home Visits',
                description: 'Quality healthcare in the comfort of your home',
                color: 'from-green-500 to-emerald-500'
              }
            ].map((feature, idx) => (
              <div key={idx} className="group bg-white rounded-3xl p-8 border-2 border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black text-[#1D2B36] mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Image Gallery Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-[#1D2B36] mb-4">
              See Our <span className="text-[#C2003F]">Care</span> In Action
            </h2>
            <p className="text-xl text-gray-600">Real families, real care, real results</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Image 1 - Elderly Care */}
            <div className="group relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all">
              <div className="aspect-[4/3] bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">👵💙</div>
                  <p className="text-gray-600 font-medium">
                    Replace with: elderly_care_home.png
                    <br />
                    <span className="text-sm">(Nurse caring for elderly patient at home)</span>
                  </p>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                <div className="text-white">
                  <h3 className="text-2xl font-bold mb-2">Elderly Care</h3>
                  <p className="text-sm">Compassionate care for your loved ones</p>
                </div>
              </div>
            </div>

            {/* Image 2 - Tech-Enabled Care */}
            <div className="group relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all">
              <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">👨‍⚕️📱</div>
                  <p className="text-gray-600 font-medium">
                    Replace with: doctor_consultation_tablet.png
                    <br />
                    <span className="text-sm">(Doctor with tablet consulting couple)</span>
                  </p>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                <div className="text-white">
                  <h3 className="text-2xl font-bold mb-2">Modern Technology</h3>
                  <p className="text-sm">Digital health records and consultations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-[#1D2B36] mb-4">
              Our <span className="text-[#C2003F]">Services</span>
            </h2>
            <p className="text-xl text-gray-600">Comprehensive healthcare solutions for your family</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Home Visits', icon: '🏠', desc: 'Doctors and nurses come to you' },
              { title: 'Virtual Consultations', icon: '💻', desc: 'Video calls with specialists' },
              { title: 'Lab Services', icon: '🔬', desc: 'Sample collection at home' },
              { title: 'Pharmacy Delivery', icon: '💊', desc: 'Medications delivered to you' },
              { title: 'Chronic Care', icon: '❤️', desc: 'Ongoing management programs' },
              { title: '24/7 Support', icon: '📞', desc: 'Always here when you need us' }
            ].map((service, idx) => (
              <div key={idx} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 border-2 border-gray-100 hover:border-[#C2003F] hover:shadow-xl transition-all group">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{service.icon}</div>
                <h3 className="text-xl font-black text-[#1D2B36] mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/services" className="inline-flex items-center gap-2 bg-[#1D2B36] text-white px-8 py-4 rounded-full font-bold hover:bg-[#C2003F] transition-all">
              View All Services
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#C2003F] to-[#FF4D6D] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-black mb-6">
            Ready to Experience Better Healthcare?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of families who trust M-Clinic for their healthcare needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register/patient" className="bg-white text-[#C2003F] px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all">
              Get Started Free
            </Link>
            <Link href="/contact" className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-[#C2003F] transition-all">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1D2B36] text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-2xl font-black mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-[#C2003F] rounded-full flex items-center justify-center">M</div>
                M-Clinic
              </div>
              <p className="text-gray-400 text-sm">
                Professional healthcare delivered to your home with care and compassion.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-4">Quick Links</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <Link href="/about" className="block hover:text-white">About Us</Link>
                <Link href="/services" className="block hover:text-white">Services</Link>
                <Link href="/contact" className="block hover:text-white">Contact</Link>
                <Link href="/terms-and-conditions" className="block hover:text-white">Terms & Conditions</Link>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-4">For Providers</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <Link href="/register/doctor" className="block hover:text-white">Join as Doctor</Link>
                <Link href="/login" className="block hover:text-white">Provider Login</Link>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-4">Contact Us</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <p className="flex items-center gap-2"><FiPhone /> +254 700 448 448</p>
                <p className="flex items-center gap-2"><FiMail /> info@mclinic.co.ke</p>
                <p className="flex items-center gap-2"><FiMapPin /> Nairobi, Kenya</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} M-Clinic Kenya. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* PWA Install */}
      <InstallPWA />
    </div>
  );
}
