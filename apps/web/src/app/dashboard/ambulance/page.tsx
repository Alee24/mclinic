'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import {
    FiCheckCircle, FiShield, FiUsers, FiMapPin, FiTruck, FiActivity,
    FiAlertCircle, FiHeart, FiPhone, FiInfo
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
        family_members: [] as any[],
        emergency_contacts: [{ name: '', relationship: '', phone: '' }]
    });

    useEffect(() => {
        api.get('/ambulance/packages').then(res => {
            if (res?.ok) return res.json();
            return [];
        }).then(data => {
            setPackages(data || []);
            if (data && data.length > 0 && formData.package_type === 'individual') {
                setFormData(p => ({ ...p, package_type: data[0].name }));
            }
        });
    }, []);

    const addFamilyMember = () => {
        const currentPackage = packages.find(p => p.name === formData.package_type);
        if (!currentPackage) return;
        const maxAdults = (currentPackage.max_adults || 1) - 1;
        const maxChildren = currentPackage.max_children || 0;
        const totalSlots = maxAdults + maxChildren;

        if (formData.family_members.length >= totalSlots) {
            toast.error(`Package limit reached: Max ${maxAdults} extra adults and ${maxChildren} children.`);
            return;
        }

        setFormData(prev => ({
            ...prev,
            family_members: [...prev.family_members, {
                name: '', relationship: '', dob: '', gender: 'Male',
                identification_number: '', medical_conditions: '', allergies: ''
            }]
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
                if (data.invoice) {
                    setCreatedInvoice(data.invoice);
                    toast.success('Subscription created! Proceeding to payment...');
                } else {
                    toast.success('Subscription successful! Please pay the invoice.');
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
                                        <div className="font-black text-lg">KES {Number(pkg.price).toLocaleString()}</div>
                                        <div className="text-xs text-gray-400">/yr</div>
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
                    {packages.length === 0 && <div className="text-center text-gray-400 py-4">Loading plans...</div>}
                </div>

                {/* RIGHT COLUMN: FORM */}
                <div className="lg:col-span-8">
                    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-2xl shadow-gray-100 border border-gray-100">
                        {/* Section 1 */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                                <FiUsers className="text-gray-400" /> Primary Subscriber
                            </h3>
                            <div className="grid grid-cols-2 gap-5">
                                <div className="col-span-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Full Name</label>
                                    <input
                                        name="primary_subscriber_name"
                                        value={formData.primary_subscriber_name}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:border-green-500 transition"
                                        required
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">ID / Passport</label>
                                    <input
                                        name="identification_number"
                                        value={formData.identification_number}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:border-green-500 transition"
                                        required
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Date of Birth</label>
                                    <input
                                        type="date"
                                        name="dob"
                                        value={formData.dob}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:border-green-500 transition"
                                        required
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Primary Phone</label>
                                    <input
                                        name="primary_phone"
                                        value={formData.primary_phone}
                                        onChange={handleChange}
                                        placeholder="Required for Dispatch"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:border-green-500 transition"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2 */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                                <FiMapPin className="text-gray-400" /> Dispatch Location
                            </h3>
                            <div className="grid grid-cols-2 gap-5">
                                <div className="col-span-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">County</label>
                                    <input
                                        name="county"
                                        value={formData.county}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:border-green-500 transition"
                                        required
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Estate / Area</label>
                                    <input
                                        name="estate"
                                        value={formData.estate}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:border-green-500 transition"
                                        required
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Street / Landmark</label>
                                    <input
                                        name="landmark"
                                        value={formData.landmark}
                                        onChange={handleChange}
                                        placeholder="e.g. Behind Total Station"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:border-green-500 transition"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3 */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                                <FiAlertCircle className="text-gray-400" /> Critical Medical Data
                            </h3>
                            <div className="grid grid-cols-2 gap-5">
                                <div className="col-span-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Blood Type</label>
                                    <select
                                        name="blood_type"
                                        value={formData.blood_type}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:border-green-500 transition"
                                    >
                                        <option value="">Unknown</option>
                                        <option>A+</option><option>O+</option><option>B+</option><option>AB+</option>
                                    </select>
                                </div>
                                <div className="col-span-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Chronic Conditions</label>
                                    <input
                                        name="chronic_conditions"
                                        value={formData.chronic_conditions}
                                        onChange={handleChange}
                                        placeholder="e.g. Diabetes, Asthma"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:border-green-500 transition"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Pre-existing Insurance Details</label>
                                    <input
                                        name="insurance_details"
                                        value={formData.insurance_details}
                                        onChange={handleChange}
                                        placeholder="Provider & Member No. (For Hospital Handover)"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:border-green-500 transition"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Family Section */}
                        {formData.package_type === 'family' && (
                            <div className="mb-8 bg-green-50 p-6 rounded-2xl border border-green-100">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-green-800 flex items-center gap-2">
                                        <FiUsers /> Family Members
                                    </h3>
                                    <button onClick={addFamilyMember} type="button" className="text-xs bg-white border border-green-200 text-green-600 px-3 py-1 rounded font-bold hover:bg-green-100">+ Add</button>
                                </div>

                                <div className="space-y-3">
                                    {formData.family_members.map((member, idx) => (
                                        <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-green-100 relative">
                                            <button type="button" onClick={() => removeFamilyMember(idx)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500">&times;</button>
                                            <div className="grid grid-cols-2 gap-3">
                                                <input
                                                    placeholder="Name"
                                                    value={member.name}
                                                    onChange={e => updateFamilyMember(idx, 'name', e.target.value)}
                                                    className="bg-gray-50 border border-gray-100 rounded px-2 py-1 text-sm outline-none focus:border-green-500"
                                                />
                                                <select
                                                    value={member.relationship}
                                                    onChange={e => updateFamilyMember(idx, 'relationship', e.target.value)}
                                                    className="bg-gray-50 border border-gray-100 rounded px-2 py-1 text-sm outline-none focus:border-green-500"
                                                >
                                                    <option value="">Relation</option>
                                                    <option>Spouse</option><option>Child</option><option>Parent</option>
                                                </select>
                                                <input
                                                    type="date"
                                                    value={member.dob}
                                                    onChange={e => updateFamilyMember(idx, 'dob', e.target.value)}
                                                    className="bg-gray-50 border border-gray-100 rounded px-2 py-1 text-sm outline-none focus:border-green-500"
                                                />
                                                <input
                                                    placeholder="Conditions"
                                                    value={member.medical_conditions}
                                                    onChange={e => updateFamilyMember(idx, 'medical_conditions', e.target.value)}
                                                    className="bg-gray-50 border border-gray-100 rounded px-2 py-1 text-sm outline-none focus:border-green-500"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    {formData.family_members.length === 0 && <p className="text-xs text-green-700 opacity-60 italic text-center">Add family members to cover them.</p>}
                                </div>
                            </div>
                        )}

                        <div className="mt-8">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#00A859] hover:bg-[#008f4c] text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 transition text-lg"
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
