'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import {
    FiCheckCircle, FiShield, FiUsers, FiMapPin, FiTruck, FiActivity,
    FiAlertCircle, FiHeart, FiPhone, FiInfo, FiPlus, FiTrash2
} from 'react-icons/fi';
import PaymentModal from '@/components/dashboard/invoices/PaymentModal';
import toast from 'react-hot-toast';

export default function AmbulanceSubscriptionPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [packages, setPackages] = useState<any[]>([]);
    const [createdInvoice, setCreatedInvoice] = useState<any>(null);

    // Form State
    const [formData, setFormData] = useState({
        primary_subscriber_name: '',
        dob: '',
        gender: 'Male',
        identification_number: '',
        nationality: 'Kenyan',
        language_spoken: 'English',
        primary_phone: '',
        secondary_phone: '',
        email: '',
        residential_address: '',
        county: '',
        estate: '',
        street: '',
        house_details: '',
        landmark: '',
        blood_type: '',
        allergies: '',
        chronic_conditions: '',
        current_medications: '',
        preferred_hospital: '',
        insurance_details: '',
        package_type: 'individual',
        // Structured Family Data
        spouse: { name: '', dob: '', gender: 'Female', identification_number: '', medical_conditions: '' },
        children: Array(4).fill(0).map(() => ({ name: '', dob: '', gender: 'Male', medical_conditions: '' })),
        parents: [
            { relationship: 'Father', name: '', dob: '', identification_number: '', medical_conditions: '' },
            { relationship: 'Mother', name: '', dob: '', identification_number: '', medical_conditions: '' }
        ],
        emergency_contacts: [{ name: '', relationship: '', phone: '' }]
    });

    useEffect(() => {
        api.get('/ambulance/packages').then(res => {
            if (res?.ok) return res.json();
            return [];
        }).then(data => {
            setPackages(data || []);
            if (data && data.length > 0) {
                setFormData(p => ({ ...p, package_type: data[0].name }));
            }
        });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const updateSpouse = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            spouse: { ...prev.spouse, [field]: value }
        }));
    };

    const updateChild = (index: number, field: string, value: string) => {
        const updated = [...formData.children];
        updated[index] = { ...updated[index], [field]: value };
        setFormData(prev => ({ ...prev, children: updated }));
    };

    const updateParent = (index: number, field: string, value: string) => {
        const updated = [...formData.parents];
        updated[index] = { ...updated[index], [field]: value };
        setFormData(prev => ({ ...prev, parents: updated }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Map structured data to the single family_members array expected by backend
        let family_members = [];
        const isFamily = formData.package_type.toLowerCase().includes('family');
        const isParents = formData.package_type.toLowerCase().includes('parent');

        if (isFamily) {
            if (formData.spouse.name) {
                family_members.push({ ...formData.spouse, relationship: 'Spouse' });
            }
            formData.children.forEach(child => {
                if (child.name) family_members.push({ ...child, relationship: 'Child' });
            });
        } else if (isParents) {
            formData.parents.forEach(parent => {
                if (parent.name) family_members.push({ ...parent });
            });
        }

        const submissionData = {
            ...formData,
            family_members
        };

        try {
            const res = await api.post('/ambulance/subscribe', submissionData);
            if (res?.ok) {
                const data = await res.json();
                if (data.invoice) {
                    setCreatedInvoice(data.invoice);
                    toast.success('Subscription created! Proceeding to payment...');
                } else {
                    toast.success('Subscription successful!');
                    router.push('/dashboard');
                }
            } else {
                toast.error('Failed to subscribe. Please try again.');
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred during submission.');
        } finally {
            setLoading(false);
        }
    };

    const getCleanFeatures = (pkg: any) => {
        const features = pkg.features || [];
        return features.filter((f: string) => !f.toLowerCase().includes('air evacuation'));
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 font-sans">
            <div className="mb-10">
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-red-100/50 text-red-500 rounded-xl">
                        <FiTruck className="text-2xl" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                        Ambulance Service Subscription
                    </h1>
                </div>
                <p className="text-gray-500 ml-16">Secure 24/7 emergency response for you and your family.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT COLUMN: PLANS */}
                <div className="lg:col-span-4 space-y-4">
                    {packages.map(pkg => {
                        const isSelected = formData.package_type === pkg.name;
                        return (
                            <div
                                key={pkg.id}
                                onClick={() => setFormData(p => ({ ...p, package_type: pkg.name }))}
                                className={`
                                    relative p-6 rounded-2xl border-2 transition-all cursor-pointer group
                                    ${isSelected ? 'border-green-500 bg-green-50/30' : 'border-gray-100 hover:border-gray-200 bg-white'}
                                `}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-50 rounded-lg text-gray-600"><FiUsers /></div>
                                        <div>
                                            <div className="font-bold text-lg leading-none">{pkg.name}</div>
                                            <div className="text-xs text-gray-400 mt-1">Full coverage</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-black text-lg text-green-700">
                                            KES {(Number(pkg.price) + Number(pkg.commission)).toLocaleString()}
                                        </div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase">
                                            {pkg.validity_days === 1 ? 'One-off' : '/ Year'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mt-4">
                                    {getCleanFeatures(pkg).map((f: string, i: number) => (
                                        <span key={i} className="text-[10px] uppercase font-bold px-2 py-1 bg-white border border-gray-100 rounded text-gray-500">
                                            {f}
                                        </span>
                                    ))}
                                    <span className="text-[10px] uppercase font-bold px-2 py-1 bg-white border border-gray-100 rounded text-gray-500">24/7 Support</span>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* RIGHT COLUMN: FORM */}
                <div className="lg:col-span-8">
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-[#161616] rounded-3xl p-8 shadow-2xl shadow-gray-100 dark:shadow-none border border-gray-100 dark:border-gray-800">
                        {/* Section 1: Primary Subscriber */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">
                                <FiUsers className="text-gray-400" /> Primary Subscriber
                            </h3>
                            <div className="grid grid-cols-2 gap-5">
                                <FormInput label="Full Name" name="primary_subscriber_name" value={formData.primary_subscriber_name} onChange={handleChange} required />
                                <FormInput label="ID / Passport" name="identification_number" value={formData.identification_number} onChange={handleChange} required />
                                <FormInput label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} required />
                                <FormInput label="Primary Phone" name="primary_phone" value={formData.primary_phone} onChange={handleChange} placeholder="Dispatch phone" required />
                            </div>
                        </div>

                        {/* Section 2: Dispatch Location */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">
                                <FiMapPin className="text-gray-400" /> Dispatch Location
                            </h3>
                            <div className="grid grid-cols-2 gap-5">
                                <FormInput label="County" name="county" value={formData.county} onChange={handleChange} required />
                                <FormInput label="Estate / Area" name="estate" value={formData.estate} onChange={handleChange} required />
                                <div className="col-span-2">
                                    <FormInput label="Street / Landmark" name="landmark" value={formData.landmark} onChange={handleChange} placeholder="e.g. Behind Total Station" required />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Family Package Specifics */}
                        {formData.package_type.toLowerCase().includes('family') && (
                            <div className="mb-8 space-y-6">
                                <h3 className="text-lg font-bold text-green-700 flex items-center gap-2 mb-4 pb-2 border-b border-green-100">
                                    <FiUsers /> Family Details (Spouse & Kids)
                                </h3>
                                
                                {/* Spouse */}
                                <div className="bg-gray-50 dark:bg-black/20 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                                    <div className="text-xs font-black uppercase text-gray-400 mb-4">Spouse Details</div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormInput label="Spouse Full Name" value={formData.spouse.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSpouse('name', e.target.value)} />
                                        <FormInput label="ID Number" value={formData.spouse.identification_number} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSpouse('identification_number', e.target.value)} />
                                        <FormInput label="Date of Birth" type="date" value={formData.spouse.dob} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSpouse('dob', e.target.value)} />
                                        <FormInput label="Medical Conditions" value={formData.spouse.medical_conditions} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSpouse('medical_conditions', e.target.value)} placeholder="e.g. None" />
                                    </div>
                                </div>

                                {/* Children */}
                                <div className="space-y-4">
                                    <div className="text-xs font-black uppercase text-gray-400">Children Details (Up to 4)</div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {formData.children.map((child, idx) => (
                                            <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                                <div className="text-[10px] font-bold text-green-600 mb-2">CHILD #{idx + 1}</div>
                                                <div className="space-y-2">
                                                    <input 
                                                        placeholder="Child Name" 
                                                        className="w-full text-xs p-2 bg-gray-50 dark:bg-black/30 border border-gray-100 dark:border-gray-700 rounded outline-none"
                                                        value={child.name}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateChild(idx, 'name', e.target.value)}
                                                    />
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <input 
                                                            type="date" 
                                                            className="w-full text-[10px] p-2 bg-gray-50 dark:bg-black/30 border border-gray-100 dark:border-gray-700 rounded outline-none"
                                                            value={child.dob}
                                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateChild(idx, 'dob', e.target.value)}
                                                        />
                                                        <select 
                                                            className="w-full text-[10px] p-2 bg-gray-50 dark:bg-black/30 border border-gray-100 dark:border-gray-700 rounded outline-none"
                                                            value={child.gender}
                                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateChild(idx, 'gender', e.target.value)}
                                                        >
                                                            <option>Male</option>
                                                            <option>Female</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Section 4: Parents Package Specifics */}
                        {formData.package_type.toLowerCase().includes('parent') && (
                            <div className="mb-8 space-y-6">
                                <h3 className="text-lg font-bold text-blue-700 flex items-center gap-2 mb-4 pb-2 border-b border-blue-100">
                                    <FiUsers /> Parents Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {formData.parents.map((parent, idx) => (
                                        <div key={idx} className="bg-gray-50 dark:bg-black/20 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                                            <div className="text-xs font-black uppercase text-blue-600 mb-4">{parent.relationship} Details</div>
                                            <div className="space-y-3">
                                                <FormInput label="Full Name" value={parent.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParent(idx, 'name', e.target.value)} />
                                                <FormInput label="ID Number" value={parent.identification_number} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParent(idx, 'identification_number', e.target.value)} />
                                                <FormInput label="Date of Birth" type="date" value={parent.dob} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParent(idx, 'dob', e.target.value)} />
                                                <FormInput label="Medical Conditions" value={parent.medical_conditions} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParent(idx, 'medical_conditions', e.target.value)} placeholder="e.g. Hypertension" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Section 5: Medical Data */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">
                                <FiAlertCircle className="text-gray-400" /> Primary Subscriber Health
                            </h3>
                            <div className="grid grid-cols-2 gap-5">
                                <div className="col-span-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Blood Type</label>
                                    <select
                                        name="blood_type"
                                        value={formData.blood_type}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-gray-800 rounded-lg px-4 py-3 text-sm font-semibold text-gray-700 dark:text-white outline-none focus:border-green-500 transition"
                                    >
                                        <option value="">Unknown</option>
                                        <option>A+</option><option>O+</option><option>B+</option><option>AB+</option>
                                        <option>A-</option><option>O-</option><option>B-</option><option>AB-</option>
                                    </select>
                                </div>
                                <FormInput label="Chronic Conditions" name="chronic_conditions" value={formData.chronic_conditions} onChange={handleChange} placeholder="e.g. Diabetes" />
                                <div className="col-span-2">
                                    <FormInput label="Insurance Details (Member No.)" name="insurance_details" value={formData.insurance_details} onChange={handleChange} placeholder="For Hospital Handover" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#00A859] hover:bg-[#008f4c] text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 dark:shadow-none transition text-lg"
                            >
                                {loading ? 'Processing...' : 'Subscribe & Pay'}
                            </button>
                            <p className="text-center text-[10px] text-gray-400 mt-4 leading-relaxed max-w-lg mx-auto">
                                By subscribing, you verify that all information provided is accurate and consent to emergency medical treatment.
                            </p>
                        </div>
                    </form>
                </div>
            </div>

            {createdInvoice && (
                <PaymentModal
                    invoice={createdInvoice}
                    onClose={() => setCreatedInvoice(null)}
                    onSuccess={() => {
                        setCreatedInvoice(null);
                        router.push('/dashboard');
                        toast.success('Payment successful');
                    }}
                />
            )}
        </div>
    );
}

function FormInput({ label, type = "text", ...props }: any) {
    return (
        <div className="w-full">
            <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 block">{label}</label>
            <input
                type={type}
                {...props}
                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-gray-800 rounded-lg px-4 py-3 text-sm font-semibold text-gray-700 dark:text-white outline-none focus:border-green-500 transition"
            />
        </div>
    );
}
