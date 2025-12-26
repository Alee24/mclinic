import { useState } from 'react';
import { api } from '@/lib/api';
import { FiX } from 'react-icons/fi';

interface AddMedicalRecordModalProps {
    patientId: number;
    appointmentId?: number; // Optional as not all records might come from apts? Actually for this flow it is required but let's make optional for safety
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddMedicalRecordModal({ patientId, appointmentId, onClose, onSuccess }: AddMedicalRecordModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        diagnosis: '',
        prescription: '',
        notes: '',
        doctorId: 1, // Mocked for now, assumes admin/doctor is logged in
    });

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!formData.diagnosis) {
                alert('Diagnosis is required');
                setLoading(false);
                return;
            }

            const res = await api.post('/medical-records', {
                ...formData,
                patientId,
                appointmentId,
                // userId/admin handling might be needed on backend to link real doctor
            });

            if (res && res.ok) {
                alert('Medical record added');
                onSuccess();
            } else {
                alert('Failed to add medical record');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-lg rounded-xl shadow-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold dark:text-white">Add Medical Record</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-black dark:hover:text-white transition">
                        <FiX size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Diagnosis *</label>
                        <input
                            name="diagnosis"
                            required
                            className="w-full px-4 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg dark:text-white"
                            value={formData.diagnosis}
                            onChange={handleChange}
                            placeholder="e.g. Acute Bronchitis"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Prescription</label>
                        <textarea
                            name="prescription"
                            rows={3}
                            className="w-full px-4 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg dark:text-white"
                            value={formData.prescription}
                            onChange={handleChange}
                            placeholder="Medication details..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Notes</label>
                        <textarea
                            name="notes"
                            rows={3}
                            className="w-full px-4 py-2 bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg dark:text-white"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Additional observations..."
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-primary text-black font-bold rounded-lg hover:opacity-90 disabled:opacity-50">
                            {loading ? 'Saving...' : 'Save Record'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
