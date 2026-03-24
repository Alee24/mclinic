'use client';

import Link from 'next/link';
import { FiCheckCircle, FiHeart, FiShield, FiZap, FiMapPin, FiStar, FiArrowRight, FiPlay } from 'react-icons/fi';
import InstallPWA from '../components/InstallPWA';
import { usePWA } from '@/providers/PWAProvider';
import Image from 'next/image';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';

export default function Home() {
  const { install } = usePWA();

  return (
    <div className="font-sans text-gray-800 bg-white">
      <Header />

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
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <div className="aspect-[4/3] relative">
                <img
                  src="https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=800&q=80"
                  alt="African nurse caring for patient at home"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
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

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-200 rounded-full blur-3xl opacity-20 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20 -z-10"></div>
      </section >

      {/* Why Choose Us */}
      < section className="py-20 bg-white" >
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
      </section >

      {/* Image Gallery Section */}
      < section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50" >
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
              <div className="aspect-[4/3] relative">
                <img
                  src="https://images.unsplash.com/photo-1576765607924-3f7b8410a787?w=800&q=80"
                  alt="African nurse providing elderly care at home"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
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
              <div className="aspect-[4/3] relative">
                <img
                  src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80"
                  alt="African doctor consulting patient with tablet"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
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
      </section >

      {/* Testimonials with real photos */}
      < section className="py-20 bg-white" >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-[#1D2B36] mb-4">
              What Patients <span className="text-[#C2003F]">Say</span>
            </h2>
            <p className="text-xl text-gray-600">Trusted by thousands of families across Kenya</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                photo: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&q=80',
                name: 'Amina Wanjiku', location: 'Nairobi', rating: 5,
                review: 'M-Clinic sent a nurse to my home within 2 hours. My elderly mother got the care she needed without any hospital stress. Truly lifesaving service!'
              },
              {
                photo: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=200&q=80',
                name: 'James Otieno', location: 'Kisumu', rating: 5,
                review: 'The doctor was professional and easy to talk to. Got my prescription in minutes and pharmacy delivered. This is the future of healthcare in Kenya.'
              },
              {
                photo: 'https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?w=200&q=80',
                name: 'Grace Muthoni', location: 'Mombasa', rating: 5,
                review: 'Booked an appointment in 3 minutes, doctor arrived in an hour. My children love that they no longer have to wait at hospitals. Highly recommend!'
              }
            ].map((t, i) => (
              <div key={i} className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                <div className="flex items-center gap-4 mb-6">
                  <img src={t.photo} alt={t.name} className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md" />
                  <div>
                    <div className="font-bold text-[#1D2B36]">{t.name}</div>
                    <div className="text-sm text-gray-500">{t.location}</div>
                    <div className="flex gap-1 mt-1">{Array.from({ length: t.rating }).map((_, j) => <FiStar key={j} className="text-yellow-400 fill-yellow-400" size={14} />)}</div>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed italic">&ldquo;{t.review}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section >

      {/* Services Overview */}
      < section className="py-20 bg-white" >
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
      </section >

      {/* CTA Section */}
      < section className="py-20 bg-gradient-to-r from-[#C2003F] to-[#FF4D6D] text-white" >
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
      </section >

      <Footer />

      {/* PWA Install */}
      <InstallPWA />
    </div >
  );
}
