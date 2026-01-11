'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FiSave, FiSettings, FiActivity, FiCheckCircle, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function MpesaSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);

    // Settings State
    const [settings, setSettings] = useState({
        MPESA_CONSUMER_KEY: '',
        MPESA_CONSUMER_SECRET: '',
        MPESA_PASSKEY: '',
        MPESA_SHORTCODE: '',
        MPESA_CALLBACK_URL: '',
        MPESA_ENV: 'sandbox', // sandbox or production
    });

    // Test State
    const [testPhone, setTestPhone] = useState('');
    const [testResult, setTestResult] = useState<any>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/settings');
            if (res.ok) {
                const data = await res.json();
                // Map array of {key, value} to object
                const settingsMap: any = { ...settings };
                data.forEach((s: any) => {
                    if (Object.keys(settings).includes(s.key)) {
                        settingsMap[s.key] = s.value;
                    }
                });
                setSettings(settingsMap);
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Convert object back to array of {key, value}
            const payload = {
                settings: Object.entries(settings).map(([key, value]) => ({ key, value }))
            };

            const res = await api.post('/settings', payload);
            if (res.ok) {
                toast.success('M-Pesa settings saved successfully');
            } else {
                toast.error('Failed to save settings');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error saving settings');
        } finally {
            setSaving(false);
        }
    };

    const handleTest = async () => {
        if (!testPhone) {
            toast.error('Please enter a phone number for testing');
            return;
        }

        setTesting(true);
        setTestResult(null);
        try {
            const res = await api.post('/mpesa/stk-push', {
                phoneNumber: testPhone,
                amount: 1, // 1 KES for test
                accountReference: 'TEST',
                transactionDesc: 'System Test'
            });

            if (res.ok) {
                const data = await res.json();
                setTestResult({ success: true, data });
                toast.success('STK Push Initiated');
            } else {
                const error = await res.text();
                setTestResult({ success: false, error });
                toast.error('STK Push Failed');
            }
        } catch (err: any) {
            console.error(err);
            setTestResult({ success: false, error: err.message });
            toast.error('Connection Error');
        } finally {
            setTesting(false);
        }
    };

    if (loading) return <div className="p-12 text-center">Loading settings...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
                    <FiSettings className="text-green-600" /> M-Pesa Configuration
                </h1>
                <p className="text-gray-500 font-medium">Manage API credentials and integration settings for M-Pesa.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Form */}
                <div className="lg:col-span-2 space-y-6 bg-white dark:bg-[#1A1A1A] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/50 dark:shadow-none">
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Environment</label>
                            <select
                                name="MPESA_ENV"
                                value={settings.MPESA_ENV}
                                onChange={handleChange}
                                className="w-full p-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 outline-none focus:border-green-500 transition-colors"
                            >
                                <option value="sandbox">Sandbox (Test)</option>
                                <option value="production">Production (Live)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Consumer Key</label>
                            <input
                                name="MPESA_CONSUMER_KEY"
                                value={settings.MPESA_CONSUMER_KEY}
                                onChange={handleChange}
                                type="password"
                                className="w-full p-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 outline-none focus:border-green-500 transition-colors font-mono tracking-widest"
                                placeholder="****************"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Consumer Secret</label>
                            <input
                                name="MPESA_CONSUMER_SECRET"
                                value={settings.MPESA_CONSUMER_SECRET}
                                onChange={handleChange}
                                type="password"
                                className="w-full p-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 outline-none focus:border-green-500 transition-colors font-mono tracking-widest"
                                placeholder="****************"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Shortcode (Paybill/Till)</label>
                                <input
                                    name="MPESA_SHORTCODE"
                                    value={settings.MPESA_SHORTCODE}
                                    onChange={handleChange}
                                    className="w-full p-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 outline-none focus:border-green-500 transition-colors font-mono"
                                    placeholder="174379"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Passkey</label>
                                <input
                                    name="MPESA_PASSKEY"
                                    value={settings.MPESA_PASSKEY}
                                    onChange={handleChange}
                                    type="password"
                                    className="w-full p-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 outline-none focus:border-green-500 transition-colors font-mono text-xs"
                                    placeholder="bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Callback URL</label>
                            <input
                                name="MPESA_CALLBACK_URL"
                                value={settings.MPESA_CALLBACK_URL}
                                onChange={handleChange}
                                className="w-full p-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 outline-none focus:border-green-500 transition-colors font-mono text-sm"
                                placeholder="https://api.mclinic.com/mpesa/callback"
                            />
                            <p className="mt-2 text-xs text-gray-400">
                                This URL must be publicly accessible and SSL secured (HTTPS).
                            </p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-green-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-green-500/20 hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
                        >
                            {saving ? <FiRefreshCw className="animate-spin" /> : <FiSave />}
                            {saving ? 'Saving...' : 'Save Configuration'}
                        </button>
                    </div>
                </div>

                {/* Test Panel */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-gray-900 to-black text-white p-8 rounded-3xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-green-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 relative z-10">
                            <FiActivity /> Live Connection Test
                        </h3>
                        <p className="text-gray-400 text-sm mb-6 relative z-10">
                            Verify your settings by initiating a real STK Push request of KES 1 to a test number.
                        </p>

                        <div className="space-y-4 relative z-10">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Test Phone Number</label>
                                <input
                                    value={testPhone}
                                    onChange={(e) => setTestPhone(e.target.value)}
                                    placeholder="2547..."
                                    className="w-full p-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-500 outline-none focus:border-green-500 transition"
                                />
                            </div>
                            <button
                                onClick={handleTest}
                                disabled={testing}
                                className="w-full bg-white text-black py-3 rounded-xl font-bold hover:bg-gray-100 transition flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {testing ? <FiRefreshCw className="animate-spin" /> : <FiActivity />}
                                {testing ? 'Testing...' : 'Test Connection'}
                            </button>
                        </div>

                        {testResult && (
                            <div className={`mt-6 p-4 rounded-xl border ${testResult.success ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'} relative z-10`}>
                                <div className="flex items-start gap-3">
                                    {testResult.success ? <FiCheckCircle className="text-green-500 mt-1" /> : <FiAlertCircle className="text-red-500 mt-1" />}
                                    <div className="text-xs">
                                        <div className={`font-bold ${testResult.success ? 'text-green-500' : 'text-red-500'}`}>
                                            {testResult.success ? 'Success' : 'Failed'}
                                        </div>
                                        <div className="mt-1 text-gray-400 font-mono break-all">
                                            {testResult.success ? JSON.stringify(testResult.data, null, 2) : testResult.error}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/10 p-6 rounded-3xl border border-yellow-100 dark:border-yellow-900/30">
                        <h4 className="font-bold text-yellow-800 dark:text-yellow-500 mb-2 flex items-center gap-2">
                            Important Notes
                        </h4>
                        <ul className="text-xs text-yellow-700 dark:text-yellow-600 space-y-2 list-disc pl-4">
                            <li>Credentials are encrypted and stored in the database.</li>
                            <li>"Sandbox" uses Safaricom's test environment.</li>
                            <li>"Production" uses real money. Be careful!</li>
                            <li>Ensure your Callback URL is reachable from the internet.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
