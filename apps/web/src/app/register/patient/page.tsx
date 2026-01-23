'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth'; // Import useAuth
import Link from 'next/link';
import { FiCheckCircle, FiUser, FiMapPin, FiNavigation, FiLock, FiMail, FiPhone, FiCreditCard, FiFileText } from 'react-icons/fi';
import { toast } from 'react-hot-toast';


export default function PatientRegisterPage() {
    const router = useRouter();
    const { login } = useAuth(); // Get login function
    const [loading, setLoading] = useState(false);
    const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [termsAccepted, setTermsAccepted] = useState(false);

    const [formData, setFormData] = useState({
        fname: '',
        lname: '',
        email: '',
        password: '',
        mobile: '',
        national_id: '',
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
            (position) => {
                const { latitude, longitude } = position.coords;
                setFormData(prev => ({ ...prev, latitude, longitude }));
                setLocationStatus('success');
            },
            (error) => {
                console.error(error);
                alert('Unable to retrieve location. Please enable location services.');
                setLocationStatus('error');
            },
            { enableHighAccuracy: true }
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate GPS location
        if (!formData.latitude || !formData.longitude) {
            toast.error('Please enable GPS location to continue. We need your location to connect you with nearby healthcare providers.');
            return;
        }

        if (!termsAccepted) {
            toast.error('Please accept the Terms and Conditions to continue.');
            return;
        }

        setLoading(true);

        try {
            const res = await api.post('/auth/register', formData);
            if (res && res.ok) {
                const data = await res.json();
                toast.success('Registration successful! Welcome to M-Clinic.');
                login(data.user, data.access_token);
                // The login function in AuthContext usually handles redirection, but we can force it here just in case or let the Context handle it.
                // Looking at Login page, it redirects if user is set.
                // But let's verify if login() redirects.
                // Assuming login() sets state, and we might need to redirect manually if it doesn't.
                router.push('/dashboard');
            } else {
                const data = res ? await res.json() : { message: 'Network error' };
                toast.error(data.message || 'Registration failed. Email might be in use.');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred during registration.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-[#050505] dark:via-[#0a0a0a] dark:to-[#050505] p-4 py-12">
            <div className="max-w-5xl w-full bg-white dark:bg-[#121212] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col md:flex-row">

                {/* Sidebar Info */}
                <div className="bg-gradient-to-br from-green-600 to-green-700 dark:from-green-900/40 dark:to-green-900/20 md:w-5/12 p-12 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <Link href="/" className="flex items-center gap-2 mb-12 group">
                            <div className="w-12 h-12 bg-white text-green-600 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg group-hover:scale-110 transition-transform">M</div>
                            <span className="font-bold text-2xl">M-Clinic</span>
                        </Link>
                        <h2 className="text-4xl font-black mb-4">Quick Sign Up</h2>
                        <p className="opacity-90 leading-relaxed text-green-50 mb-8">
                            Create your account in under 2 minutes. Just the essentials—you can complete your medical profile later when booking your first appointment.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 opacity-90 bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                                <span className="bg-white/20 p-3 rounded-lg"><FiUser className="text-xl" /></span>
                                <div>
                                    <div className="font-bold">Basic Info Only</div>
                                    <div className="text-xs text-green-100">Name, email, phone & ID</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 opacity-90 bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                                <span className="bg-white/20 p-3 rounded-lg"><FiMapPin className="text-xl" /></span>
                                <div>
                                    <div className="font-bold">GPS Location</div>
                                    <div className="text-xs text-green-100">Find nearby providers</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 opacity-90 bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                                <span className="bg-white/20 p-3 rounded-lg"><FiCheckCircle className="text-xl" /></span>
                                <div>
                                    <div className="font-bold">Instant Access</div>
                                    <div className="text-xs text-green-100">Start booking immediately</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <Link href="/terms-and-conditions" target="_blank" className="inline-flex items-center gap-2 px-5 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-white font-bold transition-all text-sm">
                                <FiFileText /> Read Terms & Conditions
                            </Link>
                        </div>
                    </div>

                    {/* Decor */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
                </div>

                {/* Form Content */}
                <div className="flex-1 p-8 md:p-12">
                    <div className="mb-8">
                        <h2 className="text-3xl font-black dark:text-white mb-2">Create Account</h2>
                        <p className="text-gray-500 text-sm">Fill in your basic details to get started</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Names */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label"><FiUser className="inline mr-1" /> First Name</label>
                                <input
                                    name="fname"
                                    value={formData.fname}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                    placeholder="John"
                                />
                            </div>
                            <div>
                                <label className="label">Last Name</label>
                                <input
                                    name="lname"
                                    value={formData.lname}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="label"><FiMail className="inline mr-1" /> Email Address</label>
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="input-field"
                                placeholder="john@example.com"
                            />
                        </div>

                        {/* Phone & ID */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label"><FiPhone className="inline mr-1" /> Mobile Number</label>
                                <input
                                    name="mobile"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                    placeholder="0712345678"
                                />
                            </div>
                            <div>
                                <label className="label"><FiCreditCard className="inline mr-1" /> ID Number</label>
                                <input
                                    name="national_id"
                                    value={formData.national_id}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                    placeholder="12345678"
                                />
                            </div>
                        </div>

                        {/* GPS Location */}
                        <div className="bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-5">
                            <label className="label text-blue-900 dark:text-blue-300 mb-3"><FiMapPin className="inline mr-1" /> GPS Location (Required)</label>
                            <p className="text-xs text-blue-700 dark:text-blue-400 mb-3">
                                We need your location to connect you with nearby healthcare providers and ensure fast service delivery.
                            </p>
                            <button
                                type="button"
                                onClick={handleGetLocation}
                                disabled={locationStatus === 'loading'}
                                className={`w-full px-6 py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition shadow-md ${locationStatus === 'success'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                            >
                                {locationStatus === 'loading' && 'Getting Location...'}
                                {locationStatus === 'success' && <><FiCheckCircle /> Location Acquired</>}
                                {(locationStatus === 'idle' || locationStatus === 'error') && <><FiNavigation /> Enable GPS Location</>}
                            </button>
                            {locationStatus === 'success' && formData.latitude && (
                                <p className="text-xs text-green-700 dark:text-green-400 mt-2 flex items-center gap-1">
                                    <FiCheckCircle /> Coordinates: {formData.latitude.toFixed(6)}, {formData.longitude?.toFixed(6)}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="label"><FiLock className="inline mr-1" /> Password</label>
                            <input
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                                className="input-field"
                                placeholder="Minimum 6 characters"
                            />
                        </div>

                        <div className="flex items-start gap-3 p-2">
                            <div className="flex items-center h-5">
                                <input
                                    id="terms"
                                    type="checkbox"
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                    className="w-5 h-5 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-green-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-green-600 dark:ring-offset-gray-800"
                                />
                            </div>
                            <label htmlFor="terms" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                I agree to the <Link href="/terms-and-conditions" className="text-green-600 hover:underline dark:text-green-500 font-bold">Terms and Conditions</Link> and <Link href="/terms-and-conditions" className="text-green-600 hover:underline dark:text-green-500 font-bold">Privacy Policy</Link>.
                            </label>
                        </div>

                        <button

                            type="submit"
                            disabled={loading || locationStatus !== 'success'}
                            className="w-full mt-6 px-6 py-4 rounded-xl font-bold bg-green-600 hover:bg-green-700 text-white transition shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating Account...' : <><FiCheckCircle className="group-hover:scale-110 transition-transform" /> Create Account</>}
                        </button>

                        <div className="text-center text-sm text-gray-500 pt-4 border-t dark:border-gray-800">
                            Already have an account? <Link href="/login" className="text-green-600 font-bold hover:underline">Log In</Link>
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
                    color: #374151;
                    margin-bottom: 0.5rem;
                    letter-spacing: 0.05em;
                }
                :global(.dark) .label {
                    color: #9ca3af;
                }
                .input-field {
                    width: 100%;
                    padding: 0.875rem 1rem;
                    border-radius: 0.75rem;
                    border: 2px solid #e5e7eb;
                    background-color: #ffffff;
                    outline: none;
                    font-size: 0.875rem;
                    transition: all 0.2s;
                    font-weight: 500;
                }
                :global(.dark) .input-field {
                    background-color: #0a0a0a;
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
