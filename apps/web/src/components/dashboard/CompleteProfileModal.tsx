'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { FiX, FiUser, FiCalendar, FiMapPin, FiPhone, FiAlertCircle } from 'react-icons/fi';

interface CompleteProfileModalProps {
    onClose: () => void;
    onSuccess: () => void;
    user: any;
}

export default function CompleteProfileModal({ onClose, onSuccess, user }: CompleteProfileModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        dob: '',
        sex: '',
        address: '',
        city: '',
        blood_group: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Update user profile
            const res = await api.patch(`/users/${user.id}`, formData);
            if (res?.ok) {
                alert('Profile completed successfully! You can now book appointments.');
                onSuccess();
            } else {
                alert('Failed to update profile. Please try again.');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred while updating your profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white dark:bg-[#121212] rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800 animate-in slide-in-from-bottom-4">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-900/60 dark:to-blue-900/40 p-6 flex items-center justify-between border-b border-blue-500/20">
                    <div>
                        <h2 className="text-2xl font-black text-white flex items-center gap-2">
                            <FiAlertCircle className="text-yellow-300" />
                            Complete Your Profile
                        </h2>
                        <p className="text-blue-100 text-sm mt-1">
                            We need a few more details before you can book your first appointment
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
                    >
                        <FiX className="text-xl" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Personal Info */}
                    <div className="bg-gray-50 dark:bg-gray-900/30 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <FiUser /> Personal Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">Date of Birth</label>
                                <input
                                    type="date"
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="label">Sex</label>
                                <select
                                    name="sex"
                                    value={formData.sex}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                >
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="label">Blood Group (Optional)</label>
                                <select
                                    name="blood_group"
                                    value={formData.blood_group}
                                    onChange={handleChange}
                                    className="input-field"
                                >
                                    <option value="">Select if known</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="bg-gray-50 dark:bg-gray-900/30 rounded-2xl p-5 border border-gray-200 dark:border-gray-800">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <FiMapPin /> Address Details
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="label">Full Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                    placeholder="Building, Street, Area"
                                />
                            </div>
                            <div>
                                <label className="label">City/Town</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                    placeholder="e.g., Nairobi"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-5 border-2 border-red-200 dark:border-red-800">
                        <h3 className="font-bold text-red-900 dark:text-red-300 mb-4 flex items-center gap-2">
                            <FiPhone /> Emergency Contact
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label text-red-900 dark:text-red-300">Contact Name</label>
                                <input
                                    type="text"
                                    name="emergency_contact_name"
                                    value={formData.emergency_contact_name}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                    placeholder="Full name"
                                />
                            </div>
                            <div>
                                <label className="label text-red-900 dark:text-red-300">Contact Phone</label>
                                <input
                                    type="tel"
                                    name="emergency_contact_phone"
                                    value={formData.emergency_contact_phone}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                    placeholder="0712345678"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-4 rounded-xl font-bold border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-4 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-lg shadow-blue-500/30 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Complete Profile & Continue'}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                .label {
                    display: block;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: #374151;
                    margin-bottom: 0.5rem;
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
                }
                :global(.dark) .input-field {
                    background-color: #0a0a0a;
                    border-color: #333;
                    color: white;
                }
                .input-field:focus {
                    border-color: #2563eb;
                    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
                }
            `}</style>
        </div>
    );
}
