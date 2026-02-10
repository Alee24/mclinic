'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FiSave, FiBell, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

export default function NotificationSettingsPage() {
    const [settings, setSettings] = useState({
        admin_notification_mobile: '',
        notify_on_signup: false,
        notify_on_booking: false,
        notify_on_payment_failure: false,
        notify_on_support_request: false,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/system-settings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Map array of {key, value} to object
            const loadedSettings: any = { ...settings };
            res.data.forEach((s: any) => {
                if (s.key in loadedSettings) {
                    if (s.key === 'admin_notification_mobile') {
                        loadedSettings[s.key] = s.value;
                    } else {
                        loadedSettings[s.key] = s.value === 'true' || s.value === '1';
                    }
                }
            });
            setSettings(loadedSettings);
        } catch (error) {
            console.error('Failed to load settings', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (key: string) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
    };

    const handleChange = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const updates = Object.entries(settings).map(([key, value]) => ({
                key,
                value: String(value)
            }));

            // We need a bulk update endpoint or loop
            // Assuming POST /system-settings allows updating or creating
            // Or better, distinct calls if no bulk endpoint exists yet. 
            // In SystemSettingsController usually there is update or create.

            for (const update of updates) {
                await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/system-settings`, update, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            toast.success('Settings saved successfully');
        } catch (error) {
            console.error('Failed to save settings', error);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading settings...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notification Settings</h1>
                    <p className="text-gray-500 mt-1">Manage admin SMS alerts and triggers</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    <FiSave className="w-5 h-5" />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="grid gap-6">
                {/* Admin Mobile Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
                            <FiBell className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Admin Contact</h3>
                            <p className="text-sm text-gray-500 mb-4">The mobile number where critical system alerts will be sent.</p>

                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Mobile Number
                            </label>
                            <input
                                type="text"
                                value={settings.admin_notification_mobile}
                                onChange={(e) => handleChange('admin_notification_mobile', e.target.value)}
                                placeholder="e.g. 0724454757"
                                className="w-full max-w-md px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Triggers Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Alert Triggers</h3>

                    <div className="space-y-6">
                        <ToggleItem
                            label="New User Signups"
                            desc="Receive an SMS whenever a new user registers."
                            checked={settings.notify_on_signup}
                            onChange={() => handleToggle('notify_on_signup')}
                        />
                        <ToggleItem
                            label="New Appointment Bookings"
                            desc="Receive an SMS whenever a new appointment is booked."
                            checked={settings.notify_on_booking}
                            onChange={() => handleToggle('notify_on_booking')}
                        />
                        <ToggleItem
                            label="Payment Failures"
                            desc="Receive an SMS when an M-Pesa transaction fails."
                            checked={settings.notify_on_payment_failure}
                            icon={<FiAlertCircle className="w-5 h-5 text-red-500" />}
                            onChange={() => handleToggle('notify_on_payment_failure')}
                        />
                        <ToggleItem
                            label="Support Requests"
                            desc="Receive an SMS when a user submits a 'Need Help' request."
                            checked={settings.notify_on_support_request}
                            onChange={() => handleToggle('notify_on_support_request')}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function ToggleItem({ label, desc, checked, onChange, icon }: any) {
    return (
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
            <div className="flex gap-3">
                {icon || <FiCheckCircle className={`w-5 h-5 ${checked ? 'text-green-500' : 'text-gray-400'}`} />}
                <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{label}</h4>
                    <p className="text-sm text-gray-500">{desc}</p>
                </div>
            </div>
            <button
                onClick={onChange}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
            >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
                    }`} />
            </button>
        </div>
    );
}
