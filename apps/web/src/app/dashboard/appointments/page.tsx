'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form selections
    const [patients, setPatients] = useState<any[]>([]);
    const [doctors, setDoctors] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        patientId: '',
        doctorId: '',
        date: '',
        time: '',
        notes: ''
    });

    const fetchData = async () => {
        setLoading(true);
        const [aptRes, patRes, docRes] = await Promise.all([
            api.get('/appointments'),
            api.get('/patients'),
            api.get('/doctors'),
        ]);

        if (aptRes?.ok) setAppointments(await aptRes.json());
        if (patRes?.ok) setPatients(await patRes.json());
        if (docRes?.ok) setDoctors(await docRes.json());
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.date || !formData.time) {
            alert('Please select date and time');
            return;
        }

        try {
            // Validate date string
            const dateTimeStr = `${formData.date}T${formData.time}`;
            const dateTime = new Date(dateTimeStr);

            if (isNaN(dateTime.getTime())) {
                alert('Invalid date or time');
                return;
            }

            const res = await api.post('/appointments', {
                patientId: parseInt(formData.patientId),
                doctorId: parseInt(formData.doctorId),
                appointmentDate: dateTime.toISOString(),
                notes: formData.notes,
                status: 'pending'
            });

            if (res && res.ok) {
                alert('Appointment created successfully');
                setShowModal(false);
                fetchData();
            } else {
                alert('Failed to create appointment');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold dark:text-white">Appointments</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-primary text-black font-bold px-4 py-2 rounded-lg hover:opacity-90 transition"
                >
                    + New Booking
                </button>
            </div>

            <div className="bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">Patient</th>
                            <th className="px-6 py-4">Doctor</th>
                            <th className="px-6 py-4">Date & Time</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-4 text-center">Loading...</td></tr>
                        ) : appointments.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No appointments found</td></tr>
                        ) : (
                            appointments.map((apt) => (
                                <tr key={apt.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium dark:text-white">{apt.patient?.fullName || 'Unknown'}</td>
                                    <td className="px-6 py-4 text-gray-500">{apt.doctor?.fullName || 'Unknown'}</td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {apt.dateTime ? new Date(apt.dateTime).toLocaleDateString() + ' at ' + new Date(apt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Invalid Date'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                            apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            {apt.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-brand-blue hover:underline text-sm font-medium">Edit</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Booking Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-lg rounded-xl shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold dark:text-white">New Appointment Booking</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-black dark:hover:text-white">✕</button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Select Patient</label>
                                <select
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black dark:text-white"
                                    required
                                    value={formData.patientId}
                                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                                >
                                    <option value="">-- Choose Patient --</option>
                                    {patients.map(p => <option key={p.id} value={p.id}>{p.fullName} ({p.user?.email})</option>)}
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
                                    {doctors.map(d => <option key={d.id} value={d.id}>{d.fullName} - {d.specialization}</option>)}
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
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-primary text-black font-bold rounded-lg hover:opacity-90">Confirm Booking</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
