'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FiX, FiCheckCircle, FiSearch, FiFileText, FiPlus, FiBriefcase } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface PrescribeLabModalProps {
    appointment: any;
    onClose: () => void;
    onSuccess: () => void;
}

export default function PrescribeLabModal({ appointment, onClose, onSuccess }: PrescribeLabModalProps) {
    const [tests, setTests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    
    const [selectedTest, setSelectedTest] = useState<any | null>(null);
    const [clinicalNotes, setClinicalNotes] = useState('');
    const [sampleDate, setSampleDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        const fetchTests = async () => {
            try {
                const res = await api.get('/laboratory/tests');
                if (res?.ok) {
                    setTests(await res.json());
                }
            } catch (err) {
                console.error(err);
                toast.error('Failed to load lab catalog');
            } finally {
                setLoading(false);
            }
        };
        fetchTests();
    }, []);

    const categories = ['All', ...Array.from(new Set(tests.map(t => t.category)))];

    const filteredTests = tests.filter(test => {
        const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            test.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || test.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handlePrescribe = async () => {
        if (!selectedTest) {
            toast.error('Please select a lab test');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                testId: selectedTest.id,
                patientId: appointment.patientId || appointment.patient?.id,
                appointmentId: appointment.id,
                isForSelf: appointment.isForSelf ?? true,
                beneficiaryName: appointment.beneficiaryName,
                beneficiaryAge: appointment.beneficiaryAge,
                beneficiaryGender: appointment.beneficiaryGender,
                beneficiaryRelation: appointment.beneficiaryRelation,
                sampleDate: sampleDate,
                notes: clinicalNotes
            };

            const res = await api.post('/laboratory/orders', payload);
            if (res?.ok) {
                toast.success(`Successfully prescribed ${selectedTest.name}!`);
                onSuccess();
                onClose();
            } else {
                toast.error('Failed to prescribe lab test');
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#111622] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100 dark:border-gray-800">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                    <div>
                        <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                            <FiBriefcase className="text-primary" />
                            Prescribe Laboratory Test
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">Prescribing for: <b>{appointment.patient?.fname} {appointment.patient?.lname}</b></p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <FiX className="dark:text-gray-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {/* Catalog search and category selection if no test selected */}
                    {!selectedTest ? (
                        <div className="space-y-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <FiSearch className="absolute left-3 top-3.5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search lab tests (e.g. hemogram)..."
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/40 dark:text-white outline-none focus:border-primary"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <select
                                    className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/40 dark:text-white outline-none focus:border-primary"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            {loading ? (
                                <div className="text-center py-12 text-gray-400">Loading diagnostic catalog...</div>
                            ) : filteredTests.length === 0 ? (
                                <div className="text-center py-12 text-gray-400 border-2 border-dashed rounded-2xl">No laboratory tests found.</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-1">
                                    {filteredTests.map(test => (
                                        <div
                                            key={test.id}
                                            onClick={() => setSelectedTest(test)}
                                            className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary cursor-pointer transition-all flex flex-col justify-between"
                                        >
                                            <div>
                                                <div className="flex justify-between items-start gap-2 mb-2">
                                                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                        {test.category}
                                                    </span>
                                                    <span className="font-bold text-xs text-primary">KES {Number(test.price).toLocaleString()}</span>
                                                </div>
                                                <h4 className="font-bold text-sm dark:text-white">{test.name}</h4>
                                                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{test.description}</p>
                                            </div>
                                            <div className="mt-3 flex justify-end">
                                                <span className="text-[10px] font-bold text-gray-500 hover:text-primary flex items-center gap-1">Select <FiPlus /></span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Selected Test Details */}
                            <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-indigo-950/20 dark:to-blue-950/20 border border-blue-100 dark:border-indigo-900/30 rounded-2xl flex justify-between items-start">
                                <div>
                                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                        {selectedTest.category}
                                    </span>
                                    <h3 className="font-bold text-lg dark:text-white mt-2">{selectedTest.name}</h3>
                                    <p className="text-xs text-gray-500 mt-1">{selectedTest.description}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-blue-600 dark:text-blue-400">KES {Number(selectedTest.price).toLocaleString()}</p>
                                    <button
                                        onClick={() => setSelectedTest(null)}
                                        className="text-xs text-gray-400 hover:text-red-500 mt-2 font-bold underline"
                                    >
                                        Change Test
                                    </button>
                                </div>
                            </div>

                            {/* Clinical Instructions / Notes */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                    <FiFileText /> Clinical Notes & Clinical Indications
                                </label>
                                <textarea
                                    rows={3}
                                    className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/40 dark:text-white outline-none focus:border-primary resize-none text-sm"
                                    placeholder="Enter clinical reasons or specific instructions for the laboratory (e.g. check for malarial parasites, typhoid screen)"
                                    value={clinicalNotes}
                                    onChange={(e) => setClinicalNotes(e.target.value)}
                                />
                            </div>

                            {/* Preferred Date */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Preferred Testing Date</label>
                                    <input
                                        type="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/40 dark:text-white outline-none focus:border-primary text-sm"
                                        value={sampleDate}
                                        onChange={(e) => setSampleDate(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Patient Action</label>
                                    <div className="p-3 bg-gray-50 dark:bg-white/5 border dark:border-gray-800 rounded-xl text-xs text-gray-500 flex items-center">
                                        This test will appear under their portal to order and pay.
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl font-bold text-sm dark:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    {selectedTest && (
                        <button
                            onClick={handlePrescribe}
                            disabled={submitting}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            {submitting ? 'Prescribing...' : 'Prescribe Lab Test'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
