'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';
import { FiCheckCircle, FiUser, FiMapPin, FiNavigation } from 'react-icons/fi';

export default function PatientRegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const [formData, setFormData] = useState({
        fname: '',
        lname: '',
        email: '',
        password: '',
        mobile: '',
        address: '',
        city: '',
        latitude: null as number | null,
        longitude: null as number | null,
        role: 'patient',
        status: true
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGetLocation = () => {
        setLocationStatus('loading');
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            setLocationStatus('error');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setFormData(prev => ({ ...prev, latitude, longitude }));

                try {
                    // Reverse geocode using OpenStreetMap (Free, requires User-Agent)
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
                        headers: { 'User-Agent': 'MClinic-Portal/1.0' }
                    });
                    const data = await res.json();
                    if (data && data.display_name) {
                        const city = data.address.city || data.address.town || data.address.village || data.address.county || '';
                        setFormData(prev => ({
                            ...prev,
                            address: data.display_name,
                            city: city
                        }));
                    }
                    setLocationStatus('success');
                } catch (err) {
                    console.error('Reverse geocoding failed', err);
                    setLocationStatus('success'); // Still success as we got coords
                }
            },
            (error) => {
                console.error(error);
                alert('Unable to retrieve location. Please enter address manually.');
                setLocationStatus('error');
            },
            { enableHighAccuracy: true }
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await api.post('/auth/register', formData);
            if (res && res.ok) {
                // Determine if we redirect to login or dashboard if auto-logged in (usually login)
                // Assuming standard flow:
                router.push('/login?registered=true');
            } else {
                const data = res ? await res.json() : { message: 'Network error' };
                alert(data.message || 'Registration failed. Email might be in use.');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred during registration.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#050505] p-4 py-12">
            <div className="max-w-4xl w-full bg-white dark:bg-[#121212] rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col md:flex-row">

                {/* Sidebar Info */}
                <div className="bg-green-600 dark:bg-green-900/20 md:w-5/12 p-12 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-12">
                            <div className="w-10 h-10 bg-white text-green-600 rounded-full flex items-center justify-center font-bold text-xl">M</div>
                            <span className="font-bold text-xl">M-Clinic</span>
                        </div>
                        <h2 className="text-3xl font-bold mb-4">Join Us.</h2>
                        <p className="opacity-90 leading-relaxed text-green-50">
                            Create your account in seconds. We just need your basics to get started. You can update your medical profile later when you're ready to book.
                        </p>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-center gap-3 opacity-80">
                                <span className="bg-white/20 p-2 rounded-lg"><FiUser /></span>
                                <span>Quick Sign Up</span>
                            </div>
                            <div className="flex items-center gap-3 opacity-80">
                                <span className="bg-white/20 p-2 rounded-lg"><FiMapPin /></span>
                                <span>GPS Location Support</span>
                            </div>
                            <div className="flex items-center gap-3 opacity-80">
                                <span className="bg-white/20 p-2 rounded-lg"><FiCheckCircle /></span>
                                <span>Instant Access</span>
                            </div>
                        </div>
                    </div>

                    {/* Decor */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
                </div>

                {/* Form Content */}
                <div className="flex-1 p-8 md:p-12">
                    <h2 className="text-2xl font-bold dark:text-white mb-2">Create Account</h2>
                    <p className="text-gray-500 text-sm mb-8">Enter your details below to get started.</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">First Name</label>
                                <input name="fname" value={formData.fname} onChange={handleChange} required className="input-field" placeholder="John" />
                            </div>
                            <div>
                                <label className="label">Last Name</label>
                                <input name="lname" value={formData.lname} onChange={handleChange} required className="input-field" placeholder="Doe" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">Mobile Number</label>
                                <input name="mobile" value={formData.mobile} onChange={handleChange} required className="input-field" placeholder="+254..." />
                            </div>
                            <div>
                                <label className="label">Email Address</label>
                                <input name="email" type="email" value={formData.email} onChange={handleChange} required className="input-field" placeholder="john@example.com" />
                            </div>
                        </div>

                        <div>
                            <label className="label">Location & Address</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="Enter address or use GPS"
                                />
                                <button
                                    type="button"
                                    onClick={handleGetLocation}
                                    className={`px-4 rounded-xl flex items-center gap-2 transition whitespace-nowrap ${locationStatus === 'success' ? 'bg-green-100 text-green-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                                >
                                    {locationStatus === 'loading' ? 'Locating...' : <><FiNavigation /> Use GPS</>}
                                </button>
                            </div>
                            {locationStatus === 'success' && (
                                <p className="text-xs text-green-600 flex items-center gap-1"><FiCheckCircle /> Location coordinates acquired</p>
                            )}
                        </div>

                        <div>
                            <label className="label">Password</label>
                            <input name="password" type="password" value={formData.password} onChange={handleChange} required className="input-field" placeholder="Create a secure password" />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-4 px-6 py-4 rounded-xl font-bold bg-green-600 hover:bg-green-700 text-white transition shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 group"
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>

                        <div className="text-center text-sm text-gray-500 pt-4">
                            Already have an account? <Link href="/login" className="text-green-500 font-bold hover:underline">Log In</Link>
                        </div>
                    </form>
                </div>
            </div>

            <style>{`
                .label {
                    display: block;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: #6b7280;
                    margin-bottom: 0.25rem;
                }
                :global(.dark) .label {
                    color: #9ca3af;
                }
                .input-field {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border-radius: 0.75rem;
                    border: 1px solid #e5e7eb;
                    background-color: #f9fafb;
                    outline: none;
                    font-size: 0.875rem;
                    transition: all 0.2s;
                }
                :global(.dark) .input-field {
                    background-color: #050505;
                    border-color: #333;
                    color: white;
                }
                .input-field:focus {
                    border-color: #16a34a;
                    box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.1);
                }
            `}</style>
        </div>
    );
}
