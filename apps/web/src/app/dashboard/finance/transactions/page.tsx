'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth, UserRole } from '@/lib/auth';
import { FiDollarSign, FiTrendingUp, FiDownload, FiCreditCard, FiActivity, FiPieChart } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend } from 'recharts';

export default function TransactionsPage() {
    const { user } = useAuth();
    const isDoctor = user?.role === UserRole.MEDIC || user?.role === UserRole.DOCTOR || user?.role === UserRole.NURSE || user?.role === UserRole.CLINICIAN;
    const [stats, setStats] = useState<any>(null);
    const [doctorBalance, setDoctorBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawMethod, setWithdrawMethod] = useState<'MPESA' | 'BTC'>('MPESA');
    const [withdrawDetails, setWithdrawDetails] = useState('');
    const [showWithdraw, setShowWithdraw] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await api.get('/financial/stats');
                if (res && res.ok) {
                    const data = await res.json();
                    if (isDoctor) {
                        const val = Number(data.balance);
                        setDoctorBalance(isNaN(val) ? 0 : val);
                        setStats(data);
                    } else {
                        setStats(data);
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

    const handleExport = async () => {
        try {
            const res = await api.get('/financial/revenue');
            if (res && res.ok) {
                const data = await res.json();

                // Convert to CSV
                const headers = ['Date', 'Invoice #', 'Status', 'Type', 'Service', 'Amount', 'Doctor', 'Patient', 'Insurance', 'Payment Method', 'Commission'];
                const csvRows = [headers.join(',')];

                for (const row of data) {
                    const values = [
                        new Date(row.date).toLocaleDateString(),
                        row.invoiceNumber,
                        row.status,
                        row.type,
                        `"${(row.serviceDetails || '').replace(/"/g, '""')}"`, // Escape quotes
                        row.amount,
                        `"${(row.doctor || '').replace(/"/g, '""')}"`,
                        `"${(row.patient || '').replace(/"/g, '""')}"`,
                        `"${(row.insurance || '').replace(/"/g, '""')}"`,
                        row.paymentMethod,
                        row.commission
                    ];
                    csvRows.push(values.join(','));
                }

                const csvContent = csvRows.join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `revenue-report-${new Date().toISOString().slice(0, 10)}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            } else {
                alert('Failed to fetch report data.');
            }
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed.');
        }
    };

    const handleViewReceipt = async (invoiceId: number) => {
        // Since getReceipt expects transactionId, but we might have invoiceID here.
        // Wait, the API I verified uses transactionId.
        // But the recent transactions in stats usually have transactionId.
        // Let's assume for now we use the ID available.
        // If it's from the stats.recentTransactions, it has 'id' which is transaction id.
        if (!invoiceId) return;

        // Open receipt in new window (simple text/html dump for now or call API)
        try {
            // Check if we can get the receipt by transaction ID (which this ID likely is for the list below)
            const res = await api.get(`/financial/receipt/${invoiceId}`);
            if (res && res.ok) {
                const data = await res.json();
                const win = window.open('', '_blank');
                if (win) {
                    win.document.write(data.html);
                    win.document.close();
                }
            } else {
                alert('Receipt not found (possibly pending payment).');
            }
        } catch (e) {
            console.error(e);
            alert('Error loading receipt');
        }
    };

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        if (!withdrawDetails) {
            alert(`Please enter your ${withdrawMethod === 'MPESA' ? 'M-Pesa phone number' : 'Bitcoin wallet address'}`);
            return;
        }

        try {
            const res = await api.post('/financial/withdraw', {
                amount: parseFloat(withdrawAmount),
                method: withdrawMethod,
                details: withdrawDetails
            });

            if (res && res.ok) {
                alert('Withdrawal request submitted successfully!');
                setShowWithdraw(false);
                setWithdrawAmount('');
                setWithdrawDetails('');
                // Refresh balance
                const statsRes = await api.get('/financial/stats');
                if (statsRes && statsRes.ok) {
                    const data = await statsRes.json();
                    setDoctorBalance(Number(data.balance) || 0);
                }
            } else {
                const error = await res?.json();
                alert(error?.message || 'Withdrawal failed');
            }
        } catch (error) {
            console.error('Withdrawal error:', error);
            alert('Withdrawal request failed');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">{isDoctor ? 'My Wallet & Earnings' : 'Financial Transactions'}</h1>
                    <p className="text-gray-500 text-sm">
                        {isDoctor ? 'Track your consultation fees and payouts.' : 'Overview of clinic revenue and expenses.'}
                    </p>
                </div>
                {!isDoctor && (
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                        <FiDownload /> Export Report
                    </button>
                )}
            </div>

            {/* Charts Section */}
            {!isDoctor && stats?.dailyRevenue && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue Trend */}
                    <div className="bg-white dark:bg-[#121212] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold dark:text-white flex items-center gap-2">
                                <FiActivity className="text-primary" /> Revenue Trend (7 Days)
                            </h3>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.dailyRevenue}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} opacity={0.1} />
                                    <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#22c55e' }}
                                    />
                                    <Area type="monotone" dataKey="amount" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Revenue Breakdown */}
                    <div className="bg-white dark:bg-[#121212] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold dark:text-white flex items-center gap-2">
                                <FiPieChart className="text-blue-500" /> Revenue Source
                            </h3>
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="h-64 w-full md:w-1/2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Pharmacy', value: stats.revenueByDepartment?.pharmacy || 0, color: '#10b981' }, // Green
                                                { name: 'Laboratory', value: stats.revenueByDepartment?.lab || 0, color: '#3b82f6' }, // Blue
                                                { name: 'Services', value: stats.revenueByDepartment?.appointments || 0, color: '#f59e0b' }, // Amber
                                            ]}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            <Cell key="pharmacy" fill="#10b981" />
                                            <Cell key="lab" fill="#3b82f6" />
                                            <Cell key="services" fill="#f59e0b" />
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-full md:w-1/2 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                        <span className="text-sm font-medium dark:text-gray-300">Pharmacy</span>
                                    </div>
                                    <span className="font-bold dark:text-white">KES {stats.revenueByDepartment?.pharmacy?.toLocaleString() || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                        <span className="text-sm font-medium dark:text-gray-300">Laboratory</span>
                                    </div>
                                    <span className="font-bold dark:text-white">KES {stats.revenueByDepartment?.lab?.toLocaleString() || 0}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                        <span className="text-sm font-medium dark:text-gray-300">Appointments</span>
                                    </div>
                                    <span className="font-bold dark:text-white">KES {stats.revenueByDepartment?.appointments?.toLocaleString() || 0}</span>
                                </div>
                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between">
                                    <span className="text-sm font-bold text-gray-500">TOTAL</span>
                                    <span className="font-black dark:text-white">KES {stats.revenueByDepartment?.total?.toLocaleString() || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                            <div className="text-2xl font-bold dark:text-white">KES {stats?.pendingClearance?.toLocaleString() || '0.00'}</div>
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
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                        <h3 className="text-lg font-bold mb-6 dark:text-white flex items-center gap-2">
                            <FiDollarSign /> Withdraw Funds
                        </h3>

                        <form onSubmit={handleWithdraw}>
                            {/* Method Selection */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <button
                                    type="button"
                                    onClick={() => setWithdrawMethod('MPESA')}
                                    className={`p-3 rounded-xl border-2 font-bold text-sm transition-all ${withdrawMethod === 'MPESA'
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : 'border-gray-100 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    M-Pesa
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setWithdrawMethod('BTC')}
                                    className={`p-3 rounded-xl border-2 font-bold text-sm transition-all ${withdrawMethod === 'BTC'
                                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                                        : 'border-gray-100 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    Bitcoin (BTC)
                                </button>
                            </div>

                            <div className="mb-4">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Amount (KES)</label>
                                <input
                                    type="number"
                                    required
                                    min="100"
                                    max={doctorBalance}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black text-2xl font-black focus:ring-2 focus:ring-primary outline-none"
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    placeholder="0"
                                />
                                <div className="text-xs text-gray-400 mt-2 text-right">Max: KES {doctorBalance.toLocaleString()}</div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                    {withdrawMethod === 'MPESA' ? 'M-Pesa Phone Number' : 'BTC Wallet Address'}
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black font-medium focus:ring-2 focus:ring-primary outline-none"
                                    value={withdrawDetails}
                                    onChange={(e) => setWithdrawDetails(e.target.value)}
                                    placeholder={withdrawMethod === 'MPESA' ? 'e.g. 0712345678' : 'e.g. bc1qxy...'}
                                />
                            </div>

                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowWithdraw(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-primary text-black font-bold rounded-xl shadow-lg hover:brightness-110 transition">Confirm</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {!isDoctor && stats?.paymentStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-900/30">
                        <div className="text-xs font-bold uppercase text-green-600 mb-1">M-Pesa</div>
                        <div className="text-xl font-black dark:text-white">KES {stats.paymentStats.mpesa.toLocaleString()}</div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                        <div className="text-xs font-bold uppercase text-blue-600 mb-1">Visa / Card</div>
                        <div className="text-xl font-black dark:text-white">KES {stats.paymentStats.visa.toLocaleString()}</div>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                        <div className="text-xs font-bold uppercase text-indigo-600 mb-1">PayPal</div>
                        <div className="text-xl font-black dark:text-white">KES {stats.paymentStats.paypal.toLocaleString()}</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                        <div className="text-xs font-bold uppercase text-gray-500 mb-1">Cash</div>
                        <div className="text-xl font-black dark:text-white">KES {stats.paymentStats.cash.toLocaleString()}</div>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-gray-800 p-8">
                <h3 className="font-bold text-lg mb-4 dark:text-white">Transaction History</h3>
                {(stats?.recentTransactions?.length > 0 || stats?.transactions?.length > 0) ? (
                    <div className="space-y-4">
                        {(stats.recentTransactions || stats.transactions).map((tx: any) => (
                            <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer" onClick={() => handleViewReceipt(tx.id)}>
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg ${tx.source === 'WITHDRAWAL' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                        <FiDollarSign />
                                    </div>
                                    <div>
                                        <div className="font-bold dark:text-white">{tx.source}</div>
                                        <div className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</div>
                                        <div className="text-tiny text-gray-400">Ref: {tx.reference}</div>
                                    </div>
                                </div>
                                <div className='text-right'>
                                    <div className={`font-bold ${tx.source === 'WITHDRAWAL' ? 'text-red-600' : 'text-green-600'}`}>
                                        {tx.source === 'WITHDRAWAL' ? '-' : '+'} KES {Number(tx.amount).toLocaleString()}
                                    </div>
                                    {tx.source !== 'WITHDRAWAL' && (
                                        <span className="text-xs text-primary underline mt-1 block">View Receipt</span>
                                    )}
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
