'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth, UserRole } from '@/lib/auth';
import { FiCheck, FiClock, FiX, FiDownload, FiSend, FiMail } from 'react-icons/fi';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

import CreateInvoiceModal from '@/components/dashboard/invoices/CreateInvoiceModal';

export default function InvoicesPage() {
    const { user } = useAuth();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [paymentMethod, setPaymentMethod] = useState('MPESA');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [processing, setProcessing] = useState(false);

    const fetchInvoices = async () => {
        // ... (existing code, keep fetchInvoices logic same)
        setLoading(true);
        try {
            const res = await api.get('/financial/invoices');
            if (res?.ok) {
                let data = await res.json();
                setInvoices(data);
            }
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    useEffect(() => {
        if (user) {
            fetchInvoices();
        }
    }, [user]);

    const generateInvoicePDF = (invoice: Invoice) => {
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(22);
        doc.setTextColor(41, 128, 185);
        doc.setFont("helvetica", "bold");
        doc.text('MCLINIC KENYA', 14, 20);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.setFont("helvetica", "normal");
        doc.text('Medical & Ambulance Services', 14, 26);
        doc.text('P.O Box 12345 - 00100', 14, 31);
        doc.text('Nairobi, Kenya', 14, 36);
        doc.text('Email: info@mclinic.co.ke', 14, 41);
        
        // INVOICE text
        doc.setFontSize(24);
        doc.setTextColor(0);
        doc.setFont("helvetica", "bold");
        doc.text('INVOICE', 140, 20);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 140, 30);
        doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 140, 36);
        doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 140, 42);
        doc.text(`Status: ${invoice.status.toUpperCase()}`, 140, 48);

        // Bill To
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.setFont("helvetica", "bold");
        doc.text('Bill To:', 14, 55);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.setFont("helvetica", "normal");
        doc.text(invoice.customerName || 'Customer', 14, 62);
        doc.text(invoice.customerEmail && invoice.customerEmail !== 'null null' ? invoice.customerEmail : 'N/A', 14, 67);

        // Items table
        // @ts-ignore
        doc.autoTable({
            startY: 80,
            head: [['Description', 'Amount (KES)']],
            body: [
                ['Medical & Clinical Services', invoice.totalAmount.toLocaleString()]
            ],
            theme: 'striped',
            headStyles: { fillColor: [41, 128, 185] },
            styles: { fontSize: 11, cellPadding: 5 }
        });

        // Total
        // @ts-ignore
        const finalY = doc.lastAutoTable.finalY || 80;
        
        doc.setFillColor(245, 245, 245);
        doc.rect(130, finalY + 10, 65, 12, 'F');
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.setFont("helvetica", "bold");
        doc.text(`Total: KES ${invoice.totalAmount.toLocaleString()}`, 135, finalY + 18);
        
        // Footer
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.setFont("helvetica", "italic");
        doc.text('Thank you for choosing Mclinic Kenya!', 105, 280, { align: 'center' });

        doc.save(`${invoice.invoiceNumber}.pdf`);
    };

    const sendInvoice = (invoice: Invoice) => {
        const subject = `Invoice ${invoice.invoiceNumber} from Mclinic Kenya`;
        const body = `Dear ${invoice.customerName},\n\nPlease find the details for your invoice ${invoice.invoiceNumber} below.\n\nTotal Amount: KES ${invoice.totalAmount.toLocaleString()}\nDue Date: ${new Date(invoice.dueDate).toLocaleDateString()}\nStatus: ${invoice.status.toUpperCase()}\n\nPlease login to your Mclinic dashboard to download the official PDF copy or complete the payment.\n\nThank you for choosing Mclinic Kenya.`;
        
        if (invoice.customerEmail && invoice.customerEmail !== 'N/A' && invoice.customerEmail !== 'null null') {
            window.location.href = `mailto:${invoice.customerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        } else {
            alert("Customer email is missing. A draft has been prepared, you can add their contact manually.");
            window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        }
    };

    // ... (keep handlePayment)
    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedInvoice) return;

        setProcessing(true);
        try {
            if (paymentMethod === 'MPESA') {
                const res = await api.post('/financial/mpesa/stk-push', {
                    phoneNumber,
                    amount: selectedInvoice.totalAmount,
                    invoiceId: selectedInvoice.id
                });
                if (res?.ok) {
                    const data = await res.json();
                    alert(data.message + ' Payment will be confirmed automatically.');
                    setShowPaymentModal(false);
                    setTimeout(() => fetchInvoices(), 6000);
                }
            } else {
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
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Invoices & Payments</h1>
                    <p className="text-sm text-gray-500">Manage billing and payments</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex gap-2 mr-4">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            Paid: {invoices.filter(i => i.status === 'paid').length}
                        </span>
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                            Pending: {invoices.filter(i => i.status === 'pending').length}
                        </span>
                    </div>

                    {user?.role === UserRole.ADMIN && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-black dark:bg-white dark:text-black text-white px-4 py-2 rounded-lg font-bold hover:opacity-80 transition"
                        >
                            + Create Invoice
                        </button>
                    )}
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
                                        <div className="flex gap-2 items-center flex-wrap">
                                            {invoice.status === 'pending' && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedInvoice(invoice);
                                                        setShowPaymentModal(true);
                                                    }}
                                                    className="bg-primary text-black font-bold px-3 py-1.5 rounded-lg hover:opacity-90 transition text-xs whitespace-nowrap"
                                                >
                                                    Pay Now
                                                </button>
                                            )}
                                            
                                            <button
                                                onClick={() => generateInvoicePDF(invoice)}
                                                className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold px-3 py-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition text-xs whitespace-nowrap"
                                                title="Download PDF"
                                            >
                                                <FiDownload /> PDF
                                            </button>
                                            
                                            <button
                                                onClick={() => sendInvoice(invoice)}
                                                className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold px-3 py-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition text-xs whitespace-nowrap"
                                                title="Send via Email"
                                            >
                                                <FiSend /> Send
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showCreateModal && (
                <CreateInvoiceModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchInvoices();
                    }}
                />
            )}

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
