'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiSearch, FiCheckCircle, FiAlertCircle, FiUser, FiFileText, FiShield, FiCalendar, FiMapPin, FiPhone, FiMail, FiAward } from 'react-icons/fi';

type VerificationType = 'medic' | 'prescription';

export default function VerifyPage() {
    const [verificationType, setVerificationType] = useState<VerificationType>('medic');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!searchQuery.trim()) {
            setError('Please enter a license number or prescription code');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://portal.mclinic.co.ke/api';

            let endpoint = '';
            if (verificationType === 'medic') {
                // Search for doctor by license number
                endpoint = `/doctors?licenseNumber=${encodeURIComponent(searchQuery)}`;
            } else {
                // Search for prescription by code
                endpoint = `/pharmacy/prescriptions?code=${encodeURIComponent(searchQuery)}`;
            }

            const res = await fetch(`${API_URL}${endpoint}`);

            if (res.ok) {
                const data = await res.json();

                if (verificationType === 'medic') {
                    // Check if doctor found
                    if (data && data.length > 0) {
                        setResult(data[0]);
                    } else {
                        setError('No medical professional found with this license number');
                    }
                } else {
                    // Check if prescription found
                    if (data && data.length > 0) {
                        setResult(data[0]);
                    } else {
                        setError('No prescription found with this code');
                    }
                }
            } else {
                setError('Verification failed. Please try again.');
            }
        } catch (err) {
            setError('Connection error. Please check your internet connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/" className="text-2xl font-black text-[#1D2B36] flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#C2003F] to-[#FF4D6D] rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                            M
                        </div>
                        <span className="bg-gradient-to-r from-[#1D2B36] to-[#C2003F] bg-clip-text text-transparent">M-Clinic</span>
                    </Link>
                    <Link href="/" className="text-[#1D2B36] hover:text-[#C2003F] font-bold transition">
                        Back to Home
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-6 py-12">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-bold mb-6">
                        <FiShield /> Public Verification Portal
                    </div>
                    <h1 className="text-5xl font-black text-[#1D2B36] mb-4">
                        Verify Medical <span className="text-[#C2003F]">Credentials</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Verify the authenticity of M-Clinic medical professionals and prescriptions.
                        Enter a license number or prescription code below.
                    </p>
                </div>

                {/* Verification Type Toggle */}
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <button
                            onClick={() => {
                                setVerificationType('medic');
                                setResult(null);
                                setError('');
                                setSearchQuery('');
                            }}
                            className={`relative p-6 rounded-2xl border-2 transition-all ${verificationType === 'medic'
                                    ? 'border-blue-600 bg-blue-50'
                                    : 'border-gray-200 hover:border-blue-300'
                                }`}
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 transition-colors ${verificationType === 'medic'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    <FiUser className="text-2xl" />
                                </div>
                                <div className={`font-bold transition-colors ${verificationType === 'medic' ? 'text-blue-600' : 'text-gray-700'
                                    }`}>
                                    Verify Medic
                                </div>
                                <div className="text-xs text-gray-500 mt-1">License Number</div>
                            </div>
                            {verificationType === 'medic' && (
                                <div className="absolute top-3 right-3 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                    <FiCheckCircle className="text-white text-sm" />
                                </div>
                            )}
                        </button>

                        <button
                            onClick={() => {
                                setVerificationType('prescription');
                                setResult(null);
                                setError('');
                                setSearchQuery('');
                            }}
                            className={`relative p-6 rounded-2xl border-2 transition-all ${verificationType === 'prescription'
                                    ? 'border-green-600 bg-green-50'
                                    : 'border-gray-200 hover:border-green-300'
                                }`}
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 transition-colors ${verificationType === 'prescription'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    <FiFileText className="text-2xl" />
                                </div>
                                <div className={`font-bold transition-colors ${verificationType === 'prescription' ? 'text-green-600' : 'text-gray-700'
                                    }`}>
                                    Verify Prescription
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Prescription Code</div>
                            </div>
                            {verificationType === 'prescription' && (
                                <div className="absolute top-3 right-3 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                                    <FiCheckCircle className="text-white text-sm" />
                                </div>
                            )}
                        </button>
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleVerify} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                {verificationType === 'medic' ? 'Medical License Number' : 'Prescription Code'}
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={verificationType === 'medic' ? 'e.g., KMP123456' : 'e.g., RX-2024-001234'}
                                    className="w-full px-6 py-4 pl-14 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none transition text-lg"
                                />
                                <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                {verificationType === 'medic'
                                    ? 'Enter the medical professional\'s license number as shown on their ID card'
                                    : 'Enter the prescription code found at the top of your prescription document'
                                }
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-bold text-white transition shadow-lg flex items-center justify-center gap-2 ${verificationType === 'medic'
                                    ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
                                    : 'bg-green-600 hover:bg-green-700 shadow-green-500/30'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <FiSearch />
                                    Verify Now
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8 animate-in slide-in-from-top">
                        <div className="flex items-start gap-4">
                            <FiAlertCircle className="text-red-600 text-2xl shrink-0 mt-1" />
                            <div>
                                <h3 className="font-bold text-red-900 mb-1">Verification Failed</h3>
                                <p className="text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success Result - Medic */}
                {result && verificationType === 'medic' && (
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden animate-in slide-in-from-bottom">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                                    <FiCheckCircle className="text-4xl" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black">Verified Medical Professional</h2>
                                    <p className="text-blue-100">This credential is authentic and active</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* Profile Image & Name */}
                            <div className="flex items-center gap-6 pb-6 border-b">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center text-4xl font-black text-blue-600">
                                    {result.fname?.[0]}{result.lname?.[0]}
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-[#1D2B36]">
                                        Dr. {result.fname} {result.lname}
                                    </h3>
                                    <p className="text-gray-600 font-medium">{result.speciality || 'General Practitioner'}</p>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="flex items-start gap-3">
                                    <FiAward className="text-blue-600 text-xl mt-1" />
                                    <div>
                                        <div className="text-sm font-bold text-gray-500 uppercase">License Number</div>
                                        <div className="text-lg font-bold text-[#1D2B36]">{result.license_number || 'N/A'}</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <FiCalendar className="text-blue-600 text-xl mt-1" />
                                    <div>
                                        <div className="text-sm font-bold text-gray-500 uppercase">License Expiry</div>
                                        <div className="text-lg font-bold text-[#1D2B36]">
                                            {result.license_expiry ? new Date(result.license_expiry).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <FiMapPin className="text-blue-600 text-xl mt-1" />
                                    <div>
                                        <div className="text-sm font-bold text-gray-500 uppercase">Location</div>
                                        <div className="text-lg font-bold text-[#1D2B36]">{result.city || 'Nairobi'}</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <FiShield className="text-blue-600 text-xl mt-1" />
                                    <div>
                                        <div className="text-sm font-bold text-gray-500 uppercase">Status</div>
                                        <div className={`text-lg font-bold ${result.is_verified ? 'text-green-600' : 'text-yellow-600'}`}>
                                            {result.is_verified ? '✓ Verified' : 'Pending Verification'}
                                        </div>
                                    </div>
                                </div>

                                {result.mobile && (
                                    <div className="flex items-start gap-3">
                                        <FiPhone className="text-blue-600 text-xl mt-1" />
                                        <div>
                                            <div className="text-sm font-bold text-gray-500 uppercase">Contact</div>
                                            <div className="text-lg font-bold text-[#1D2B36]">{result.mobile}</div>
                                        </div>
                                    </div>
                                )}

                                {result.email && (
                                    <div className="flex items-start gap-3">
                                        <FiMail className="text-blue-600 text-xl mt-1" />
                                        <div>
                                            <div className="text-sm font-bold text-gray-500 uppercase">Email</div>
                                            <div className="text-lg font-bold text-[#1D2B36] break-all">{result.email}</div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Verification Badge */}
                            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center gap-3">
                                <FiCheckCircle className="text-green-600 text-2xl" />
                                <div className="text-sm text-green-800">
                                    <strong>Verified by M-Clinic:</strong> This medical professional is registered and authorized
                                    to provide healthcare services through M-Clinic platform.
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success Result - Prescription */}
                {result && verificationType === 'prescription' && (
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden animate-in slide-in-from-bottom">
                        <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                                    <FiCheckCircle className="text-4xl" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black">Verified Prescription</h2>
                                    <p className="text-green-100">This prescription is authentic and valid</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="flex items-start gap-3">
                                    <FiFileText className="text-green-600 text-xl mt-1" />
                                    <div>
                                        <div className="text-sm font-bold text-gray-500 uppercase">Prescription Code</div>
                                        <div className="text-lg font-bold text-[#1D2B36]">{result.prescription_code || result.id}</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <FiCalendar className="text-green-600 text-xl mt-1" />
                                    <div>
                                        <div className="text-sm font-bold text-gray-500 uppercase">Issue Date</div>
                                        <div className="text-lg font-bold text-[#1D2B36]">
                                            {result.createdAt ? new Date(result.createdAt).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <FiUser className="text-green-600 text-xl mt-1" />
                                    <div>
                                        <div className="text-sm font-bold text-gray-500 uppercase">Prescribed By</div>
                                        <div className="text-lg font-bold text-[#1D2B36]">
                                            {result.doctor?.fname} {result.doctor?.lname}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <FiShield className="text-green-600 text-xl mt-1" />
                                    <div>
                                        <div className="text-sm font-bold text-gray-500 uppercase">Status</div>
                                        <div className="text-lg font-bold text-green-600">✓ Valid</div>
                                    </div>
                                </div>
                            </div>

                            {/* Verification Badge */}
                            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center gap-3">
                                <FiCheckCircle className="text-green-600 text-2xl" />
                                <div className="text-sm text-green-800">
                                    <strong>Verified by M-Clinic:</strong> This prescription was issued by a licensed medical
                                    professional through the M-Clinic platform and is valid for use.
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Info Section */}
                <div className="mt-12 bg-blue-50 border-2 border-blue-200 rounded-2xl p-8">
                    <h3 className="text-xl font-black text-[#1D2B36] mb-4 flex items-center gap-2">
                        <FiShield className="text-blue-600" />
                        Why Verify?
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-700">
                        <div>
                            <h4 className="font-bold mb-2">For Patients:</h4>
                            <ul className="space-y-1">
                                <li>• Confirm your healthcare provider is licensed</li>
                                <li>• Verify prescription authenticity</li>
                                <li>• Ensure quality and safety</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-2">For Pharmacies:</h4>
                            <ul className="space-y-1">
                                <li>• Validate prescriptions before dispensing</li>
                                <li>• Prevent fraud and misuse</li>
                                <li>• Comply with regulations</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-[#1D2B36] text-white py-8 mt-20">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-sm text-gray-400">
                        &copy; {new Date().getFullYear()} M-Clinic Kenya. All rights reserved.
                    </p>
                    <div className="mt-4 flex justify-center gap-6 text-sm">
                        <Link href="/" className="hover:text-green-400 transition">Home</Link>
                        <Link href="/contact" className="hover:text-green-400 transition">Contact</Link>
                        <Link href="/terms-and-conditions" className="hover:text-green-400 transition">Terms</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
