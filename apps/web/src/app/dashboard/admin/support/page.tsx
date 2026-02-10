'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../../layout';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FiMail, FiPhone, FiCheck, FiX, FiMessageSquare, FiUser, FiSend } from 'react-icons/fi';

export default function AdminSupportPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [responses, setResponses] = useState<{ [key: string]: string }>({});
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

    const handleStatusUpdate = async (id: string, status: string, response?: string) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/support/${id}`,
                { status, response },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(response ? 'Response sent and status updated' : 'Status updated');

            // Clear response state for this ID
            setResponses(prev => {
                const updated = { ...prev };
                delete updated[id];
                return updated;
            });

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
                                    <h3 className="font-medium text-gray-900 dark:text-white flex flex-wrap items-center gap-2">
                                        {req.name && <span className="flex items-center gap-1 font-bold"><FiUser className="w-4 h-4 text-blue-500" /> {req.name}</span>}
                                        {req.email && <span className="flex items-center gap-1 opacity-70"><FiMail className="w-3.5 h-3.5" /> {req.email}</span>}
                                        {req.mobile && <span className="flex items-center gap-1 opacity-70"><FiPhone className="w-3.5 h-3.5" /> {req.mobile}</span>}
                                    </h3>
                                </div>
                                <div className="flex gap-2">
                                    {req.status === 'OPEN' && (
                                        <>
                                            <button
                                                onClick={() => handleStatusUpdate(req.id, 'RESOLVED', responses[req.id])}
                                                className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 flex items-center gap-1.5 transition shadow-sm"
                                                title="Resolve with SMS"
                                            >
                                                <FiCheck className="w-4 h-4" /> Resolve {req.mobile ? '& SMS' : ''}
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(req.id, 'DISMISSED')}
                                                className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                                                title="Dismiss"
                                            >
                                                <FiX className="w-5 h-5" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl mb-4 border border-gray-100 dark:border-gray-600">
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap flex gap-3 leading-relaxed">
                                    <FiMessageSquare className="w-5 h-5 mt-0.5 text-gray-400 flex-shrink-0" />
                                    {req.message}
                                </p>
                            </div>

                            {req.status === 'OPEN' && (
                                <div className="mt-4 space-y-3 animation-in fade-in slide-in-from-top-2">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
                                        <FiSend /> Admin Response {req.mobile && <span className="text-green-500">(Sent via SMS)</span>}
                                    </div>
                                    <textarea
                                        className="w-full p-4 rounded-xl bg-white dark:bg-black border-2 border-gray-100 dark:border-gray-700 focus:border-blue-500 dark:text-white outline-none transition text-sm min-h-[100px]"
                                        placeholder="Type your response here. If you click 'Resolve', this will be sent to the user..."
                                        value={responses[req.id] || ''}
                                        onChange={(e) => setResponses({ ...responses, [req.id]: e.target.value })}
                                    />
                                </div>
                            )}

                            {req.adminResponse && (
                                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                    <div className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Admin Response</div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{req.adminResponse}"</p>
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
