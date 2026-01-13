'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import {
    FiSettings, FiShield, FiSave, FiRefreshCw, FiCreditCard, FiDollarSign, FiSmartphone
} from 'react-icons/fi';
import { SiPaypal, SiStripe, SiVisa, SiMastercard } from 'react-icons/si';

interface Setting {
    key: string;
    value: string;
    description: string;
    isSecure: boolean;
}

export default function PaymentSettingsPage() {
    const [settings, setSettings] = useState<Setting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeGateway, setActiveGateway] = useState<'mpesa' | 'paypal' | 'stripe'>('mpesa');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await api.get('/settings');
            if (!res) return;
            const data = await res.json();
            setSettings(data.filter((s: any) =>
                s.key.startsWith('PAYMENT_') ||
                s.key.startsWith('MPESA_') ||
                s.key.startsWith('PAYPAL_') ||
                s.key.startsWith('STRIPE_')
            ));
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            toast.error('Failed to load payment settings');
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
                return [...prev, { key, value, description: '', isSecure: key.includes('KEY') || key.includes('SECRET') }];
            }
        });
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const res = await api.post('/settings', { settings });
            if (res && res.ok) {
                toast.success('Payment settings updated successfully');
            } else {
                throw new Error('Failed to update');
            }
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const getSetting = (key: string) => settings.find(s => s.key === key);
    const getSettingValue = (key: string) => getSetting(key)?.value ?? '';
    const isEnabled = (gateway: string) => getSettingValue(`PAYMENT_${gateway.toUpperCase()}_ENABLED`) === 'true';

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                {/* @ts-ignore */}
                <FiRefreshCw className="animate-spin text-4xl text-blue-500" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        {/* @ts-ignore */}
                        <FiCreditCard className="text-blue-600" />
                        Payment Gateway Settings
                    </h1>
                    <p className="text-gray-500 mt-1">Configure and manage all payment methods in one place</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-md disabled:opacity-50"
                >
                    {/* @ts-ignore */}
                    {saving ? <FiRefreshCw className="animate-spin" /> : <FiSave />}
                    {saving ? 'Saving...' : 'Save All Settings'}
                </button>
            </div>

            {/* Payment Methods Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* M-Pesa Card */}
                <div
                    onClick={() => setActiveGateway('mpesa')}
                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${activeGateway === 'mpesa'
                        ? 'border-green-500 bg-green-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            {/* @ts-ignore */}
                            <FiSmartphone className="text-3xl text-green-600" />
                            <div>
                                <h3 className="font-bold text-lg">M-Pesa</h3>
                                <p className="text-xs text-gray-500">Mobile Money (Kenya)</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isEnabled('mpesa')}
                                onChange={(e) => handleUpdateValue('PAYMENT_MPESA_ENABLED', e.target.checked ? 'true' : 'false')}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                    </div>
                    <div className="text-sm text-gray-600">
                        {isEnabled('mpesa') ? '✅ Active' : '❌ Disabled'}
                    </div>
                </div>

                {/* PayPal Card */}
                <div
                    onClick={() => setActiveGateway('paypal')}
                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${activeGateway === 'paypal'
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            {/* @ts-ignore */}
                            <SiPaypal className="text-3xl text-[#0070BA]" />
                            <div>
                                <h3 className="font-bold text-lg">PayPal</h3>
                                <p className="text-xs text-gray-500">Global Payments</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isEnabled('paypal')}
                                onChange={(e) => handleUpdateValue('PAYMENT_PAYPAL_ENABLED', e.target.checked ? 'true' : 'false')}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    <div className="text-sm text-gray-600">
                        {isEnabled('paypal') ? '✅ Active' : '❌ Disabled'}
                    </div>
                </div>

                {/* Stripe Card */}
                <div
                    onClick={() => setActiveGateway('stripe')}
                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${activeGateway === 'stripe'
                        ? 'border-purple-500 bg-purple-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            {/* @ts-ignore */}
                            <SiStripe className="text-3xl text-[#635BFF]" />
                            <div>
                                <h3 className="font-bold text-lg">Stripe</h3>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    {/* @ts-ignore */}
                                    <SiVisa className="text-blue-600" />
                                    {/* @ts-ignore */}
                                    <SiMastercard className="text-orange-600" />
                                    Cards
                                </p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isEnabled('stripe')}
                                onChange={(e) => handleUpdateValue('PAYMENT_STRIPE_ENABLED', e.target.checked ? 'true' : 'false')}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                    </div>
                    <div className="text-sm text-gray-600">
                        {isEnabled('stripe') ? '✅ Active' : '❌ Disabled'}
                    </div>
                </div>
            </div>

            {/* Configuration Panel */}
            <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
                <div className="p-6 border-b bg-gray-50">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        {/* @ts-ignore */}
                        <FiSettings /> {activeGateway.toUpperCase()} Configuration
                    </h2>
                </div>
                <div className="p-8">
                    {activeGateway === 'mpesa' && (
                        <div className="space-y-4">
                            <p className="text-gray-600 mb-6">Configure your Safaricom Daraja API credentials for M-Pesa mobile payments.</p>
                            <a
                                href="/dashboard/admin/settings/mpesa"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all shadow-md"
                            >
                                {/* @ts-ignore */}
                                <FiSettings /> Configure M-Pesa Settings
                            </a>
                        </div>
                    )}

                    {activeGateway === 'paypal' && (
                        <div className="space-y-6">
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-sm text-blue-800">
                                    <strong>PayPal Integration:</strong> Get your API credentials from the PayPal Developer Dashboard.
                                </p>
                            </div>

                            {/* Environment Toggle */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Environment</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleUpdateValue('PAYPAL_ENV', 'sandbox')}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all ${getSettingValue('PAYPAL_ENV') === 'sandbox' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        Sandbox
                                    </button>
                                    <button
                                        onClick={() => handleUpdateValue('PAYPAL_ENV', 'live')}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all ${getSettingValue('PAYPAL_ENV') === 'live' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        Live
                                    </button>
                                </div>
                            </div>

                            {/* Credentials */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        {getSettingValue('PAYPAL_ENV') === 'live' ? 'Live' : 'Sandbox'} Client ID
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full p-3 border rounded-xl"
                                        value={getSettingValue(getSettingValue('PAYPAL_ENV') === 'live' ? 'PAYPAL_LIVE_CLIENT_ID' : 'PAYPAL_SANDBOX_CLIENT_ID')}
                                        onChange={(e) => handleUpdateValue(getSettingValue('PAYPAL_ENV') === 'live' ? 'PAYPAL_LIVE_CLIENT_ID' : 'PAYPAL_SANDBOX_CLIENT_ID', e.target.value)}
                                        placeholder="Enter PayPal Client ID"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        {getSettingValue('PAYPAL_ENV') === 'live' ? 'Live' : 'Sandbox'} Client Secret
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full p-3 border rounded-xl"
                                        value={getSettingValue(getSettingValue('PAYPAL_ENV') === 'live' ? 'PAYPAL_LIVE_CLIENT_SECRET' : 'PAYPAL_SANDBOX_CLIENT_SECRET')}
                                        onChange={(e) => handleUpdateValue(getSettingValue('PAYPAL_ENV') === 'live' ? 'PAYPAL_LIVE_CLIENT_SECRET' : 'PAYPAL_SANDBOX_CLIENT_SECRET', e.target.value)}
                                        placeholder="Enter PayPal Client Secret"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeGateway === 'stripe' && (
                        <div className="space-y-6">
                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                <p className="text-sm text-purple-800">
                                    <strong>Stripe Integration:</strong> Get your API keys from your Stripe Dashboard. Supports Visa, Mastercard, and more.
                                </p>
                            </div>

                            {/* Environment Toggle */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Environment</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleUpdateValue('STRIPE_ENV', 'test')}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all ${getSettingValue('STRIPE_ENV') === 'test' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        Test Mode
                                    </button>
                                    <button
                                        onClick={() => handleUpdateValue('STRIPE_ENV', 'live')}
                                        className={`px-4 py-2 rounded-lg font-medium transition-all ${getSettingValue('STRIPE_ENV') === 'live' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        Live Mode
                                    </button>
                                </div>
                            </div>

                            {/* Credentials */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Publishable Key ({getSettingValue('STRIPE_ENV') === 'live' ? 'Live' : 'Test'})
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full p-3 border rounded-xl font-mono text-sm"
                                        value={getSettingValue(getSettingValue('STRIPE_ENV') === 'live' ? 'STRIPE_LIVE_PUBLISHABLE_KEY' : 'STRIPE_TEST_PUBLISHABLE_KEY')}
                                        onChange={(e) => handleUpdateValue(getSettingValue('STRIPE_ENV') === 'live' ? 'STRIPE_LIVE_PUBLISHABLE_KEY' : 'STRIPE_TEST_PUBLISHABLE_KEY', e.target.value)}
                                        placeholder="pk_test_..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Secret Key ({getSettingValue('STRIPE_ENV') === 'live' ? 'Live' : 'Test'})
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full p-3 border rounded-xl font-mono text-sm"
                                        value={getSettingValue(getSettingValue('STRIPE_ENV') === 'live' ? 'STRIPE_LIVE_SECRET_KEY' : 'STRIPE_TEST_SECRET_KEY')}
                                        onChange={(e) => handleUpdateValue(getSettingValue('STRIPE_ENV') === 'live' ? 'STRIPE_LIVE_SECRET_KEY' : 'STRIPE_TEST_SECRET_KEY', e.target.value)}
                                        placeholder="sk_test_..."
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Webhook Secret (Optional)
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full p-3 border rounded-xl font-mono text-sm"
                                        value={getSettingValue('STRIPE_WEBHOOK_SECRET')}
                                        onChange={(e) => handleUpdateValue('STRIPE_WEBHOOK_SECRET', e.target.value)}
                                        placeholder="whsec_..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
