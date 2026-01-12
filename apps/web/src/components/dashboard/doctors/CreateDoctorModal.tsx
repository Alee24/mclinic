'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { FiX } from 'react-icons/fi';

interface CreateDoctorModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateDoctorModal({ onClose, onSuccess }: CreateDoctorModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        sex: 'Male',
        dob: '',
        email: '',
        mobile: '',
        address: '',
        specialty: '',
        dr_type: 'Specialist',
        licenseNumber: '',
        reg_code: '',
        licenseExpiryDate: '',
        qualifications: '',
        hospitalAffiliation: '',
        fee: 0,
        bio: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!formData.name || !formData.licenseNumber || !formData.email) {
                // Basic validation
            }

            const res = await api.post('/doctors', {
                ...formData,
                // Ensure date is ISO
                licenseExpiryDate: formData.licenseExpiryDate ? new Date(formData.licenseExpiryDate).toISOString() : null,
            });

            if (res && res.ok) {
                alert('Doctor created successfully');
                onSuccess();
            } else {
                alert('Failed to create doctor');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-bold dark:text-white">Add New Doctor</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-black dark:hover:text-white transition"><FiX size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Section: Personal Details */}
                        <div className="md:col-span-2 border-b pb-2 mb-2">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Personal Information</h3>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Full Name *</label>
                            <input name="name" required className="w-full form-input" value={formData.name} onChange={handleChange} placeholder="e.g. John Doe" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Gender *</label>
                            <select name="sex" className="w-full form-input" value={formData.sex} onChange={handleChange}>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Date of Birth</label>
                            <input type="date" name="dob" className="w-full form-input" value={formData.dob} onChange={handleChange} />
                        </div>

                        {/* Section: Contact Info */}
                        <div className="md:col-span-2 border-b border-t py-2 my-2 bg-gray-50/50 -mx-6 px-6">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Details</h3>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email Address *</label>
                            <input type="email" name="email" required className="w-full form-input" value={formData.email} onChange={handleChange} placeholder="doctor@example.com" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Mobile Number *</label>
                            <input name="mobile" required className="w-full form-input" value={formData.mobile} onChange={handleChange} placeholder="+254..." />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Physical Address</label>
                            <input name="address" className="w-full form-input" value={formData.address} onChange={handleChange} placeholder="Building, Street, City" />
                        </div>

                        {/* Section: Professional Info */}
                        <div className="md:col-span-2 border-b border-t py-2 my-2 bg-gray-50/50 -mx-6 px-6">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Professional Profile</h3>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Specialty *</label>
                            <select name="specialty" required className="w-full form-input" value={formData.specialty} onChange={handleChange}>
                                <option value="">Select Specialty</option>
                                {[
                                    'Cardiology', 'Dermatology', 'Neurology', 'Pediatrics',
                                    'Psychiatry', 'Oncology', 'Radiology', 'Surgery',
                                    'Orthopedics', 'Gynecology', 'Urology', 'Internal Medicine',
                                    'Dentistry', 'Ophthalmology', 'ENT', 'General Practice'
                                ].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Doctor Type</label>
                            <select name="dr_type" className="w-full form-input" value={formData.dr_type} onChange={handleChange}>
                                <option value="Specialist">Specialist</option>
                                <option value="General Practitioner">General Practitioner</option>
                                <option value="Consultant">Consultant</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">License Number *</label>
                            <input name="licenseNumber" required className="w-full form-input font-mono" value={formData.licenseNumber} onChange={handleChange} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Reg. Code (KMPDC)</label>
                            <input name="reg_code" className="w-full form-input font-mono" value={formData.reg_code} onChange={handleChange} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">License Expiry *</label>
                            <input type="date" name="licenseExpiryDate" required className="w-full form-input" value={formData.licenseExpiryDate} onChange={handleChange} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Hospital Affiliation</label>
                            <input name="hospitalAffiliation" className="w-full form-input" value={formData.hospitalAffiliation} onChange={handleChange} />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Qualifications</label>
                            <input name="qualifications" className="w-full form-input" value={formData.qualifications} onChange={handleChange} placeholder="MBBS, MD, PhD..." />
                        </div>

                        {/* Section: Financial & Bio */}
                        <div className="md:col-span-2 border-b border-t py-2 my-2 bg-gray-50/50 -mx-6 px-6">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Other Details</h3>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Consultation Fee (KES)</label>
                            <input type="number" name="fee" required className="w-full form-input" value={formData.fee} onChange={handleChange} min="0" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Bio</label>
                            <textarea name="bio" className="w-full form-input" rows={2} value={formData.bio} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800 mt-6">
                        <button type="button" onClick={onClose} className="px-6 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-primary text-black font-bold rounded-lg hover:opacity-90 disabled:opacity-50">
                            {loading ? 'Creating...' : 'Create Doctor'}
                        </button>
                    </div>
                </form>
            </div>
            <style global>{`
                .form-input {
                    @apply px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition outline-none;
                }
            `}</style>
        </div>
    );
}
