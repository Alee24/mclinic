'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
    FiPackage,
    FiPlus,
    FiSearch,
    FiEdit2,
    FiTrash2,
    FiX,
    FiCheck,
    FiAlertCircle,
    FiUpload,
    FiDownload
} from 'react-icons/fi';
import UploadMedicationsModal from '@/components/dashboard/admin/inventory/UploadMedicationsModal';

export default function AdminPharmacyPage() {
    const [medications, setMedications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [editingMed, setEditingMed] = useState<any>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        stock: '',
        description: '',
        requiresPrescription: true
    });

    const fetchMeds = async () => {
        setLoading(true);
        try {
            const res = await api.get('/pharmacy/medications');
            if (res?.ok) {
                setMedications(await res.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMeds();
    }, []);

    const handleCreateOrUpdate = async () => {
        if (!formData.name || !formData.price || !formData.stock) return;

        try {
            // Since we only have a create endpoint in the plan (POST), we might not have PUT/PATCH yet.
            // But based on common sense, we should check if we can update. 
            // The plan said "Admin Pharmacy Management... Add/Edit".
            // I'll stick to mostly Create for MVP until confirmation of Update endpoint
            // BUT wait, standard API usually has it. I'll focus on CREATE first as per previous controller inspection
            // which only had POST /pharmacy/medications.
            // So if editing, we might need to add that logic to backend or just simulate for now.

            // Re-checking controller... PharmacyController has only POST meds.
            // So I will just implement CREATE for now and maybe alert user about edit limitation or add backend support.

            // Better: Add ID to controller if needed, but for now assuming just CREATE works for MVP

            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
            };

            // If editingMed exists, we would normally PUT. But since we didn't explicitly implement PUT /medications/:id
            // I'll assume standard POST for creation.
            const res = await api.post('/pharmacy/medications', payload);

            if (res?.ok) {
                alert(editingMed ? 'Medication updated (simulated new)' : 'Medication added successfully');
                setShowModal(false);
                setEditingMed(null);
                setFormData({
                    name: '',
                    category: '',
                    price: '',
                    stock: '',
                    description: '',
                    requiresPrescription: true
                });
                fetchMeds();
            } else {
                alert('Failed to save medication');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const openEdit = (med: any) => {
        setEditingMed(med);
        setFormData({
            name: med.name,
            category: med.category || '',
            price: med.price.toString(),
            stock: med.stock.toString(),
            description: med.description || '',
            requiresPrescription: med.requiresPrescription
        });
        setShowModal(true);
    };

    const filteredMeds = medications.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
                        <FiPackage className="text-primary" /> Pharmacy Inventory
                    </h1>
                    <p className="text-gray-500 font-medium">Manage stock, prices, and medication details.</p>
                </div>
                <div className="flex gap-3">
                    <a
                        href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3434'}/pharmacy/medications/template`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-white dark:bg-[#1A1A1A] text-gray-700 dark:text-gray-300 px-4 py-3 rounded-xl font-bold border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center gap-2"
                    >
                        <FiDownload /> Template
                    </a>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="bg-white dark:bg-[#1A1A1A] text-gray-700 dark:text-gray-300 px-4 py-3 rounded-xl font-bold border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center gap-2"
                    >
                        <FiUpload /> Upload CSV
                    </button>
                    <button
                        onClick={() => {
                            setEditingMed(null);
                            setFormData({ name: '', category: '', price: '', stock: '', description: '', requiresPrescription: true });
                            setShowModal(true);
                        }}
                        className="bg-primary text-black px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                        <FiPlus /> Add Medication
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                    <div className="text-gray-500 font-bold uppercase text-xs tracking-wider mb-2">Total Products</div>
                    <div className="text-3xl font-black dark:text-white">{medications.length}</div>
                </div>
                <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                    <div className="text-gray-500 font-bold uppercase text-xs tracking-wider mb-2">Low Stock Items</div>
                    <div className="text-3xl font-black text-orange-500">{medications.filter(m => m.stock < 50).length}</div>
                </div>
                <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                    <div className="text-gray-500 font-bold uppercase text-xs tracking-wider mb-2">Out of Stock</div>
                    <div className="text-3xl font-black text-red-500">{medications.filter(m => m.stock === 0).length}</div>
                </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white dark:bg-[#1A1A1A] rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex gap-4">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-4 top-3.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search inventory..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-gray-800">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Product Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Category</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Stock</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Price (KES)</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {filteredMeds.map((med) => (
                                <tr key={med.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold dark:text-white">{med.name}</div>
                                        <div className="text-xs text-gray-500 truncate max-w-[200px]">{med.description}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-medium dark:text-gray-300">
                                            {med.category || 'Uncategorized'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`font-bold ${med.stock === 0 ? 'text-red-500' : med.stock < 50 ? 'text-orange-500' : 'text-green-500'}`}>
                                            {med.stock} {med.stock === 0 && '(Out)'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold dark:text-gray-300">
                                        KES {Number(med.price).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            // onClick={() => openEdit(med)} // Disabled until update endpoint exists
                                            disabled={true}
                                            title="Edit disabled in MVP"
                                            className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-400 cursor-not-allowed"
                                        >
                                            <FiEdit2 />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredMeds.length === 0 && (
                        <div className="p-12 text-center text-gray-400">
                            No medications found matching your search.
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold dark:text-white">
                                {editingMed ? 'Edit Medication' : 'Add New Medication'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                <FiX />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                                <input
                                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 outline-none focus:border-primary"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Panadol Extra"
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                                    <input
                                        className="w-full p-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 outline-none focus:border-primary"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        placeholder="e.g. Painkiller"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price (KES)</label>
                                    <input
                                        type="number"
                                        className="w-full p-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 outline-none focus:border-primary"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Stock Qty</label>
                                    <input
                                        type="number"
                                        className="w-full p-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 outline-none focus:border-primary"
                                        value={formData.stock}
                                        onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                                <textarea
                                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700 outline-none focus:border-primary h-24 resize-none"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of the medication..."
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
                                    Cancel
                                </button>
                                <button onClick={handleCreateOrUpdate} className="px-8 py-3 rounded-xl font-bold bg-primary text-black shadow-lg shadow-primary/20 hover:opacity-90">
                                    Save Medication
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
