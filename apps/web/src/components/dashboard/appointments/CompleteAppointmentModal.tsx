import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { FiX, FiCheck, FiPlus, FiTrash2 } from 'react-icons/fi';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface CompleteAppointmentModalProps {
    appointment: any;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CompleteAppointmentModal({ appointment, onClose, onSuccess }: CompleteAppointmentModalProps) {
    const [loading, setLoading] = useState(false);
    const [diagnosis, setDiagnosis] = useState('');
    const [notes, setNotes] = useState('');
    const [prescriptionItems, setPrescriptionItems] = useState<any[]>([]);

    const addPrescriptionItem = () => {
        setPrescriptionItems([
            ...prescriptionItems, 
            { medicationName: '', dosage: '', frequency: '', duration: '', quantity: 1, instructions: '' }
        ]);
    };

    const updatePrescriptionItem = (index: number, field: string, value: any) => {
        const newItems = [...prescriptionItems];
        newItems[index][field] = value;
        setPrescriptionItems(newItems);
    };

    const removePrescriptionItem = (index: number) => {
        setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!diagnosis.trim()) {
            toast.error("Diagnosis is required.");
            return;
        }

        if (!notes.trim()) {
            toast.error("Detailed report/notes is required.");
            return;
        }

        setLoading(true);
        const toastId = toast.loading('Submitting medical report and completing appointment...');

        try {
            // 1. Create Medical Record
            const recordRes = await api.post('/medical-records', {
                patientId: Number(appointment.patientId),
                doctorId: Number(appointment.doctorId),
                appointmentId: Number(appointment.id),
                diagnosis,
                notes,
            });

            if (!recordRes?.ok) {
                throw new Error("Failed to save medical report.");
            }

            // 2. Create Prescription if any items exist
            if (prescriptionItems.length > 0) {
                // Filter out empty items
                const validItems = prescriptionItems.filter(item => item.medicationName.trim() !== '');
                if (validItems.length > 0) {
                    const scriptRes = await api.post('/pharmacy/prescriptions', {
                        patientId: Number(appointment.patientId),
                        doctorId: Number(appointment.doctorId),
                        appointmentId: Number(appointment.id),
                        items: validItems
                    });
                    if (!scriptRes?.ok) {
                        toast.error("Medical record saved, but failed to save prescription.", { id: toastId });
                    }
                }
            }

            // 3. Update Appointment Status to completed
            const statusRes = await api.patch(`/appointments/${appointment.id}/status`, { status: 'completed' });
            if (!statusRes?.ok) {
                throw new Error("Failed to update appointment status.");
            }

            toast.success('Appointment completed successfully!', { id: toastId });
            onSuccess();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'An error occurred.', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Transition appear show={true} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={loading ? () => {} : onClose}>
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-[#1A1A1A] p-6 text-left align-middle shadow-2xl transition-all">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <Dialog.Title as="h3" className="text-xl font-bold dark:text-white">
                                        Medical Report
                                    </Dialog.Title>
                                    <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-widest">
                                        Finalize Appointment & Diagnosis
                                    </p>
                                </div>
                                <button disabled={loading} onClick={onClose} className="text-gray-500 hover:text-black dark:hover:text-white transition p-2 bg-gray-100 dark:bg-white/5 rounded-full">
                                    <FiX size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Medical Record Info */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                            Primary Diagnosis <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={diagnosis}
                                            onChange={(e) => setDiagnosis(e.target.value)}
                                            placeholder="e.g. Acute Bronchitis, Essential Hypertension"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                            Detailed Report / Clinical Notes <span className="text-rose-500">*</span>
                                        </label>
                                        <textarea
                                            required
                                            rows={4}
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Symptoms, observations, and treatment plan..."
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Prescriptions */}
                                <div className="pt-6 border-t border-dashed border-gray-200 dark:border-gray-800">
                                    <div className="flex justify-between items-center mb-4">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Prescription (Optional)
                                        </label>
                                        <button
                                            type="button"
                                            onClick={addPrescriptionItem}
                                            className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
                                        >
                                            <FiPlus /> Add Medication
                                        </button>
                                    </div>
                                    
                                    {prescriptionItems.length > 0 ? (
                                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                            {prescriptionItems.map((item, index) => (
                                                <div key={index} className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl relative border border-gray-100 dark:border-gray-800">
                                                    <button
                                                        type="button"
                                                        onClick={() => removePrescriptionItem(index)}
                                                        className="absolute top-2 right-2 text-gray-400 hover:text-rose-500 transition p-2"
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="md:col-span-2">
                                                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Medication Name</label>
                                                            <input
                                                                type="text"
                                                                value={item.medicationName}
                                                                onChange={(e) => updatePrescriptionItem(index, 'medicationName', e.target.value)}
                                                                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white"
                                                                placeholder="e.g. Amoxicillin 500mg"
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Dosage</label>
                                                            <input
                                                                type="text"
                                                                value={item.dosage}
                                                                onChange={(e) => updatePrescriptionItem(index, 'dosage', e.target.value)}
                                                                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white"
                                                                placeholder="e.g. 2 Tablets"
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Frequency</label>
                                                            <input
                                                                type="text"
                                                                value={item.frequency}
                                                                onChange={(e) => updatePrescriptionItem(index, 'frequency', e.target.value)}
                                                                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white"
                                                                placeholder="e.g. 3 times a day"
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Duration</label>
                                                            <input
                                                                type="text"
                                                                value={item.duration}
                                                                onChange={(e) => updatePrescriptionItem(index, 'duration', e.target.value)}
                                                                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white"
                                                                placeholder="e.g. 5 days"
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Quantity to Dispense</label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={item.quantity}
                                                                onChange={(e) => updatePrescriptionItem(index, 'quantity', parseInt(e.target.value))}
                                                                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white"
                                                                required
                                                            />
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <label className="block text-[10px] font-bold text-gray-500 uppercase">Instructions</label>
                                                            <input
                                                                type="text"
                                                                value={item.instructions}
                                                                onChange={(e) => updatePrescriptionItem(index, 'instructions', e.target.value)}
                                                                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white"
                                                                placeholder="e.g. Take after meals"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                                            <p className="text-sm text-gray-500 mb-2">No prescriptions added.</p>
                                            <button
                                                type="button"
                                                onClick={addPrescriptionItem}
                                                className="text-xs font-bold text-blue-600 dark:text-blue-400"
                                            >
                                                + Add Medication
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={loading}
                                        className="px-6 py-3 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                                    >
                                        {loading ? 'Submitting...' : <><FiCheck /> Complete & Submit Report</>}
                                    </button>
                                </div>
                            </form>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
