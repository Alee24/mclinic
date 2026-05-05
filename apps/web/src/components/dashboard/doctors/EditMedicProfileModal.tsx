import { Dialog, Transition, Tab } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { FiX, FiSave, FiBriefcase, FiUpload, FiUser, FiFileText, FiMapPin } from 'react-icons/fi';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import toast from 'react-hot-toast';
import { MEDICAL_SPECIALITIES, MEDICAL_QUALIFICATIONS, KENYAN_HOSPITALS, REGULATORY_BODIES } from '@/lib/medical-constants';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface EditMedicProfileModalProps {
    doctor: any;
    onClose: () => void;
    onSuccess: () => void;
}

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

export default function EditMedicProfileModal({ doctor, onClose, onSuccess }: EditMedicProfileModalProps) {
    const { user } = useAuth();
    const isNurse = user?.role === 'nurse';
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        regulatory_body: '',
        registration_number: '',
        licenceNo: '',
        licenseExpiryDate: '', // New Field
        years_of_experience: 0,
        hospital_attachment: '',
        speciality: '',
        qualification: '', // New Field
        address: '',       // New Field
        consultation_fee: 0,
        telemedicine: 0,
        on_call: 0,
        about: '',
    });

    const [showOtherSpeciality, setShowOtherSpeciality] = useState(false);
    const [showOtherQualification, setShowOtherQualification] = useState(false);
    const [showOtherHospital, setShowOtherHospital] = useState(false);
    const [showOtherRegulatory, setShowOtherRegulatory] = useState(false);

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
                licenseExpiryDate: doctor.licenseExpiryDate ? new Date(doctor.licenseExpiryDate).toISOString().split('T')[0] : '', // Format date
                years_of_experience: doctor.years_of_experience || 0,
                hospital_attachment: doctor.hospital_attachment || '',
                speciality: doctor.speciality || '',
                qualification: doctor.qualification || '', // Load new field
                address: doctor.address || '',             // Load new field
                consultation_fee: doctor.fee || 0,
                telemedicine: doctor.telemedicine || 0,
                on_call: doctor.on_call || 0,
                about: doctor.about || '',
            });
            setSigPreview(doctor.signatureUrl || '');
            setStampPreview(doctor.stampUrl || '');

            // Initialize "Other" states
            if (doctor.speciality && !MEDICAL_SPECIALITIES.includes(doctor.speciality)) setShowOtherSpeciality(true);
            if (doctor.qualification && !MEDICAL_QUALIFICATIONS.includes(doctor.qualification)) setShowOtherQualification(true);
            if (doctor.hospital_attachment && !KENYAN_HOSPITALS.includes(doctor.hospital_attachment)) setShowOtherHospital(true);
            if (doctor.regulatory_body && !REGULATORY_BODIES.some(b => b.startsWith(doctor.regulatory_body))) setShowOtherRegulatory(true);

            if (doctor.profile_image) {
                if (doctor.profile_image.startsWith('http') || doctor.profile_image.startsWith('blob:')) {
                    setProfilePreview(doctor.profile_image);
                } else {
                    setProfilePreview(`${API_URL}/api/uploads/profiles/${doctor.profile_image}`);
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
                const profRes = await api.post(`/doctors/${doctor.id}/upload-profile`, profileData);
                if (profRes?.ok) toast.success('Profile picture updated', { id: 'profUpload' });
                else toast.error('Profile picture upload failed', { id: 'profUpload' });
            }

            // 4. Upload Signature if changed
            if (signatureFile) {
                const sigData = new FormData();
                sigData.append('file', signatureFile);
                toast.loading('Uploading signature...', { id: 'sigUpload' });
                const sigRes = await api.post(`/doctors/${doctor.id}/upload-signature`, sigData);
                if (sigRes?.ok) toast.success('Signature uploaded', { id: 'sigUpload' });
                else toast.error('Signature upload failed', { id: 'sigUpload' });
            }

            // 5. Upload Stamp if changed
            if (stampFile) {
                const stampData = new FormData();
                stampData.append('file', stampFile);
                toast.loading('Uploading stamp...', { id: 'stampUpload' });
                const stampRes = await api.post(`/doctors/${doctor.id}/upload-stamp`, stampData);
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
                        <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-[#1C1C1C] text-left align-middle shadow-xl transition-all flex flex-col max-h-[90vh]">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                                <div>
                                    <Dialog.Title as="h3" className="text-xl font-bold dark:text-white flex items-center gap-2">
                                        <FiBriefcase className="text-blue-500" /> Medic Profile
                                    </Dialog.Title>
                                    <p className="text-sm text-gray-500 mt-1">Update your professional details and credentials.</p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition">
                                    <FiX className="dark:text-white" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-hidden flex flex-col">
                                <Tab.Group>
                                    <Tab.List className="flex space-x-1 bg-white dark:bg-[#1C1C1C] p-4 border-b border-gray-100 dark:border-gray-800">
                                        <Tab className={({ selected }) => classNames('w-full py-2.5 text-sm font-medium leading-5 rounded-lg transition focus:outline-none ring-0', selected ? 'bg-blue-50 text-blue-700 shadow' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700')}>
                                            <div className="flex items-center justify-center gap-2"><FiUser /> Personal Info</div>
                                        </Tab>
                                        <Tab className={({ selected }) => classNames('w-full py-2.5 text-sm font-medium leading-5 rounded-lg transition focus:outline-none ring-0', selected ? 'bg-blue-50 text-blue-700 shadow' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700')}>
                                            <div className="flex items-center justify-center gap-2"><FiBriefcase /> Professional Details</div>
                                        </Tab>
                                        <Tab className={({ selected }) => classNames('w-full py-2.5 text-sm font-medium leading-5 rounded-lg transition focus:outline-none ring-0', selected ? 'bg-blue-50 text-blue-700 shadow' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700')}>
                                            <div className="flex items-center justify-center gap-2"><FiFileText /> Credentials & Docs</div>
                                        </Tab>
                                    </Tab.List>

                                    <Tab.Panels className="flex-1 overflow-y-auto p-6">
                                        {/* PERSONAL INFO TAB */}
                                        <Tab.Panel>
                                            <div className="space-y-6">
                                                {/* Profile Picture */}
                                                <div className="flex items-center gap-6 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-gray-800">
                                                    <div className="relative w-24 h-24 bg-white dark:bg-black rounded-full border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center overflow-hidden shrink-0">
                                                        {profilePreview ? (
                                                            <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-gray-400 text-xs">No Image</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">Profile Photo</h4>
                                                        <div className="relative overflow-hidden inline-block">
                                                            <button type="button" className="px-4 py-2 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition flex items-center gap-2">
                                                                <FiUpload /> Upload New Photo
                                                            </button>
                                                            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'profile')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-2">Recommended: Square JPG/PNG, Max 2MB</p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 mb-1">Bio / About Me</label>
                                                    <textarea name="about" value={formData.about} onChange={handleChange} rows={4} className="w-full p-3 rounded-lg border border-gray-200 dark:bg-black dark:border-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Write a brief professional summary..." />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 mb-1">Physical Address / Location</label>
                                                        <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-200 dark:bg-black dark:border-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Nairobi, Westlands" />
                                                    </div>
                                                </div>
                                            </div>
                                        </Tab.Panel>

                                        {/* PROFESSIONAL DETAILS TAB */}
                                        <Tab.Panel>
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 mb-1">Primary Specialty</label>
                                                        <select
                                                            name="speciality"
                                                            value={showOtherSpeciality ? 'Other' : formData.speciality}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                if (val === 'Other') {
                                                                    setShowOtherSpeciality(true);
                                                                    setFormData({ ...formData, speciality: '' });
                                                                } else {
                                                                    setShowOtherSpeciality(false);
                                                                    setFormData({ ...formData, speciality: val });
                                                                }
                                                            }}
                                                            className="w-full p-3 rounded-lg border border-gray-200 dark:bg-black dark:border-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                        >
                                                            <option value="">Select Speciality</option>
                                                            {MEDICAL_SPECIALITIES.map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                        {showOtherSpeciality && (
                                                            <input
                                                                type="text"
                                                                name="speciality"
                                                                value={formData.speciality}
                                                                onChange={handleChange}
                                                                className="w-full mt-2 p-3 rounded-lg border border-blue-200 dark:bg-black dark:border-blue-900 dark:text-white text-sm animate-in slide-in-from-top-2 duration-300"
                                                                placeholder="Type speciality..."
                                                            />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 mb-1">Highest Qualification</label>
                                                        <select
                                                            name="qualification"
                                                            value={showOtherQualification ? 'Other' : formData.qualification}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                if (val === 'Other') {
                                                                    setShowOtherQualification(true);
                                                                    setFormData({ ...formData, qualification: '' });
                                                                } else {
                                                                    setShowOtherQualification(false);
                                                                    setFormData({ ...formData, qualification: val });
                                                                }
                                                            }}
                                                            className="w-full p-3 rounded-lg border border-gray-200 dark:bg-black dark:border-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                        >
                                                            <option value="">Select Qualification</option>
                                                            {MEDICAL_QUALIFICATIONS.map(q => <option key={q} value={q}>{q}</option>)}
                                                        </select>
                                                        {showOtherQualification && (
                                                            <input
                                                                type="text"
                                                                name="qualification"
                                                                value={formData.qualification}
                                                                onChange={handleChange}
                                                                className="w-full mt-2 p-3 rounded-lg border border-blue-200 dark:bg-black dark:border-blue-900 dark:text-white text-sm animate-in slide-in-from-top-2 duration-300"
                                                                placeholder="Type qualification..."
                                                            />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 mb-1">Years of Experience</label>
                                                        <input type="number" name="years_of_experience" value={formData.years_of_experience} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-200 dark:bg-black dark:border-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 mb-1">Current Hospital Attachment</label>
                                                        <select
                                                            name="hospital_attachment"
                                                            value={showOtherHospital ? 'Other' : formData.hospital_attachment}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                if (val === 'Other') {
                                                                    setShowOtherHospital(true);
                                                                    setFormData({ ...formData, hospital_attachment: '' });
                                                                } else {
                                                                    setShowOtherHospital(false);
                                                                    setFormData({ ...formData, hospital_attachment: val });
                                                                }
                                                            }}
                                                            className="w-full p-3 rounded-lg border border-gray-200 dark:bg-black dark:border-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                        >
                                                            <option value="">Select Hospital</option>
                                                            {KENYAN_HOSPITALS.map(h => <option key={h} value={h}>{h}</option>)}
                                                        </select>
                                                        {showOtherHospital && (
                                                            <input
                                                                type="text"
                                                                name="hospital_attachment"
                                                                value={formData.hospital_attachment}
                                                                onChange={handleChange}
                                                                className="w-full mt-2 p-3 rounded-lg border border-blue-200 dark:bg-black dark:border-blue-900 dark:text-white text-sm animate-in slide-in-from-top-2 duration-300"
                                                                placeholder="Type hospital name..."
                                                            />
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                                    <h4 className="font-bold text-gray-900 dark:text-white mb-4">Service Settings</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-500 mb-1">Consultation Fee (KES)</label>
                                                            <input type="number" name="consultation_fee" value={formData.consultation_fee} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-200 dark:bg-black dark:border-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                                        </div>
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl cursor-pointer">
                                                                <input type="checkbox" id="tele" name="telemedicine" checked={Number(formData.telemedicine) === 1} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                                                <label htmlFor="tele" className="text-sm font-medium dark:text-white cursor-pointer select-none">Opt-in for Telemedicine</label>
                                                            </div>
                                                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl cursor-pointer">
                                                                <input type="checkbox" id="call" name="on_call" checked={Number(formData.on_call) === 1} onChange={handleChange} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                                                <label htmlFor="call" className="text-sm font-medium dark:text-white cursor-pointer select-none">Available On-Call</label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Tab.Panel>

                                        {/* CREDENTIALS TAB */}
                                        <Tab.Panel>
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 mb-1">Regulatory Body</label>
                                                        <select
                                                            name="regulatory_body"
                                                            value={showOtherRegulatory ? 'Other' : formData.regulatory_body}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                if (val === 'Other') {
                                                                    setShowOtherRegulatory(true);
                                                                    setFormData({ ...formData, regulatory_body: '' });
                                                                } else {
                                                                    setShowOtherRegulatory(false);
                                                                    setFormData({ ...formData, regulatory_body: val });
                                                                }
                                                            }}
                                                            className="w-full p-3 rounded-lg border border-gray-200 dark:bg-black dark:border-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                        >
                                                            <option value="">Select Body</option>
                                                            {REGULATORY_BODIES.map(b => <option key={b} value={b.split(' (')[0]}>{b}</option>)}
                                                        </select>
                                                        {showOtherRegulatory && (
                                                            <input
                                                                type="text"
                                                                name="regulatory_body"
                                                                value={formData.regulatory_body}
                                                                onChange={handleChange}
                                                                className="w-full mt-2 p-3 rounded-lg border border-blue-200 dark:bg-black dark:border-blue-900 dark:text-white text-sm animate-in slide-in-from-top-2 duration-300"
                                                                placeholder="Type regulatory body..."
                                                            />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 mb-1">Registration Number</label>
                                                        <input type="text" name="registration_number" value={formData.registration_number} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-200 dark:bg-black dark:border-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 mb-1">License Number</label>
                                                        <input type="text" name="licenceNo" value={formData.licenceNo} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-200 dark:bg-black dark:border-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 mb-1">License Expiry Date</label>
                                                        <input type="date" name="licenseExpiryDate" value={formData.licenseExpiryDate} onChange={handleChange} className="w-full p-3 rounded-lg border border-gray-200 dark:bg-black dark:border-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                                    </div>
                                                </div>

                                                {!isNurse && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                                                        {/* Signature */}
                                                        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-gray-800 text-center">
                                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Digital Signature</label>
                                                            <div className="relative group w-full h-32 bg-white dark:bg-black rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center overflow-hidden mb-3">
                                                                {sigPreview ? (
                                                                    <img src={sigPreview} alt="Signature" className="h-full object-contain" />
                                                                ) : (
                                                                    <span className="text-gray-400 text-xs">No signature</span>
                                                                )}
                                                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'signature')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                                    <FiUpload className="text-white text-2xl" />
                                                                </div>
                                                            </div>
                                                            <p className="text-[10px] text-gray-500">Required for prescriptions</p>
                                                        </div>

                                                        {/* Stamp */}
                                                        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-gray-800 text-center">
                                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Official Stamp</label>
                                                            <div className="relative group w-full h-32 bg-white dark:bg-black rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center overflow-hidden mb-3">
                                                                {stampPreview ? (
                                                                    <img src={stampPreview} alt="Stamp" className="h-full object-contain" />
                                                                ) : (
                                                                    <span className="text-gray-400 text-xs">No stamp</span>
                                                                )}
                                                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'stamp')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                                    <FiUpload className="text-white text-2xl" />
                                                                </div>
                                                            </div>
                                                            <p className="text-[10px] text-gray-500">Required for official documents</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {isNurse && (
                                                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-100 dark:border-yellow-900/20">
                                                        <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                                                            Note: Stamp and Signature portals are restricted for nursing profiles.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </Tab.Panel>
                                    </Tab.Panels>
                                </Tab.Group>
                            </div>

                            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5 flex justify-between items-center">
                                <span className="text-xs text-gray-500">* All changes require saving</span>
                                <div className="flex gap-3">
                                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition">
                                        Cancel
                                    </button>
                                    <button type="button" onClick={handleSubmit} disabled={loading} className="px-6 py-2 text-sm font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-500/30">
                                        {loading ? 'Saving...' : <><FiSave /> Save Changes</>}
                                    </button>
                                </div>
                            </div>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
