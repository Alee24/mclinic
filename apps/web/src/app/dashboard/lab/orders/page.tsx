'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FiClock, FiCheck, FiPlay, FiFileText, FiUser, FiCalendar, FiFilter, FiRefreshCw, FiDownload, FiEye, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import UploadLabResultModal from '@/components/dashboard/lab/UploadLabResultModal';
import { useAuth, UserRole } from '@/lib/auth';

export default function LabOrdersPage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [viewNotesOrder, setViewNotesOrder] = useState<any>(null);

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

    const handleDownloadReport = (filename: string) => {
        // Construct URL - assuming backend serves static files from /uploads
        const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3434'}/uploads/reports/${filename}`;
        window.open(url, '_blank');
    };

    const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);
    const isPatient = user?.role === UserRole.PATIENT;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lab Orders</h1>
                    <p className="text-gray-500">{isPatient ? 'View your test results and reports' : 'Track and process test requests'}</p>
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
                                {!isPatient && <th className="p-4 text-xs font-bold text-gray-500 uppercase">Patient</th>}
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
                                    {!isPatient && (
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
                                    )}
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
                                        <div className="flex justify-end gap-2">
                                            {/* Standard Actions (Tech Only) */}
                                            {!isPatient && order.status === 'pending' && (
                                                <button onClick={() => updateStatus(order.id, 'sample_received')} className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100">Receive Sample</button>
                                            )}
                                            {!isPatient && order.status === 'sample_received' && (
                                                <button onClick={() => updateStatus(order.id, 'processing')} className="text-xs bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg font-bold hover:bg-purple-100">Start Processing</button>
                                            )}
                                            {!isPatient && order.status === 'processing' && (
                                                <button onClick={() => setSelectedOrder(order)} className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-lg font-bold hover:bg-green-100">Enter Results</button>
                                            )}

                                            {/* Report Actions (Everyone if completed) */}
                                            {order.status === 'completed' && order.report_url && (
                                                <button
                                                    onClick={() => handleDownloadReport(order.report_url)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 text-xs font-bold"
                                                    title="Download Report"
                                                >
                                                    <FiDownload /> Report
                                                </button>
                                            )}

                                            {/* Notes (Everyone if exists) */}
                                            {order.technicianNotes && (
                                                <button
                                                    onClick={() => setViewNotesOrder(order)}
                                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-1 text-xs"
                                                    title="View Technician Notes"
                                                >
                                                    <FiEye /> Notes
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedOrder && (
                <UploadLabResultModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onSuccess={() => {
                        setSelectedOrder(null);
                        fetchOrders();
                    }}
                />
            )}

            {/* View Notes Modal */}
            {viewNotesOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-md rounded-2xl shadow-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <FiAlertCircle className="text-blue-500 text-2xl" />
                            <h3 className="text-lg font-bold dark:text-white">Technician Notes</h3>
                        </div>
                        <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap max-h-60 overflow-y-auto">
                            {viewNotesOrder.technicianNotes}
                        </div>
                        <button
                            onClick={() => setViewNotesOrder(null)}
                            className="mt-6 w-full py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-bold transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
