'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FiPlus, FiActivity, FiDollarSign, FiSearch, FiList } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function LabTestsPage() {
    const [tests, setTests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Other'
    });

    const fetchTests = async () => {
        try {
            const res = await api.get('/laboratory/tests');
            if (res && res.ok) {
                setTests(await res.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTests();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/laboratory/tests', {
                ...formData,
                price: parseFloat(formData.price)
            });

            if (res && res.ok) {
                toast.success('Test created successfully');
                setShowModal(false);
                setFormData({ name: '', description: '', price: '', category: 'Other' });
                fetchTests();
            } else {
                toast.error('Failed to create test');
            }
        } catch (err) {
            toast.error('Error creating test');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Laboratory Tests</h1>
                    <p className="text-gray-500">Manage available tests and prices</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
                >
                    <FiPlus /> Add New Test
                </button>
            </div>

            {loading ? (
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tests.map((test) => (
                        <div key={test.id} className="bg-white dark:bg-[#121212] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                                    <FiActivity size={24} />
                                </div>
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-xs rounded text-gray-500 font-bold uppercase">
                                    {test.category}
                                </span>
                            </div>
                            <h3 className="font-bold text-lg mb-1 dark:text-gray-200">{test.name}</h3>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{test.description}</p>
                            <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800">
                                <div className="font-bold text-lg text-green-600 flex items-center">
                                    <FiDollarSign size={16} /> {test.price}
                                </div>
                                <span className={`w-2 h-2 rounded-full ${test.isActive ? 'bg-green-500' : 'bg-red-500'}`} title={test.isActive ? 'Active' : 'Inactive'} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Test Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-md rounded-2xl p-6 shadow-xl">
                        <h2 className="text-xl font-bold mb-4 dark:text-white">Add New Lab Test</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Test Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2 rounded-lg border dark:bg-black dark:border-gray-700 dark:text-white"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Category</label>
                                <select
                                    className="w-full p-2 rounded-lg border dark:bg-black dark:border-gray-700 dark:text-white"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="Other">Other</option>
                                    <option value="Hematology">Hematology</option>
                                    <option value="Biochemistry">Biochemistry</option>
                                    <option value="Microbiology">Microbiology</option>
                                    <option value="Immunology">Immunology</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Price (KES)</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full p-2 rounded-lg border dark:bg-black dark:border-gray-700 dark:text-white"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                <textarea
                                    className="w-full p-2 rounded-lg border dark:bg-black dark:border-gray-700 dark:text-white"
                                    rows={3}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold"
                                >
                                    Save Test
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
