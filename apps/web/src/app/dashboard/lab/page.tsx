'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { FiSearch, FiFilter, FiActivity, FiShoppingCart, FiClock, FiInfo } from 'react-icons/fi';
import BookLabTestModal from '@/components/dashboard/lab/BookLabTestModal';

export default function LabTestsPage() {
    const { user } = useAuth();
    const [tests, setTests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    // Booking State
    const [selectedTest, setSelectedTest] = useState<any | null>(null);

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        try {
            const res = await api.get('/laboratory/tests');
            if (res?.ok) {
                setTests(await res.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const categories = ['All', ...Array.from(new Set(tests.map(t => t.category)))];

    const filteredTests = tests.filter(test => {
        const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            test.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || test.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white">Laboratory Tests</h1>
                    <p className="text-gray-500">Browse and book diagnostic tests.</p>
                </div>

                {/* Search & Filter */}
                <div className="flex gap-4">
                    <div className="relative">
                        {/* @ts-ignore */}
                        <FiSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search tests..."
                            className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black w-64 outline-none focus:ring-2 focus:ring-primary"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black outline-none focus:ring-2 focus:ring-primary"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-500">Loading laboratory catalog...</div>
            ) : filteredTests.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                    <p className="text-gray-500">No tests found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTests.map(test => (
                        <div key={test.id} className="bg-white dark:bg-[#161616] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all group flex flex-col">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <FiActivity size={24} />
                                </div>
                                <span className="bg-gray-100 dark:bg-gray-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide text-gray-600 dark:text-gray-400">
                                    {test.category}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">{test.name}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{test.description}</p>

                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mt-auto flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-bold">Price</p>
                                    <p className="text-lg font-black text-gray-900 dark:text-white">KES {Number(test.price).toLocaleString()}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedTest(test)}
                                    className="bg-gray-900 dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
                                >
                                    Book Now <FiShoppingCart />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Booking Modal */}
            {selectedTest && (
                <BookLabTestModal
                    test={selectedTest}
                    onClose={() => setSelectedTest(null)}
                    onSuccess={() => {
                        setSelectedTest(null);
                        // Show success message or redirect
                    }}
                />
            )}
        </div>
    );
}
