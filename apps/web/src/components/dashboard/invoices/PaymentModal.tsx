'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { FiX } from 'react-icons/fi';

interface PaymentModalProps {
    invoice: any;
    onClose: () => void;
    onSuccess: () => void;
}

export default function PaymentModal({ invoice, onClose, onSuccess }: PaymentModalProps) {
    const [paymentMethod, setPaymentMethod] = useState('MPESA');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [processing, setProcessing] = useState(false);

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        try {
            if (paymentMethod === 'MPESA') {
                const res = await api.post('/financial/mpesa/stk-push', {
                    phoneNumber,
                    amount: invoice.totalAmount,
                    invoiceId: invoice.id
                });
                if (res?.ok) {
                    const data = await res.json();
                    alert(data.message + ' Payment will be confirmed automatically.');
                    onSuccess();
                } else {
                    alert('STK Push failed. Please try again.');
                }
            } else {
                const res = await api.post(`/financial/invoices/${invoice.id}/confirm-payment`, {
                    paymentMethod,
                    transactionId: `MAN-${Date.now()}`
                });
                if (res?.ok) {
                    alert('Payment confirmed successfully!');
                    onSuccess();
                } else {
                    alert('Payment confirmation failed.');
                }
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred during payment.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in zoom-in-95 duration-200">
            <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-md rounded-xl shadow-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold dark:text-white">Process Payment</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-black dark:hover:text-white">
                        <FiX size={24} />
                    </button>
                </div>

                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Invoice</div>
                    <div className="font-mono font-bold dark:text-white">{invoice.invoiceNumber}</div>
                    <div className="text-sm text-gray-500 mt-2">Amount Due</div>
                    <div className="text-2xl font-bold text-green-600">KES {Number(invoice.totalAmount).toLocaleString()}</div>
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
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                        >
                            {processing ? 'Processing...' : paymentMethod === 'MPESA' ? 'Pay Now' : 'Confirm Payment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
