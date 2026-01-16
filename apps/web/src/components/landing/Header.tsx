'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FiPhone, FiMail, FiClock, FiMenu, FiX } from 'react-icons/fi';

export default function Header() {
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
        <>
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
        </>
    );
}
