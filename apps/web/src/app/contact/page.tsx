'use client';

import { useState } from 'react';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { FiPhone, FiMail, FiMapPin, FiSend, FiCheckCircle } from 'react-icons/fi';
import { api } from '@/lib/api';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        subject: 'General Inquiry',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        
        try {
            const res = await api.post('/support', {
                name: `${formData.firstName} ${formData.lastName}`.trim(),
                email: formData.email,
                message: `[${formData.subject}] ${formData.message}`
            });
            
            if (res && res.ok) {
                setStatus('success');
                setFormData({ firstName: '', lastName: '', email: '', subject: 'General Inquiry', message: '' });
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error('Submission error', error);
            setStatus('error');
        }
    };

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
                                    <a href="tel:0700448448" className="text-blue-600 font-bold text-xl hover:underline">0700 448 448</a>
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
                        {status === 'success' ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4 animate-in fade-in">
                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl">
                                    <FiCheckCircle />
                                </div>
                                <h3 className="text-3xl font-black text-[#1D2B36]">Message Sent!</h3>
                                <p className="text-gray-600 text-lg">Thank you for reaching out. Our support team will get back to you shortly.</p>
                                <button onClick={() => setStatus('idle')} className="mt-6 px-8 py-3 bg-[#1D2B36] text-white rounded-xl font-bold hover:bg-[#C2003F] transition-colors">
                                    Send Another Message
                                </button>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-2xl font-black text-[#1D2B36] mb-6">Send a Message</h3>
                                {status === 'error' && (
                                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl font-medium border border-red-100">
                                        An error occurred while sending your message. Please try again.
                                    </div>
                                )}
                                <form className="space-y-6" onSubmit={handleSubmit}>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700">First Name</label>
                                            <input required type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-[#C2003F] transition outline-none" placeholder="John" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700">Last Name</label>
                                            <input required type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-[#C2003F] transition outline-none" placeholder="Doe" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Email Address</label>
                                        <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-[#C2003F] transition outline-none" placeholder="john@example.com" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Subject</label>
                                        <select value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-[#C2003F] transition outline-none">
                                            <option>General Inquiry</option>
                                            <option>Support</option>
                                            <option>Partnership</option>
                                            <option>Feedback</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Message</label>
                                        <textarea required value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-[#C2003F] transition outline-none h-32 resize-none" placeholder="How can we help you?"></textarea>
                                    </div>

                                    <button disabled={status === 'submitting'} type="submit" className="w-full bg-[#1D2B36] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#C2003F] transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
                                        {status === 'submitting' ? 'Sending...' : 'Send Message'} <FiSend />
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
