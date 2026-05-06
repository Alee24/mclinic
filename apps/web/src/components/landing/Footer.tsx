'use client';

import Link from 'next/link';
import { FiPhone, FiMail, FiMapPin, FiTwitter, FiFacebook, FiInstagram } from 'react-icons/fi';

export default function Footer() {
    return (
        <footer className="bg-mc-dark text-white pt-24 pb-12 overflow-hidden relative">
            {/* Background Blob */}
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-mc-green opacity-5 blob-shape translate-x-1/2 translate-y-1/2" />
            
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-4 gap-16 mb-20">
                    <div className="space-y-8">
                        <Link href="/" className="flex items-center gap-2 group">
                            <img src="/logo.png" alt="M-Clinic Kenya" className="h-12 w-auto brightness-0 invert" />
                        </Link>
                        <p className="text-gray-400 leading-relaxed">
                            Redefining healthcare delivery in Kenya. Professional medical care at your doorstep, powered by modern technology and compassionate hearts.
                        </p>
                        <div className="flex gap-4">
                            {[FiTwitter, FiFacebook, FiInstagram].map((Icon, i) => (
                                <Link key={i} href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-mc-green hover:border-mc-green transition-all">
                                    <Icon size={18} />
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-black mb-8">Quick Links</h3>
                        <ul className="space-y-4 text-gray-400">
                            <li><Link href="/about" className="hover:text-mc-green transition-colors">About Us</Link></li>
                            <li><Link href="/services" className="hover:text-mc-green transition-colors">Our Services</Link></li>
                            <li><Link href="/contact" className="hover:text-mc-green transition-colors">Contact Support</Link></li>
                            <li><Link href="/terms-and-conditions" className="hover:text-mc-green transition-colors">Terms & Conditions</Link></li>
                            <li><Link href="/privacy" className="hover:text-mc-green transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/delete-my-data" className="hover:text-mc-green transition-colors">Delete My Data</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-black mb-8">For Providers</h3>
                        <ul className="space-y-4 text-gray-400">
                            <li><Link href="/register/doctor" className="hover:text-mc-green transition-colors">Join the Network</Link></li>
                            <li><Link href="/login" className="hover:text-mc-green transition-colors">Provider Dashboard</Link></li>
                            <li><Link href="/guidelines" className="hover:text-mc-green transition-colors">Medical Guidelines</Link></li>
                            <li><Link href="/compliance" className="hover:text-mc-green transition-colors">Compliance</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-black mb-8">Contact</h3>
                        <ul className="space-y-6 text-gray-400">
                            <li className="flex items-center gap-4 group cursor-pointer">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-mc-green group-hover:text-white transition-all"><FiPhone /></div>
                                <div>
                                    <div className="text-xs text-gray-500 uppercase font-black">Call Us</div>
                                    <div className="font-bold text-white">0700 448 448</div>
                                </div>
                            </li>
                            <li className="flex items-center gap-4 group cursor-pointer">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-mc-green group-hover:text-white transition-all"><FiMail /></div>
                                <div>
                                    <div className="text-xs text-gray-500 uppercase font-black">Email Us</div>
                                    <div className="font-bold text-white">info@mclinic.co.ke</div>
                                </div>
                            </li>
                            <li className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><FiMapPin /></div>
                                <div>
                                    <div className="text-xs text-gray-500 uppercase font-black">Visit Us</div>
                                    <div className="font-bold text-white">Nairobi, Kenya</div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} M-Clinic Kenya. All rights reserved.
                    </p>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                        Designed & Developed by | <a href="https://kkdes.co.ke/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-mc-green transition-colors font-bold underline underline-offset-8 decoration-mc-green/30">KKDES</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
