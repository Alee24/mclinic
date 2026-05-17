'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth, UserRole } from '@/lib/auth';
import { api, getApiBaseUrl } from '@/lib/api';
import { 
    FiSettings, 
    FiCreditCard, 
    FiGlobe, 
    FiUploadCloud, 
    FiCheckCircle, 
    FiAlertCircle, 
    FiPhone, 
    FiMail, 
    FiMapPin,
    FiFacebook,
    FiTwitter,
    FiInstagram,
    FiLinkedin,
    FiLoader,
    FiInfo
} from 'react-icons/fi';

interface SettingItem {
    key: string;
    value: string;
}

export default function FinanceSettingsPage() {
    const { user } = useAuth();
    
    // UI tabs state
    const [activeTab, setActiveTab] = useState<'profile' | 'payments' | 'social'>('profile');

    // Loading & message states
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Form fields state
    const [companyName, setCompanyName] = useState<string>('');
    const [companyTagline, setCompanyTagline] = useState<string>('');
    const [companyEmail, setCompanyEmail] = useState<string>('');
    const [companyPhone, setCompanyPhone] = useState<string>('');
    const [companyAddress, setCompanyAddress] = useState<string>('');
    const [logoUrl, setLogoUrl] = useState<string>('');
    const [bankName, setBankName] = useState<string>('');
    const [bankAccName, setBankAccName] = useState<string>('');
    const [bankAccNo, setBankAccNo] = useState<string>('');
    const [mpesaTillPaybill, setMpesaTillPaybill] = useState<string>('');
    const [fbUrl, setFbUrl] = useState<string>('');
    const [twitterUrl, setTwitterUrl] = useState<string>('');
    const [igUrl, setIgUrl] = useState<string>('');
    const [linkedinUrl, setLinkedinUrl] = useState<string>('');

    // Logo upload references
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadingLogo, setUploadingLogo] = useState<boolean>(false);

    // Fetch all current settings
    const fetchSettings = async () => {
        setLoading(true);
        setErrorMessage(null);
        try {
            const res = await api.get('/settings');
            if (res && res.ok) {
                const settingsList: SettingItem[] = await res.json();
                
                // Map values to states
                settingsList.forEach((item) => {
                    switch (item.key) {
                        case 'COMPANY_NAME': setCompanyName(item.value); break;
                        case 'COMPANY_TAGLINE': setCompanyTagline(item.value); break;
                        case 'COMPANY_EMAIL': setCompanyEmail(item.value); break;
                        case 'COMPANY_PHONE': setCompanyPhone(item.value); break;
                        case 'COMPANY_ADDRESS': setCompanyAddress(item.value); break;
                        case 'COMPANY_LOGO_URL': setLogoUrl(item.value); break;
                        case 'COMPANY_BANK_NAME': setBankName(item.value); break;
                        case 'COMPANY_BANK_ACC_NAME': setBankAccName(item.value); break;
                        case 'COMPANY_BANK_ACC_NO': setBankAccNo(item.value); break;
                        case 'COMPANY_MPESA_TILL_PAYBILL': setMpesaTillPaybill(item.value); break;
                        case 'COMPANY_FB': setFbUrl(item.value); break;
                        case 'COMPANY_TWITTER': setTwitterUrl(item.value); break;
                        case 'COMPANY_IG': setIgUrl(item.value); break;
                        case 'COMPANY_LINKEDIN': setLinkedinUrl(item.value); break;
                    }
                });
            } else {
                const text = await res?.text();
                throw new Error(text || 'Could not fetch settings');
            }
        } catch (err: any) {
            console.error('Fetch settings error:', err);
            setErrorMessage(err.message || 'Failed to fetch settings from API.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === UserRole.ADMIN) {
            fetchSettings();
        }
    }, [user]);

    // Handle settings submission
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccessMessage(null);
        setErrorMessage(null);

        const settingsToSave = [
            { key: 'COMPANY_NAME', value: companyName },
            { key: 'COMPANY_TAGLINE', value: companyTagline },
            { key: 'COMPANY_EMAIL', value: companyEmail },
            { key: 'COMPANY_PHONE', value: companyPhone },
            { key: 'COMPANY_ADDRESS', value: companyAddress },
            { key: 'COMPANY_LOGO_URL', value: logoUrl },
            { key: 'COMPANY_BANK_NAME', value: bankName },
            { key: 'COMPANY_BANK_ACC_NAME', value: bankAccName },
            { key: 'COMPANY_BANK_ACC_NO', value: bankAccNo },
            { key: 'COMPANY_MPESA_TILL_PAYBILL', value: mpesaTillPaybill },
            { key: 'COMPANY_FB', value: fbUrl },
            { key: 'COMPANY_TWITTER', value: twitterUrl },
            { key: 'COMPANY_IG', value: igUrl },
            { key: 'COMPANY_LINKEDIN', value: linkedinUrl },
        ];

        try {
            const res = await api.post('/settings', { settings: settingsToSave });
            if (res && res.ok) {
                setSuccessMessage('Branding, Banking and General settings successfully saved system-wide!');
                setTimeout(() => setSuccessMessage(null), 5000);
            } else {
                const text = await res?.text();
                throw new Error(text || 'Unexpected API failure while updating settings.');
            }
        } catch (err: any) {
            console.error('Save settings error:', err);
            setErrorMessage(`Failed to save settings: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    // Handle active brand logo upload
    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingLogo(true);
        setSuccessMessage(null);
        setErrorMessage(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/settings/upload-logo', formData);
            if (res && res.ok) {
                const data = await res.json();
                setLogoUrl(data.filename);
                setSuccessMessage('Brand logo uploaded successfully! Click "Save Changes" to apply this logo system-wide.');
                setTimeout(() => setSuccessMessage(null), 5000);
            } else {
                const text = await res?.text();
                throw new Error(text || 'Failed to upload brand logo.');
            }
        } catch (err: any) {
            console.error('Upload logo error:', err);
            setErrorMessage(`Logo Upload Error: ${err.message}`);
        } finally {
            setUploadingLogo(false);
        }
    };

    // Get absolute logo preview URL
    const getLogoPreviewUrl = () => {
        if (!logoUrl) return 'https://mclinic.co.ke/wp-content/uploads/2025/04/M-Clinic-Logo.png';
        if (logoUrl.startsWith('http')) return logoUrl;
        return `${getApiBaseUrl()}/settings/logo-image/${logoUrl}`;
    };

    if (user?.role !== UserRole.ADMIN) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-[#121212] rounded-2xl border border-gray-100 dark:border-gray-800 text-center shadow-sm">
                <FiAlertCircle className="w-12 h-12 text-red-500 mb-4 animate-bounce" />
                <h3 className="text-xl font-bold dark:text-white">Access Denied</h3>
                <p className="text-gray-500 text-sm mt-1 max-w-sm">
                    Only system Administrators have authorization to modify clinic-wide financial and branding settings.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight dark:text-white flex items-center gap-3">
                        <FiSettings className="text-[#0B6E40]" /> General Clinic Settings
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Overhaul global clinic information, payment till & accounts, brand logos, and document receipts dynamically.
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving || loading}
                    className="bg-[#0B6E40] text-white font-bold px-6 py-3 rounded-xl shadow-md hover:bg-[#08522e] disabled:opacity-50 transition-all flex items-center gap-2 justify-center"
                >
                    {saving ? (
                        <>
                            <FiLoader className="animate-spin" /> Saving...
                        </>
                    ) : (
                        'Save Changes'
                    )}
                </button>
            </div>

            {/* Notification triggers showing exact errors */}
            {successMessage && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 flex items-start gap-3 shadow-sm transition-all duration-300">
                    <FiCheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <div>
                        <span className="font-bold text-sm">Success</span>
                        <p className="text-xs mt-0.5">{successMessage}</p>
                    </div>
                </div>
            )}

            {errorMessage && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl text-red-800 dark:text-red-300 flex items-start gap-3 shadow-sm transition-all duration-300">
                    <FiAlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-600 dark:text-red-400" />
                    <div>
                        <span className="font-bold text-sm">Error Detected</span>
                        <p className="text-xs mt-0.5">{errorMessage}</p>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center p-24 bg-white dark:bg-[#121212] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <FiLoader className="w-8 h-8 text-[#0B6E40] animate-spin mb-3" />
                    <p className="text-sm text-gray-500 font-medium animate-pulse">Loading active clinic settings...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Settings tabs sidebar */}
                    <div className="lg:col-span-1 space-y-2">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-3 ${
                                activeTab === 'profile'
                                    ? 'bg-[#0B6E40] text-white shadow-md'
                                    : 'bg-white dark:bg-[#121212] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 border border-gray-200/60 dark:border-gray-800'
                            }`}
                        >
                            <FiSettings className="w-4 h-4" /> Clinic Profile & Logo
                        </button>
                        <button
                            onClick={() => setActiveTab('payments')}
                            className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-3 ${
                                activeTab === 'payments'
                                    ? 'bg-[#0B6E40] text-white shadow-md'
                                    : 'bg-white dark:bg-[#121212] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 border border-gray-200/60 dark:border-gray-800'
                            }`}
                        >
                            <FiCreditCard className="w-4 h-4" /> Banking & M-Pesa
                        </button>
                        <button
                            onClick={() => setActiveTab('social')}
                            className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-3 ${
                                activeTab === 'social'
                                    ? 'bg-[#0B6E40] text-white shadow-md'
                                    : 'bg-white dark:bg-[#121212] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 border border-gray-200/60 dark:border-gray-800'
                            }`}
                        >
                            <FiGlobe className="w-4 h-4" /> Social Profiles
                        </button>

                        {/* Interactive live verification info card */}
                        <div className="bg-[#f0fdf4] dark:bg-emerald-950/10 border border-[#bbf7d0]/60 dark:border-emerald-900/40 rounded-2xl p-4 mt-6">
                            <h4 className="font-bold text-xs text-[#0B6E40] flex items-center gap-1.5 uppercase tracking-wide">
                                <FiInfo className="w-3.5 h-3.5" /> Receipt Auto-Verification
                            </h4>
                            <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                                Settings configured on this page are instantly injected into newly generated PDF receipts and invoices, complete with a secure verification QR code.
                            </p>
                        </div>
                    </div>

                    {/* Settings Content container */}
                    <div className="lg:col-span-3 bg-white dark:bg-[#121212] rounded-2xl border border-gray-200/60 dark:border-gray-800 p-6 shadow-sm">
                        <form onSubmit={handleSave} className="space-y-6">
                            {/* Tab 1: Clinic Profile & Logo */}
                            {activeTab === 'profile' && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
                                            Clinic Profile Details
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            These profile attributes populate the headers of clinic letters, receipts, and medical invoices.
                                        </p>
                                    </div>

                                    {/* Brand Logo Upload Card */}
                                    <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800/80 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
                                        <div className="relative group w-28 h-28 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-inner flex items-center justify-center p-2 flex-shrink-0">
                                            <img
                                                src={getLogoPreviewUrl()}
                                                alt="Clinic Logo Preview"
                                                className="max-w-full max-h-full object-contain rounded"
                                            />
                                            {uploadingLogo && (
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                    <FiLoader className="w-6 h-6 text-white animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2 text-center md:text-left">
                                            <h4 className="font-bold text-sm dark:text-white">Active Clinic Logo</h4>
                                            <p className="text-xs text-gray-500">
                                                Accepted formats: PNG, JPG, JPEG, SVG. Transparent background recommended (ideal size: 400x120px).
                                            </p>
                                            <div className="pt-2 flex flex-wrap gap-2 justify-center md:justify-start">
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleLogoUpload}
                                                    accept="image/*"
                                                    className="hidden"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={uploadingLogo}
                                                    className="bg-white dark:bg-black text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 font-bold px-4 py-2 rounded-lg text-xs hover:bg-gray-50 dark:hover:bg-gray-900 flex items-center gap-1.5 transition-all shadow-sm"
                                                >
                                                    <FiUploadCloud className="w-3.5 h-3.5" /> Upload New Logo
                                                </button>
                                                {logoUrl && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setLogoUrl('')}
                                                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400 font-bold text-xs px-3 py-2 transition-all"
                                                    >
                                                        Reset to Default
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Text Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Company / Clinic Name</label>
                                            <input
                                                type="text"
                                                value={companyName}
                                                onChange={(e) => setCompanyName(e.target.value)}
                                                placeholder="e.g. M-Clinic Services Kenya"
                                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white focus:ring-1 focus:ring-[#0B6E40] focus:border-[#0B6E40] text-sm"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Tagline or Document Subtitle</label>
                                            <input
                                                type="text"
                                                value={companyTagline}
                                                onChange={(e) => setCompanyTagline(e.target.value)}
                                                placeholder="e.g. Official Digital Healthcare Portal"
                                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white focus:ring-1 focus:ring-[#0B6E40] focus:border-[#0B6E40] text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1">
                                                <FiPhone className="text-gray-400" /> Clinic Phone Contact
                                            </label>
                                            <input
                                                type="text"
                                                value={companyPhone}
                                                onChange={(e) => setCompanyPhone(e.target.value)}
                                                placeholder="e.g. +254 724 454 757"
                                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white focus:ring-1 focus:ring-[#0B6E40] focus:border-[#0B6E40] text-sm"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1">
                                                <FiMail className="text-gray-400" /> Clinic Email Address
                                            </label>
                                            <input
                                                type="email"
                                                value={companyEmail}
                                                onChange={(e) => setCompanyEmail(e.target.value)}
                                                placeholder="e.g. support@mclinic.co.ke"
                                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white focus:ring-1 focus:ring-[#0B6E40] focus:border-[#0B6E40] text-sm"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1 md:col-span-2">
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1">
                                                <FiMapPin className="text-gray-400" /> Physical Address
                                            </label>
                                            <textarea
                                                value={companyAddress}
                                                onChange={(e) => setCompanyAddress(e.target.value)}
                                                placeholder="e.g. 5th Floor, Medical Plaza, Nairobi, Kenya"
                                                rows={2}
                                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white focus:ring-1 focus:ring-[#0B6E40] focus:border-[#0B6E40] text-sm"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab 2: Payments & Banking info */}
                            {activeTab === 'payments' && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
                                            Banking & Payment Methods
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Modify instructions rendered under "Bank Transfer Details" and "Mobile Money Payment" sections in client receipts.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Bank details card */}
                                        <div className="bg-gray-50 dark:bg-gray-900/30 border border-gray-200/60 dark:border-gray-800 p-5 rounded-2xl space-y-4">
                                            <h4 className="font-bold text-xs uppercase tracking-wider text-[#0B6E40] flex items-center gap-1.5">
                                                <FiCreditCard className="w-4 h-4" /> Bank Account Info
                                            </h4>
                                            
                                            <div className="space-y-3">
                                                <div className="space-y-1">
                                                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Bank Institution Name</label>
                                                    <input
                                                        type="text"
                                                        value={bankName}
                                                        onChange={(e) => setBankName(e.target.value)}
                                                        placeholder="e.g. Equity Bank Kenya"
                                                        className="w-full px-3 py-2 bg-white dark:bg-black rounded-lg border border-gray-300 dark:border-gray-700 dark:text-white focus:ring-1 focus:ring-[#0B6E40] text-sm"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Account Holder Name</label>
                                                    <input
                                                        type="text"
                                                        value={bankAccName}
                                                        onChange={(e) => setBankAccName(e.target.value)}
                                                        placeholder="e.g. M-Clinic Services Limited"
                                                        className="w-full px-3 py-2 bg-white dark:bg-black rounded-lg border border-gray-300 dark:border-gray-700 dark:text-white focus:ring-1 focus:ring-[#0B6E40] text-sm"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Account Number</label>
                                                    <input
                                                        type="text"
                                                        value={bankAccNo}
                                                        onChange={(e) => setBankAccNo(e.target.value)}
                                                        placeholder="e.g. 1234567890123"
                                                        className="w-full px-3 py-2 bg-white dark:bg-black rounded-lg border border-gray-300 dark:border-gray-700 dark:text-white focus:ring-1 focus:ring-[#0B6E40] text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Mobile Money card */}
                                        <div className="bg-gray-50 dark:bg-gray-900/30 border border-gray-200/60 dark:border-gray-800 p-5 rounded-2xl space-y-4">
                                            <h4 className="font-bold text-xs uppercase tracking-wider text-[#0B6E40] flex items-center gap-1.5">
                                                <FiSettings className="w-4 h-4" /> M-Pesa Mobile Payments
                                            </h4>
                                            
                                            <div className="space-y-3">
                                                <div className="space-y-1">
                                                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">M-Pesa Buy Goods Till / Paybill Number</label>
                                                    <input
                                                        type="text"
                                                        value={mpesaTillPaybill}
                                                        onChange={(e) => setMpesaTillPaybill(e.target.value)}
                                                        placeholder="e.g. 300977"
                                                        className="w-full px-3 py-2 bg-white dark:bg-black rounded-lg border border-gray-300 dark:border-gray-700 dark:text-white focus:ring-1 focus:ring-[#0B6E40] text-sm"
                                                    />
                                                </div>
                                                <p className="text-[11px] text-gray-500 leading-relaxed pt-2">
                                                    In Kenya, official digital transactions use Safaricom M-Pesa. Setting your Merchant Till number here automatically updates instruction sections on downloadable customer PDFs.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab 3: Social Media profiles */}
                            {activeTab === 'social' && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2">
                                            Social Media Profiles
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Embed links to your active social networks directly within the footers of printable invoice templates.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                                                <FiFacebook className="text-blue-600" /> Facebook Profile Link
                                            </label>
                                            <input
                                                type="url"
                                                value={fbUrl}
                                                onChange={(e) => setFbUrl(e.target.value)}
                                                placeholder="e.g. https://facebook.com/mclinic"
                                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white focus:ring-1 focus:ring-[#0B6E40] text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                                                <FiTwitter className="text-sky-500" /> Twitter / X Profile Link
                                            </label>
                                            <input
                                                type="url"
                                                value={twitterUrl}
                                                onChange={(e) => setTwitterUrl(e.target.value)}
                                                placeholder="e.g. https://twitter.com/mclinic"
                                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white focus:ring-1 focus:ring-[#0B6E40] text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                                                <FiInstagram className="text-pink-600" /> Instagram Profile Link
                                            </label>
                                            <input
                                                type="url"
                                                value={igUrl}
                                                onChange={(e) => setIgUrl(e.target.value)}
                                                placeholder="e.g. https://instagram.com/mclinic"
                                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white focus:ring-1 focus:ring-[#0B6E40] text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                                                <FiLinkedin className="text-blue-800" /> LinkedIn Company Page
                                            </label>
                                            <input
                                                type="url"
                                                value={linkedinUrl}
                                                onChange={(e) => setLinkedinUrl(e.target.value)}
                                                placeholder="e.g. https://linkedin.com/company/mclinic"
                                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white focus:ring-1 focus:ring-[#0B6E40] text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Form submit footer action bar */}
                            <div className="border-t border-gray-100 dark:border-gray-800 pt-6 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={fetchSettings}
                                    disabled={saving}
                                    className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-bold px-5 py-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-[#0B6E40] text-white font-bold px-6 py-2.5 rounded-xl hover:bg-[#08522e] disabled:opacity-50 transition flex items-center gap-2 text-sm shadow-md"
                                >
                                    {saving ? (
                                        <>
                                            <FiLoader className="animate-spin" /> Saving...
                                        </>
                                    ) : (
                                        'Save Settings'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
