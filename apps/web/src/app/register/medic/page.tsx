'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';
import { FiCheckCircle, FiUser, FiActivity, FiBriefcase, FiMapPin, FiClock } from 'react-icons/fi';
import { getCadres, getTitles, getSpecialties, getRegulatoryBody } from '@/lib/data/specialties';

export default function MedicRegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1 = KYC, 2 = Medical, 3 = Availability

    const [formData, setFormData] = useState({
        // A. Professional Identity (KYC)
        fname: '',
        lname: '',
        national_id: '',
        mobile: '',
        email: '',
        password: '',

        // B. Medical Verification
        cadre: 'Medical Doctors', // Broad Cadre
        dr_type: 'Medical Officer (MO)', // Professional Title
        speciality: 'General Practice / Family Medicine', // Specialty
        regulatory_body: 'KMPDC',
        reg_code: '', // Registration Number
        licenceNo: '',
        licenceExpiry: '',
        years_of_experience: 0,

        // C. Availability & Logistics
        hospital_attachment: '',
        address: '', // Clinic Location
        telemedicine: 0,
        on_call: 0,
        fee: 1500,
        about: '',

        // Defaults
        sex: 'Male',
        status: 0 // Inactive until approved
    });

    // Dropdown Options State
    const [availableTitles, setAvailableTitles] = useState<string[]>([]);
    const [availableSpecialties, setAvailableSpecialties] = useState<string[]>([]);

    // Initialize Dropdowns on Mount
    useEffect(() => {
        updateDropdowns(formData.cadre, formData.dr_type);
    }, []);

    const updateDropdowns = (selectedCadre: string, selectedTitle?: string) => {
        const titles = getTitles(selectedCadre);
        const title = (selectedTitle && titles.includes(selectedTitle)) ? selectedTitle : titles[0]; // Default to first title if invalid

        const specialties = getSpecialties(selectedCadre, title);
        const regulatoryBody = getRegulatoryBody(selectedCadre);

        // Fee Logic
        const fixedFeeCadres = ['Nursing', 'Clinical Officers'];
        const isFixedFee = fixedFeeCadres.includes(selectedCadre);
        const newFee = isFixedFee ? 1500 : 2500; // Default base fee

        setAvailableTitles(titles);
        setAvailableSpecialties(specialties);

        setFormData(prev => ({
            ...prev,
            cadre: selectedCadre,
            dr_type: title,
            speciality: specialties[0] || '',
            regulatory_body: regulatoryBody,
            fee: newFee
        }));
    };

    const handleCadreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        updateDropdowns(e.target.value); // Reset title/specialty defaults
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newTitle = e.target.value;
        const specialties = getSpecialties(formData.cadre, newTitle);
        setAvailableSpecialties(specialties);

        setFormData(prev => ({
            ...prev,
            dr_type: newTitle,
            speciality: specialties[0] || ''
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target as any;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked ? 1 : 0 : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await api.post('/auth/register/doctor', {
                ...formData,
                years_of_experience: Number(formData.years_of_experience),
                fee: Number(formData.fee),
                telemedicine: Number(formData.telemedicine),
                on_call: Number(formData.on_call)
            });

            if (res && res.ok) {
                alert('Application submitted successfully! Your account is pending verification by the medical board.');
                router.push('/login');
            } else {
                const data = res ? await res.json() : { message: 'Network error or no response' };
                alert(data.message || 'Registration failed. Please check your details.');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred during submission.');
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const cadres = getCadres();
    const isFixedFee = ['Nursing', 'Clinical Officers'].includes(formData.cadre);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#050505] p-4 py-12">
            <div className="max-w-4xl w-full bg-white dark:bg-[#121212] rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col md:flex-row">

                {/* Sidebar / Progress */}
                <div className="bg-blue-600 dark:bg-blue-900/20 md:w-1/3 p-8 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-8">
                            <div className="w-10 h-10 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">M</div>
                            <span className="font-bold text-xl">Medic Registration</span>
                        </div>

                        <div className="space-y-6">
                            <div className={`flex items-center gap-4 p-3 rounded-xl transition ${step === 1 ? 'bg-white/20 font-bold' : 'opacity-70'}`}>
                                <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-sm">1</div>
                                <div>
                                    <div className="text-sm uppercase tracking-wider text-blue-100">Step 1</div>
                                    <div>Identity & KYC</div>
                                </div>
                            </div>
                            <div className={`flex items-center gap-4 p-3 rounded-xl transition ${step === 2 ? 'bg-white/20 font-bold' : 'opacity-70'}`}>
                                <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-sm">2</div>
                                <div>
                                    <div className="text-sm uppercase tracking-wider text-blue-100">Step 2</div>
                                    <div>Medical Profile</div>
                                </div>
                            </div>
                            <div className={`flex items-center gap-4 p-3 rounded-xl transition ${step === 3 ? 'bg-white/20 font-bold' : 'opacity-70'}`}>
                                <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-sm">3</div>
                                <div>
                                    <div className="text-sm uppercase tracking-wider text-blue-100">Step 3</div>
                                    <div>Availability</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 mt-12">
                        <p className="text-xs text-blue-200">
                            "Join the leading network of verified medical professionals. Provide premium care to patients across the region."
                        </p>
                    </div>

                    {/* Decor */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/50 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
                </div>

                {/* Form Content */}
                <div className="flex-1 p-8 md:p-12">
                    <h2 className="text-2xl font-bold dark:text-white mb-2">
                        {step === 1 && 'Professional Identity'}
                        {step === 2 && 'Medical Licensing'}
                        {step === 3 && 'Logistics & Availability'}
                    </h2>
                    <p className="text-gray-500 text-sm mb-8">Please complete all fields carefully for verification.</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {step === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">First Name</label>
                                        <input name="fname" value={formData.fname} onChange={handleChange} required className="input-field" placeholder="Official First Name" />
                                    </div>
                                    <div>
                                        <label className="label">Last Name</label>
                                        <input name="lname" value={formData.lname} onChange={handleChange} required className="input-field" placeholder="Official Last Name" />
                                    </div>
                                </div>

                                <div>
                                    <label className="label">National ID / Passport No.</label>
                                    <input name="national_id" value={formData.national_id} onChange={handleChange} required className="input-field" placeholder="For Verification" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Mobile Number</label>
                                        <input name="mobile" value={formData.mobile} onChange={handleChange} required className="input-field" placeholder="+254..." />
                                    </div>
                                    <div>
                                        <label className="label">Email Address</label>
                                        <input name="email" type="email" value={formData.email} onChange={handleChange} required className="input-field" placeholder="Work Email" />
                                    </div>
                                </div>

                                <div>
                                    <label className="label">Password</label>
                                    <input name="password" type="password" value={formData.password} onChange={handleChange} required className="input-field" placeholder="Strong Password" />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Professional Cadre</label>
                                        <select
                                            name="cadre"
                                            value={formData.cadre}
                                            onChange={handleCadreChange}
                                            className="input-field"
                                            required
                                        >
                                            {cadres.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label">Professional Title</label>
                                        <select
                                            name="dr_type"
                                            value={formData.dr_type}
                                            onChange={handleTitleChange}
                                            className="input-field"
                                            required
                                        >
                                            {availableTitles.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Specialty</label>
                                        <select
                                            name="speciality"
                                            value={formData.speciality}
                                            onChange={handleChange}
                                            className="input-field"
                                            required
                                        >
                                            {availableSpecialties.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label">Regulatory Body</label>
                                        <input
                                            name="regulatory_body"
                                            value={formData.regulatory_body}
                                            readOnly
                                            className="input-field bg-gray-100 cursor-not-allowed text-gray-500"
                                            title="Automatically determined by Cadre"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Registration Number</label>
                                        <input name="reg_code" value={formData.reg_code} onChange={handleChange} required className="input-field" placeholder="Board Number" />
                                    </div>
                                    <div>
                                        <label className="label">Years of Experience</label>
                                        <input name="years_of_experience" type="number" min="0" value={formData.years_of_experience} onChange={handleChange} className="input-field" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Practice License No.</label>
                                        <input name="licenceNo" value={formData.licenceNo} onChange={handleChange} required className="input-field" placeholder="Current License" />
                                    </div>
                                    <div>
                                        <label className="label">License Expiry</label>
                                        <input name="licenceExpiry" type="date" value={formData.licenceExpiry} onChange={handleChange} required className="input-field" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div>
                                    <label className="label">Current Hospital Attachment</label>
                                    <input name="hospital_attachment" value={formData.hospital_attachment} onChange={handleChange} className="input-field" placeholder="Primary Workplace" />
                                </div>

                                <div>
                                    <label className="label">Clinic Physical Address</label>
                                    <input name="address" value={formData.address} onChange={handleChange} required className="input-field" placeholder="Building, Street, City" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Consultation Fee (KES)</label>
                                        <input
                                            name="fee"
                                            type="number"
                                            value={formData.fee}
                                            onChange={handleChange}
                                            readOnly={isFixedFee}
                                            className={`input-field ${isFixedFee ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
                                            title={isFixedFee ? "Fixed consultation fee" : "Set your professional fee"}
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Bio / About</label>
                                        <input name="about" value={formData.about} onChange={handleChange} className="input-field" placeholder="Short professional bio" />
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" name="telemedicine" checked={Number(formData.telemedicine) === 1} onChange={handleChange} className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" />
                                        <div>
                                            <div className="text-sm font-bold dark:text-gray-200">Telemedicine Willingness</div>
                                            <div className="text-xs text-gray-500">I am available for remote video consultations</div>
                                        </div>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input type="checkbox" name="on_call" checked={Number(formData.on_call) === 1} onChange={handleChange} className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" />
                                        <div>
                                            <div className="text-sm font-bold dark:text-gray-200">On-Call Availability</div>
                                            <div className="text-xs text-gray-500">I am available for emergency dispatch calls</div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        )}

                        <div className="pt-6 flex gap-4">
                            {step > 1 && (
                                <button type="button" onClick={prevStep} className="px-6 py-3 rounded-xl font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition">
                                    Back
                                </button>
                            )}

                            {step < 3 ? (
                                <button type="button" onClick={nextStep} className="flex-1 px-6 py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-lg shadow-blue-500/30">
                                    Continue
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 rounded-xl font-bold bg-green-600 hover:bg-green-700 text-white transition shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Submitting...' : <><FiCheckCircle /> Submit Application</>}
                                </button>
                            )}
                        </div>
                        <div className="text-center text-sm text-gray-500 pt-4">
                            Already have an account? <Link href="/login" className="text-blue-500 font-bold hover:underline">Log In</Link>
                        </div>
                    </form>
                </div>
            </div>

            <style jsx>{`
                .label {
                    display: block;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: #6b7280;
                    margin-bottom: 0.25rem;
                }
                :global(.dark) .label {
                    color: #9ca3af;
                }
                .input-field {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border-radius: 0.75rem;
                    border: 1px solid #e5e7eb;
                    background-color: #f9fafb;
                    outline: none;
                    font-size: 0.875rem;
                    transition: all 0.2s;
                }
                :global(.dark) .input-field {
                    background-color: #050505;
                    border-color: #333;
                    color: white;
                }
                .input-field:focus {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                }
            `}</style>
        </div>
    );
}
