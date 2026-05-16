'use client';

import { useState } from 'react';
import { FiCheck, FiArrowRight, FiInfo, FiUser, FiBriefcase, FiAward, FiDollarSign } from 'react-icons/fi';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { MEDICAL_SPECIALITIES, MEDICAL_QUALIFICATIONS, KENYAN_HOSPITALS, REGULATORY_BODIES } from '@/lib/medical-constants';
import { FiChevronDown, FiImage, FiUpload, FiShield, FiFileText, FiCamera } from 'react-icons/fi';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3434';

interface Props {
    doctor: any;
    onComplete: () => void;
}

export default function OnboardingFlow({ doctor, onComplete }: Props) {
    const [step, setStep] = useState(doctor.accepted_terms ? 2 : 1);
    const [loading, setLoading] = useState(false);
    const [showOtherSpeciality, setShowOtherSpeciality] = useState(false);
    const [showOtherQualification, setShowOtherQualification] = useState(false);
    const [showOtherHospital, setShowOtherHospital] = useState(false);
    const [showOtherRegulatory, setShowOtherRegulatory] = useState(false);

    const [profileFile, setProfileFile] = useState<File | null>(null);
    const [profilePreview, setProfilePreview] = useState(doctor.id ? `/api/users/profile-image/${doctor.id}` : '');

    const [formData, setFormData] = useState({
        about: doctor.about || '',
        speciality: doctor.speciality || '',
        qualification: doctor.qualification || '',
        years_of_experience: doctor.years_of_experience || 0,
        hospital_attachment: doctor.hospital_attachment || '',
        fee: doctor.fee || 1500,
        address: doctor.address || '',
        regulatory_body: doctor.regulatory_body || '',
        reg_code: doctor.reg_code || '',
        licenceNo: doctor.licenceNo || '',
        licenceExpiry: doctor.licenceExpiry ? new Date(doctor.licenceExpiry).toISOString().split('T')[0] : ''
    });

    const handleAcceptTerms = async () => {
        setLoading(true);
        try {
            const res = await api.patch(`/doctors/${doctor.id}`, { accepted_terms: 1 });
            if (res?.ok) {
                setStep(2);
                toast.success('Terms accepted. Let\'s set up your profile!');
            }
        } catch (err) {
            toast.error('Failed to save terms acceptance.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (isFinal = false) => {
        setLoading(true);
        try {
            // Upload profile image if it exists and we're on the image step or finishing
            if (profileFile && (step === 2 || isFinal)) {
                const imgData = new FormData();
                imgData.append('file', profileFile);
                await api.post(`/doctors/${doctor.id}/upload-profile`, imgData);
            }

            const updatePayload: any = { ...formData };
            if (isFinal) updatePayload.onboarding_completed = 1;

            const res = await api.patch(`/doctors/${doctor.id}`, updatePayload);
            if (res?.ok) {
                if (isFinal) {
                    toast.success('Onboarding complete! Welcome to M-Clinic.');
                    onComplete();
                } else {
                    setStep(step + 1);
                }
            }
        } catch (err) {
            toast.error('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    if (step === 1) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in zoom-in duration-500">
                <div className="bg-white dark:bg-[#161616] rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <div className="p-8 md:p-12">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-3xl flex items-center justify-center text-3xl">
                                <FiInfo />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">Professional Agreements</h1>
                                <p className="text-gray-500 font-medium tracking-tight">Please review our updated terms and conditions for Medics.</p>
                            </div>
                        </div>

                        <div className="prose prose-blue dark:prose-invert max-w-none h-96 overflow-y-auto pr-4 mb-8 custom-scrollbar">
                            <section className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">1. Scope of Service</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                        As a healthcare professional on M-Clinic Kenya, you agree to provide high-quality medical services, maintaining the highest standards of professional conduct and ethics. This includes timely response to appointments and accurate documentation of patient interactions.
                                    </p>
                                </div>

                                <div className="p-6 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                                    <h3 className="text-xl font-bold text-rose-900 dark:text-rose-100 mb-2 flex items-center gap-2">
                                        <FiDollarSign /> 2. Commission & Billing Structure
                                    </h3>
                                    <p className="text-rose-800 dark:text-rose-200 text-sm leading-relaxed font-medium">
                                        M-Clinic operates on a commission-based model to maintain platform infrastructure and support. 
                                        <strong> A standard commission of 40% will be deducted from your input consultation fees for every completed virtual or physical visit.</strong>
                                    </p>
                                    <div className="mt-4 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
                                        <FiCheck /> Example: If you set your fee to KES 2,000, your earnings will be KES 1,200 after commission.
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">3. Data Privacy & Security</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                        All patient data must be handled in strict accordance with the Data Protection Act (2019). Sharing patient records outside the platform is strictly prohibited.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">4. Payouts and Taxes</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                        Payouts are processed weekly. You are responsible for reporting and paying any individual income taxes as per Kenyan law.
                                    </p>
                                </div>
                            </section>
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                            <p className="text-xs text-gray-400 italic">By clicking "Accept and Continue", you agree to the M-Clinic Kenya Professional Terms of Service.</p>
                            <button
                                onClick={handleAcceptTerms}
                                disabled={loading}
                                className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : 'Accept and Continue'} <FiArrowRight />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 animate-in slide-in-from-right duration-500">
            {/* Multi-step Header */}
            <div className="flex items-center justify-center gap-4 mb-8">
                {[2, 3, 4, 5, 6].map((s) => (
                    <div
                        key={s}
                        className={`w-10 h-2 rounded-full transition-all duration-500 ${step >= s ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-800'}`}
                    />
                ))}
            </div>

            <div className="bg-white dark:bg-[#161616] rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 p-8 md:p-12">
                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-8">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-3xl flex items-center justify-center text-3xl mb-4">
                                <FiCamera />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">Profile Picture</h2>
                            <p className="text-gray-500 font-medium tracking-tight">Upload a professional photo. Patients trust profiles with clear images.</p>
                        </div>

                        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[2.5rem] bg-gray-50/50 dark:bg-black/20">
                            <label htmlFor="profile-upload" className="relative group cursor-pointer block">
                                <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-2xl relative">
                                    {profilePreview ? (
                                        <img src={profilePreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-5xl">
                                            <FiUser />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-2xl">
                                        <FiUpload />
                                    </div>
                                </div>
                                <div className="absolute bottom-0 right-0 md:-bottom-2 md:-right-2 w-10 h-10 md:w-12 md:h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-[#161616]">
                                    <FiCamera />
                                </div>
                            </label>
                            <input
                                id="profile-upload"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setProfileFile(file);
                                        setProfilePreview(URL.createObjectURL(file));
                                    }
                                }}
                            />
                            <div className="mt-8 text-center">
                                <h4 className="font-bold text-gray-900 dark:text-white">Click to upload your photo</h4>
                                <p className="text-sm text-gray-500 mt-1">Supports JPG, PNG or WebP. Max 5MB.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button onClick={() => setStep(1)} className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold rounded-2xl">Back</button>
                            <button
                                onClick={() => handleUpdateProfile()}
                                disabled={loading}
                                className="flex-[2] py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
                            >
                                {profileFile ? 'Upload & Continue' : 'Continue'}
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6">
                        <div className="mb-8">
                            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-3xl flex items-center justify-center text-3xl mb-4">
                                <FiUser />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">Basic Information</h2>
                            <p className="text-gray-500 font-medium">Tell us about yourself. This bio will appear on your public profile.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Professional Bio / About</label>
                                <textarea
                                    className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-800 focus:ring-2 focus:ring-primary outline-none min-h-[150px]"
                                    placeholder="Write a professional summary of your experience..."
                                    value={formData.about}
                                    onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Office / Practice Address</label>
                                <input
                                    type="text"
                                    className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-800 focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="e.g. Upper Hill Medical Centre, Nairobi"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button onClick={() => setStep(2)} className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold rounded-2xl">Back</button>
                            <button
                                onClick={() => handleUpdateProfile()}
                                disabled={!formData.about || !formData.address || loading}
                                className="flex-[2] py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                            >
                                Next Step
                            </button>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-6">
                        <div className="mb-8">
                            <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 rounded-3xl flex items-center justify-center text-3xl mb-4">
                                <FiBriefcase />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">Expertise & Experience</h2>
                            <p className="text-gray-500 font-medium">Let patients know your specialities and where you work.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Medical Speciality</label>
                                <div className="relative">
                                    <select
                                        className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-800 focus:ring-2 focus:ring-primary outline-none appearance-none font-medium"
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
                                    >
                                        <option value="">Select Speciality</option>
                                        {MEDICAL_SPECIALITIES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <FiChevronDown />
                                    </div>
                                </div>
                                {showOtherSpeciality && (
                                    <input
                                        type="text"
                                        className="w-full mt-2 p-4 rounded-2xl bg-gray-50 dark:bg-black border border-blue-200 dark:border-blue-900 focus:ring-2 focus:ring-primary outline-none animate-in slide-in-from-top-2 duration-300"
                                        placeholder="Type your speciality..."
                                        value={formData.speciality}
                                        onChange={(e) => setFormData({ ...formData, speciality: e.target.value })}
                                    />
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Years of Experience</label>
                                    <input
                                        type="number"
                                        className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-800 focus:ring-2 focus:ring-primary outline-none"
                                        value={formData.years_of_experience}
                                        onChange={(e) => setFormData({ ...formData, years_of_experience: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Highest Qualification</label>
                                    <div className="relative">
                                        <select
                                            className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-800 focus:ring-2 focus:ring-primary outline-none appearance-none font-medium"
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
                                        >
                                            <option value="">Select Qualification</option>
                                            {MEDICAL_QUALIFICATIONS.map(q => <option key={q} value={q}>{q}</option>)}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <FiChevronDown />
                                        </div>
                                    </div>
                                    {showOtherQualification && (
                                        <input
                                            type="text"
                                            className="w-full mt-2 p-4 rounded-2xl bg-gray-50 dark:bg-black border border-blue-200 dark:border-blue-900 focus:ring-2 focus:ring-primary outline-none animate-in slide-in-from-top-2 duration-300"
                                            placeholder="Type your qualification..."
                                            value={formData.qualification}
                                            onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                                        />
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Current Hospital Attachment</label>
                                <div className="relative">
                                    <select
                                        className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-800 focus:ring-2 focus:ring-primary outline-none appearance-none font-medium"
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
                                    >
                                        <option value="">Select Hospital</option>
                                        {KENYAN_HOSPITALS.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <FiChevronDown />
                                    </div>
                                </div>
                                {showOtherHospital && (
                                    <input
                                        type="text"
                                        className="w-full mt-2 p-4 rounded-2xl bg-gray-50 dark:bg-black border border-blue-200 dark:border-blue-900 focus:ring-2 focus:ring-primary outline-none animate-in slide-in-from-top-2 duration-300"
                                        placeholder="Type hospital name..."
                                        value={formData.hospital_attachment}
                                        onChange={(e) => setFormData({ ...formData, hospital_attachment: e.target.value })}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button onClick={() => setStep(3)} className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold rounded-2xl">Back</button>
                            <button
                                onClick={() => handleUpdateProfile()}
                                disabled={loading}
                                className="flex-[2] py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
                            >
                                Next Step
                            </button>
                        </div>
                    </div>
                )}

                {step === 5 && (
                    <div className="space-y-6">
                        <div className="mb-8">
                            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-3xl flex items-center justify-center text-3xl mb-4">
                                <FiShield />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">Licensing & Credentials</h2>
                            <p className="text-gray-500 font-medium tracking-tight">Verify your professional credentials as per regulatory standards.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Regulatory Body</label>
                                <div className="relative">
                                    <select
                                        className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-800 focus:ring-2 focus:ring-primary outline-none appearance-none font-medium"
                                        value={showOtherRegulatory ? 'Other' : formData.regulatory_body}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === 'Other') {
                                                setShowOtherRegulatory(true);
                                                setFormData({ ...formData, regulatory_body: '' });
                                            } else {
                                                setShowOtherRegulatory(false);
                                                setFormData({ ...formData, regulatory_body: val.split(' (')[0] });
                                            }
                                        }}
                                    >
                                        <option value="">Select Body</option>
                                        {REGULATORY_BODIES.map(b => <option key={b} value={b.split(' (')[0]}>{b}</option>)}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <FiChevronDown />
                                    </div>
                                </div>
                                {showOtherRegulatory && (
                                    <input
                                        type="text"
                                        className="w-full mt-2 p-4 rounded-2xl bg-gray-50 dark:bg-black border border-blue-200 dark:border-blue-900 focus:ring-2 focus:ring-primary outline-none animate-in slide-in-from-top-2 duration-300"
                                        placeholder="Type regulatory body..."
                                        value={formData.regulatory_body}
                                        onChange={(e) => setFormData({ ...formData, regulatory_body: e.target.value })}
                                    />
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Registration / Board No.</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-800 focus:ring-2 focus:ring-primary outline-none"
                                        placeholder="Board Registration No."
                                        value={formData.reg_code}
                                        onChange={(e) => setFormData({ ...formData, reg_code: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Practice License No.</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-800 focus:ring-2 focus:ring-primary outline-none"
                                        placeholder="Annual Practice License"
                                        value={formData.licenceNo}
                                        onChange={(e) => setFormData({ ...formData, licenceNo: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">License Expiry Date</label>
                                <input
                                    type="date"
                                    className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-black border border-gray-100 dark:border-gray-800 focus:ring-2 focus:ring-primary outline-none"
                                    value={formData.licenceExpiry}
                                    onChange={(e) => setFormData({ ...formData, licenceExpiry: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button onClick={() => setStep(4)} className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold rounded-2xl">Back</button>
                            <button
                                onClick={() => handleUpdateProfile()}
                                disabled={!formData.reg_code || !formData.licenceNo || loading}
                                className="flex-[2] py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
                            >
                                Next Step
                            </button>
                        </div>
                    </div>
                )}

                {step === 6 && (
                    <div className="space-y-6 text-center">
                        <div className="mb-8 text-left">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-3xl flex items-center justify-center text-3xl mb-4">
                                <FiDollarSign />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">Fees & Earnings</h2>
                            <p className="text-gray-500 font-medium tracking-tight">Set your consultation fee. Remember the platform commission.</p>
                        </div>

                        <div className="p-8 bg-green-50 dark:bg-green-900/10 rounded-[2rem] border border-green-100 dark:border-green-900/30 text-center space-y-4">
                            <label className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-widest block">Your Consultation Fee (KES)</label>
                            <input
                                type="number"
                                className="w-full max-w-xs mx-auto text-4xl font-black bg-transparent text-center focus:outline-none text-gray-900 dark:text-white"
                                value={formData.fee}
                                onChange={(e) => setFormData({ ...formData, fee: parseInt(e.target.value) || 0 })}
                            />
                            
                            <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-green-200 dark:border-green-800">
                                <div className="text-center">
                                    <div className="text-[10px] font-bold text-gray-500 uppercase">M-Clinic Commission (40%)</div>
                                    <div className="text-lg font-bold text-rose-500">KES {(formData.fee * 0.4).toLocaleString()}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-[10px] font-bold text-gray-500 uppercase">Your Net Income</div>
                                    <div className="text-lg font-bold text-green-600">KES {(formData.fee * 0.6).toLocaleString()}</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button onClick={() => setStep(5)} className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold rounded-2xl">Back</button>
                            <button
                                onClick={() => handleUpdateProfile(true)}
                                disabled={loading}
                                className="flex-[2] py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
                            >
                                Finish Setup
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
