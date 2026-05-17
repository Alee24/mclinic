'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FiMenu, FiX, FiArrowRight } from 'react-icons/fi';

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'py-4' : 'py-8'}`}>
            <div className="max-w-7xl mx-auto px-6">
                <div className={`glass rounded-[2rem] px-8 py-4 flex justify-between items-center transition-all ${isScrolled ? 'shadow-2xl border-mc-dark/5' : 'border-transparent'}`}>
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <span className="text-2xl font-black tracking-tighter text-mc-dark">
                            M-CLINIC<span className="text-mc-green">.</span>
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center gap-10">
                        {['Solutions', 'Products', 'Resources', 'Pricing'].map((item) => (
                            <Link 
                                key={item} 
                                href={`/${item.toLowerCase()}`} 
                                className="text-sm font-bold text-mc-dark/70 hover:text-mc-crimson transition-colors"
                            >
                                {item}
                            </Link>
                        ))}
                        <Link 
                            href="/verify" 
                            className="text-sm font-bold text-[#0B6E40] hover:text-[#08522E] transition-colors border border-emerald-200 bg-emerald-50/50 px-3 py-1.5 rounded-xl flex items-center gap-1.5"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0B6E40]"></span>
                            </span>
                            Verify Credentials
                        </Link>
                    </div>

                    {/* CTA Buttons */}
                    <div className="hidden lg:flex items-center gap-4">
                        <Link href="/login" className="text-sm font-bold text-mc-dark hover:text-mc-crimson transition-colors px-4">
                            Login
                        </Link>
                        <Link href="/register/patient" className="bg-mc-dark text-white px-8 py-3 rounded-2xl font-bold text-sm hover:bg-[#0B6E40] transition-all flex items-center gap-2 group">
                            Join Now
                            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden text-mc-dark">
                        {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={`lg:hidden fixed inset-0 bg-white z-[100] transition-all duration-500 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none translate-y-10'}`}>
                <div className="p-8 space-y-8">
                    <div className="flex justify-between items-center">
                        <span className="text-2xl font-black text-mc-dark">M-CLINIC<span className="text-mc-green">.</span></span>
                        <button onClick={() => setMobileMenuOpen(false)}><FiX size={32} /></button>
                    </div>
                    <div className="flex flex-col gap-6 pt-10">
                        {['Solutions', 'Products', 'Resources', 'Pricing'].map((item) => (
                            <Link 
                                key={item} 
                                href={`/${item.toLowerCase()}`} 
                                className="text-4xl font-black text-mc-dark hover:text-mc-crimson transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {item}
                            </Link>
                        ))}
                        <Link 
                            href="/verify" 
                            className="text-4xl font-black text-[#0B6E40] hover:text-[#08522E] transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Verify Credentials
                        </Link>
                    </div>
                    <div className="pt-10 flex flex-col gap-4">
                        <Link href="/login" className="w-full text-center py-5 rounded-2xl border-2 border-mc-dark font-black text-xl">Login</Link>
                        <Link href="/register/patient" className="w-full text-center py-5 rounded-2xl bg-mc-crimson text-white font-black text-xl">Join Now</Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
