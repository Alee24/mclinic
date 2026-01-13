'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { FiRefreshCw, FiTrash2, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';

interface DeletionRequest {
    id: number;
    email: string;
    reason: string;
    status: string;
    createdAt: string;
}

export default function DataDeletionRequestsPage() {
    const { user } = useAuth();
    const [requests, setRequests] = useState<DeletionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchRequests = async () => {
        try {
            setLoading(true);
            setError('');
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://portal.mclinic.co.ke/api';
            const token = localStorage.getItem('token');

            const res = await fetch(`${API_URL}/legal/data-deletion-requests`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                throw new Error('Failed to fetch requests');
            }

            const data = await res.json();
            setRequests(data);
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                // @ts-ignore
                return <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full flex items-center gap-1"><FiCheckCircle /> Completed</span>;
            case 'rejected':
                // @ts-ignore
                return <span className="px-2 py-1 text-xs font-bold bg-red-100 text-red-700 rounded-full flex items-center gap-1"><FiXCircle /> Rejected</span>;
            default:
                // @ts-ignore
                return <span className="px-2 py-1 text-xs font-bold bg-yellow-100 text-yellow-700 rounded-full flex items-center gap-1"><FiClock /> Pending</span>;
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold dark:text-white">Data Deletion Requests</h1>
                <button
                    onClick={fetchRequests}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                    {/* @ts-ignore */}
                    <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
                    {error}
                </div>
            )}

            <div className="bg-white dark:bg-[#161616] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Reason</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {loading && requests.length === 0 ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-48"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-64"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-16"></div></td>
                                    </tr>
                                ))
                            ) : requests.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            {/* @ts-ignore */}
                                            <FiTrash2 className="text-4xl text-gray-300 mb-2" />
                                            <p>No deletion requests found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                requests.map((request) => (
                                    <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(request.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium dark:text-white">
                                            {request.email}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate" title={request.reason}>
                                            {request.reason || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(request.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button className="text-blue-600 hover:text-blue-700 font-medium">Review</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
