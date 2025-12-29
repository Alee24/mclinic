'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FiPackage, FiShoppingBag, FiCheckCircle, FiSearch, FiAlertCircle } from 'react-icons/fi';

export default function PharmacyView() {
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadPrescriptions();
    }, []);

    const loadPrescriptions = async () => {
        try {
            const res = await api.get('/pharmacy/prescriptions');
            if (res.ok) setPrescriptions(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDispense = async (prescriptionId: number) => {
        if (!confirm("Mark this prescription as DISPENSED? This will deduct stock.")) return;
        try {
            await api.patch(`/pharmacy/prescriptions/${prescriptionId}/status`, { status: 'DISPENSED' });
            loadPrescriptions();
        } catch (e) {
            alert("Failed to dispense");
        }
    };

    const filtered = prescriptions.filter(p =>
        p.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.medicationName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center">Loading Pharmacy System...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold dark:text-white">Pharmacy Dashboard</h1>
                    <p className="text-gray-500">Manage prescriptions, inventory, and dispensing.</p>
                </div>
                <div className="relative">
                    <FiSearch className="absolute left-3 top-3 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search patient or drug..."
                        className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161616] w-64"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><FiShoppingBag /></div>
                    <div>
                        <div className="text-2xl font-black dark:text-white">{prescriptions.filter(p => p.status === 'PENDING').length}</div>
                        <div className="text-sm font-bold text-blue-600">Pending Orders</div>
                    </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/10 p-6 rounded-2xl border border-green-100 dark:border-green-900/30 flex items-center gap-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-xl"><FiCheckCircle /></div>
                    <div>
                        <div className="text-2xl font-black dark:text-white">{prescriptions.filter(p => p.status === 'DISPENSED').length}</div>
                        <div className="text-sm font-bold text-green-600">Dispensed Today</div>
                    </div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/10 p-6 rounded-2xl border border-orange-100 dark:border-orange-900/30 flex items-center gap-4">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-xl"><FiAlertCircle /></div>
                    <div>
                        <div className="text-2xl font-black dark:text-white">3</div>
                        <div className="text-sm font-bold text-orange-600">Low Stock Items</div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-[#161616] rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-lg dark:text-white">Active Prescriptions Queue</h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filtered.map(p => (
                        <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${p.status === 'PENDING' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                                    }`}>RX</div>
                                <div>
                                    <h4 className="font-bold dark:text-white">{p.medicationName || 'Unknown Drug'}</h4>
                                    <p className="text-sm text-gray-500">Patient: <span className="font-medium text-black dark:text-gray-300">{p.patientName}</span></p>
                                    <p className="text-xs text-gray-400">Dosage: {p.dosage} • {p.frequency}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${p.status === 'PENDING' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                                    }`}>{p.status}</span>

                                {p.status === 'PENDING' && (
                                    <button
                                        onClick={() => handleDispense(p.id)}
                                        className="bg-donezo-dark text-white px-4 py-2 rounded-lg text-sm font-bold hover:brightness-110"
                                    >
                                        Dispense
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="p-8 text-center text-gray-400 italic">No prescriptions found.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
