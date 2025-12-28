'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FiClock, FiCheck, FiPlay, FiFileText, FiUser, FiCalendar, FiFilter, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';

// Simple Modal for Result Entry (Inline for now)
const ResultEntryModal = ({ order, onClose, onSuccess }: { order: any; onClose: () => void; onSuccess: () => void }) => {
    const [results, setResults] = useState([{ parameter_name: '', value: '', unit: '', reference_range: '' }]);
    const [submitting, setSubmitting] = useState(false);

    const addField = () => {
        setResults([...results, { parameter_name: '', value: '', unit: '', reference_range: '' }]);
    };

    const handleChange = (index: number, field: string, val: string) => {
        const newResults = [...results];
        // @ts-ignore
        newResults[index][field] = val;
        setResults(newResults);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await api.post(`/laboratory/orders/${order.id}/results`, { results });
            if (res && res.ok) {
                // Also update status to completed
                await api.patch(`/laboratory/orders/${order.id}/status`, { status: 'completed' });
                toast.success('Results saved & Order Completed');
                onSuccess();
            } else {
                toast.error('Failed to save results');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error saving results');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-left">
            <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold dark:text-white">Enter Results: {order?.test?.name}</h2>
                    <p className="text-sm text-gray-500">Patient: {order?.patient?.fname} {order?.patient?.lname}</p>
                </div>

                <div className="p-6 overflow-y-auto">
                    <form id="resultForm" onSubmit={handleSubmit} className="space-y-4">
                        {results.map((row, i) => (
                            <div key={i} className="grid grid-cols-12 gap-2 items-end bg-gray-50 dark:bg-white/5 p-3 rounded-lg">
                                <div className="col-span-4">
                                    <label className="text-xs font-bold text-gray-500">Parameter</label>
                                    <input required placeholder="e.g. Hemoglobin" className="w-full p-2 text-sm rounded border dark:bg-black dark:border-gray-700 dark:text-white" value={row.parameter_name} onChange={e => handleChange(i, 'parameter_name', e.target.value)} />
                                </div>
                                <div className="col-span-3">
                                    <label className="text-xs font-bold text-gray-500">Value</label>
                                    <input required placeholder="e.g. 14.5" className="w-full p-2 text-sm rounded border dark:bg-black dark:border-gray-700 dark:text-white" value={row.value} onChange={e => handleChange(i, 'value', e.target.value)} />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-bold text-gray-500">Unit</label>
                                    <input placeholder="g/dL" className="w-full p-2 text-sm rounded border dark:bg-black dark:border-gray-700 dark:text-white" value={row.unit} onChange={e => handleChange(i, 'unit', e.target.value)} />
                                </div>
                                <div className="col-span-3">
                                    <label className="text-xs font-bold text-gray-500">Ref Range</label>
                                    <input placeholder="13-17" className="w-full p-2 text-sm rounded border dark:bg-black dark:border-gray-700 dark:text-white" value={row.reference_range} onChange={e => handleChange(i, 'reference_range', e.target.value)} />
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={addField} className="text-sm text-blue-600 hover:underline">+ Add Another Parameter</button>
                    </form>
                </div>

                <div className="p-6 border-t dark:border-gray-700 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
                    <button form="resultForm" type="submit" disabled={submitting} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold">
                        {submitting ? 'Saving...' : 'Save & Complete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function LabOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await api.get('/laboratory/orders');
            if (res && res.ok) {
                setOrders(await res.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const updateStatus = async (id: string, status: string) => {
        try {
            await api.patch(`/laboratory/orders/${id}/status`, { status });
            toast.success(`Status updated to ${status}`);
            fetchOrders();
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'sample_received': return 'bg-blue-100 text-blue-700';
            case 'processing': return 'bg-purple-100 text-purple-700';
            case 'completed': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-500';
        }
    };

    const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lab Orders</h1>
                    <p className="text-gray-500">Track and process test requests</p>
                </div>
                <div className="flex gap-2">
                    <select
                        className="p-2 rounded-lg border dark:bg-[#121212] dark:border-gray-800 dark:text-white text-sm"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="sample_received">Sample Recvd</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                    </select>
                    <button onClick={fetchOrders} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200"><FiRefreshCw /></button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-400">Loading orders...</div>
            ) : filteredOrders.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-[#121212] rounded-xl border border-dashed border-gray-300">
                    <FiFileText className="mx-auto text-4xl text-gray-300 mb-4" />
                    <p className="text-gray-500">No orders found.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-gray-800">
                            <tr>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Order ID</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Patient</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Test</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition">
                                    <td className="p-4 font-mono text-xs text-gray-500">#{order.id.slice(0, 8)}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                {order.patient?.fname?.[0] || 'U'}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm dark:text-gray-200">{order.patient?.fname} {order.patient?.lname}</div>
                                                <div className="text-xs text-gray-400">{order.patient?.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-gray-700 dark:text-gray-300">{order.test?.name}</div>
                                        <div className="text-xs text-gray-400">{order.test?.category}</div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-500">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getStatusColor(order.status)}`}>
                                            {order.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        {order.status === 'pending' && (
                                            <button
                                                onClick={() => updateStatus(order.id, 'sample_received')}
                                                className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100"
                                            >
                                                Receive Sample
                                            </button>
                                        )}
                                        {order.status === 'sample_received' && (
                                            <button
                                                onClick={() => updateStatus(order.id, 'processing')}
                                                className="text-xs bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg font-bold hover:bg-purple-100"
                                            >
                                                Start Processing
                                            </button>
                                        )}
                                        {order.status === 'processing' && (
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-lg font-bold hover:bg-green-100"
                                            >
                                                Enter Results
                                            </button>
                                        )}
                                        {order.status === 'completed' && (
                                            <button className="text-gray-400 hover:text-blue-500"><FiFileText size={18} /></button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedOrder && (
                <ResultEntryModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onSuccess={() => {
                        setSelectedOrder(null);
                        fetchOrders();
                    }}
                />
            )}
        </div>
    );
}
