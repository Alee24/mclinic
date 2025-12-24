'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth, UserRole } from '@/lib/auth';
import { FiDollarSign, FiTrendingUp, FiDownload, FiCreditCard } from 'react-icons/fi';

export default function TransactionsPage() {
    const { user } = useAuth();
    const isDoctor = user?.role === UserRole.DOCTOR;
    const [stats, setStats] = useState<any>(null);
    const [doctorBalance, setDoctorBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [showWithdraw, setShowWithdraw] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                if (isDoctor) {
                    // Find my doctor profile to get balance
                    const res = await api.get('/doctors/map');
                    if (res && res.ok) {
                        const docs = await res.json();
                        const me = docs.find((d: any) => d.email === user?.email);
                        if (me) setDoctorBalance(Number(me.balance));
                    }
                } else {
                    // Admin Stats
                    const res = await api.get('/financial/stats');
                    if (res && res.ok) {
                        setStats(await res.json());
                    }
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [user, isDoctor]);

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(withdrawAmount);
        if (!amount || amount <= 0 || amount > doctorBalance) {
            alert('Invalid amount');
            return;
        }

        if (!confirm(`Withdrawing KES ${amount}. Confirm?`)) return;

        try {
            const res = await api.post('/financial/withdraw', { amount });
            if (res && res.ok) {
                const data = await res.json();
                setDoctorBalance(Number(data.newBalance));
                setShowWithdraw(false);
                setWithdrawAmount('');
                alert('Withdrawal successful!');
            } else {
                alert('Withdrawal failed.');
            }
        } catch (err) {
            console.error(err);
            alert('Error processing withdrawal.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">{isDoctor ? 'My Earnings' : 'Financial Transactions'}</h1>
                    <p className="text-gray-500 text-sm">
                        {isDoctor ? 'Track your consultation fees and payouts.' : 'Overview of clinic revenue and expenses.'}
                    </p>
                </div>
                {!isDoctor && (
                    <button className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                        <FiDownload /> Export Report
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isDoctor ? (
                    <>
                        <div className="bg-gradient-to-br from-primary to-green-600 p-6 rounded-xl shadow-lg text-black">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-black/70 text-sm font-bold uppercase">Wallet Balance</span>
                                <div className="p-2 bg-black/10 rounded-lg text-black"><FiDollarSign /></div>
                            </div>
                            <div className="text-3xl font-black mb-4">KES {doctorBalance.toLocaleString()}</div>
                            <button
                                onClick={() => setShowWithdraw(true)}
                                className="w-full py-2 bg-black/20 hover:bg-black/30 text-xs font-bold uppercase tracking-widest rounded-lg transition"
                            >
                                Withdraw Funds
                            </button>
                        </div>
                        <div className="bg-white dark:bg-[#121212] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm opacity-60">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-gray-500 text-sm font-medium">Pending Clearance</span>
                                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg"><FiTrendingUp /></div>
                            </div>
                            <div className="text-2xl font-bold dark:text-white">KES 0.00</div>
                            <div className="text-xs text-gray-400 mt-2">Funds available after 24hrs</div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="bg-white dark:bg-[#121212] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-gray-500 text-sm font-medium">Gross Revenue</span>
                                <div className="p-2 bg-green-100 text-green-600 rounded-lg"><FiDollarSign /></div>
                            </div>
                            <div className="text-3xl font-bold dark:text-white">KES {stats?.totalRevenue?.toLocaleString() || '0.00'}</div>
                            <div className="text-xs text-green-500 flex items-center gap-1 mt-2">
                                <FiTrendingUp /> Total in-flow
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#121212] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-gray-500 text-sm font-medium">Net Revenue (40%)</span>
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FiDollarSign /></div>
                            </div>
                            <div className="text-3xl font-bold dark:text-white">KES {stats?.netRevenue?.toLocaleString() || '0.00'}</div>
                            <div className="text-xs text-blue-500 mt-2">
                                Company Commission
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#121212] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-gray-500 text-sm font-medium">Pending Invoices</span>
                                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><FiCreditCard /></div>
                            </div>
                            <div className="text-3xl font-bold dark:text-white">{stats?.invoices?.pending || 0}</div>
                            <div className="text-xs text-gray-400 mt-2">
                                Unpaid bills
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Withdraw Modal */}
            {showWithdraw && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                        <h3 className="text-lg font-bold mb-4 dark:text-white">Withdraw Funds</h3>
                        <form onSubmit={handleWithdraw}>
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Amount (KES)</label>
                                <input
                                    type="number"
                                    required
                                    min="100"
                                    max={doctorBalance}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black text-xl font-bold focus:ring-2 focus:ring-primary outline-none"
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    placeholder="0"
                                />
                                <div className="text-xs text-gray-400 mt-2 text-right">Max: KES {doctorBalance}</div>
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowWithdraw(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-primary text-black font-bold rounded-xl shadow-lg">Confirm</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-gray-800 p-8">
                <h3 className="font-bold text-lg mb-4 dark:text-white">Transaction History</h3>
                {stats?.recentTransactions?.length > 0 ? (
                    <div className="space-y-4">
                        {stats.recentTransactions.map((tx: any) => (
                            <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg ${tx.source === 'WITHDRAWAL' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                        <FiDollarSign />
                                    </div>
                                    <div>
                                        <div className="font-bold dark:text-white">{tx.source}</div>
                                        <div className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div className={`font-bold ${tx.source === 'WITHDRAWAL' ? 'text-red-600' : 'text-green-600'}`}>
                                    {tx.source === 'WITHDRAWAL' ? '-' : '+'} KES {Number(tx.amount).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-8">No recent transactions found.</div>
                )}
            </div>
        </div>
    );
}
