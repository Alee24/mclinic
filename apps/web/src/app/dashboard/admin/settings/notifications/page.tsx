'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import {
    FiMail, FiSave, FiRefreshCw, FiBell, FiCheckCircle, FiAlertCircle,
    FiCalendar, FiDollarSign, FiActivity, FiFileText, FiUser, FiShield,
    FiServer, FiLock, FiAtSign, FiSend
} from 'react-icons/fi';

interface Setting {
    key: string;
    value: string;
    description: string;
    isSecure: boolean;
}

interface NotificationToggle {
    key: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
}

export default function NotificationSettingsPage() {
    const [settings, setSettings] = useState<Setting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await api.get('/settings');
            if (!res) return;
            const data = await res.json();
            setSettings(data.filter((s: any) => s.key.startsWith('EMAIL_')));

            // Initialize SMTP defaults if missing in DB (avoid UI glitches)
            const requiredKeys = ['EMAIL_SMTP_HOST', 'EMAIL_SMTP_PORT', 'EMAIL_SMTP_USER', 'EMAIL_SMTP_PASS', 'EMAIL_SMTP_FROM_EMAIL', 'EMAIL_SMTP_FROM_NAME'];
            setSettings(prev => {
                const newSettings = [...prev];
                requiredKeys.forEach(key => {
                    if (!newSettings.find(s => s.key === key)) {
                        newSettings.push({ key, value: '', description: 'SMTP Config', isSecure: key.includes('PASS') });
                    }
                });
                return newSettings;
            });

        } catch (error) {
            console.error('Failed to fetch settings:', error);
            toast.error('Failed to load notification settings');
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
                return [...prev, { key, value, description: '', isSecure: key.includes('PASS') }];
            }
        });
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const res = await api.post('/settings', { settings });
            if (res && res.ok) {
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

    const [testEmail, setTestEmail] = useState('');

    const handleTest = async () => {
        try {
            setTesting(true);
            await handleSave(); // Save first to ensure backend uses latest config

            const payload = testEmail ? { to: testEmail } : {};
            const res = await api.post('/email/test', payload);

            if (res) {
                const data = await res.json();
                if (res.ok && data.success) {
                    toast.success(`Test email sent ${testEmail ? 'to ' + testEmail : 'successfully'}!`);
                } else {
                    let msg = data.error || 'Connection refused. Check settings.';
                    if (msg.includes('535') || msg.includes('Invalid login')) msg = 'Authentication Failed: Wrong Username or Password.';
                    else if (msg.includes('wrong version') || msg.includes('SSL')) msg = 'SSL Mismatch: Toggle "Use Secure Connection".';
                    else if (msg.includes('ETIMEDOUT')) msg = 'Connection Timed Out: Check Host and Port.';

                    toast.error(`SMTP Error: ${msg}`, { duration: 6000 });
                }
            }
        } catch (error) {
            console.error(error);
            toast.error('Test failed');
        } finally {
            setTesting(false);
        }
    };

    const getSetting = (key: string) => settings.find(s => s.key === key);
    const getSettingValue = (key: string) => getSetting(key)?.value ?? '';
    const isEnabled = (key: string) => getSetting(key)?.value === 'true'; // Strict check for boolean toggles

    const masterEnabled = getSettingValue('EMAIL_NOTIFICATIONS_ENABLED') !== 'false'; // Default to true if not set

    const notificationToggles: NotificationToggle[] = [
        // @ts-ignore
        { key: 'EMAIL_BOOKING_CONFIRMATION', label: 'Appointment Confirmation', description: 'Confirm booking to patient', icon: <FiCalendar />, color: 'blue' },
        // @ts-ignore
        { key: 'EMAIL_BOOKING_NOTIFICATION_MEDIC', label: 'Medic Notification', description: 'Notify doctor of new booking', icon: <FiUser />, color: 'purple' },
        // @ts-ignore
        { key: 'EMAIL_PAYMENT_CONFIRMATION', label: 'Payment Confirmation', description: 'Receipts for payments', icon: <FiDollarSign />, color: 'green' },
        // @ts-ignore
        { key: 'EMAIL_LAB_RESULTS_READY', label: 'Lab Results Ready', description: 'Notify patient of results', icon: <FiActivity />, color: 'red' },
        // @ts-ignore
        { key: 'EMAIL_PRESCRIPTION_READY', label: 'Prescription Ready', description: 'Pharmacy collection notice', icon: <FiFileText />, color: 'orange' },
        // @ts-ignore
        { key: 'EMAIL_ACCOUNT_CREATION', label: 'Welcome Emails', description: 'New account welcome', icon: <FiMail />, color: 'indigo' },
        // @ts-ignore
        { key: 'EMAIL_INVOICE_GENERATED', label: 'Invoices', description: 'Billing statements', icon: <FiFileText />, color: 'yellow' },
        // @ts-ignore
        { key: 'EMAIL_LICENSE_EXPIRY_WARNING', label: 'License Compliance', description: 'Expiry warnings for doctors', icon: <FiShield />, color: 'pink' }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                {/* @ts-ignore */}
                <FiRefreshCw className="animate-spin text-4xl text-blue-500" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        {/* @ts-ignore */}
                        <FiBell className="text-blue-600" />
                        Email Settings
                    </h1>
                    <p className="text-gray-500 mt-1">Configure SMTP server and notification preferences</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative">
                        <input
                            type="email"
                            placeholder="Test email address..."
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 pr-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-64"
                        />
                    </div>
                    <button
                        onClick={handleTest}
                        disabled={saving || testing}
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 whitespace-nowrap"
                    >
                        {/* @ts-ignore */}
                        {testing ? <FiRefreshCw className="animate-spin" /> : <FiSend />}
                        {testing ? 'Sending...' : 'Test Config'}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || testing}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 whitespace-nowrap"
                    >
                        {/* @ts-ignore */}
                        {saving ? <FiRefreshCw className="animate-spin" /> : <FiSave />}
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>

            {/* SMTP Configuration Section */}
            <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-6 text-gray-800 border-b pb-4">
                    {/* @ts-ignore */}
                    <FiServer className="text-blue-500" /> SMTP Server Configuration
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">SMTP Host</label>
                            <input
                                type="text"
                                value={getSettingValue('EMAIL_SMTP_HOST')}
                                onChange={e => handleUpdateValue('EMAIL_SMTP_HOST', e.target.value)}
                                placeholder="smtp.gmail.com"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">SMTP Port</label>
                            <input
                                type="text"
                                value={getSettingValue('EMAIL_SMTP_PORT')}
                                onChange={e => handleUpdateValue('EMAIL_SMTP_PORT', e.target.value)}
                                placeholder="587"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            />
                        </div>
                        <div className="flex items-center gap-3 pt-4">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={getSettingValue('EMAIL_SMTP_SECURE') === 'true'}
                                    onChange={(e) => handleUpdateValue('EMAIL_SMTP_SECURE', e.target.checked ? 'true' : 'false')}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                            {/* @ts-ignore */}
                            <span className="text-sm font-medium text-gray-700 flex items-center gap-1"><FiLock className="text-xs" /> Use Secure Connection (SSL/TLS)</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">SMTP Username / Email</label>
                            <input
                                type="text"
                                value={getSettingValue('EMAIL_SMTP_USER')}
                                onChange={e => handleUpdateValue('EMAIL_SMTP_USER', e.target.value)}
                                placeholder="notifications@mclinic.co.ke"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">SMTP Password</label>
                            <input
                                type="password"
                                value={getSettingValue('EMAIL_SMTP_PASS')}
                                onChange={e => handleUpdateValue('EMAIL_SMTP_PASS', e.target.value)}
                                placeholder="••••••••••••"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Sender Name ("From" Name)</label>
                            <input
                                type="text"
                                value={getSettingValue('EMAIL_SMTP_FROM_NAME')}
                                onChange={e => handleUpdateValue('EMAIL_SMTP_FROM_NAME', e.target.value)}
                                placeholder="M-Clinic Alerts"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Sender Email ("From" Email)</label>
                            <div className="relative">
                                {/* @ts-ignore */}
                                <span className="absolute left-3 top-3 text-gray-400"><FiAtSign /></span>
                                <input
                                    type="text"
                                    value={getSettingValue('EMAIL_SMTP_FROM_EMAIL')}
                                    onChange={e => handleUpdateValue('EMAIL_SMTP_FROM_EMAIL', e.target.value)}
                                    placeholder="noreply@mclinic.co.ke"
                                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notification Toggles */}
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <div className="p-6 border-b bg-gray-50 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            {/* @ts-ignore */}
                            <FiMail /> Notification Preferences
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Enable or disable specific email types</p>
                    </div>

                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border">
                        <span className={`text-sm font-bold ${masterEnabled ? 'text-green-600' : 'text-red-500'}`}>
                            {masterEnabled ? 'System Enabled' : 'System Disabled'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={masterEnabled}
                                onChange={(e) => handleUpdateValue('EMAIL_NOTIFICATIONS_ENABLED', e.target.checked ? 'true' : 'false')}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {notificationToggles.map((toggle) => {
                            const enabled = isEnabled(toggle.key);
                            const colorClasses = {
                                blue: 'bg-blue-50 border-blue-200 text-blue-700',
                                purple: 'bg-purple-50 border-purple-200 text-purple-700',
                                green: 'bg-green-50 border-green-200 text-green-700',
                                red: 'bg-red-50 border-red-200 text-red-700',
                                orange: 'bg-orange-50 border-orange-200 text-orange-700',
                                indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
                                yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
                                pink: 'bg-pink-50 border-pink-200 text-pink-700',
                            }[toggle.color];

                            return (
                                <div
                                    key={toggle.key}
                                    className={`p-5 rounded-xl border transition-all ${enabled ? colorClasses : 'bg-gray-50 border-gray-200 opacity-70'}`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`text-2xl ${enabled ? `text-${toggle.color}-600` : 'text-gray-400'}`}>
                                                {toggle.icon}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-base">{toggle.label}</h3>
                                                <p className="text-xs opacity-80 mt-1">{toggle.description}</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={enabled}
                                                onChange={(e) => handleUpdateValue(toggle.key, e.target.checked ? 'true' : 'false')}
                                                disabled={!masterEnabled}
                                                className="sr-only peer"
                                            />
                                            <div className={`w-9 h-5 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${enabled ? `peer-checked:bg-${toggle.color}-600` : 'peer-checked:bg-blue-600'} ${!masterEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                                        </label>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-500 border text-center">
                Settings are stored securely. Sending emails relies on correct SMTP details.
            </div>
        </div>
    );
}
