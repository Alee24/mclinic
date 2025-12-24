'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { FiPlus, FiEdit2, FiTrash2, FiCheckCircle, FiClock, FiAlertTriangle, FiEye } from 'react-icons/fi';

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<any>(null);

    // Invoice Form Data
    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        dueDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        items: [{ description: 'Consultation Fee', quantity: 1, unitPrice: 1500 }]
    });

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
        setFormData({
            ...formData,
            items: [...formData.items, { description: '', quantity: 1, unitPrice: 0 }]
        });
    };

    const handleRemoveItem = (idx: number) => {
        const newItems = formData.items.filter((_, i) => i !== idx);
        setFormData({ ...formData, items: newItems });
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems: any = [...formData.items];
        newItems[index][field] = value;
        setFormData({ ...formData, items: newItems });
    };

    const resetForm = () => {
        setFormData({
            customerName: '',
            customerEmail: '',
            dueDate: new Date().toISOString().split('T')[0],
            status: 'pending',
            items: [{ description: 'Consultation Fee', quantity: 1, unitPrice: 1500 }]
        });
        setEditingInvoice(null);
    };

    const handleOpenEdit = (inv: any) => {
        setEditingInvoice(inv);
        setFormData({
            customerName: inv.customerName,
            customerEmail: inv.customerEmail,
            dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : '',
            status: inv.status,
            items: inv.items.map((it: any) => ({
                description: it.description,
                quantity: it.quantity,
                unitPrice: it.unitPrice
            }))
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let res;
            if (editingInvoice) {
                res = await api.patch(`/financial/invoices/${editingInvoice.id}`, formData);
            } else {
                res = await api.post('/financial/invoices', formData);
            }

            if (res && res.ok) {
                alert(editingInvoice ? 'Invoice Updated!' : 'Invoice Created!');
                setShowModal(false);
                resetForm();
                fetchInvoices();
            } else {
                alert('Action failed');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this invoice?')) return;
        try {
            const res = await api.delete(`/financial/invoices/${id}`);
            if (res && res.ok) {
                fetchInvoices();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            const res = await api.patch(`/financial/invoices/${id}`, { status });
            if (res && res.ok) {
                fetchInvoices();
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Financial Invoices</h1>
                    <p className="text-sm text-gray-500">Manage billings, payments and overdue records.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="bg-primary text-black font-bold px-4 py-2 rounded-lg hover:opacity-90 transition flex items-center gap-2"
                >
                    <FiPlus /> New Invoice
                </button>
            </div>

            <div className="bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-500 font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Invoice #</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Due Date</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">Fetching invoices...</td></tr>
                        ) : invoices.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No invoices found. Create one to begin.</td></tr>
                        ) : (
                            invoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                                    <td className="px-6 py-4 font-mono text-sm font-bold text-brand-blue dark:text-blue-400">{inv.invoiceNumber}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="font-semibold text-gray-900 dark:text-white">{inv.customerName}</div>
                                        <div className="text-gray-500">{inv.customerEmail}</div>
                                    </td>
                                    <td className="px-6 py-4 font-bold dark:text-white">KES {Number(inv.totalAmount).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase w-fit flex items-center gap-1.5 ${inv.status === 'paid' ? 'bg-green-100 text-green-700 border border-green-200' :
                                                inv.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                                    inv.status === 'overdue' ? 'bg-red-100 text-red-700 border border-red-200' :
                                                        'bg-gray-100 text-gray-700 border border-gray-200'
                                                }`}>
                                                {inv.status === 'paid' && <FiCheckCircle />}
                                                {inv.status === 'pending' && <FiClock />}
                                                {inv.status === 'overdue' && <FiAlertTriangle />}
                                                {inv.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            <select
                                                className="text-[10px] bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded px-1 min-w-[80px]"
                                                value={inv.status}
                                                onChange={(e) => handleUpdateStatus(inv.id, e.target.value)}
                                            >
                                                <option value="pending">Mark Pending</option>
                                                <option value="paid">Mark Paid</option>
                                                <option value="overdue">Mark Overdue</option>
                                                <option value="cancelled">Cancel</option>
                                            </select>
                                            <button onClick={() => handleOpenEdit(inv)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition" title="Edit">
                                                <FiEdit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(inv.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition" title="Delete">
                                                <FiTrash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Invoice Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-3xl rounded-2xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-800">
                        <div className="flex justify-between items-center mb-8 border-b border-gray-50 dark:border-gray-800 pb-4">
                            <div>
                                <h2 className="text-xl font-bold dark:text-white">{editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}</h2>
                                <p className="text-xs text-gray-500 mt-1">Fill in details for {editingInvoice ? editingInvoice.invoiceNumber : 'a new guest billing'}.</p>
                            </div>
                            <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-400 hover:text-black dark:hover:text-white transition">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5 ml-1">Customer Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Full Name"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition"
                                        value={formData.customerName}
                                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5 ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="email@example.com"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition"
                                        value={formData.customerEmail}
                                        onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5 ml-1">Due Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition"
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5 ml-1">Initial Status</label>
                                    <select
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition appearance-none"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                        <option value="overdue">Overdue</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-4 border-l-4 border-primary pl-3">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Billable Items</h3>
                                    <button type="button" onClick={handleAddItem} className="text-xs bg-primary/10 text-primary-dark font-bold px-3 py-1.5 rounded-lg hover:bg-primary/20 transition">+ Add Item</button>
                                </div>
                                <div className="space-y-4">
                                    {formData.items.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 items-end animate-in fade-in slide-in-from-top-2">
                                            <div className="flex-1">
                                                <label className="text-[10px] font-bold text-gray-400 mb-1 block ml-1">Description</label>
                                                <input
                                                    placeholder="Item or Service"
                                                    required
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white text-sm outline-none"
                                                    value={item.description}
                                                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                                                />
                                            </div>
                                            <div className="w-24">
                                                <label className="text-[10px] font-bold text-gray-400 mb-1 block ml-1">Qty</label>
                                                <input
                                                    type="number"
                                                    required
                                                    min="1"
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white text-sm outline-none"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value))}
                                                />
                                            </div>
                                            <div className="w-32">
                                                <label className="text-[10px] font-bold text-gray-400 mb-1 block ml-1">Unit Price</label>
                                                <input
                                                    type="number"
                                                    required
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white text-sm outline-none"
                                                    value={item.unitPrice}
                                                    onChange={(e) => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value))}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(idx)}
                                                disabled={formData.items.length === 1}
                                                className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <FiTrash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-black/40 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                                <div className="flex justify-between items-center text-lg">
                                    <span className="font-medium text-gray-500">Estimated Total:</span>
                                    <span className="font-black text-2xl dark:text-white">
                                        KES {formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-6 flex justify-end gap-3 border-t border-gray-50 dark:border-gray-800">
                                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="px-6 py-3 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition">Discard</button>
                                <button type="submit" className="px-10 py-3 bg-primary text-black font-black rounded-xl hover:opacity-90 shadow-lg shadow-primary/20 transition transform active:scale-95">
                                    {editingInvoice ? 'Save Changes' : 'Generate & Send'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
