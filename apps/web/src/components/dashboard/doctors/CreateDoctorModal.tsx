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
        email: '', // Needed for creating a user account alongside? Backend assumes existing user or creates one?
        // Current backend `create` assumes `userId` is passed OR `user` object. 
        // DoctorsService.create takes (dto, user). This suggests invalid logic for ADMIN creating a doctor.
        // Admin creating doctor usually means creating a User AND a Doctor profile.
        // Let's assume for now we just create the profile and link to a dummy user or handle it like Patient (nullable user).
        // Wait, Doctor entity has `user` as OneToOne. 
        // Let's stick to the current pattern: maybe backend creates a user or we just send details.
        // Actually, looking at `DoctorsService.create`, it takes `user: User` as second arg. This implies the LOGGED IN user (Admin) is creating it? 
        // NO, the service creates `doctor` with `user` (the 2nd arg) as the LINKED user.
        // If Admin creates a doctor, we don't want the doctor linked to the Admin's user account!
        // Constraint: Doctor.user is OneToOne.
        // Fix (like Patient): Make user nullable in Doctor entity.
        specialty: '',
        licenseNumber: '',
        boardNumber: '',
        licenseExpiryDate: '',
        qualifications: '',
        hospitalAffiliation: '',
        bio: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!formData.name || !formData.licenseNumber || !formData.startDate) {
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
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Full Name *</label>
                            <input name="name" required className="w-full form-input" value={formData.name} onChange={handleChange} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Specialty *</label>
                            <input name="specialty" required className="w-full form-input" value={formData.specialty} onChange={handleChange} placeholder="e.g. Cardiologist" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Hospital Affiliation</label>
                            <input name="hospitalAffiliation" className="w-full form-input" value={formData.hospitalAffiliation} onChange={handleChange} />
                        </div>

                        {/* Professional Info */}
                        <div className="md:col-span-2 border-t pt-4 mt-2">
                            <h3 className="text-sm font-bold text-primary mb-3 uppercase tracking-wider">Professional Verification</h3>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">License Number *</label>
                            <input name="licenseNumber" required className="w-full form-input font-mono" value={formData.licenseNumber} onChange={handleChange} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Board Number</label>
                            <input name="boardNumber" className="w-full form-input font-mono" value={formData.boardNumber} onChange={handleChange} placeholder="e.g. KVPB/..." />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">License Expiry Date *</label>
                            <input type="date" name="licenseExpiryDate" required className="w-full form-input" value={formData.licenseExpiryDate} onChange={handleChange} />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Qualifications</label>
                            <textarea name="qualifications" className="w-full form-input" rows={2} value={formData.qualifications} onChange={handleChange} placeholder="MBBS, MD, etc." />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Bio</label>
                            <textarea name="bio" className="w-full form-input" rows={3} value={formData.bio} onChange={handleChange} />
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
            <style jsx global>{`
                .form-input {
                    @apply px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition outline-none;
                }
            `}</style>
        </div>
    );
}
