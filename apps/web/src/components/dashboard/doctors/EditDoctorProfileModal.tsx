import { Dialog, Transition, Tab } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { 
    FiX, FiSave, FiBriefcase, FiUpload, FiUser, FiFileText, 
    FiMapPin, FiCreditCard, FiClock, FiActivity, FiCheckCircle,
    FiAlertCircle, FiInfo, FiHash, FiCalendar
} from 'react-icons/fi';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import toast from 'react-hot-toast';
import { 
    MEDICAL_SPECIALITIES, 
    MEDICAL_QUALIFICATIONS, 
    KENYAN_HOSPITALS, 
    REGULATORY_BODIES 
} from '@/lib/medical-constants';

interface EditMedicProfileModalProps {
    doctor: any;
    onClose: () => void;
    onSuccess: () => void;
}

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

export default function EditDoctorProfileModal({ doctor, onClose, onSuccess }: EditMedicProfileModalProps) {
    const { user } = useAuth();
    const isNurse = user?.role === 'nurse';
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [formData, setFormData] = useState({
        regulatory_body: '',
        registration_number: '',
        licenceNo: '',
        licenseExpiryDate: '',
        years_of_experience: 0,
        hospital_attachment: '',
        speciality: '',
        qualification: '',
        address: '',
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
                licenseExpiryDate: doctor.licenceExpiry ? new Date(doctor.licenceExpiry).toISOString().split('T')[0] : '',
                years_of_experience: doctor.years_of_experience || 0,
                hospital_attachment: doctor.hospital_attachment || '',
                speciality: doctor.speciality || '',
                qualification: doctor.qualification || '',
                address: doctor.address || '',
                consultation_fee: doctor.fee || 0,
                telemedicine: doctor.telemedicine || 0,
                on_call: doctor.on_call || 0,
                about: doctor.about || '',
            });
            
            const getUrl = (val: string) => {
                if (!val) return '';
                if (val.startsWith('http') || val.startsWith('blob:')) return val;
                return `/api/uploads/${val.includes('profiles') ? '' : 'profiles/'}${val}`;
            };

            setSigPreview(doctor.signatureUrl || '');
            setStampPreview(doctor.stampUrl || '');
            
            if (doctor.profile_image) {
                setProfilePreview(getUrl(doctor.profile_image));
            }

            const isKnownSpeciality = doctor.speciality && MEDICAL_SPECIALITIES.includes(doctor.speciality) && doctor.speciality !== 'Other';
            if (doctor.speciality && !isKnownSpeciality) setShowOtherSpeciality(true);

            const isKnownQualification = doctor.qualification && MEDICAL_QUALIFICATIONS.includes(doctor.qualification) && doctor.qualification !== 'Other';
            if (doctor.qualification && !isKnownQualification) setShowOtherQualification(true);

            const isKnownHospital = doctor.hospital_attachment && KENYAN_HOSPITALS.includes(doctor.hospital_attachment) && doctor.hospital_attachment !== 'Other';
            if (doctor.hospital_attachment && !isKnownHospital) setShowOtherHospital(true);

            const isKnownRegulatory = doctor.regulatory_body && REGULATORY_BODIES.some(b => b.startsWith(doctor.regulatory_body)) && doctor.regulatory_body !== 'Other';
            if (doctor.regulatory_body && !isKnownRegulatory) setShowOtherRegulatory(true);
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
            if (file.size > 2 * 1024 * 1024) {
                toast.error('File size exceeds 2MB limit');
                return;
            }
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
        if (e) e.preventDefault();
        if (!doctor?.id) {
            toast.error('Doctor ID missing. Please refresh.');
            return;
        }
        setLoading(true);

        try {
            const payload: any = {
                ...formData,
                reg_code: formData.registration_number,
                fee: Number(formData.consultation_fee),
                years_of_experience: Number(formData.years_of_experience),
                telemedicine: Number(formData.telemedicine),
                on_call: Number(formData.on_call),
                licenceExpiry: formData.licenseExpiryDate ? new Date(formData.licenseExpiryDate).toISOString() : null,
            };

            delete payload.registration_number;
            delete payload.consultation_fee;
            delete payload.licenseExpiryDate;

            const res = await api.patch(`/doctors/${doctor.id}`, payload);
            if (!res?.ok) {
                const errData = res ? await res.text() : 'No response from server';
                throw new Error(errData);
            }

            const uploadPromises = [];
            
            if (profileFile) {
                const fd = new FormData();
                fd.append('file', profileFile);
                uploadPromises.push(api.post(`/doctors/${doctor.id}/upload-profile`, fd));
            }
            
            if (signatureFile) {
                const fd = new FormData();
                fd.append('file', signatureFile);
                uploadPromises.push(api.post(`/doctors/${doctor.id}/upload-signature`, fd));
            }
            
            if (stampFile) {
                const fd = new FormData();
                fd.append('file', stampFile);
                uploadPromises.push(api.post(`/doctors/${doctor.id}/upload-stamp`, fd));
            }

            if (uploadPromises.length > 0) {
                toast.loading('Uploading documents...', { id: 'uploading' });
                const results = await Promise.all(uploadPromises);
                const failed = results.filter(r => !r?.ok);
                if (failed.length > 0) {
                    toast.error('Some files failed to upload.', { id: 'uploading' });
                } else {
                    toast.success('Files uploaded!', { id: 'uploading' });
                }
            }

            toast.success('Profile updated successfully!');
            onSuccess();
        } catch (err: any) {
            console.error('[EditDoctorProfile] Save Error:', err);
            toast.error(err.message || 'An error occurred while saving.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Transition appear show={true} as={Fragment}>
            <Dialog as="div" className="relative z-[2000]" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-[2.5rem] bg-white dark:bg-[#111111] text-left align-middle shadow-[0_50px_100px_rgba(0,0,0,0.25)] transition-all flex flex-col max-h-[90vh] border border-white/10">
                                
                                <div className="px-8 py-8 border-b border-gray-50 dark:border-white/5 flex justify-between items-start bg-slate-50/50 dark:bg-white/5">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
                                            <FiBriefcase size={32} />
                                        </div>
                                        <div>
                                            <Dialog.Title as="h3" className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                                                Medic Profile
                                            </Dialog.Title>
                                            <p className="text-slate-500 font-medium text-sm mt-1">Manage your professional identity and clinic settings</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={onClose} 
                                        className="p-3 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-2xl transition-all shadow-sm border border-slate-100 dark:border-white/5"
                                    >
                                        <FiX size={20} />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-hidden flex flex-col">
                                    <Tab.Group onChange={setActiveTab}>
                                        <Tab.List className="flex gap-2 bg-white dark:bg-[#111111] px-8 pt-4 border-b border-gray-50 dark:border-white/5">
                                            {[
                                                { label: 'Personal Info', icon: FiUser },
                                                { label: 'Professional', icon: FiActivity },
                                                { label: 'Credentials', icon: FiFileText }
                                            ].map((item, idx) => (
                                                <Tab 
                                                    key={item.label}
                                                    className={({ selected }) => classNames(
                                                        'flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-widest transition-all rounded-t-2xl outline-none border-b-4',
                                                        selected 
                                                            ? 'bg-blue-50/50 dark:bg-blue-500/10 text-blue-600 border-blue-600' 
                                                            : 'text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-200'
                                                    )}
                                                >
                                                    <item.icon size={16} />
                                                    {item.label}
                                                </Tab>
                                            ))}
                                        </Tab.List>

                                        <Tab.Panels className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                                            <Tab.Panel className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                <section>
                                                    <div className="flex flex-col md:flex-row items-center gap-8 p-8 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5">
                                                        <div className="relative group shrink-0">
                                                            <div className="w-32 h-32 bg-white dark:bg-black rounded-3xl border-4 border-white dark:border-white/10 shadow-2xl overflow-hidden flex items-center justify-center">
                                                                {profilePreview ? (
                                                                    <img src={profilePreview} alt="Profile" className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                                                                ) : (
                                                                    <FiUser className="text-slate-200 dark:text-white/10" size={60} />
                                                                )}
                                                                <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                                    <FiUpload className="text-white" size={24} />
                                                                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'profile')} className="hidden" />
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 text-center md:text-left">
                                                            <h4 className="text-lg font-black text-slate-900 dark:text-white mb-1">Profile Identity</h4>
                                                            <p className="text-sm text-slate-500 mb-4 font-medium">Your photo will be visible to patients on the radar and booking pages.</p>
                                                            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                                                <span className="px-3 py-1.5 bg-blue-100/50 dark:bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase rounded-lg">High Resolution</span>
                                                                <span className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 text-slate-500 text-[10px] font-black uppercase rounded-lg">Max 2MB</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </section>

                                                <div className="grid grid-cols-1 gap-8">
                                                    <div className="space-y-2">
                                                        <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                                                            <FiUser size={14} /> Professional Bio
                                                        </label>
                                                        <textarea 
                                                            name="about" 
                                                            value={formData.about} 
                                                            onChange={handleChange} 
                                                            rows={5} 
                                                            className="w-full px-5 py-4 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none" 
                                                            placeholder="Introduce yourself to patients..." 
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                                                            <FiMapPin size={14} /> Clinic / Service Location
                                                        </label>
                                                        <input 
                                                            type="text" 
                                                            name="address" 
                                                            value={formData.address} 
                                                            onChange={handleChange} 
                                                            className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" 
                                                            placeholder="Street address, building, or hospital wing..." 
                                                        />
                                                    </div>
                                                </div>
                                            </Tab.Panel>

                                            <Tab.Panel className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Primary Specialty</label>
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
                                                            className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                                        >
                                                            <option value="">Select Specialty</option>
                                                            {MEDICAL_SPECIALITIES.map(s => <option key={s} value={s}>{s}</option>)}
                                                            <option value="Other">Custom Specialty...</option>
                                                        </select>
                                                        {showOtherSpeciality && (
                                                            <input
                                                                type="text"
                                                                name="speciality"
                                                                value={formData.speciality}
                                                                onChange={handleChange}
                                                                className="w-full mt-3 px-5 py-4 rounded-2xl bg-blue-50/30 border border-blue-200 dark:bg-blue-500/5 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 text-sm font-bold"
                                                                placeholder="Enter your specialty..."
                                                            />
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Highest Qualification</label>
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
                                                            className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                                        >
                                                            <option value="">Select Qualification</option>
                                                            {MEDICAL_QUALIFICATIONS.map(q => <option key={q} value={q}>{q}</option>)}
                                                            <option value="Other">Custom Qualification...</option>
                                                        </select>
                                                        {showOtherQualification && (
                                                            <input
                                                                type="text"
                                                                name="qualification"
                                                                value={formData.qualification}
                                                                onChange={handleChange}
                                                                className="w-full mt-3 px-5 py-4 rounded-2xl bg-blue-50/30 border border-blue-200 dark:bg-blue-500/5 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 text-sm font-bold"
                                                                placeholder="Enter your qualification..."
                                                            />
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Years of Experience</label>
                                                        <input 
                                                            type="number" 
                                                            name="years_of_experience" 
                                                            value={formData.years_of_experience} 
                                                            onChange={handleChange} 
                                                            className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none" 
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Hospital Attachment</label>
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
                                                            className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                                                        >
                                                            <option value="">Select Hospital</option>
                                                            {KENYAN_HOSPITALS.map(h => <option key={h} value={h}>{h}</option>)}
                                                            <option value="Other">Add Custom Hospital...</option>
                                                        </select>
                                                        {showOtherHospital && (
                                                            <input
                                                                type="text"
                                                                name="hospital_attachment"
                                                                value={formData.hospital_attachment}
                                                                onChange={handleChange}
                                                                className="w-full mt-3 px-5 py-4 rounded-2xl bg-blue-50/30 border border-blue-200 dark:bg-blue-500/5 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 text-sm font-bold"
                                                                placeholder="Enter hospital name..."
                                                            />
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border border-slate-100 dark:border-white/5">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="space-y-3">
                                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Consultation Fee (KES)</label>
                                                            <input 
                                                                type="number" 
                                                                name="consultation_fee" 
                                                                value={formData.consultation_fee} 
                                                                onChange={handleChange} 
                                                                className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-lg font-black focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none shadow-sm" 
                                                            />
                                                        </div>

                                                        <div className="flex flex-col gap-4">
                                                            <label className="flex items-center gap-3 p-5 bg-white dark:bg-black border border-slate-100 dark:border-white/10 rounded-2xl shadow-sm cursor-pointer group">
                                                                <input 
                                                                    type="checkbox" 
                                                                    name="telemedicine" 
                                                                    checked={Number(formData.telemedicine) === 1} 
                                                                    onChange={handleChange} 
                                                                    className="w-6 h-6 rounded-lg border-2 border-slate-200 text-blue-600 focus:ring-0 cursor-pointer" 
                                                                />
                                                                <span className="text-sm font-black text-slate-800 dark:text-white">Telemedicine Enabled</span>
                                                            </label>

                                                            <label className="flex items-center gap-3 p-5 bg-white dark:bg-black border border-slate-100 dark:border-white/10 rounded-2xl shadow-sm cursor-pointer group">
                                                                <input 
                                                                    type="checkbox" 
                                                                    name="on_call" 
                                                                    checked={Number(formData.on_call) === 1} 
                                                                    onChange={handleChange} 
                                                                    className="w-6 h-6 rounded-lg border-2 border-slate-200 text-blue-600 focus:ring-0 cursor-pointer" 
                                                                />
                                                                <span className="text-sm font-black text-slate-800 dark:text-white">On-Call Available</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Tab.Panel>

                                            <Tab.Panel className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Regulatory Body</label>
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
                                                            className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none"
                                                        >
                                                            <option value="">Select Board</option>
                                                            {REGULATORY_BODIES.map(b => <option key={b} value={b.split(' (')[0]}>{b}</option>)}
                                                            <option value="Other">Other Regulatory Body...</option>
                                                        </select>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Registration No.</label>
                                                        <input type="text" name="registration_number" value={formData.registration_number} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white text-sm font-bold" />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">License No.</label>
                                                        <input type="text" name="licenceNo" value={formData.licenceNo} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white text-sm font-bold" />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">License Expiry</label>
                                                        <input type="date" name="licenseExpiryDate" value={formData.licenseExpiryDate} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white text-sm font-bold" />
                                                    </div>
                                                </div>

                                                {!isNurse && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-50 dark:border-white/5">
                                                        <div className="space-y-4">
                                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Digital Signature</label>
                                                            <div className="relative group w-full h-40 bg-slate-50 dark:bg-white/5 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-white/10 flex items-center justify-center overflow-hidden transition-all hover:border-blue-500/50">
                                                                {sigPreview ? (
                                                                    <img src={sigPreview} alt="Signature" className="h-full object-contain p-4 mix-blend-multiply dark:mix-blend-normal contrast-125" />
                                                                ) : (
                                                                    <div className="text-center p-6">
                                                                        <FiUpload className="mx-auto text-slate-300 mb-2" size={24} />
                                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Upload Signature</span>
                                                                    </div>
                                                                )}
                                                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'signature')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-4">
                                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Official Stamp</label>
                                                            <div className="relative group w-full h-40 bg-slate-50 dark:bg-white/5 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-white/10 flex items-center justify-center overflow-hidden transition-all hover:border-blue-500/50">
                                                                {stampPreview ? (
                                                                    <img src={stampPreview} alt="Stamp" className="h-full object-contain p-4 mix-blend-multiply dark:mix-blend-normal" />
                                                                ) : (
                                                                    <div className="text-center p-6">
                                                                        <FiUpload className="mx-auto text-slate-300 mb-2" size={24} />
                                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Upload Stamp</span>
                                                                    </div>
                                                                )}
                                                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'stamp')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </Tab.Panel>
                                        </Tab.Panels>
                                    </Tab.Group>
                                </div>

                                <div className="px-8 py-6 border-t border-gray-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Secure Profile Update</span>
                                    </div>
                                    <div className="flex gap-4 w-full md:w-auto">
                                        <button type="button" onClick={onClose} className="flex-1 md:flex-none px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Discard Changes</button>
                                        <button 
                                            type="button" 
                                            onClick={handleSubmit} 
                                            disabled={loading} 
                                            className="flex-1 md:flex-none px-10 py-4 bg-blue-600 text-white rounded-[1.25rem] text-xs font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/30"
                                        >
                                            {loading ? 'Processing...' : <><FiSave size={18} /> Update Profile</>}
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
