'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';
import { FiCheckCircle, FiUser, FiActivity, FiShield } from 'react-icons/fi';

export default function PatientRegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1 = Identity, 2 = Medical, 3 = Insurance

    const [formData, setFormData] = useState({
        // A. Identity (User)
        fname: '',
        lname: '',
        national_id: '',
        email: '',
        password: '',
        mobile: '',
        address: '',

        // B. Medical Basics
        dob: '',
        sex: 'Male',
        blood_group: '',
        genotype: '',
        allergies: '',
        medical_history: '', // Chronic conditions

        // C. Insurance & Emergency
        shif_number: '',
        insurance_provider: '',
        insurance_policy_no: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_relation: '',

        // Defaults
        role: 'patient',
        status: true // Active immediately
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await api.post('/auth/register', formData);
            if (res && res.ok) {
                alert('Account created successfully! Welcome to M-Clinic.');
                router.push('/login');
            } else {
                const data = res ? await res.json() : { message: 'Network error' };
                alert(data.message || 'Registration failed. Email might be in use.');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#050505] p-4 py-12">
            <div className="max-w-4xl w-full bg-white dark:bg-[#121212] rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col md:flex-row">

                {/* Sidebar / Progress */}
                <div className="bg-green-600 dark:bg-green-900/20 md:w-1/3 p-8 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-8">
                            <div className="w-10 h-10 bg-white text-green-600 rounded-full flex items-center justify-center font-bold text-xl">M</div>
                            <span className="font-bold text-xl">M-Clinic</span>
                        </div>

                        <div className="space-y-6">
                            <div className={`flex items-center gap-4 p-3 rounded-xl transition ${step === 1 ? 'bg-white/20 font-bold' : 'opacity-70'}`}>
                                <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-sm">1</div>
                                <div>
                                    <div className="text-sm uppercase tracking-wider text-green-100">Step 1</div>
                                    <div>Identity & Account</div>
                                </div>
                            </div>
                            <div className={`flex items-center gap-4 p-3 rounded-xl transition ${step === 2 ? 'bg-white/20 font-bold' : 'opacity-70'}`}>
                                <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-sm">2</div>
                                <div>
                                    <div className="text-sm uppercase tracking-wider text-green-100">Step 2</div>
                                    <div>Health Basics</div>
                                </div>
                            </div>
                            <div className={`flex items-center gap-4 p-3 rounded-xl transition ${step === 3 ? 'bg-white/20 font-bold' : 'opacity-70'}`}>
                                <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-sm">3</div>
                                <div>
                                    <div className="text-sm uppercase tracking-wider text-green-100">Step 3</div>
                                    <div>Insurance & Safety</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 mt-12">
                        <p className="text-xs text-green-100">
                            "Your health journey starts here. Secure access to your medical records and top-tier professionals."
                        </p>
                    </div>

                    {/* Decor */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/50 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
                </div>

                {/* Form Content */}
                <div className="flex-1 p-8 md:p-12">
                    <h2 className="text-2xl font-bold dark:text-white mb-2">
                        {step === 1 && 'Create Patient Account'}
                        {step === 2 && 'Basic Health Profile'}
                        {step === 3 && 'Insurance & Emergency'}
                    </h2>
                    <p className="text-gray-500 text-sm mb-8">Let's get you set up with a comprehensive profile.</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {step === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
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

                                <div>
                                    <label className="label">Email Address</label>
                                    <input name="email" type="email" value={formData.email} onChange={handleChange} required className="input-field" placeholder="john@example.com" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Mobile Number</label>
                                        <input name="mobile" value={formData.mobile} onChange={handleChange} required className="input-field" placeholder="+254..." />
                                    </div>
                                    <div>
                                        <label className="label">National ID</label>
                                        <input name="national_id" value={formData.national_id} onChange={handleChange} className="input-field" placeholder="Optional" />
                                    </div>
                                </div>

                                <div>
                                    <label className="label">Password</label>
                                    <input name="password" type="password" value={formData.password} onChange={handleChange} required className="input-field" placeholder="Secure Password" />
                                </div>

                                <div>
                                    <label className="label">Home Address</label>
                                    <input name="address" value={formData.address} onChange={handleChange} className="input-field" placeholder="e.g. Westlands, Nairobi" />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Date of Birth</label>
                                        <input name="dob" type="date" value={formData.dob} onChange={handleChange} required className="input-field" />
                                    </div>
                                    <div>
                                        <label className="label">Biological Sex</label>
                                        <select name="sex" value={formData.sex} onChange={handleChange} className="input-field">
                                            <option>Male</option>
                                            <option>Female</option>
                                            <option>Intersex</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Blood Group</label>
                                        <select name="blood_group" value={formData.blood_group} onChange={handleChange} className="input-field">
                                            <option value="">Unknown</option>
                                            <option>A+</option><option>A-</option>
                                            <option>B+</option><option>B-</option>
                                            <option>AB+</option><option>AB-</option>
                                            <option>O+</option><option>O-</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label">Genotype</label>
                                        <select name="genotype" value={formData.genotype} onChange={handleChange} className="input-field">
                                            <option value="">Unknown</option>
                                            <option>AA</option>
                                            <option>AS</option>
                                            <option>SS</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="label">Known Allergies</label>
                                    <input name="allergies" value={formData.allergies} onChange={handleChange} className="input-field" placeholder="e.g. Peanuts, Penicillin (Optional)" />
                                </div>

                                <div>
                                    <label className="label">Chronic Conditions / History</label>
                                    <textarea name="medical_history" value={formData.medical_history} onChange={handleChange} className="input-field h-24" placeholder="Brief medical history or existing conditions..." />
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div>
                                    <label className="label">SHIF Number</label>
                                    <input name="shif_number" value={formData.shif_number} onChange={handleChange} className="input-field" placeholder="Social Health Insurance Fund No." />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Insurance Provider</label>
                                        <input name="insurance_provider" value={formData.insurance_provider} onChange={handleChange} className="input-field" placeholder="e.g. Jubilee, AAR" />
                                    </div>
                                    <div>
                                        <label className="label">Policy Number</label>
                                        <input name="insurance_policy_no" value={formData.insurance_policy_no} onChange={handleChange} className="input-field" placeholder="Policy #" />
                                    </div>
                                </div>

                                <div className="pt-4 border-t dark:border-gray-800">
                                    <label className="label mb-4 text-red-500">In Case of Emergency</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="label">Contact Name</label>
                                            <input name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} required className="input-field" placeholder="Next of Kin" />
                                        </div>
                                        <div>
                                            <label className="label">Relationship</label>
                                            <input name="emergency_contact_relation" value={formData.emergency_contact_relation} onChange={handleChange} required className="input-field" placeholder="e.g. Spouse, Parent" />
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <label className="label">Contact Phone</label>
                                        <input name="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={handleChange} required className="input-field" placeholder="Emergency Number" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="pt-6 flex gap-4">
                            {step > 1 && (
                                <button type="button" onClick={prevStep} className="px-6 py-3 rounded-xl font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition">
                                    Back
                                </button>
                            )}

                            {step < 3 ? (
                                <button type="button" onClick={nextStep} className="flex-1 px-6 py-3 rounded-xl font-bold bg-green-600 hover:bg-green-700 text-white transition shadow-lg shadow-green-500/30">
                                    Continue
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 rounded-xl font-bold bg-green-600 hover:bg-green-700 text-white transition shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Creating Account...' : <><FiCheckCircle /> Create Account</>}
                                </button>
                            )}
                        </div>
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
