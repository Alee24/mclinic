'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import {
    FiSettings, FiSave, FiRefreshCw, FiDollarSign, FiPercent, FiTruck, FiVideo, FiMapPin
} from 'react-icons/fi';

interface Setting {
    key: string;
    value: string;
    description: string;
    isSecure: boolean;
}

export default function FeeSettingsPage() {
    const [settings, setSettings] = useState<Setting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const FEE_KEYS = [
        'FEE_BOOKING',
        'FEE_PHYSICAL_VISIT',
        'FEE_VIRTUAL_VISIT',
        'FEE_AMBULANCE_BASE',
        'COMMISSION_PERCENTAGE',
        'FEE_GLOBAL_BASE_DAY',
        'FEE_GLOBAL_BASE_NIGHT',
        'NIGHT_SHIFT_START_TIME',
        'NIGHT_SHIFT_END_TIME'
    ];

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await api.get('/settings');
            if (!res) return;
            const data = await res.json();
            setSettings(data.filter((s: any) => FEE_KEYS.includes(s.key)));
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            toast.error('Failed to load fee settings');
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
                toast.success('Service fees updated successfully');
            } else {
                throw new Error('Failed to update');
            }
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const getSettingValue = (key: string) => settings.find(s => s.key === key)?.value ?? '0';

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <FiRefreshCw className="animate-spin text-4xl text-blue-500" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <FiSettings className="text-blue-600" />
                        Service Fees & Commissions
                    </h1>
                    <p className="text-gray-500 font-medium">Define global pricing and platform commission rates</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50"
                >
                    {saving ? <FiRefreshCw className="animate-spin" /> : <FiSave />}
                    {saving ? 'Updating...' : 'Apply Changes'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Consultation Fees */}
                <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-xl border border-gray-100 dark:border-gray-700 transition-all hover:shadow-2xl space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                            <FiVideo className="text-2xl" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white">Consultation Fees</h2>
                            <p className="text-sm text-gray-500">Service delivery pricing</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="group">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Virtual Consultation (KES)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">KES</span>
                                <input
                                    type="number"
                                    value={getSettingValue('FEE_VIRTUAL_VISIT')}
                                    onChange={(e) => handleUpdateValue('FEE_VIRTUAL_VISIT', e.target.value)}
                                    className="w-full pl-14 pr-4 py-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-transparent focus:border-blue-500 dark:text-white outline-none transition-all font-black text-lg"
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Physical / Home Visit (KES)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">KES</span>
                                <input
                                    type="number"
                                    value={getSettingValue('FEE_PHYSICAL_VISIT')}
                                    onChange={(e) => handleUpdateValue('FEE_PHYSICAL_VISIT', e.target.value)}
                                    className="w-full pl-14 pr-4 py-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-transparent focus:border-blue-500 dark:text-white outline-none transition-all font-black text-lg"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Global Shift Pricing */}
                <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-xl border border-gray-100 dark:border-gray-700 transition-all hover:shadow-2xl space-y-6 md:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                            <FiMapPin className="text-2xl" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white">Global Shift Pricing</h2>
                            <p className="text-sm text-gray-500">Base and Night charges for all medics</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="group">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Base Day Charge (KES)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">KES</span>
                                <input
                                    type="number"
                                    value={getSettingValue('FEE_GLOBAL_BASE_DAY')}
                                    onChange={(e) => handleUpdateValue('FEE_GLOBAL_BASE_DAY', e.target.value)}
                                    className="w-full pl-14 pr-4 py-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-transparent focus:border-indigo-500 dark:text-white outline-none transition-all font-black text-lg"
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Night Charge (KES)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">KES</span>
                                <input
                                    type="number"
                                    value={getSettingValue('FEE_GLOBAL_BASE_NIGHT')}
                                    onChange={(e) => handleUpdateValue('FEE_GLOBAL_BASE_NIGHT', e.target.value)}
                                    className="w-full pl-14 pr-4 py-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-transparent focus:border-indigo-500 dark:text-white outline-none transition-all font-black text-lg"
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Night Shift Starts</label>
                            <input
                                type="time"
                                value={getSettingValue('NIGHT_SHIFT_START_TIME')}
                                onChange={(e) => handleUpdateValue('NIGHT_SHIFT_START_TIME', e.target.value)}
                                className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-transparent focus:border-indigo-500 dark:text-white outline-none transition-all font-black text-lg"
                            />
                        </div>

                        <div className="group">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Night Shift Ends</label>
                            <input
                                type="time"
                                value={getSettingValue('NIGHT_SHIFT_END_TIME')}
                                onChange={(e) => handleUpdateValue('NIGHT_SHIFT_END_TIME', e.target.value)}
                                className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-transparent focus:border-indigo-500 dark:text-white outline-none transition-all font-black text-lg"
                            />
                        </div>
                    </div>
                </div>

                {/* Booking & Platform Fees */}
                <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-xl border border-gray-100 dark:border-gray-700 transition-all hover:shadow-2xl space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600">
                            <FiPercent className="text-2xl" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white">Platform Revenue</h2>
                            <p className="text-sm text-gray-500">Commission & base charges</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="group">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Booking Fee (KES)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">KES</span>
                                <input
                                    type="number"
                                    value={getSettingValue('FEE_BOOKING')}
                                    onChange={(e) => handleUpdateValue('FEE_BOOKING', e.target.value)}
                                    className="w-full pl-14 pr-4 py-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-transparent focus:border-teal-500 dark:text-white outline-none transition-all font-black text-lg"
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2 px-1 italic">Flat fee charged to patients per booking</p>
                        </div>

                        <div className="group">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Platform Commission (%)</label>
                            <div className="relative">
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                                <input
                                    type="number"
                                    value={getSettingValue('COMMISSION_PERCENTAGE')}
                                    onChange={(e) => handleUpdateValue('COMMISSION_PERCENTAGE', e.target.value)}
                                    className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-transparent focus:border-teal-500 dark:text-white outline-none transition-all font-black text-lg"
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2 px-1 italic">Percentage deducted from professional service fees</p>
                        </div>
                    </div>
                </div>

                {/* Specialized Services */}
                <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-xl border border-gray-100 dark:border-gray-700 transition-all hover:shadow-2xl md:col-span-2">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600">
                            <FiTruck className="text-2xl" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white">Emergency & Logistics</h2>
                            <p className="text-sm text-gray-500">Ambulance and specialized transport</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Ambulance Base Charge (KES)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">KES</span>
                                <input
                                    type="number"
                                    value={getSettingValue('FEE_AMBULANCE_BASE')}
                                    onChange={(e) => handleUpdateValue('FEE_AMBULANCE_BASE', e.target.value)}
                                    className="w-full pl-14 pr-4 py-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-transparent focus:border-orange-500 dark:text-white outline-none transition-all font-black text-lg"
                                />
                            </div>
                        </div>
                        
                        <div className="bg-orange-50/50 dark:bg-orange-900/10 p-6 rounded-2xl border border-orange-100 dark:border-orange-900/20 flex items-center justify-center">
                            <p className="text-xs text-orange-800 dark:text-orange-300 font-medium text-center">
                                Mileage and additional distance-based charges are calculated dynamically based on GPS coordinates.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="bg-blue-600 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-blue-600/40 relative overflow-hidden group">
                <div className="relative z-10">
                    <h3 className="text-2xl font-black mb-2">Revenue Impact</h3>
                    <p className="text-blue-100 max-w-md">Changing these rates will affect all future transactions. Current pending bookings will maintain their original quoted prices.</p>
                </div>
                <div className="text-4xl font-black opacity-20 group-hover:opacity-40 transition-opacity absolute right-12 top-1/2 -translate-y-1/2 pointer-events-none">
                    <FiDollarSign className="scale-[4]" />
                </div>
            </div>
        </div>
    );
}
