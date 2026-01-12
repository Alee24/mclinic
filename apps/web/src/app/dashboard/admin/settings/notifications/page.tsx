'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import {
    FiMail, FiSave, FiRefreshCw, FiBell, FiCheckCircle, FiAlertCircle,
    FiCalendar, FiDollarSign, FiActivity, FiFileText, FiUser, FiShield
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
                return [...prev, { key, value, description: '', isSecure: false }];
            }
        });
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const res = await api.post('/settings', { settings });
            if (res && res.ok) {
                toast.success('Notification settings updated successfully');
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
    const getSettingValue = (key: string) => getSetting(key)?.value ?? 'true';
    const isEnabled = (key: string) => getSettingValue(key) === 'true';

    const masterEnabled = isEnabled('EMAIL_NOTIFICATIONS_ENABLED');

    const notificationToggles: NotificationToggle[] = [
        {
            key: 'EMAIL_BOOKING_CONFIRMATION',
            label: 'Appointment Confirmation',
            description: 'Send confirmation emails to patients when they book an appointment',
            icon: <FiCalendar />,
            color: 'blue'
        },
        {
            key: 'EMAIL_BOOKING_NOTIFICATION_MEDIC',
            label: 'Medic Appointment Notification',
            description: 'Notify healthcare providers about new appointments',
            icon: <FiUser />,
            color: 'purple'
        },
        {
            key: 'EMAIL_PAYMENT_CONFIRMATION',
            label: 'Payment Confirmation',
            description: 'Send payment receipts after successful transactions',
            icon: <FiDollarSign />,
            color: 'green'
        },
        {
            key: 'EMAIL_LAB_RESULTS_READY',
            label: 'Lab Results Ready',
            description: 'Notify patients when their lab results are available',
            icon: <FiActivity />,
            color: 'red'
        },
        {
            key: 'EMAIL_PRESCRIPTION_READY',
            label: 'Prescription Ready',
            description: 'Notify patients when their prescription is ready for collection',
            icon: <FiFileText />,
            color: 'orange'
        },
        {
            key: 'EMAIL_ACCOUNT_CREATION',
            label: 'Welcome Emails',
            description: 'Send welcome emails when new accounts are created',
            icon: <FiMail />,
            color: 'indigo'
        },
        {
            key: 'EMAIL_INVOICE_GENERATED',
            label: 'Invoice Notifications',
            description: 'Send invoices and billing statements to patients',
            icon: <FiFileText />,
            color: 'yellow'
        },
        {
            key: 'EMAIL_LICENSE_EXPIRY_WARNING',
            label: 'License Expiry Warnings',
            description: 'Warn healthcare providers about expiring licenses',
            icon: <FiShield />,
            color: 'pink'
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <FiRefreshCw className="animate-spin text-4xl text-blue-500" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <FiBell className="text-blue-600" />
                        Email Notification Settings
                    </h1>
                    <p className="text-gray-500 mt-1">Control which emails are sent to patients and staff</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-md disabled:opacity-50"
                >
                    {saving ? <FiRefreshCw className="animate-spin" /> : <FiSave />}
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </div>

            {/* Master Toggle */}
            <div className={`mb-8 p-6 rounded-2xl border-2 ${masterEnabled ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-3 mb-2">
                            {masterEnabled ? <FiCheckCircle className="text-green-600" /> : <FiAlertCircle className="text-red-600" />}
                            Email Notifications: {masterEnabled ? 'Enabled' : 'Disabled'}
                        </h2>
                        <p className="text-sm text-gray-600">
                            {masterEnabled
                                ? 'All email notifications are currently active. You can fine-tune individual types below.'
                                : '⚠️ All email notifications are disabled. Toggle this on to enable emails.'}
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={masterEnabled}
                            onChange={(e) => handleUpdateValue('EMAIL_NOTIFICATIONS_ENABLED', e.target.checked ? 'true' : 'false')}
                            className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                </div>
            </div>

            {/* Individual Notification Toggles */}
            <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
                <div className="p-6 border-b bg-gray-50">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <FiMail /> Individual Notification Types
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Enable or disable specific types of email notifications</p>
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
                                    className={`p-5 rounded-xl border-2 transition-all ${enabled ? colorClasses : 'bg-gray-50 border-gray-200'}`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`text-2xl ${enabled ? `text-${toggle.color}-600` : 'text-gray-400'}`}>
                                                {toggle.icon}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">{toggle.label}</h3>
                                                <p className="text-xs text-gray-600 mt-1">{toggle.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                        <span className="text-sm font-medium">
                                            {enabled ? '✅ Enabled' : '❌ Disabled'}
                                        </span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={enabled}
                                                onChange={(e) => handleUpdateValue(toggle.key, e.target.checked ? 'true' : 'false')}
                                                disabled={!masterEnabled}
                                                className="sr-only peer"
                                            />
                                            <div className={`w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${enabled ? `peer-checked:bg-${toggle.color}-600` : 'peer-checked:bg-blue-600'} ${!masterEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                                        </label>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-200">
                <div className="flex items-start gap-4">
                    <FiAlertCircle className="text-blue-600 text-2xl shrink-0 mt-1" />
                    <div>
                        <h3 className="font-bold text-blue-900 mb-2">How This Works</h3>
                        <ul className="text-sm text-blue-800 space-y-2">
                            <li>• <strong>Master Toggle</strong>: Disabling this will stop ALL emails from being sent</li>
                            <li>• <strong>Individual Toggles</strong>: Fine-tune which specific email types to send</li>
                            <li>• <strong>Real-time</strong>: Changes take effect immediately after saving</li>
                            <li>• <strong>Database-backed</strong>: Settings are stored in the database and persist across server restarts</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
