import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FiX } from 'react-icons/fi';

interface CreateAppointmentModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateAppointmentModal({ onClose, onSuccess }: CreateAppointmentModalProps) {
    const [loading, setLoading] = useState(false);
    const [patients, setPatients] = useState<any[]>([]);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        patientId: '',
        doctorId: '',
        serviceId: '',
        date: '',
        time: '',
        notes: ''
    });

    useEffect(() => {
        const loadData = async () => {
            const [patRes, docRes, servRes] = await Promise.all([
                api.get('/patients'),
                api.get('/doctors'),
                api.get('/services'),
            ]);
            if (patRes?.ok) setPatients(await patRes.json());
            if (docRes?.ok) setDoctors(await docRes.json());
            if (servRes?.ok) setServices(await servRes.json());
        };
        loadData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!formData.date || !formData.time) {
                alert('Please select date and time');
                setLoading(false);
                return;
            }

            const dateTimeStr = `${formData.date}T${formData.time}`;
            const dateTime = new Date(dateTimeStr);

            if (isNaN(dateTime.getTime())) {
                alert('Invalid date or time');
                setLoading(false);
                return;
            }

            const res = await api.post('/appointments', {
                patientId: parseInt(formData.patientId),
                doctorId: parseInt(formData.doctorId),
                appointmentDate: formData.date,
                appointmentTime: formData.time,
                serviceId: formData.serviceId ? parseInt(formData.serviceId) : null,
                isVirtual: false,
                notes: formData.notes,
                status: 'pending'
            });

            if (res && res.ok) {
                alert('Appointment created successfully! Invoice has been generated.');
                onSuccess();
            } else {
                alert('Failed to create appointment');
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
                    <h2 className="text-xl font-bold dark:text-white">New Appointment Booking</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-black dark:hover:text-white"><FiX size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Select Patient</label>
                        <select
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black dark:text-white"
                            required
                            value={formData.patientId}
                            onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                        >
                            <option value="">-- Choose Patient --</option>
                            {patients.map(p => <option key={p.id} value={p.id}>{p.fname} {p.lname}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Select Doctor</label>
                        <select
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black dark:text-white"
                            required
                            value={formData.doctorId}
                            onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                        >
                            <option value="">-- Choose Doctor --</option>
                            {doctors.map(d => <option key={d.id} value={d.id}>{d.fname} {d.lname} - {d.specialty || d.dr_type}</option>)}
                        </select>
                    </div>



                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Date</label>
                            <input
                                type="date"
                                required
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black dark:text-white"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Time</label>
                            <input
                                type="time"
                                required
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black dark:text-white"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Notes</label>
                        <textarea
                            rows={3}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black dark:text-white"
                            placeholder="Reason for visit..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-primary text-black font-bold rounded-lg hover:opacity-90 disabled:opacity-50">
                            {loading ? 'Booking...' : 'Confirm Booking'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
