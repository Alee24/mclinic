'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { FiCheckCircle, FiShield, FiUsers, FiMapPin, FiTruck, FiPhone, FiAlertCircle } from 'react-icons/fi';
import PaymentModal from '@/components/dashboard/invoices/PaymentModal';

export default function AmbulanceSubscriptionPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [packages, setPackages] = useState<any[]>([]);
    const [createdInvoice, setCreatedInvoice] = useState<any>(null); // For payment modal

    // Form State
    const [formData, setFormData] = useState({
        // 1. Primary Subscriber
        primary_subscriber_name: '',
        dob: '',
        gender: 'Male',
        identification_number: '',
        nationality: 'Kenyan',
        language_spoken: 'English',

        // 2. Contact & Location
        primary_phone: '',
        secondary_phone: '',
        email: '',
        residential_address: '',
        county: '',
        estate: '',
        street: '',
        house_details: '',
        landmark: '',

        // 3. Medical Bio-Data
        blood_type: '',
        allergies: '',
        chronic_conditions: '',
        current_medications: '',
        preferred_hospital: '',
        insurance_details: '',

        // 4. Family Package
        package_type: 'individual',
        family_members: [] as any[],
        // Emergency Contact
        emergency_contacts: [{ name: '', relationship: '', phone: '' }]
    });

    const addFamilyMember = () => {
        if (!currentPackage) return;
        const maxAdults = (currentPackage.max_adults || 1) - 1; // Primary is 1
        const maxChildren = currentPackage.max_children || 0;
        const totalSlots = maxAdults + maxChildren;

        if (formData.family_members.length >= totalSlots) {
            alert(`This package allows a maximum of ${maxAdults} additional adult(s) and ${maxChildren} children.`);
            return;
        }

        setFormData(prev => ({
            ...prev,
            family_members: [...prev.family_members, { name: '', relationship: '', dob: '', gender: 'Male', medical_conditions: '' }]
        }));
    };

    const updateFamilyMember = (index: number, field: string, value: string) => {
        const updated = [...formData.family_members];
        updated[index] = { ...updated[index], [field]: value };
        setFormData(prev => ({ ...prev, family_members: updated }));
    };

    const removeFamilyMember = (index: number) => {
        const updated = formData.family_members.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, family_members: updated }));
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/ambulance/subscribe', formData);
            if (res?.ok) {
                const data = await res.json();
                // Check if invoice was returned
                if (data.invoice) {
                    setCreatedInvoice(data.invoice);
                    // Don't redirect yet. Wait for payment.
                } else {
                    alert('Ambulance subscription successful! Please check invoices to pay.');
                    router.push('/dashboard');
                }
            } else {
                alert('Failed to subscribe. Please try again.');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred.');
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        // Fetch Packages
        api.get('/ambulance/packages').then(res => {
            if (res?.ok) return res.json();
            return [];
        }).then(data => {
            setPackages(data || []);
            // Select first by default if not set
            if (data && data.length > 0 && formData.package_type === 'individual') {
                setFormData(p => ({ ...p, package_type: data[0].name }));
            }
        });
    }, []);

    // Helper logic
    const currentPackage = packages.find(p => p.name === formData.package_type);

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                    <span className="p-3 bg-red-100 text-red-600 rounded-xl"><FiTruck /></span>
                    Ambulance Service Subscription
                </h1>
                <p className="text-gray-500 mt-2">Secure 24/7 emergency response for you and your family.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sidebar Plan Selection */}
                <div className="space-y-6">
                    {packages.map(pkg => (
                        <div
                            key={pkg.id}
                            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${formData.package_type === pkg.name ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-gray-200 dark:border-gray-800'}`}
                            onClick={() => setFormData(p => ({ ...p, package_type: pkg.name }))}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm"><FiUsers className="text-xl" /></div>
                                <span className="font-bold text-lg">KES {Number(pkg.price).toLocaleString()}<span className="text-xs text-gray-500 font-normal">/yr</span></span>
                            </div>
                            <h3 className="font-bold text-lg dark:text-white">{pkg.name}</h3>
                            <p className="text-xs text-gray-500 mt-1">{pkg.description}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {pkg.features?.map((f: string, i: number) => (
                                    <span key={i} className="text-[10px] bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-sm">{f}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                    {packages.length === 0 && <div className="text-gray-400 text-center py-4">Loading packages...</div>}
                </div>

                {/* Form Area */}
                <div className="md:col-span-2 bg-white dark:bg-[#121212] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Section 1: Subscriber Details */}
                        <div>
                            <h3 className="text-lg font-bold border-b pb-2 mb-4 dark:text-white flex items-center gap-2"><FiUsers /> Primary Subscriber</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[0.7rem] font-bold uppercase text-gray-600 dark:text-gray-400 mb-1">Full Name</label>
                                    <input name="primary_subscriber_name" value={formData.primary_subscriber_name} onChange={handleChange} className="w-full p-2.5 rounded-lg border border-gray-200 bg-gray-50 dark:bg-black dark:border-gray-800 dark:text-white outline-none text-sm transition focus:border-red-500 focus:ring-2 focus:ring-red-500/10" required />
                                </div>
                                <div>
                                    <label className="label">ID / Passport</label>
                                    <input name="identification_number" value={formData.identification_number} onChange={handleChange} className="input-field" required />
                                </div>
                                <div>
                                    <label className="label">Date of Birth</label>
                                    <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="input-field" required />
                                </div>
                                <div>
                                    <label className="label">Primary Phone</label>
                                    <input name="primary_phone" value={formData.primary_phone} onChange={handleChange} className="input-field" required placeholder="Required for Dispatch" />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Location */}
                        <div>
                            <h3 className="text-lg font-bold border-b pb-2 mb-4 dark:text-white flex items-center gap-2"><FiMapPin /> Dispatch Location</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">County</label>
                                    <input name="county" value={formData.county} onChange={handleChange} className="input-field" required />
                                </div>
                                <div>
                                    <label className="label">Estate / Area</label>
                                    <input name="estate" value={formData.estate} onChange={handleChange} className="input-field" required />
                                </div>
                                <div className="col-span-2">
                                    <label className="label">Street / Landmark</label>
                                    <input name="landmark" value={formData.landmark} onChange={handleChange} className="input-field" placeholder="e.g. Behind Total Station" required />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Medical Bio */}
                        <div>
                            <h3 className="text-lg font-bold border-b pb-2 mb-4 dark:text-white flex items-center gap-2"><FiAlertCircle /> Critical Medical Data</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Blood Type</label>
                                    <select name="blood_type" value={formData.blood_type} onChange={handleChange} className="input-field">
                                        <option value="">Unknown</option>
                                        <option>A+</option><option>O+</option><option>B+</option><option>AB+</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Chronic Conditions</label>
                                    <input name="chronic_conditions" value={formData.chronic_conditions} onChange={handleChange} className="input-field" placeholder="e.g. Diabetes, Asthma" />
                                </div>
                                <div className="col-span-2">
                                    <label className="label">Pre-existing Insurance Details</label>
                                    <input name="insurance_details" value={formData.insurance_details} onChange={handleChange} className="input-field" placeholder="Provider & Member No. (For Hospital Handover)" />
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Family Members (Conditional) */}
                        {formData.package_type === 'family' && (
                            <div>
                                <div className="flex justify-between items-center border-b pb-2 mb-4">
                                    <h3 className="text-lg font-bold dark:text-white flex items-center gap-2"><FiUsers /> Family Members</h3>
                                    <button type="button" onClick={addFamilyMember} className="text-sm bg-green-100 text-green-600 px-3 py-1 rounded-lg font-bold hover:bg-green-200">+ Add Member</button>
                                </div>

                                <div className="space-y-4">
                                    {formData.family_members.map((member, idx) => (
                                        <div key={idx} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 relative">
                                            <button type="button" onClick={() => removeFamilyMember(idx)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">&times;</button>
                                            <div className="grid grid-cols-2 gap-3">
                                                <input placeholder="Name" value={member.name} onChange={e => updateFamilyMember(idx, 'name', e.target.value)} className="input-field" />
                                                <select value={member.relationship} onChange={e => updateFamilyMember(idx, 'relationship', e.target.value)} className="input-field">
                                                    <option value="">Relationship</option>
                                                    <option>Spouse</option><option>Child</option><option>Parent</option><option>House Help</option>
                                                </select>
                                                <input type="date" value={member.dob} onChange={e => updateFamilyMember(idx, 'dob', e.target.value)} className="input-field" />
                                                <input placeholder="Any Medical Conditions" value={member.medical_conditions} onChange={e => updateFamilyMember(idx, 'medical_conditions', e.target.value)} className="input-field" />
                                            </div>
                                        </div>
                                    ))}
                                    {formData.family_members.length === 0 && <p className="text-sm text-gray-400 italic">No family members added yet.</p>}
                                </div>
                            </div>
                        )}

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-green-500/30 transition flex items-center justify-center gap-2"
                            >
                                {loading ? 'Processing...' : 'Subscribe & Pay'}
                            </button>
                            <p className="text-center text-xs text-gray-400 mt-4">By subscribing, you verify that all information provided is accurate and consent to emergency medical treatment.</p>
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
                    }}
                />
            )}
        </div>
    );
}
