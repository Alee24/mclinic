'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FiSearch, FiFilter, FiActivity, FiUser, FiCalendar, FiFileText, FiUpload, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import UploadLabResultModal from '@/components/dashboard/lab/UploadLabResultModal';

export default function AdminLabOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/laboratory/orders'); // Admin endpoint
            if (res?.ok) {
                setOrders(await res.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        if (!confirm('Are you sure you want to update the status?')) return;
        try {
            await api.patch(`/laboratory/orders/${id}/status`, { status });
            fetchOrders();
        } catch (err) {
            console.error(err);
        }
    };

    const filteredOrders = orders.filter(order => filterStatus === 'All' || order.status === filterStatus);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'processing': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white">Lab Orders Management</h1>
                    <p className="text-gray-500">Manage patient test requests and results.</p>
                </div>
                <div className="flex gap-2">
                    <select
                        className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black outline-none focus:ring-2 focus:ring-primary"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-[#161616] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-gray-800">
                        <tr>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase">Order ID</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase">Patient</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase">Test</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {filteredOrders.map(order => (
                            <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <td className="p-4 text-sm font-mono text-gray-400">#{order.id.slice(0, 8)}</td>
                                <td className="p-4">
                                    <div className="font-bold text-gray-900 dark:text-white">
                                        {order.isForSelf ? `${order.patient.fname} ${order.patient.lname}` : order.beneficiaryName}
                                    </div>
                                    {!order.isForSelf && (
                                        <div className="text-xs text-gray-500">
                                            (Via {order.patient.fname}) • {order.beneficiaryRelation}
                                        </div>
                                    )}
                                </td>
                                <td className="p-4">
                                    <div className="font-medium text-gray-900 dark:text-white">{order.test.name}</div>
                                    <div className="text-xs text-gray-500">{order.test.category}</div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-gray-500">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-4 flex items-center gap-2">
                                    {order.status === 'pending' && (
                                        <button
                                            onClick={() => handleStatusUpdate(order.id, 'processing')}
                                            className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400"
                                            title="Mark Sample Received"
                                        >
                                            <FiActivity />
                                        </button>
                                    )}
                                    {order.status !== 'completed' && (
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="p-2 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg text-green-600 dark:text-green-400"
                                            title="Upload Results"
                                        >
                                            <FiUpload />
                                        </button>
                                    )}
                                    {order.status === 'completed' && order.report_url && (
                                        <a
                                            href={`/api/uploads/reports/${order.report_url}`}
                                            target="_blank"
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400"
                                            title="View Report"
                                        >
                                            <FiFileText />
                                        </a>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredOrders.length === 0 && (
                    <div className="p-12 text-center text-gray-500">No orders found.</div>
                )}
            </div>

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
        </div>
    );
}
