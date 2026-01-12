'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import {
    FiSettings, FiShield, FiSave, FiRefreshCw, FiCheckCircle,
    FiAlertCircle, FiSmartphone, FiTerminal, FiCloud
} from 'react-icons/fi';

interface Setting {
    key: string;
    value: string;
    description: string;
    isSecure: boolean;
}

export default function MpesaSettingsPage() {
    const [settings, setSettings] = useState<Setting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testPhone, setTestPhone] = useState('');
    const [activeTab, setActiveTab] = useState<'general' | 'sandbox' | 'production'>('general');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await api.get('/settings');
            if (!res) return;
            const data = await res.json();
            setSettings(data.filter((s: any) => s.key.startsWith('MPESA_')));
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            toast.error('Failed to load M-Pesa settings');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateValue = (key: string, value: string) => {
        setSettings(prev => {
            const exists = prev.find(s => s.key === key);
            if (exists) {
                return prev.map(s => s.key === key ? { ...s, value } : s);
            } else {
                // Add new setting if it doesn't exist
                return [...prev, { key, value, description: '', isSecure: key.includes('KEY') || key.includes('SECRET') || key.includes('PASSKEY') }];
            }
        });
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const res = await api.post('/settings', { settings });
            if (res.ok) {
                toast.success('Settings updated successfully');
            } else {
                throw new Error('Failed to update');
            }
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleTestConnection = async () => {
        if (!testPhone) {
            toast.error('Please enter a phone number to test');
            return;
        }

        try {
            setTesting(true);
            const res = await api.post('/mpesa/stk-push', {
                phoneNumber: testPhone,
                amount: 1,
                accountReference: 'TEST',
                transactionDesc: 'System Test'
            });

            const data = await res.json();
            if (res.ok) {
                toast.success('Test STK Push initiated successfully! Check your phone.');
            } else {
                toast.error(data.message || 'Test failed');
            }
        } catch (error) {
            toast.error('Connection test failed. Check your credentials.');
        } finally {
            setTesting(false);
        }
    };

    const getSetting = (key: string) => settings.find(s => s.key === key);
    const getSettingValue = (key: string) => getSetting(key)?.value || '';

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <FiRefreshCw className="animate-spin text-4xl text-blue-500" />
            </div>
        );
    }

    const mpesaEnv = getSettingValue('MPESA_ENV') || 'sandbox';

    // Define the credentials structure for both environments
    const sandboxFields = [
        { key: 'MPESA_SANDBOX_CONSUMER_KEY', label: 'Consumer Key', type: 'password' as const, placeholder: 'Enter your Sandbox Consumer Key' },
        { key: 'MPESA_SANDBOX_CONSUMER_SECRET', label: 'Consumer Secret', type: 'password' as const, placeholder: 'Enter your Sandbox Consumer Secret' },
        { key: 'MPESA_SANDBOX_SHORTCODE', label: 'Shortcode', type: 'text' as const, placeholder: 'e.g., 174379' },
        { key: 'MPESA_SANDBOX_PASSKEY', label: 'Passkey', type: 'password' as const, placeholder: 'Enter your Sandbox Passkey' },
        { key: 'MPESA_SANDBOX_CALLBACK_URL', label: 'Callback URL', type: 'text' as const, placeholder: 'https://yourdomain.com/mpesa/callback' },
    ];

    const productionFields = [
        { key: 'MPESA_PROD_CONSUMER_KEY', label: 'Consumer Key', type: 'password' as const, placeholder: 'Enter your Production Consumer Key' },
        { key: 'MPESA_PROD_CONSUMER_SECRET', label: 'Consumer Secret', type: 'password' as const, placeholder: 'Enter your Production Consumer Secret' },
        { key: 'MPESA_PROD_SHORTCODE', label: 'Shortcode', type: 'text' as const, placeholder: 'e.g., 123456' },
        { key: 'MPESA_PROD_PASSKEY', label: 'Passkey', type: 'password' as const, placeholder: 'Enter your Production Passkey' },
        { key: 'MPESA_PROD_CALLBACK_URL', label: 'Callback URL', type: 'text' as const, placeholder: 'https://yourdomain.com/mpesa/callback' },
    ];

    const renderCredentialField = (field: { key: string; label: string; type: 'text' | 'password'; placeholder: string }) => {
        const setting = getSetting(field.key);
        const isSecure = field.type === 'password';
        const currentValue = setting?.value ?? '';

        return (
            <div key={field.key} className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="block text-sm font-bold text-gray-700">
                        {field.label}
                    </label>
                    {isSecure && (
                        <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                            <FiShield size={10} /> Secure
                        </span>
                    )}
                </div>
                <div className="relative group">
                    <input
                        type={field.type}
                        className="w-full pl-4 pr-10 py-3 rounded-xl border bg-white focus:ring-2 focus:ring-blue-500 transition-all font-mono text-sm"
                        value={currentValue}
                        onChange={(e) => handleUpdateValue(field.key, e.target.value)}
                        placeholder={field.placeholder}
                    />
                    <FiSettings className="absolute right-4 top-3.5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <FiSmartphone className="text-blue-600" />
                        M-Pesa Integration
                    </h1>
                    <p className="text-gray-500 mt-1">Configure your Safaricom Daraja API credentials and test your connection.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-md disabled:opacity-50"
                >
                    {saving ? <FiRefreshCw className="animate-spin" /> : <FiSave />}
                    {saving ? 'Saving...' : 'Save All Settings'}
                </button>
            </div>

            {/* Status Card */}
            <div className={`mb-8 p-4 rounded-xl border-l-4 flex items-center justify-between shadow-sm ${mpesaEnv === 'production' ? 'bg-green-50 border-green-500 text-green-800' : 'bg-yellow-50 border-yellow-500 text-yellow-800'}`}>
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${mpesaEnv === 'production' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                        {mpesaEnv === 'production' ? <FiCloud className="text-2xl" /> : <FiShield className="text-2xl" />}
                    </div>
                    <div>
                        <p className="font-bold text-lg">Active Mode: <span className="uppercase">{mpesaEnv}</span></p>
                        <p className="text-sm opacity-80">The system is currently using {mpesaEnv} credentials for all payments.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleUpdateValue('MPESA_ENV', 'sandbox')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mpesaEnv === 'sandbox' ? 'bg-yellow-600 text-white shadow-md' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}
                    >
                        Switch to Sandbox
                    </button>
                    <button
                        onClick={() => handleUpdateValue('MPESA_ENV', 'production')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mpesaEnv === 'production' ? 'bg-green-600 text-white shadow-md' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}
                    >
                        Switch to Production
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b">
                <button
                    onClick={() => setActiveTab('general')}
                    className={`pb-3 px-2 font-medium transition-all flex items-center gap-2 ${activeTab === 'general' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <FiSettings /> General & Test
                </button>
                <button
                    onClick={() => setActiveTab('sandbox')}
                    className={`pb-3 px-2 font-medium transition-all flex items-center gap-2 ${activeTab === 'sandbox' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <FiShield /> Sandbox API
                </button>
                <button
                    onClick={() => setActiveTab('production')}
                    className={`pb-3 px-2 font-medium transition-all flex items-center gap-2 ${activeTab === 'production' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <FiCloud /> Production API
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
                <div className="p-8">
                    {activeTab === 'general' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div>
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <FiCheckCircle className="text-blue-500" />
                                    Dynamic Config Info
                                </h3>
                                <div className="space-y-4 text-gray-600 leading-relaxed">
                                    <p>The system is built with <strong>Dynamic Configuration</strong>. You can swap between Sandbox and Production modes instantly without restarting the server.</p>
                                    <p>Credentials entered in the Sandbox and Production tabs will be automatically used based on the active mode selected above.</p>
                                    <div className="p-4 bg-blue-50 rounded-lg text-sm flex gap-3">
                                        <FiAlertCircle className="text-blue-600 shrink-0 mt-1" />
                                        <span>Make sure your <strong>Callback URL</strong> is publicly accessible for M-Pesa to send payment confirmations.</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <FiTerminal className="text-blue-600" />
                                    Test Connection
                                </h3>
                                <p className="text-sm text-gray-500 mb-6">Send a test STK Push of KES 1.00 to verify your current configuration.</p>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number (254xxx)</label>
                                        <div className="relative">
                                            <FiSmartphone className="absolute left-3 top-3 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="e.g., 254712345678"
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-blue-500 text-gray-800"
                                                value={testPhone}
                                                onChange={(e) => setTestPhone(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleTestConnection}
                                        disabled={testing}
                                        className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50"
                                    >
                                        {testing ? <FiRefreshCw className="animate-spin" /> : <FiTerminal />}
                                        {testing ? 'Testing...' : 'Trigger Test STK Push'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'sandbox' && (
                        <div>
                            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                                <p className="text-sm text-yellow-800 font-medium">
                                    <strong>Sandbox Environment:</strong> Use these credentials for testing. No real money will be transacted.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {sandboxFields.map(field => renderCredentialField(field))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'production' && (
                        <div>
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                                <p className="text-sm text-red-800 font-medium">
                                    <strong>⚠️ Production Environment:</strong> These credentials will process REAL money. Double-check all values before saving!
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {productionFields.map(field => renderCredentialField(field))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
