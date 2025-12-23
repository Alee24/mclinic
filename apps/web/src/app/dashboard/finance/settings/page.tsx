'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

export default function PaymentSettingsPage() {
    const [provider, setProvider] = useState('mpesa');
    const [credentials, setCredentials] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let credsParsed;
            try {
                credsParsed = JSON.parse(credentials);
            } catch (e) {
                alert('Invalid JSON format');
                setLoading(false);
                return;
            }

            const res = await api.post('/financial/config', {
                provider,
                credentials: credsParsed,
            });

            if (res && res.ok) {
                alert('Settings saved successfully!');
            } else {
                alert('Failed to save settings');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl">
            <h1 className="text-2xl font-bold mb-6 dark:text-white">Payment Configuration</h1>

            <div className="bg-white dark:bg-[#121212] p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2 dark:text-gray-300">Payment Provider</label>
                        <select
                            value={provider}
                            onChange={(e) => setProvider(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black dark:text-white"
                        >
                            <option value="mpesa">M-Pesa (Daraja)</option>
                            <option value="visa">Visa (CyberSource)</option>
                            <option value="paypal">PayPal</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 dark:text-gray-300">API Credentials (JSON)</label>
                        <p className="text-xs text-gray-500 mb-2">Enter Consumer Key, Secret, etc. as a JSON object.</p>
                        <textarea
                            value={credentials}
                            onChange={(e) => setCredentials(e.target.value)}
                            rows={6}
                            placeholder={'{\n  "consumerKey": "...",\n  "consumerSecret": "..."\n}'}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black dark:text-white font-mono text-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary text-black font-bold px-6 py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Configuration'}
                    </button>
                </form>
            </div>
        </div>
    );
}
