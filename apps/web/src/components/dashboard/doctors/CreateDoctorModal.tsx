import { Dialog, Transition, Tab } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { 
    FiX, FiSave, FiBriefcase, FiUser, FiFileText, 
    FiActivity, FiMail, FiPhone, FiMapPin, FiPlus, FiAlertCircle
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

interface CreateDoctorModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
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
        fee: 1500,
        bio: '',
    });

    const [showOtherSpeciality, setShowOtherSpeciality] = useState(false);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name || !formData.email || !formData.mobile) {
            toast.error('Please fill in all required fields');
            return;
        }

        setLoading(true);

        try {
            const res = await api.post('/doctors', {
                ...formData,
                licenceNo: formData.licenseNumber,
                speciality: formData.specialty,
                qualification: formData.qualifications,
                hospital_attachment: formData.hospitalAffiliation,
                licenceExpiry: formData.licenseExpiryDate ? new Date(formData.licenseExpiryDate).toISOString() : null,
            });

            if (res && res.ok) {
                toast.success('Medic account created successfully');
                onSuccess();
            } else {
                const err = await res?.text();
                throw new Error(err || 'Failed to create');
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'An error occurred during registration');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Transition appear show={true} as={Fragment}>
            <Dialog as="div" className="relative z-[2000]" onClose={onClose}>
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md" />
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-[2.5rem] bg-white dark:bg-[#111111] text-left align-middle shadow-[0_50px_100px_rgba(0,0,0,0.25)] transition-all flex flex-col max-h-[90vh] border border-white/10">
                            
                            <div className="px-8 py-8 border-b border-gray-50 dark:border-white/5 flex justify-between items-start bg-slate-50/50 dark:bg-white/5">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
                                        <FiPlus size={32} />
                                    </div>
                                    <div>
                                        <Dialog.Title as="h3" className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                                            Register New Medic
                                        </Dialog.Title>
                                        <p className="text-slate-500 font-medium text-sm mt-1">Add a new professional to the medical radar</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-3 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 rounded-2xl transition-all border border-slate-100 dark:border-white/5">
                                    <FiX size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-hidden flex flex-col">
                                <Tab.Group>
                                    <Tab.List className="flex gap-2 bg-white dark:bg-[#111111] px-8 pt-4 border-b border-gray-50 dark:border-white/5">
                                        {['Account Profile', 'Professional Details', 'Service Settings'].map((tab) => (
                                            <Tab key={tab} className={({ selected }) => classNames(
                                                'px-6 py-4 text-xs font-black uppercase tracking-widest transition-all rounded-t-2xl outline-none border-b-4',
                                                selected ? 'bg-blue-50/50 dark:bg-blue-500/10 text-blue-600 border-blue-600' : 'text-slate-400 border-transparent hover:text-slate-600'
                                            )}>{tab}</Tab>
                                        ))}
                                    </Tab.List>

                                    <Tab.Panels className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                                        <Tab.Panel className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="md:col-span-2 space-y-2">
                                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Full Name *</label>
                                                    <input name="name" value={formData.name} onChange={handleChange} required className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white text-sm font-bold" placeholder="e.g. Dr. Jane Smith" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Email Address *</label>
                                                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white text-sm font-bold" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Mobile Number *</label>
                                                    <input name="mobile" value={formData.mobile} onChange={handleChange} required className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white text-sm font-bold" />
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
                                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Primary Cadre</label>
                                                    <select name="dr_type" value={formData.dr_type} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white text-sm font-bold">
                                                        {DOCTOR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Specialty</label>
                                                    <select name="specialty" value={formData.specialty} onChange={handleChange} required className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white text-sm font-bold">
                                                        <option value="">Select Specialty</option>
                                                        {MEDICAL_SPECIALITIES.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">License Number *</label>
                                                    <input name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} required className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white text-sm font-bold font-mono" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">KMPDC/Reg Code</label>
                                                    <input name="reg_code" value={formData.reg_code} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white text-sm font-bold font-mono" />
                                                </div>
                                                <div className="space-y-2 md:col-span-2">
                                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Hospital Attachment</label>
                                                    <select name="hospitalAffiliation" value={formData.hospitalAffiliation} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white text-sm font-bold">
                                                        <option value="">Select Hospital</option>
                                                        {KENYAN_HOSPITALS.map(h => <option key={h} value={h}>{h}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        </Tab.Panel>

                                        <Tab.Panel className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <div className="p-8 bg-blue-600 rounded-[2.5rem] text-white shadow-2xl">
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                                        <FiActivity size={24} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xl font-black tracking-tight">Initial Consultation Fee</h4>
                                                        <p className="text-blue-100 text-xs font-medium">This can be updated by the medic later</p>
                                                    </div>
                                                </div>
                                                <div className="relative">
                                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-200 font-black text-xl">KES</span>
                                                    <input 
                                                        type="number" 
                                                        name="fee" 
                                                        value={formData.fee} 
                                                        onChange={handleChange} 
                                                        className="w-full pl-20 pr-8 py-6 rounded-3xl bg-white/10 border-2 border-white/20 text-3xl font-black focus:bg-white/20 outline-none" 
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="p-6 bg-amber-50 dark:bg-amber-500/5 rounded-2xl border border-amber-100 dark:border-amber-500/20 flex gap-4">
                                                <FiAlertCircle className="text-amber-500 shrink-0 mt-1" size={20} />
                                                <p className="text-xs text-amber-800 dark:text-amber-200 font-medium leading-relaxed">
                                                    Registering a medic will create a corresponding system user account. They will receive an email with instructions to set their password.
                                                </p>
                                            </div>
                                        </Tab.Panel>
                                    </Tab.Panels>
                                </Tab.Group>
                            </div>

                            <div className="px-8 py-6 border-t border-gray-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex justify-end gap-4">
                                <button type="button" onClick={onClose} className="px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">Cancel</button>
                                <button type="button" onClick={handleSubmit} disabled={loading} className="px-10 py-4 bg-blue-600 text-white rounded-[1.25rem] text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/30 flex items-center gap-2">
                                    {loading ? 'Creating...' : <><FiSave /> Register Medic</>}
                                </button>
                            </div>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
