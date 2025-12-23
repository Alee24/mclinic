import { useState } from 'react';
import { api } from '@/lib/api';
import { FiX } from 'react-icons/fi';

interface CreatePatientModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreatePatientModal({ onClose, onSuccess }: CreatePatientModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        phoneNumber: '',
        bloodType: '',
        address: '',
        city: '',
        maritalStatus: '',
        occupation: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelation: '',
        allergies: '',
        existingConditions: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Basic validation
            if (!formData.firstName || !formData.lastName || !formData.dateOfBirth) {
                alert('Please fill in required fields');
                setLoading(false);
                return;
            }

            const res = await api.post('/patients', {
                ...formData,
                // Ensure date is properly formatted if needed, though yyyy-mm-dd from input type="date" is usually fine for ISO start
                dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
            });

            if (res && res.ok) {
                alert('Patient created successfully');
                onSuccess();
            } else {
                alert('Failed to create patient');
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
            <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-4xl rounded-xl shadow-2xl my-8 flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-bold dark:text-white">Add New Patient</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-black dark:hover:text-white transition">
                        <FiX size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
                    <div className="space-y-6">
                        {/* Section: Personal Info */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-primary pl-3">Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">First Name *</label>
                                    <input name="firstName" required className="w-full form-input" value={formData.firstName} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Last Name *</label>
                                    <input name="lastName" required className="w-full form-input" value={formData.lastName} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Date of Birth *</label>
                                    <input type="date" name="dateOfBirth" required className="w-full form-input" value={formData.dateOfBirth} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Gender</label>
                                    <select name="gender" className="w-full form-input" value={formData.gender} onChange={handleChange}>
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Marital Status</label>
                                    <select name="maritalStatus" className="w-full form-input" value={formData.maritalStatus} onChange={handleChange}>
                                        <option value="">Select Status</option>
                                        <option value="single">Single</option>
                                        <option value="married">Married</option>
                                        <option value="divorced">Divorced</option>
                                        <option value="widowed">Widowed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Occupation</label>
                                    <input name="occupation" className="w-full form-input" value={formData.occupation} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        {/* Section: Contact & Location */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-primary pl-3">Contact & Location</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Phone Number</label>
                                    <input name="phoneNumber" type="tel" className="w-full form-input" value={formData.phoneNumber} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">City</label>
                                    <input name="city" className="w-full form-input" value={formData.city} onChange={handleChange} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Address</label>
                                    <input name="address" className="w-full form-input" value={formData.address} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        {/* Section: Medical Info */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-primary pl-3">Medical Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Blood Type</label>
                                    <select name="bloodType" className="w-full form-input" value={formData.bloodType} onChange={handleChange}>
                                        <option value="">Select Type</option>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Allergies</label>
                                    <textarea name="allergies" rows={3} className="w-full form-input" placeholder="List any allergies..." value={formData.allergies} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Existing Conditions</label>
                                    <textarea name="existingConditions" rows={3} className="w-full form-input" placeholder="Diabetes, Hypertension, etc." value={formData.existingConditions} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        {/* Section: Emergency Contact */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 border-l-4 border-primary pl-3">Emergency Contact (Next of Kin)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Name</label>
                                    <input name="emergencyContactName" className="w-full form-input" value={formData.emergencyContactName} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Relation</label>
                                    <input name="emergencyContactRelation" className="w-full form-input" value={formData.emergencyContactRelation} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Phone</label>
                                    <input name="emergencyContactPhone" className="w-full form-input" value={formData.emergencyContactPhone} onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800 mt-8">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="px-8 py-2.5 bg-primary text-black font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50">
                            {loading ? 'Creating...' : 'Create Patient'}
                        </button>
                    </div>
                </form>
            </div>

            <style jsx global>{`
                .form-input {
                    @apply px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition outline-none;
                }
            `}</style>
        </div>
    );
}
