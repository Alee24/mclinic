'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { FiPlus, FiCheckCircle, FiXCircle, FiAlertCircle, FiClock, FiDollarSign } from 'react-icons/fi';

interface MedicRecommendationsCardProps {
    appointmentId: number;
    isMedic: boolean;
    isPatient: boolean;
}

export default function MedicRecommendationsCard({ appointmentId, isMedic, isPatient }: MedicRecommendationsCardProps) {
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [selectedService, setSelectedService] = useState('');
    const [selectedType, setSelectedType] = useState('Repeat Visit');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
        if (isMedic) fetchServices();
    }, [appointmentId, isMedic]);

    const fetchData = async () => {
        try {
            const res = await api.get(`/recommendations/appointment/${appointmentId}`);
            if (res?.ok) {
                setRecommendations(await res.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchServices = async () => {
        try {
            const res = await api.get('/services'); // Assuming generic services endpoint exists
            if (res?.ok) {
                setServices(await res.json());
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAdd = async () => {
        if (!selectedType) return;
        setSubmitting(true);
        try {
            await api.post('/recommendations', {
                appointment_id: appointmentId,
                type: selectedType,
                service_id: selectedService ? parseInt(selectedService) : null,
                notes: notes
            });
            setNotes('');
            setSelectedService('');
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Failed to add recommendation');
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusUpdate = async (id: number, status: string) => {
        if (!confirm(`Are you sure you want to ${status} this recommendation?`)) return;

        try {
            // If accepting, simulate payment immediately for now
            if (status === 'accepted') {
                // TODO: Integrate actual payment gateway here
                alert('Proceeding to payment...');
                await api.patch(`/recommendations/${id}/status`, { status: 'paid' }); // Mock payment success
                alert('Payment successful! Recommendation accepted.');
            } else {
                await api.patch(`/recommendations/${id}/status`, { status });
            }
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Action failed');
        }
    };

    if (loading) return <div className="p-4 text-center text-gray-400">Loading recommendations...</div>;

    const recommendationTypes = [
        'Repeat Visit',
        'Drug Administration',
        'Virtual Session',
        'Emergency Evacuation',
        'Admission',
        'Other'
    ];

    return (
        <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FiAlertCircle className="text-primary" />
                Medic Recommendations
            </h3>

            {/* List Existing Recommendations */}
            <div className="space-y-4 mb-6">
                {recommendations.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No recommendations yet.</p>
                ) : (
                    recommendations.map((rec) => (
                        <div key={rec.id} className="p-4 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-100 dark:border-gray-800">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className="font-bold text-sm dark:text-white block">{rec.type}</span>
                                    {rec.service && (
                                        <span className="text-xs text-primary font-medium">{rec.service.name} (KES {rec.service.price})</span>
                                    )}
                                </div>
                                <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${rec.status === 'paid' ? 'bg-green-100 text-green-700' :
                                        rec.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {rec.status}
                                </span>
                            </div>

                            {rec.notes && <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{rec.notes}</p>}

                            {/* Patient Actions */}
                            {isPatient && rec.status === 'pending' && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleStatusUpdate(rec.id, 'accepted')}
                                        className="flex-1 py-2 bg-primary text-black text-xs font-bold rounded hover:opacity-90 flex items-center justify-center gap-1"
                                    >
                                        <FiCheckCircle /> Accept & Pay
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(rec.id, 'rejected')}
                                        className="flex-1 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold rounded hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center gap-1"
                                    >
                                        <FiXCircle /> Reject
                                    </button>
                                </div>
                            )}

                            {/* Status Info */}
                            {rec.status === 'paid' && (
                                <p className="text-xs text-green-600 dark:text-green-400 font-bold flex items-center gap-1">
                                    <FiCheckCircle /> Paid & Confirmed
                                </p>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Doctor Add Form */}
            {isMedic && (
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-3">Add Recommendation</h4>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Type</label>
                            <select
                                className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-primary"
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                            >
                                {recommendationTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Link Service (Optional - for payment)</label>
                            <select
                                className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-primary"
                                value={selectedService}
                                onChange={(e) => setSelectedService(e.target.value)}
                            >
                                <option value="">Select Service...</option>
                                {services.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} - KES {s.price}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Notes / Instructions</label>
                            <textarea
                                className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-primary min-h-[80px]"
                                placeholder="Enter specific instructions..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={handleAdd}
                            disabled={submitting}
                            className="w-full py-2 bg-black dark:bg-white text-white dark:text-black font-bold rounded-lg text-sm hover:opacity-80 transition disabled:opacity-50"
                        >
                            {submitting ? 'Adding...' : 'Add Recommendation'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
