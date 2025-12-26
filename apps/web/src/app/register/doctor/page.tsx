'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function DoctorRegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fname: '',
        lname: '',
        email: '',
        password: '',
        address: '',
        dr_type: 'Physician',
        type: 'General',
        speciality: '',
        sex: 'Male',
        fee: 1500,
        experience: 0,
        about: '',
        status: 1
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await api.post('/auth/register/doctor', formData);
            if (res.ok) {
                alert('Application submitted! Your account is pending approval by the Admin.');
                router.push('/login');
            } else {
                alert('Registration failed. Email might be in use.');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1A1A1A] p-4">
            <div className="max-w-2xl w-full bg-white dark:bg-[#121212] p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 my-8">
                <h2 className="text-3xl font-black mb-2 dark:text-white">Doctor Application</h2>
                <p className="text-gray-500 mb-8">Join the M-Clinic network. Requires Admin Approval.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">First Name</label>
                            <input name="fname" required className="input-field" onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Last Name</label>
                            <input name="lname" required className="input-field" onChange={handleChange} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                            <input name="email" type="email" required className="input-field" onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                            <input name="password" type="password" required className="input-field" onChange={handleChange} />
                        </div>
                    </div>

                    {/* Professional Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Doctor Type</label>
                            <select name="type" className="input-field" onChange={handleChange}>
                                <option>General</option>
                                <option>Specialist</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Speciality</label>
                            <input name="speciality" placeholder="e.g. Cardiology" className="input-field" onChange={handleChange} />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Consultation Fee</label>
                            <input name="fee" type="number" defaultValue={1500} className="input-field" onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Yrs Experience</label>
                            <input name="experience" type="number" className="input-field" onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Gender</label>
                            <select name="sex" className="input-field" onChange={handleChange}>
                                <option>Male</option>
                                <option>Female</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Clinic Address / Location</label>
                        <input name="address" required placeholder="e.g. Nairobi CBD, Plaza X" className="input-field" onChange={handleChange} />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">About / Bio</label>
                        <textarea name="about" className="input-field h-24" onChange={handleChange}></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-primary text-black font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition disabled:opacity-50"
                    >
                        {loading ? 'Submitting Application...' : 'Submit for Approval'}
                    </button>

                    <div className="text-center text-sm text-gray-500">
                        <Link href="/login">Back to Login</Link>
                    </div>
                </form>
            </div>
            <style jsx>{`
                .input-field {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border-radius: 0.75rem;
                    border: 1px solid #e5e7eb;
                    background-color: #f9fafb;
                    outline: none;
                }
                :global(.dark) .input-field {
                    background-color: #000;
                    border-color: #333;
                    color: white;
                }
                .input-field:focus {
                    ring: 2px;
                    ring-color: #10b981;
                }
            `}</style>
        </div>
    );
}
