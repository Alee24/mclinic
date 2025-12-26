import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { FiX, FiSave, FiHeart, FiActivity, FiShield } from 'react-icons/fi';
import { api } from '@/lib/api';

interface EditMedicalProfileModalProps {
    user: any;
    patient: any;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditMedicalProfileModal({ user, patient, onClose, onSuccess }: EditMedicalProfileModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        dob: '',
        blood_group: '',
        genotype: '',
        height: '',
        weight: '',
        allergies: '',
        medical_history: '',
        family_history: '',
        social_history: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_relation: '',
        insurance_provider: '',
        insurance_policy_no: '',
        shif_number: '',
        subscription_plan: '',
        current_medications: '',
        surgical_history: '',
        disability_status: '',
    });

    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        if (patient) {
            setFormData({
                dob: user.dob || '', // DOB usually on User
                blood_group: patient.blood_group || '',
                genotype: patient.genotype || '',
                height: patient.height || '',
                weight: patient.weight || '',
                allergies: patient.allergies || '',
                medical_history: patient.medical_history || '',
                family_history: patient.family_history || '',
                social_history: patient.social_history || '',
                emergency_contact_name: patient.emergency_contact_name || '',
                emergency_contact_phone: patient.emergency_contact_phone || '',
                emergency_contact_relation: patient.emergency_contact_relation || '',
                insurance_provider: patient.insurance_provider || '',
                insurance_policy_no: patient.insurance_policy_no || '',
                shif_number: patient.shif_number || '',
                subscription_plan: patient.subscription_plan || 'Pay-As-You-Go',
                current_medications: patient.current_medications || '',
                surgical_history: patient.surgical_history || '',
                disability_status: patient.disability_status || '',
            });
        }
    }, [patient]);

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(''); // Clear error on change
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMsg('');

        try {
            const res = await api.patch('/medical-profiles/me', formData);
            if (res && res.ok) {
                setSuccessMsg('Profile updated successfully!');
                setTimeout(() => {
                    onSuccess();
                }, 1500);
            } else {
                setError('Failed to update profile. Please try again.');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred. Check your connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Transition appear show={true} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-[#1C1C1C] p-6 text-left align-middle shadow-xl transition-all">
                            <div className="flex justify-between items-center mb-6">
                                <Dialog.Title as="h3" className="text-xl font-bold dark:text-white flex items-center gap-2">
                                    <FiActivity className="text-blue-500" /> Update Medical Profile
                                </Dialog.Title>
                                <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition">
                                    <FiX className="dark:text-white" />
                                </button>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm border border-red-200">
                                    {error}
                                </div>
                            )}

                            {successMsg && (
                                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm border border-green-200">
                                    {successMsg}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Vitals */}
                                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl space-y-4">
                                    <h4 className="font-bold text-sm text-gray-500 uppercase flex items-center gap-2">
                                        <FiActivity /> Vitals & Biodata
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="col-span-2 md:col-span-1">
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Date of Birth</label>
                                            <input
                                                type="date"
                                                name="dob"
                                                value={formData.dob}
                                                onChange={handleChange}
                                                className="w-full p-2 rounded-lg border dark:bg-black dark:border-gray-700 dark:text-white text-sm"
                                            />
                                            {formData.dob && (
                                                <div className="text-xs text-blue-500 font-bold mt-1">
                                                    Age: {new Date().getFullYear() - new Date(formData.dob).getFullYear()} years
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Blood Group</label>
                                            <select name="blood_group" value={formData.blood_group} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-black dark:border-gray-700 dark:text-white text-sm">
                                                <option value="">Select</option>
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
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Genotype</label>
                                            <input type="text" name="genotype" value={formData.genotype} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-black dark:border-gray-700 dark:text-white text-sm" placeholder="e.g. AA" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Height (cm)</label>
                                            <input type="number" name="height" value={formData.height} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-black dark:border-gray-700 dark:text-white text-sm" placeholder="175" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Weight (kg)</label>
                                            <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-black dark:border-gray-700 dark:text-white text-sm" placeholder="70" />
                                        </div>
                                    </div>
                                </div>

                                {/* History */}
                                <div className="space-y-4">
                                    <h4 className="font-bold text-sm text-gray-500 uppercase flex items-center gap-2">
                                        <FiHeart /> Medical History
                                    </h4>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Allergies</label>
                                            <textarea name="allergies" value={formData.allergies} onChange={handleChange} rows={2} className="w-full p-3 rounded-lg border dark:bg-black dark:border-gray-700 dark:text-white text-sm" placeholder="List any allergies..." />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Medical History (Chronic Conditions, Surgeries)</label>
                                            <textarea name="medical_history" value={formData.medical_history} onChange={handleChange} rows={3} className="w-full p-3 rounded-lg border dark:bg-black dark:border-gray-700 dark:text-white text-sm" placeholder="Diabetes, Hypertension..." />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Current Medications</label>
                                            <textarea name="current_medications" value={formData.current_medications} onChange={handleChange} rows={2} className="w-full p-3 rounded-lg border dark:bg-black dark:border-gray-700 dark:text-white text-sm" placeholder="List active medications..." />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Surgical History</label>
                                            <textarea name="surgical_history" value={formData.surgical_history} onChange={handleChange} rows={2} className="w-full p-3 rounded-lg border dark:bg-black dark:border-gray-700 dark:text-white text-sm" placeholder="List past surgeries..." />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Disability Status</label>
                                            <input type="text" name="disability_status" value={formData.disability_status} onChange={handleChange} className="w-full p-3 rounded-lg border dark:bg-black dark:border-gray-700 dark:text-white text-sm" placeholder="Mobility, Hearing, Vision issues..." />
                                        </div>
                                    </div>
                                </div>

                                {/* Emergency & Insurance */}
                                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl space-y-4">
                                    <h4 className="font-bold text-sm text-gray-500 uppercase flex items-center gap-2">
                                        <FiShield /> Emergency & Insurance
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Emergency Contact Name</label>
                                            <input type="text" name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-black dark:border-gray-700 dark:text-white text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Contact Phone</label>
                                            <input type="text" name="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-black dark:border-gray-700 dark:text-white text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Insurance Provider</label>
                                            <input type="text" name="insurance_provider" value={formData.insurance_provider} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-black dark:border-gray-700 dark:text-white text-sm" placeholder="e.g. NHIF, AAR" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Policy Number</label>
                                            <input type="text" name="insurance_policy_no" value={formData.insurance_policy_no} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-black dark:border-gray-700 dark:text-white text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">SHIF Number</label>
                                            <input type="text" name="shif_number" value={formData.shif_number} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-black dark:border-gray-700 dark:text-white text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Subscription Plan</label>
                                            <select name="subscription_plan" value={formData.subscription_plan} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-black dark:border-gray-700 dark:text-white text-sm">
                                                <option value="Pay-As-You-Go">Pay-As-You-Go</option>
                                                <option value="Individual Basic">Individual Basic</option>
                                                <option value="Family Gold">Family Gold</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-800">
                                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={loading} className="px-6 py-2 text-sm font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
                                        {loading ? 'Saving...' : <><FiSave /> Save Changes</>}
                                    </button>
                                </div>
                            </form>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
