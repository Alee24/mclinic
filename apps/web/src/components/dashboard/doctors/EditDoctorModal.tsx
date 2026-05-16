import { Dialog, Transition, Tab } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { 
    FiX, FiSave, FiBriefcase, FiUpload, FiUser, FiFileText, 
    FiActivity, FiCheck, FiMail, FiPhone, FiCalendar, FiMapPin, FiInfo
} from 'react-icons/fi';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { 
    MEDICAL_SPECIALITIES, 
    MEDICAL_QUALIFICATIONS, 
    KENYAN_HOSPITALS, 
    REGULATORY_BODIES,
    DOCTOR_TYPES
} from '@/lib/medical-constants';

interface EditDoctorModalProps {
    doctorId: number;
    onClose: () => void;
    onSuccess: () => void;
}

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

export default function EditDoctorModal({ doctorId, onClose, onSuccess }: EditDoctorModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({
        fname: '',
        lname: '',
        sex: '',
        dob: '',
        email: '',
        mobile: '',
        address: '',
        speciality: '',
        dr_type: '',
        licenceNo: '',
        reg_code: '',
        licenseExpiryDate: '',
        hospital_attachment: '',
        qualification: '',
        fee: 0,
        about: '',
    });

    const [showOtherSpeciality, setShowOtherSpeciality] = useState(false);
    const [showOtherQualification, setShowOtherQualification] = useState(false);
    const [showOtherHospital, setShowOtherHospital] = useState(false);

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const res = await api.get(`/doctors/${doctorId}`);
                if (res && res.ok) {
                    const data = await res.json();
                    setFormData({
                        fname: data.fname || '',
                        lname: data.lname || '',
                        sex: data.sex || 'Male',
                        dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '',
                        email: data.email || '',
                        mobile: data.mobile || '',
                        address: data.address || '',
                        speciality: data.speciality || '',
                        dr_type: data.dr_type || '',
                        licenceNo: data.licenceNo || '',
                        reg_code: data.reg_code || '',
                        licenseExpiryDate: data.licenceExpiry ? new Date(data.licenceExpiry).toISOString().split('T')[0] : '',
                        hospital_attachment: data.hospital_attachment || '',
                        qualification: data.qualification || '',
                        fee: data.fee || 0,
                        about: data.about || '',
                    });

                    if (data.profile_image) {
                        const url = data.profile_image.startsWith('http') 
                            ? data.profile_image 
                            : `/api/uploads/profiles/${data.profile_image}`;
                        setPreviewUrl(url);
                    }

                    // Initialize "Other" states
                    const isKnownSpeciality = data.speciality && MEDICAL_SPECIALITIES.includes(data.speciality) && data.speciality !== 'Other';
                    if (data.speciality && !isKnownSpeciality) setShowOtherSpeciality(true);

                    const isKnownQualification = data.qualification && MEDICAL_QUALIFICATIONS.includes(data.qualification) && data.qualification !== 'Other';
                    if (data.qualification && !isKnownQualification) setShowOtherQualification(true);

                    const isKnownHospital = data.hospital_attachment && KENYAN_HOSPITALS.includes(data.hospital_attachment) && data.hospital_attachment !== 'Other';
                    if (data.hospital_attachment && !isKnownHospital) setShowOtherHospital(true);
                }
            } catch (err) {
                console.error(err);
                toast.error('Failed to load doctor details');
            } finally {
                setFetching(false);
            }
        };
        fetchDoctor();
    }, [doctorId]);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (selectedFile) {
                const fd = new FormData();
                fd.append('file', selectedFile);
                await api.post(`/doctors/${doctorId}/upload-profile`, fd);
            }

            const res = await api.patch(`/doctors/${doctorId}`, {
                ...formData,
                fee: Number(formData.fee),
                licenceExpiry: formData.licenseExpiryDate ? new Date(formData.licenseExpiryDate).toISOString() : null
            });

            if (res && res.ok) {
                toast.success('Doctor updated successfully');
                onSuccess();
            } else {
                const err = await res?.text();
                throw new Error(err || 'Failed to update');
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return null;

    return (
        <Transition appear show={true} as={Fragment}>
            <Dialog as="div" className="relative z-[2000]" onClose={onClose}>
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md" />
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-[2.5rem] bg-white dark:bg-[#111111] text-left align-middle shadow-[0_50px_100px_rgba(0,0,0,0.25)] transition-all flex flex-col max-h-[90vh] border border-white/10">
                            
                            <div className="px-8 py-8 border-b border-gray-50 dark:border-white/5 flex justify-between items-start bg-slate-50/50 dark:bg-white/5">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                                        <FiBriefcase size={32} />
                                    </div>
                                    <div>
                                        <Dialog.Title as="h3" className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                                            Edit Doctor Account
                                        </Dialog.Title>
                                        <p className="text-slate-500 font-medium text-sm mt-1">Administrative profile management</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-3 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 rounded-2xl transition-all border border-slate-100 dark:border-white/5">
                                    <FiX size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-hidden flex flex-col">
                                <Tab.Group>
                                    <Tab.List className="flex gap-2 bg-white dark:bg-[#111111] px-8 pt-4 border-b border-gray-50 dark:border-white/5">
                                        {['Basic Info', 'Professional', 'Financials'].map((tab) => (
                                            <Tab key={tab} className={({ selected }) => classNames(
                                                'px-6 py-4 text-xs font-black uppercase tracking-widest transition-all rounded-t-2xl outline-none border-b-4',
                                                selected ? 'bg-blue-50/50 dark:bg-blue-500/10 text-blue-600 border-blue-600' : 'text-slate-400 border-transparent hover:text-slate-600'
                                            )}>{tab}</Tab>
                                        ))}
                                    </Tab.List>

                                    <Tab.Panels className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                                        <Tab.Panel className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <div className="flex flex-col md:flex-row items-center gap-8 p-8 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-slate-100">
                                                <div className="relative group">
                                                    <div className="w-32 h-32 bg-white dark:bg-black rounded-3xl border-4 border-white dark:border-white/10 shadow-2xl overflow-hidden flex items-center justify-center">
                                                        {previewUrl ? <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" /> : <FiUser className="text-slate-200" size={60} />}
                                                        <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                            <FiUpload className="text-white" size={24} />
                                                            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="flex-1 space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">First Name</label>
                                                            <input name="fname" value={formData.fname} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-white/10 text-sm font-bold" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Last Name</label>
                                                            <input name="lname" value={formData.lname} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black border border-slate-200 dark:border-white/10 text-sm font-bold" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                                                    <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-400 text-sm font-bold">
                                                        <FiMail /> {formData.email}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Mobile Number</label>
                                                    <input name="mobile" value={formData.mobile} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white text-sm font-bold" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Gender</label>
                                                    <select name="sex" value={formData.sex} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white text-sm font-bold">
                                                        <option value="Male">Male</option>
                                                        <option value="Female">Female</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Date of Birth</label>
                                                    <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white text-sm font-bold" />
                                                </div>
                                            </div>
                                        </Tab.Panel>

                                        <Tab.Panel className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Cadre / Type</label>
                                                    <select name="dr_type" value={formData.dr_type} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white text-sm font-bold">
                                                        {DOCTOR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Specialty</label>
                                                    <select 
                                                        name="speciality" 
                                                        value={showOtherSpeciality ? 'Other' : formData.speciality} 
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val === 'Other') setShowOtherSpeciality(true);
                                                            else { setShowOtherSpeciality(false); setFormData({...formData, speciality: val}); }
                                                        }}
                                                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white text-sm font-bold"
                                                    >
                                                        <option value="">Select Specialty</option>
                                                        {MEDICAL_SPECIALITIES.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                    {showOtherSpeciality && <input name="speciality" value={formData.speciality} onChange={handleChange} placeholder="Custom specialty..." className="w-full mt-2 px-5 py-3 rounded-xl bg-blue-50/50 border border-blue-100 text-sm font-bold" />}
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">License Number</label>
                                                    <input name="licenceNo" value={formData.licenceNo} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white text-sm font-bold" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">License Expiry</label>
                                                    <input type="date" name="licenseExpiryDate" value={formData.licenseExpiryDate} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white text-sm font-bold" />
                                                </div>
                                            </div>
                                        </Tab.Panel>

                                        <Tab.Panel className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <div className="p-8 bg-blue-600 rounded-[2.5rem] text-white shadow-2xl shadow-blue-500/20">
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                                        <FiActivity size={24} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xl font-black">Consultation Rates</h4>
                                                        <p className="text-blue-100 text-xs">Manage professional service fees</p>
                                                    </div>
                                                </div>
                                                <div className="relative">
                                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-200 font-black text-xl">KES</span>
                                                    <input 
                                                        type="number" 
                                                        name="fee" 
                                                        value={formData.fee} 
                                                        onChange={handleChange} 
                                                        className="w-full pl-20 pr-8 py-6 rounded-3xl bg-white/10 border-2 border-white/20 text-3xl font-black focus:bg-white/20 focus:border-white outline-none transition-all" 
                                                    />
                                                </div>
                                            </div>
                                        </Tab.Panel>
                                    </Tab.Panels>
                                </Tab.Group>
                            </div>

                            <div className="px-8 py-6 border-t border-gray-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex justify-end gap-4">
                                <button type="button" onClick={onClose} className="px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">Cancel</button>
                                <button type="button" onClick={handleSubmit} disabled={loading} className="px-10 py-4 bg-blue-600 text-white rounded-[1.25rem] text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30 flex items-center gap-2">
                                    {loading ? 'Saving...' : <><FiSave /> Save Changes</>}
                                </button>
                            </div>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
