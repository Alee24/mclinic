'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../../layout';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FiMail, FiPhone, FiCheck, FiX, FiMessageSquare } from 'react-icons/fi';

export default function AdminSupportPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/support`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(res.data);
        } catch (error) {
            console.error('Failed to fetch requests', error);
            toast.error('Failed to load support requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/support/${id}`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Status updated');
            fetchRequests();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const filteredRequests = requests.filter(r =>
        filter === 'ALL' ? true : r.status === filter
    );

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Support Requests</h1>

            <div className="flex gap-4 mb-6">
                {['ALL', 'OPEN', 'RESOLVED', 'DISMISSED'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f
                                ? 'bg-blue-600 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : (
                <div className="space-y-4">
                    {filteredRequests.map((req) => (
                        <div key={req.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${req.status === 'OPEN' ? 'bg-yellow-100 text-yellow-800' :
                                                req.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                                                    'bg-gray-100 text-gray-800'
                                            }`}>
                                            {req.status}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {new Date(req.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                        {req.email && <span className="flex items-center gap-1"><FiMail className="w-4 h-4" /> {req.email}</span>}
                                        {req.mobile && <span className="flex items-center gap-1 ml-3"><FiPhone className="w-4 h-4" /> {req.mobile}</span>}
                                    </h3>
                                </div>
                                <div className="flex gap-2">
                                    {req.status === 'OPEN' && (
                                        <>
                                            <button
                                                onClick={() => handleStatusUpdate(req.id, 'RESOLVED')}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                                title="Mark as Resolved"
                                            >
                                                <FiCheck className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(req.id, 'DISMISSED')}
                                                className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"
                                                title="Dismiss"
                                            >
                                                <FiX className="w-5 h-5" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-4">
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap flex gap-3">
                                    <FiMessageSquare className="w-5 h-5 mt-0.5 text-gray-400 flex-shrink-0" />
                                    {req.message}
                                </p>
                            </div>

                            {req.adminResponse && (
                                <div className="text-sm text-gray-500 pl-4 border-l-2 border-gray-200">
                                    <span className="font-medium">Note:</span> {req.adminResponse}
                                </div>
                            )}
                        </div>
                    ))}

                    {filteredRequests.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            No requests found.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
