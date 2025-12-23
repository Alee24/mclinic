'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Invoice Form Data
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [items, setItems] = useState<{ description: string, quantity: number, unitPrice: number }[]>([
        { description: 'Consultation Fee', quantity: 1, unitPrice: 1500 }
    ]);

    const fetchInvoices = async () => {
        setLoading(true);
        const res = await api.get('/financial/invoices');
        if (res && res.ok) {
            setInvoices(await res.json());
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const handleAddItem = () => {
        setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems: any = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/financial/invoices', {
                customerName,
                customerEmail,
                dueDate: new Date().toISOString(), // Immediate due
                items
            });

            if (res && res.ok) {
                alert('Invoice Created & Sent!');
                setShowModal(false);
                setCustomerName('');
                setCustomerEmail('');
                setItems([{ description: 'Consultation Fee', quantity: 1, unitPrice: 1500 }]);
                fetchInvoices();
            } else {
                alert('Failed to create invoice');
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold dark:text-white">Invoices</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-primary text-black font-bold px-4 py-2 rounded-lg hover:opacity-90 transition"
                >
                    + Create Guest Invoice
                </button>
            </div>

            <div className="bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">Invoice #</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-4 text-center">Loading...</td></tr>
                        ) : invoices.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">No invoices found</td></tr>
                        ) : (
                            invoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-mono text-sm dark:text-gray-300">{inv.invoiceNumber}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium dark:text-white">{inv.customerName}</div>
                                        <div className="text-xs text-gray-500">{inv.customerEmail}</div>
                                    </td>
                                    <td className="px-6 py-4 font-bold dark:text-white">KES {inv.totalAmount}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${inv.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                inv.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                            }`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(inv.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <button className="text-brand-blue hover:underline text-sm font-medium">View</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Invoice Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-2xl rounded-xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold dark:text-white">New Guest Invoice</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-black dark:hover:text-white">✕</button>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Customer Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black dark:text-white"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black dark:text-white"
                                        value={customerEmail}
                                        onChange={(e) => setCustomerEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold uppercase text-gray-500 mb-2">Line Items</h3>
                                <div className="space-y-3">
                                    {items.map((item, idx) => (
                                        <div key={idx} className="flex gap-3">
                                            <input
                                                placeholder="Description"
                                                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black dark:text-white"
                                                value={item.description}
                                                onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                                            />
                                            <input
                                                type="number"
                                                placeholder="Qty"
                                                className="w-20 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black dark:text-white"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value))}
                                            />
                                            <input
                                                type="number"
                                                placeholder="Price"
                                                className="w-32 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black dark:text-white"
                                                value={item.unitPrice}
                                                onChange={(e) => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value))}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <button type="button" onClick={handleAddItem} className="mt-2 text-sm text-brand-blue font-bold">+ Add Item</button>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-primary text-black font-bold rounded-lg hover:opacity-90">Send Invoice</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
