'use client';

import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { FiPhone, FiMail, FiMapPin, FiSend } from 'react-icons/fi';

export default function ContactPage() {
    return (
        <main className="bg-white min-h-screen font-sans">
            <Header />

            <section className="bg-[#1D2B36] text-white py-20 text-center">
                <h1 className="text-5xl font-black mb-4">Contact <span className="text-[#C2003F]">Us</span></h1>
                <p className="text-xl opacity-80">We are here to help 24/7</p>
            </section>

            <section className="py-20">
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16">
                    {/* Contact Info */}
                    <div className="space-y-12">
                        <div>
                            <h2 className="text-3xl font-black text-[#1D2B36] mb-6">Get in Touch</h2>
                            <p className="text-gray-600 text-lg">
                                Have questions about our services or need assistance with your account? Reach out to our support team anytime.
                            </p>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-start gap-4 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                                <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center text-2xl shrink-0">
                                    <FiPhone />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#1D2B36] text-lg">Call Us</h3>
                                    <p className="text-gray-600 mb-1">Speak directly to our support team.</p>
                                    <a href="tel:+254700448448" className="text-blue-600 font-bold text-xl hover:underline">+254 700 448 448</a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-6 bg-green-50 rounded-2xl border border-green-100">
                                <div className="w-12 h-12 bg-green-600 text-white rounded-xl flex items-center justify-center text-2xl shrink-0">
                                    <FiMail />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#1D2B36] text-lg">Email Us</h3>
                                    <p className="text-gray-600 mb-1">For general inquiries and partnerships.</p>
                                    <a href="mailto:info@mclinic.co.ke" className="text-green-600 font-bold text-xl hover:underline">info@mclinic.co.ke</a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-6 bg-orange-50 rounded-2xl border border-orange-100">
                                <div className="w-12 h-12 bg-orange-600 text-white rounded-xl flex items-center justify-center text-2xl shrink-0">
                                    <FiMapPin />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#1D2B36] text-lg">Visit Us</h3>
                                    <p className="text-gray-600 mb-1">Headquarters</p>
                                    <p className="text-[#1D2B36] font-medium">Nairobi, Kenya</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
                        <h3 className="text-2xl font-black text-[#1D2B36] mb-6">Send a Message</h3>
                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">First Name</label>
                                    <input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-[#C2003F] transition outline-none" placeholder="John" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Last Name</label>
                                    <input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-[#C2003F] transition outline-none" placeholder="Doe" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Email Address</label>
                                <input type="email" className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-[#C2003F] transition outline-none" placeholder="john@example.com" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Subject</label>
                                <select className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-[#C2003F] transition outline-none">
                                    <option>General Inquiry</option>
                                    <option>Support</option>
                                    <option>Partnership</option>
                                    <option>Feedback</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Message</label>
                                <textarea className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-[#C2003F] transition outline-none h-32 resize-none" placeholder="How can we help you?"></textarea>
                            </div>

                            <button className="w-full bg-[#1D2B36] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#C2003F] transition-colors flex items-center justify-center gap-2">
                                Send Message <FiSend />
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
