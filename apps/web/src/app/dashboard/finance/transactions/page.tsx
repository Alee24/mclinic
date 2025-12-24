'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTx = async () => {
            try {
                const res = await api.get('/financial/transactions');
                if (res && res.ok) {
                    setTransactions(await res.json());
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTx();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold dark:text-white">Transaction History</h1>

            <div className="bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">Reference</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Provider</th>
                            <th className="px-6 py-4">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-4 text-center">Loading...</td></tr>
                        ) : transactions.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No transactions found</td></tr>
                        ) : (
                            transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-mono text-sm dark:text-gray-300">{tx.reference}</td>
                                    <td className="px-6 py-4 font-medium dark:text-white">{tx.currency || 'KES'} {tx.amount}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${(tx.status === 'completed' || tx.status === 'SUCCESS') ? 'bg-green-100 text-green-700' :
                                                tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                            }`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 uppercase text-xs font-bold text-gray-500">{tx.source || tx.type}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
