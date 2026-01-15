'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FiPackage, FiSearch, FiCheckCircle, FiClock, FiFilter, FiUser, FiActivity, FiTruck, FiMapPin, FiPhone } from 'react-icons/fi';

export default function AdminPharmacyOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await api.get('/pharmacy/orders');
            if (res?.ok) {
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
        if (!confirm(`Update order status to ${status}?`)) return;

        try {
            const res = await api.patch(`/pharmacy/orders/${id}/status`, { status });
            if (res?.ok) {
                fetchOrders(); // Refresh
            } else {
                alert('Failed to update status.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.user?.fname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.user?.lname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.id.toString().includes(searchQuery) ||
            order.deliveryCity?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
                        <FiPackage /> Pharmacy Orders
                    </h1>
                    <p className="text-gray-500 font-medium tracking-tight">Manage and fulfill patient medication orders.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-[#1A1A1A] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <FiSearch className="absolute left-4 top-3.5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by Patient, Order ID, or City..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                    {['all', 'PAID', 'SHIPPED', 'DELIVERED', 'PENDING'].map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-xl font-bold text-sm capitalize whitespace-nowrap transition-colors ${statusFilter === status
                                ? 'bg-primary text-black'
                                : 'bg-gray-50 dark:bg-white/5 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10'
                                }`}
                        >
                            {status === 'PAID' ? 'Ready to Ship' : status.toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders List */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="text-center py-12 text-gray-400">Loading orders...</div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-[#1A1A1A] rounded-3xl border border-gray-100 dark:border-gray-800">
                        <div className="text-gray-400 mb-2">No orders found matching your criteria.</div>
                    </div>
                ) : (
                    filteredOrders.map((order) => (
                        <div key={order.id} className="bg-white dark:bg-[#1A1A1A] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                            {/* Status Badge */}
                            <div className={`absolute top-0 right-0 px-4 py-2 rounded-bl-2xl text-xs font-bold uppercase tracking-widest ${order.status === 'PENDING' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/20' :
                                order.status === 'PAID' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20' :
                                    order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/20' :
                                        'bg-green-100 text-green-600 dark:bg-green-900/20'
                                }`}>
                                {order.status}
                            </div>

                            <div className="flex flex-col xl:flex-row xl:items-start gap-6">
                                {/* Patient Info & ID */}
                                <div className="w-full xl:w-1/4 pb-4 xl:pb-0 xl:border-r border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg">
                                            <FiUser />
                                        </div>
                                        <div>
                                            <div className="font-bold dark:text-white">{order.user?.fname} {order.user?.lname}</div>
                                            <div className="text-xs text-gray-500 font-mono">ID: {order.id.slice(0, 8)}...</div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-2">
                                        <FiClock /> {new Date(order.createdAt).toLocaleString()}
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                        <FiActivity /> Amount: <span className="font-bold text-gray-700 dark:text-gray-300">KES {Number(order.totalAmount).toLocaleString()}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                        Payment: <span className={`font-bold ${order.paymentStatus === 'COMPLETED' ? 'text-green-500' : 'text-orange-500'}`}>{order.paymentStatus}</span> ({order.paymentMethod})
                                    </div>
                                </div>

                                {/* Items & Delivery */}
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Items */}
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Items</h4>
                                        <div className="space-y-2">
                                            {order.items?.map((item: any, idx: number) => (
                                                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800">
                                                    <div>
                                                        <div className="font-bold text-sm dark:text-gray-200">{item.medicationName || item.medication?.name}</div>
                                                    </div>
                                                    <div className="text-xs font-bold bg-white dark:bg-black px-2 py-1 rounded shadow-sm">
                                                        x{item.quantity}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Delivery Info */}
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Delivery Details</h4>
                                        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 space-y-2 text-sm text-blue-800 dark:text-blue-300">
                                            <div className="flex gap-2 items-start">
                                                <FiMapPin className="mt-0.5 shrink-0" />
                                                <span>{order.deliveryAddress}, {order.deliveryCity}</span>
                                            </div>
                                            <div className="flex gap-2 items-center">
                                                <FiPhone className="shrink-0" />
                                                <span>{order.contactPhone}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="w-full xl:w-1/6 flex flex-col gap-2 xl:border-l border-gray-100 dark:border-gray-800 xl:pl-6">
                                    {order.status === 'PAID' && (
                                        <button
                                            onClick={() => updateStatus(order.id, 'SHIPPED')}
                                            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                                        >
                                            <FiTruck /> Mark Shipped
                                        </button>
                                    )}
                                    {order.status === 'SHIPPED' && (
                                        <button
                                            onClick={() => updateStatus(order.id, 'DELIVERED')}
                                            className="w-full py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-500/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                                        >
                                            <FiCheckCircle /> Complete
                                        </button>
                                    )}
                                    {order.status === 'DELIVERED' && (
                                        <div className="text-center w-full py-2">
                                            <span className="text-green-600 font-bold flex items-center justify-center gap-2"><FiCheckCircle /> Completed</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
