'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { FiCheck, FiClock, FiX } from 'react-icons/fi';

interface Invoice {
    id: number;
    invoiceNumber: string;
    customerName: string;
    customerEmail: string;
    totalAmount: number;
    status: string;
    dueDate: string;
    createdAt: string;
}

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [paymentMethod, setPaymentMethod] = useState('MPESA');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [processing, setProcessing] = useState(false);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const res = await api.get('/financial/invoices');
            if (res?.ok) {
                setInvoices(await res.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedInvoice) return;

        setProcessing(true);
        try {
            if (paymentMethod === 'MPESA') {
                // Initiate M-Pesa STK Push
                const res = await api.post('/financial/mpesa/stk-push', {
                    phoneNumber,
                    amount: selectedInvoice.totalAmount,
                    invoiceId: selectedInvoice.id
                });

                if (res?.ok) {
                    const data = await res.json();
                    alert(data.message + ' Payment will be confirmed automatically.');
                    setShowPaymentModal(false);
                    // Poll for status update
                    setTimeout(() => fetchInvoices(), 6000);
                }
            } else {
                // Manual payment confirmation
                const res = await api.post(`/financial/invoices/${selectedInvoice.id}/confirm-payment`, {
                    paymentMethod,
                    transactionId: `MAN-${Date.now()}`
                });

                if (res?.ok) {
                    alert('Payment confirmed successfully!');
                    setShowPaymentModal(false);
                    fetchInvoices();
                }
            }
        } catch (err) {
            console.error(err);
            alert('Payment failed');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold dark:text-white">Invoices & Payments</h1>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        Paid: {invoices.filter(i => i.status === 'paid').length}
                    </span>
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                        Pending: {invoices.filter(i => i.status === 'pending').length}
                    </span>
                </div>
            </div>

            <div className="bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">Invoice #</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Amount (KES)</th>
                            <th className="px-6 py-4">Due Date</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-4 text-center">Loading...</td></tr>
                        ) : invoices.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">No invoices found</td></tr>
                        ) : (
                            invoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-mono text-sm font-medium dark:text-white">
                                        {invoice.invoiceNumber}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium dark:text-white">{invoice.customerName}</div>
                                        <div className="text-xs text-gray-500">{invoice.customerEmail}</div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                        {invoice.totalAmount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                        {new Date(invoice.dueDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase flex items-center gap-1 w-fit ${invoice.status === 'paid'
                                                ? 'bg-green-100 text-green-700'
                                                : invoice.status === 'pending'
                                                    ? 'bg-orange-100 text-orange-700'
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {invoice.status === 'paid' ? <FiCheck /> : <FiClock />}
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {invoice.status === 'pending' && (
                                            <button
                                                onClick={() => {
                                                    setSelectedInvoice(invoice);
                                                    setShowPaymentModal(true);
                                                }}
                                                className="bg-primary text-black font-bold px-4 py-2 rounded-lg hover:opacity-90 transition text-sm"
                                            >
                                                Pay Now
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showPaymentModal && selectedInvoice && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-md rounded-xl shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold dark:text-white">Process Payment</h2>
                            <button onClick={() => setShowPaymentModal(false)} className="text-gray-500 hover:text-black dark:hover:text-white">
                                <FiX size={24} />
                            </button>
                        </div>

                        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="text-sm text-gray-500 mb-1">Invoice</div>
                            <div className="font-mono font-bold dark:text-white">{selectedInvoice.invoiceNumber}</div>
                            <div className="text-sm text-gray-500 mt-2">Amount Due</div>
                            <div className="text-2xl font-bold text-primary">KES {selectedInvoice.totalAmount.toLocaleString()}</div>
                        </div>

                        <form onSubmit={handlePayment} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Payment Method</label>
                                <select
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black dark:text-white"
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                >
                                    <option value="MPESA">M-Pesa (STK Push)</option>
                                    <option value="CASH">Cash</option>
                                    <option value="VISA">Card/Visa</option>
                                    <option value="PAYPAL">PayPal</option>
                                </select>
                            </div>

                            {paymentMethod === 'MPESA' && (
                                <div>
                                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">Phone Number</label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="254712345678"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black dark:text-white"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Enter phone number in format: 254XXXXXXXXX</p>
                                </div>
                            )}

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowPaymentModal(false)}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2 bg-primary text-black font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
                                >
                                    {processing ? 'Processing...' : paymentMethod === 'MPESA' ? 'Send STK Push' : 'Confirm Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
