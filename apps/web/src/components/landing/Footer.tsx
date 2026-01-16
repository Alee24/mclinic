'use client';

import Link from 'next/link';
import { FiPhone, FiMail, FiMapPin } from 'react-icons/fi';

export default function Footer() {
    return (
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
    );
}
