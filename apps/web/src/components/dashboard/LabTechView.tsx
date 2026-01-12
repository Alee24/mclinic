'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FiActivity, FiFileText, FiUpload, FiCheckSquare, FiSearch } from 'react-icons/fi';

export default function LabTechView() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const res = await api.get('/laboratory/orders');
            if (res && res.ok) setOrders(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            await api.patch(`/laboratory/orders/${id}/status`, { status });
            loadOrders();
        } catch (e) {
            console.error(e);
        }
    };

    const handleUploadResults = async (orderId: number) => {
        const result = prompt("Enter Test Results (Text Summary):");
        if (!result) return;

        try {
            // Simplified result entry
            await api.post(`/laboratory/orders/${orderId}/results`, { results: [{ parameter: 'Summary', value: result }] });
            await handleUpdateStatus(orderId, 'COMPLETED');
            alert("Results uploaded successfully!");
        } catch (e) {
            alert("Failed to upload results");
        }
    }

    if (loading) return <div className="p-8 text-center">Loading Laboratory System...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold dark:text-white">Laboratory Dashboard</h1>
                    <p className="text-gray-500">Manage test requests, samples, and results.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Pending Tests" value={orders.filter(o => o.status === 'PENDING').length} icon={<FiActivity />} color="orange" />
                <StatCard label="Samples Collected" value={orders.filter(o => o.status === 'IN_PROGRESS').length} icon={<FiFileText />} color="blue" />
                <StatCard label="Completed Today" value={orders.filter(o => o.status === 'COMPLETED').length} icon={<FiCheckSquare />} color="green" />
            </div>

            <div className="bg-white dark:bg-[#161616] rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-lg dark:text-white">Lab Request Queue</h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {orders.map(order => (
                        <div key={order.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-gray-50 dark:hover:bg-white/5 transition">
                            <div className="flex gap-4">
                                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl h-fit">
                                    <FiActivity className="text-gray-600 dark:text-gray-400 text-xl" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-lg dark:text-white">{order.test?.name || 'Unknown Test'}</h4>
                                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                            order.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                                'bg-orange-100 text-orange-700'
                                            }`}>{order.status}</span>
                                    </div>
                                    <p className="text-sm text-gray-500">Patient: <span className="font-bold text-black dark:text-white">{order.patient?.fname || 'Unknown'} {order.patient?.lname}</span></p>
                                    <p className="text-xs text-gray-400 font-mono mt-1">Order #{order.id} • {new Date(order.orderDate).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {order.status === 'PENDING' && (
                                    <button
                                        onClick={() => handleUpdateStatus(order.id, 'IN_PROGRESS')}
                                        className="px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-lg text-sm hover:bg-blue-100"
                                    >
                                        Collect Sample
                                    </button>
                                )}
                                {(order.status === 'PENDING' || order.status === 'IN_PROGRESS') && (
                                    <button
                                        onClick={() => handleUploadResults(order.id)}
                                        className="px-4 py-2 bg-donezo-dark text-white font-bold rounded-lg text-sm flex items-center gap-2 hover:brightness-110"
                                    >
                                        <FiUpload /> Upload Result
                                    </button>
                                )}
                                {order.status === 'COMPLETED' && (
                                    <button className="px-4 py-2 border border-gray-200 text-gray-500 font-bold rounded-lg text-sm" disabled>
                                        Results Sent
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {orders.length === 0 && (
                        <div className="p-12 text-center text-gray-400 italic">No lab requests found.</div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color }: any) {
    const colors: any = {
        green: 'text-green-600 bg-green-50',
        blue: 'text-blue-600 bg-blue-50',
        orange: 'text-orange-600 bg-orange-50',
    };
    return (
        <div className="bg-white dark:bg-[#161616] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${colors[color]}`}>
                {icon}
            </div>
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
            </div>
        </div>
    );
}
