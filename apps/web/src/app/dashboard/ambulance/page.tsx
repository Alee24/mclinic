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

    useEffect(() => {
        // Fetch Packages
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

    // Filter out unwanted features for display
    const getCleanFeatures = (pkg: any) => {
        const features = pkg.features || [];
        return features.filter((f: string) => !f.toLowerCase().includes('air evacuation'));
    };

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center p-4 bg-red-50 text-red-600 rounded-full mb-4 shadow-sm">
                    <FiTruck className="text-3xl" />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    Ambulance Service Subscription
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-3 text-lg max-w-2xl mx-auto">
                    Professional 24/7 ground ambulance response ensuring critical care for you and your loved ones.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Plans */}
                <div className="lg:col-span-4 space-y-4">
                    <h3 className="text-sm font-bold uppercase text-gray-400 tracking-wider mb-2">Select a Plan</h3>
                    {packages.map(pkg => {
                        const isSelected = formData.package_type === pkg.name;
                        return (
                            <div
                                key={pkg.id}
                                onClick={() => setFormData(p => ({ ...p, package_type: pkg.name }))}
                                className={`
                                    relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 group
                                    ${isSelected
                                        ? 'border-green-500 bg-green-50/50 dark:bg-green-900/10 ring-1 ring-green-500 shadow-md'
                                        : 'border-gray-200 dark:border-gray-800 hover:border-green-200 dark:hover:border-gray-700 bg-white dark:bg-[#121212]'
                                    }
                                `}
                            >
                                {isSelected && (
                                    <div className="absolute top-4 right-4 text-green-600">
                                        <FiCheckCircle className="text-xl" />
                                    </div>
                                )}
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
                                        <FiShield className="text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg dark:text-white capitalize leading-tight">{pkg.name}</h3>
                                        <span className="text-xs text-gray-500 font-medium">Auto-renewal available</span>
                                    </div>
                                </div>

                                <div className="mt-4 mb-4">
                                    <span className="text-2xl font-black text-gray-900 dark:text-white">
                                        KES {Number(pkg.price).toLocaleString()}
                                    </span>
                                    <span className="text-sm text-gray-500 ml-1">/year</span>
                                </div>

                                <div className="space-y-2">
                                    {getCleanFeatures(pkg).map((f: string, i: number) => (
                                        <div key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <FiCheckCircle className="mt-0.5 text-green-500 flex-shrink-0" />
                                            <span className="leading-snug">{f}</span>
                                        </div>
                                    ))}
                                    <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <FiCheckCircle className="mt-0.5 text-green-500 flex-shrink-0" />
                                        <span className="leading-snug">Advanced cardiac life support</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Right Column: Form */}
                <div className="lg:col-span-8">
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-[#121212] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
                        <div className="p-6 md:p-8 space-y-10">

                            {/* Section 1 */}
                            <section>
                                <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-100 dark:border-gray-800">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">1</div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Primary Subscriber Details</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="form-group">
                                        <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Full Name</label>
                                        <input
                                            name="primary_subscriber_name"
                                            value={formData.primary_subscriber_name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-0 transition-all font-medium"
                                            placeholder="Enter full legal name"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">ID / Passport</label>
                                        <input
                                            name="identification_number"
                                            value={formData.identification_number}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-0 transition-all font-medium"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Date of Birth</label>
                                        <input
                                            type="date"
                                            name="dob"
                                            value={formData.dob}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-0 transition-all font-medium"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Primary Phone</label>
                                        <div className="relative">
                                            <FiPhone className="absolute left-4 top-3.5 text-gray-400" />
                                            <input
                                                name="primary_phone"
                                                value={formData.primary_phone}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-black border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-0 transition-all font-medium"
                                                placeholder="e.g. 0712 345 678"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 2 */}
                            <section>
                                <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-100 dark:border-gray-800">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">2</div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Dispatch Location</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Residential Address (County / Estate / House)</label>
                                        <input
                                            name="residential_address"
                                            value={formData.residential_address}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-0 transition-all font-medium"
                                            placeholder="Detailed address helps us reach you faster"
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Nearest Landmark / Directions</label>
                                        <input
                                            name="landmark"
                                            value={formData.landmark}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-0 transition-all font-medium"
                                            placeholder="e.g. Behind Total Station, Blue Gate"
                                            required
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Section 3 */}
                            <section>
                                <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-100 dark:border-gray-800">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">3</div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Critical Medical Info</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Blood Type</label>
                                        <select
                                            name="blood_type"
                                            value={formData.blood_type}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-0 transition-all font-medium"
                                        >
                                            <option value="">Unknown</option>
                                            <option>A+</option><option>A-</option>
                                            <option>B+</option><option>B-</option>
                                            <option>AB+</option><option>AB-</option>
                                            <option>O+</option><option>O-</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Chronic Conditions</label>
                                        <input
                                            name="chronic_conditions"
                                            value={formData.chronic_conditions}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-0 transition-all font-medium"
                                            placeholder="None"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Section 4: Family Members */}
                            {formData.package_type === 'family' && (
                                <section className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-800">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">4</div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Family Members</h3>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addFamilyMember}
                                            className="text-sm bg-white dark:bg-gray-800 text-blue-600 border border-blue-200 shadow-sm px-4 py-2 rounded-lg font-bold hover:bg-blue-50 transition"
                                        >
                                            + Add Member
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {formData.family_members.map((member, idx) => (
                                            <div key={idx} className="p-5 rounded-xl bg-white dark:bg-[#0a0a0a] shadow-sm border border-gray-100 dark:border-gray-800 relative">
                                                <button type="button" onClick={() => removeFamilyMember(idx)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition">
                                                    <span className="sr-only">Remove</span>
                                                    &times;
                                                </button>
                                                <h4 className="text-xs font-bold uppercase text-gray-400 mb-3">Family Member {idx + 1}</h4>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <input
                                                        placeholder="Full Name"
                                                        value={member.name}
                                                        onChange={e => updateFamilyMember(idx, 'name', e.target.value)}
                                                        className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-black border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-0 transition-all text-sm"
                                                        required
                                                    />
                                                    <select
                                                        value={member.relationship}
                                                        onChange={e => updateFamilyMember(idx, 'relationship', e.target.value)}
                                                        className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-black border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-0 transition-all text-sm"
                                                        required
                                                    >
                                                        <option value="">Relationship</option>
                                                        <option>Spouse</option><option>Child</option><option>Parent</option><option>House Help</option>
                                                    </select>
                                                    <input
                                                        type="date"
                                                        value={member.dob}
                                                        onChange={e => updateFamilyMember(idx, 'dob', e.target.value)}
                                                        className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-black border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-0 transition-all text-sm"
                                                        required
                                                    />
                                                    <input
                                                        placeholder="Medical Conditions / Allergies"
                                                        value={member.medical_conditions}
                                                        onChange={e => updateFamilyMember(idx, 'medical_conditions', e.target.value)}
                                                        className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-black border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-0 transition-all text-sm"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        {formData.family_members.length === 0 && (
                                            <div className="text-center py-6 text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                                                <p>No family members added yet.</p>
                                                <p className="text-xs mt-1">Click "Add Member" to include dependents.</p>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}

                        </div>

                        {/* Footer Action */}
                        <div className="p-6 md:p-8 bg-gray-50 dark:bg-black/20 border-t border-gray-100 dark:border-gray-800">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="text-sm text-gray-500 leading-relaxed md:max-w-md">
                                    <FiCheckCircle className="inline mr-1 text-green-500" />
                                    Review your details carefully. By continuing, you agree to the <span className="underline cursor-pointer">Terms of Service</span>.
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full md:w-auto px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-green-500/20 transition flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>Processing...</>
                                    ) : (
                                        <>
                                            <span>Subscribe & Pay</span>
                                            <span className="bg-white/20 px-2 py-0.5 rounded text-sm">
                                                KES {Number(packages.find(p => p.name === formData.package_type)?.price || 0).toLocaleString()}
                                            </span>
                                        </>
                                    )}
                                </button>
                            </div>
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
                        toast.success('Payment successfully processed!');
                    }}
                />
            )}
        </div>
    );
}
