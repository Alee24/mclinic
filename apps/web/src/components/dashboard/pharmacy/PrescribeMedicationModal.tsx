'use client';

import { useState, useEffect } from 'react';
import { FiX, FiPlus, FiTrash2, FiSearch, FiCheck } from 'react-icons/fi';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface PrescribeMedicationModalProps {
    appointment: any;
    onClose: () => void;
    onSuccess: () => void;
}

export default function PrescribeMedicationModal({ appointment, onClose, onSuccess }: PrescribeMedicationModalProps) {
    const [medications, setMedications] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMeds, setSelectedMeds] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchMeds = async () => {
            setLoading(true);
            try {
                const res = await api.get('/pharmacy/medications');
                if (res?.ok) {
                    setMedications(await res.json());
                }
            } catch (err) {
                console.error(err);
                toast.error('Failed to load medications');
            } finally {
                setLoading(false);
            }
        };
        fetchMeds();
    }, []);

    const handleAddMed = (med: any) => {
        if (selectedMeds.find(m => m.medicationId === med.id)) {
            toast.error('Medication already selected');
            return;
        }
        setSelectedMeds([...selectedMeds, {
            medicationId: med.id,
            name: med.name,
            quantity: 1,
            dosage: '',
            frequency: '',
            duration: '',
            instructions: ''
        }]);
        toast.success(`Added ${med.name}`);
    };

    const handleRemoveMed = (index: number) => {
        const newMeds = [...selectedMeds];
        newMeds.splice(index, 1);
        setSelectedMeds(newMeds);
    };

    const updateMed = (index: number, field: string, value: any) => {
        const newMeds = [...selectedMeds];
        newMeds[index] = { ...newMeds[index], [field]: value };
        setSelectedMeds(newMeds);
    };

    const handleSubmit = async () => {
        if (selectedMeds.length === 0) return;
        setSubmitting(true);
        try {
            const payload = {
                doctorId: appointment.doctor?.id,
                patientId: appointment.patient?.id, // Use User ID directly
                appointmentId: appointment.id,
                items: selectedMeds.map(m => ({
                    medicationId: m.medicationId, // Ensure this is the ID from the meds list
                    medicationName: m.name,
                    quantity: Number(m.quantity),
                    dosage: m.dosage,
                    frequency: m.frequency,
                    duration: m.duration,
                    instructions: m.instructions
                }))
            };

            console.log('Sending Prescription Payload:', payload);

            const res = await api.post('/pharmacy/prescriptions', payload);
            if (res?.ok) {
                toast.success('Prescription sent successfully!');
                onSuccess();
            } else {
                const errorData = res ? await res.json().catch(() => ({})) : {};
                toast.error(errorData.message || (res ? res.statusText : 'Network Error') || 'Failed to send prescription.');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error connection refused or invalid response.');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredMeds = medications.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] relative z-[10000]">
                <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                    <h2 className="text-xl font-bold dark:text-white">Prescribe Medication</h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <FiX />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    {/* Left: Search & Select */}
                    <div className="w-full md:w-1/3 border-r border-gray-100 dark:border-gray-800 p-6 flex flex-col bg-gray-50/30 dark:bg-black/10">
                        <div className="relative mb-4">
                            <FiSearch className="absolute left-4 top-3.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search medications..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                            {loading ? <p className="text-center text-gray-400 py-4">Loading meds...</p> :
                                filteredMeds.length === 0 ? <p className="text-center text-gray-400 py-4">No medications found.</p> :
                                    filteredMeds.map(med => (
                                        <div
                                            key={med.id}
                                            onClick={() => handleAddMed(med)}
                                            className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-primary cursor-pointer transition-all group"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-sm dark:text-white group-hover:text-primary transition-colors">{med.name}</p>
                                                    <p className="text-xs text-gray-500">{med.category} • {med.stock > 0 ? `${med.stock} in stock` : 'Out of Stock'}</p>
                                                </div>
                                                <FiPlus className="text-gray-400 group-hover:text-primary" />
                                            </div>
                                        </div>
                                    ))}
                            {searchQuery && !medications.find(m => m.name.toLowerCase() === searchQuery.toLowerCase()) && (
                                <div
                                    onClick={() => handleAddMed({ id: null, name: searchQuery, stock: 0, category: 'Custom' })}
                                    className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                >
                                    <div className="flex justify-between items-center text-blue-700 dark:text-blue-300">
                                        <span className="font-bold text-sm">Add "{searchQuery}" as custom med</span>
                                        <FiPlus />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Prescription Details */}
                    <div className="w-full md:w-2/3 p-6 overflow-y-auto bg-white dark:bg-[#1A1A1A]">
                        <h3 className="font-bold text-lg mb-4 dark:text-white flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">Rx</span>
                            Prescription List
                        </h3>

                        {selectedMeds.length === 0 ? (
                            <div className="h-64 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
                                <p>No medications selected.</p>
                                <p className="text-sm">Select from the list to begin.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {selectedMeds.map((item, idx) => (
                                    <div key={idx} className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-white/5 relative group">
                                        <button
                                            onClick={() => handleRemoveMed(idx)}
                                            className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <FiTrash2 size={14} />
                                        </button>
                                        <h4 className="font-bold text-primary mb-3">{item.name}</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-500 uppercase">Dosage</label>
                                                <input
                                                    type="text"
                                                    placeholder="500mg"
                                                    value={item.dosage}
                                                    onChange={(e) => updateMed(idx, 'dosage', e.target.value)}
                                                    className="w-full mt-1 p-2 rounded-lg bg-white dark:bg-black border border-gray-200 dark:border-gray-700 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-500 uppercase">Frequency</label>
                                                <input
                                                    type="text"
                                                    placeholder="2x Daily"
                                                    value={item.frequency}
                                                    onChange={(e) => updateMed(idx, 'frequency', e.target.value)}
                                                    className="w-full mt-1 p-2 rounded-lg bg-white dark:bg-black border border-gray-200 dark:border-gray-700 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-500 uppercase">Duration</label>
                                                <input
                                                    type="text"
                                                    placeholder="7 Days"
                                                    value={item.duration}
                                                    onChange={(e) => updateMed(idx, 'duration', e.target.value)}
                                                    className="w-full mt-1 p-2 rounded-lg bg-white dark:bg-black border border-gray-200 dark:border-gray-700 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-500 uppercase">Quantity</label>
                                                <input
                                                    type="number"
                                                    placeholder="1"
                                                    value={item.quantity}
                                                    onChange={(e) => updateMed(idx, 'quantity', e.target.value)}
                                                    className="w-full mt-1 p-2 rounded-lg bg-white dark:bg-black border border-gray-200 dark:border-gray-700 text-sm"
                                                />
                                            </div>
                                            <div className="col-span-2 md:col-span-4">
                                                <label className="text-[10px] font-bold text-gray-500 uppercase">Instructions</label>
                                                <input
                                                    type="text"
                                                    placeholder="Take after meals..."
                                                    value={item.instructions}
                                                    onChange={(e) => updateMed(idx, 'instructions', e.target.value)}
                                                    className="w-full mt-1 p-2 rounded-lg bg-white dark:bg-black border border-gray-200 dark:border-gray-700 text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1A1A1A]">
                    {appointment.doctor?.signatureUrl && (
                        <div className="mb-4 flex items-center justify-end gap-2 text-xs text-gray-400">
                            <img src={appointment.doctor.signatureUrl} alt="Signature" className="h-8 opacity-60" />
                            <span>Digitally Signed by Dr. {appointment.doctor.user?.lname}</span>
                        </div>
                    )}
                    <div className="flex justify-end gap-3">
                        <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || selectedMeds.length === 0}
                            className="px-8 py-3 rounded-xl font-bold bg-donezo-dark text-white shadow-lg shadow-donezo-dark/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {submitting ? 'Sending...' : <><FiCheck /> Send Prescription</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
