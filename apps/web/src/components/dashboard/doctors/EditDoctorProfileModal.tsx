import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { FiX, FiSave, FiBriefcase, FiUpload } from 'react-icons/fi';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

    const [signatureFile, setSignatureFile] = useState<File | null>(null);
    const [stampFile, setStampFile] = useState<File | null>(null);
    const [profileFile, setProfileFile] = useState<File | null>(null);

    const [sigPreview, setSigPreview] = useState('');
    const [stampPreview, setStampPreview] = useState('');
    const [profilePreview, setProfilePreview] = useState('');

    useEffect(() => {
        if (doctor) {
            setFormData({
                regulatory_body: doctor.regulatory_body || '',
                registration_number: doctor.reg_code || '',
                licenceNo: doctor.licenceNo || '',
                years_of_experience: doctor.years_of_experience || 0,
                hospital_attachment: doctor.hospital_attachment || '',
                speciality: doctor.speciality || '',
                consultation_fee: doctor.fee || 0,
                telemedicine: doctor.telemedicine || 0,
                on_call: doctor.on_call || 0,
                about: doctor.about || '',
            });
            setSigPreview(doctor.signatureUrl || '');
            setStampPreview(doctor.stampUrl || '');

            if (doctor.profile_image) {
                if (doctor.profile_image.startsWith('http') || doctor.profile_image.startsWith('blob:')) {
                    setProfilePreview(doctor.profile_image);
                } else {
                    setProfilePreview(`${API_URL}/uploads/profiles/${doctor.profile_image}`);
                }
            } else {
                setProfilePreview('');
            }
        }
    }, [doctor]);

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
        }));
    };

    const handleFileChange = (e: any, type: 'signature' | 'stamp' | 'profile') => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            if (type === 'signature') {
                setSignatureFile(file);
                setSigPreview(previewUrl);
            } else if (type === 'stamp') {
                setStampFile(file);
                setStampPreview(previewUrl);
            } else {
                setProfileFile(file);
                setProfilePreview(previewUrl);
            }
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Prepare Payload (Map frontend fields to DB columns)
            const payload: any = {
                ...formData,
                reg_code: formData.registration_number, // User input registration_number maps to reg_code
                fee: Number(formData.consultation_fee), // Map consultation_fee to fee and ensure number
                years_of_experience: Number(formData.years_of_experience), // Ensure number
                telemedicine: Number(formData.telemedicine),
                on_call: Number(formData.on_call),
            };

            // Remove non-DB fields
            delete payload.registration_number;
            delete payload.consultation_fee;

            // 2. Update Profile Data
            const res = await api.patch(`/doctors/${doctor.id}`, payload);
            if (!res?.ok) throw new Error('Failed to update details');

            // 3. Upload Profile Image if changed
            if (profileFile) {
                const profileData = new FormData();
                profileData.append('file', profileFile);
                toast.loading('Uploading profile picture...', { id: 'profUpload' });
                const profRes = await api.post(`/doctors/${doctor.id}/upload-profile`, profileData, true);
                if (profRes?.ok) toast.success('Profile picture updated', { id: 'profUpload' });
                else toast.error('Profile picture upload failed', { id: 'profUpload' });
            }

            // 4. Upload Signature if changed
            if (signatureFile) {
                const sigData = new FormData();
                sigData.append('file', signatureFile);
                toast.loading('Uploading signature...', { id: 'sigUpload' });
                const sigRes = await api.post(`/doctors/${doctor.id}/upload-signature`, sigData, true); // true for isFormData
                if (sigRes?.ok) toast.success('Signature uploaded', { id: 'sigUpload' });
                else toast.error('Signature upload failed', { id: 'sigUpload' });
            }

            // 5. Upload Stamp if changed
            if (stampFile) {
                const stampData = new FormData();
                stampData.append('file', stampFile);
                toast.loading('Uploading stamp...', { id: 'stampUpload' });
                const stampRes = await api.post(`/doctors/${doctor.id}/upload-stamp`, stampData, true);
                if (stampRes?.ok) toast.success('Stamp uploaded', { id: 'stampUpload' });
                else toast.error('Stamp upload failed', { id: 'stampUpload' });
            }

            toast.success('Profile updated successfully!');
            onSuccess();
        } catch (err) {
            console.error(err);
            toast.error('An error occurred while saving.');
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
                        <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-[#1C1C1C] text-left align-middle shadow-xl transition-all flex flex-col max-h-[90vh]">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                <Dialog.Title as="h3" className="text-xl font-bold dark:text-white flex items-center gap-2">
                                    <FiBriefcase className="text-blue-500" /> Edit Professional Profile
                                </Dialog.Title>
                                <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition">
                                    <FiX className="dark:text-white" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Bio / About</label>
                                            <textarea name="about" value={formData.about} onChange={handleChange} rows={3} className="w-full p-2 rounded-lg border dark:bg-black dark:border-gray-700 dark:text-white text-sm" placeholder="Brief professional summary..." />
                                        </div>

                                        {/* Profile Picture Upload Section (New) */}
                                        <div className="md:col-span-2 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 text-center">
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Profile Picture</label>
                                            <div className="flex items-center justify-center gap-6">
                                                <div className="relative w-24 h-24 bg-white dark:bg-black rounded-full border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center overflow-hidden shrink-0">
                                                    {profilePreview ? (
                                                        <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">No Image</span>
                                                    )}
                                                </div>
                                                <div className="text-left">
                                                    <div className="relative overflow-hidden inline-block">
                                                        <button type="button" className="px-4 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition flex items-center gap-2">
                                                            <FiUpload /> Choose Image
                                                        </button>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleFileChange(e, 'profile')}
                                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-2">Recommended: Square JPG/PNG</p>
                                                </div>
                                            </div>
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

                                    {/* Upload Section (Signature & Stamp) */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t dark:border-gray-800">

                                        {/* Signature */}
                                        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-gray-800 text-center">
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Signature</label>
                                            <div className="relative group w-full h-32 bg-white dark:bg-black rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center overflow-hidden mb-3">
                                                {sigPreview ? (
                                                    <img src={sigPreview} alt="Signature" className="h-full object-contain" />
                                                ) : (
                                                    <span className="text-gray-400 text-xs">No signature</span>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileChange(e, 'signature')}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                />
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                    <FiUpload className="text-white text-2xl" />
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-gray-500">Click to upload new signature</p>
                                        </div>

                                        {/* Stamp */}
                                        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-gray-800 text-center">
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Personal Stamp</label>
                                            <div className="relative group w-full h-32 bg-white dark:bg-black rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center overflow-hidden mb-3">
                                                {stampPreview ? (
                                                    <img src={stampPreview} alt="Stamp" className="h-full object-contain" />
                                                ) : (
                                                    <span className="text-gray-400 text-xs">No stamp</span>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileChange(e, 'stamp')}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                />
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                    <FiUpload className="text-white text-2xl" />
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-gray-500">Click to upload new stamp</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
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
                            </div>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
