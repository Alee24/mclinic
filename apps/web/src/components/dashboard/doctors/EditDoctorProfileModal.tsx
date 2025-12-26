import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { FiX, FiSave, FiBriefcase, FiList } from 'react-icons/fi';
import { api } from '@/lib/api';

interface EditDoctorProfileModalProps {
    doctor: any;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditDoctorProfileModal({ doctor, onClose, onSuccess }: EditDoctorProfileModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        regulatory_body: '',
        registration_number: '',
        licenceNo: '',
        years_of_experience: 0,
        hospital_attachment: '',
        speciality: '',
        consultation_fee: 0,
        telemedicine: 0,
        on_call: 0,
        about: '',
    });

    const [error, setError] = useState('');

    useEffect(() => {
        if (doctor) {
            setFormData({
                regulatory_body: doctor.regulatory_body || '',
                registration_number: doctor.reg_code || '', // Assuming reg_code is Registration Number
                licenceNo: doctor.licenceNo || '',
                years_of_experience: doctor.years_of_experience || 0,
                hospital_attachment: doctor.hospital_attachment || '',
                speciality: doctor.speciality || '',
                consultation_fee: doctor.fee || 0,
                telemedicine: doctor.telemedicine || 0,
                on_call: doctor.on_call || 0,
                about: doctor.about || '',
            });
        }
    }, [doctor]);

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
        }));
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Using /doctors/:id endpoint
            const res = await api.patch(`/doctors/${doctor.id}`, formData);
            if (res && res.ok) {
                onSuccess();
            } else {
                setError('Failed to update profile');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred');
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
                                    <FiBriefcase className="text-blue-500" /> Edit Professional Profile
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

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Bio / About</label>
                                        <textarea name="about" value={formData.about} onChange={handleChange} rows={3} className="w-full p-2 rounded-lg border dark:bg-black dark:border-gray-700 dark:text-white text-sm" placeholder="Brief professional summary..." />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Regulatory Body</label>
                                        <select name="regulatory_body" value={formData.regulatory_body} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-black dark:border-gray-700 dark:text-white text-sm">
                                            <option value="">Select Body</option>
                                            <option value="KMPDC">KMPDC</option>
                                            <option value="NCK">NCK</option>
                                            <option value="COC">COC</option>
                                            <option value="PPB">PPB</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Registration Number</label>
                                        <input type="text" name="registration_number" value={formData.registration_number} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-black dark:border-gray-700 dark:text-white text-sm" />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">License Number</label>
                                        <input type="text" name="licenceNo" value={formData.licenceNo} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-black dark:border-gray-700 dark:text-white text-sm" />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Primary Specialty</label>
                                        <input type="text" name="speciality" value={formData.speciality} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-black dark:border-gray-700 dark:text-white text-sm" />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Years of Experience</label>
                                        <input type="number" name="years_of_experience" value={formData.years_of_experience} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-black dark:border-gray-700 dark:text-white text-sm" />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Current Hospital Attachment</label>
                                        <input type="text" name="hospital_attachment" value={formData.hospital_attachment} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-black dark:border-gray-700 dark:text-white text-sm" />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Consultation Fee (KES)</label>
                                        <input type="number" name="consultation_fee" value={formData.consultation_fee} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-black dark:border-gray-700 dark:text-white text-sm" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                                        <input type="checkbox" name="telemedicine" checked={Number(formData.telemedicine) === 1} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                        <label className="text-sm font-medium dark:text-white">Telemedicine Willingness</label>
                                    </div>
                                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                                        <input type="checkbox" name="on_call" checked={Number(formData.on_call) === 1} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                        <label className="text-sm font-medium dark:text-white">Available On-Call</label>
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
