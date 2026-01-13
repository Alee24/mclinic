'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FiFileText, FiActivity, FiClock, FiCheckCircle, FiDownload, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper to load image for PDF
const getDataUrl = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = url;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = reject;
    });
};

export default function PatientLabResultsPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewNotesOrder, setViewNotesOrder] = useState<any>(null);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/laboratory/orders');
            if (res && res.ok) {
                setOrders(await res.json());
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to load lab results');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleDownloadReport = async (order: any) => {
        // 1. Prefer Uploaded Report by Technician
        if (order.report_url) {
            const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3434'}/uploads/reports/${order.report_url}`;
            window.open(url, '_blank');
            return;
        }

        // 2. Fallback: Generate PDF on Client
        generateLabReport(order);
    };

    const generateLabReport = async (order: any) => {
        const toastId = toast.loading('Generating Lab Report...');
        try {
            const doc = new jsPDF();

            // --- Assets ---
            const logoData = await getDataUrl('/logo.png').catch(() => null);

            // --- Header ---
            if (logoData) {
                doc.addImage(logoData, 'PNG', 150, 10, 40, 15);
            } else {
                doc.setFontSize(20);
                doc.setTextColor(41, 128, 185);
                doc.text('M-Clinic', 150, 20, { align: 'right' });
            }

            doc.setFontSize(16);
            doc.setTextColor(0);
            doc.setFont('helvetica', 'bold');
            doc.text('LABORATORY REPORT', 20, 20);

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100);
            doc.text('M-Clinic Diagnostic Centre', 20, 26);
            doc.text('Nairobi, Kenya', 20, 31);
            doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 20, 36);

            doc.setDrawColor(200);
            doc.setLineWidth(0.5);
            doc.line(20, 45, 190, 45);

            // --- Patient & Order Info ---
            doc.setFontSize(10);
            doc.setTextColor(0);

            // Patient (Left)
            doc.setFont('helvetica', 'bold');
            doc.text('PATIENT INFO', 20, 55);
            doc.setFont('helvetica', 'normal');
            doc.text(`Name: ${order.patient?.fname} ${order.patient?.lname}`, 20, 62);
            doc.text(`Email: ${order.patient?.email}`, 20, 68);
            // doc.text(`Gender: ${order.patient?.sex || 'N/A'}`, 20, 74);

            // Order (Right)
            doc.setFont('helvetica', 'bold');
            doc.text('TEST DETAILS', 120, 55);
            doc.setFont('helvetica', 'normal');
            doc.text(`Test Name: ${order.test?.name}`, 120, 62);
            doc.text(`Order ID: #${order.id.split('-')[0]}`, 120, 68);
            doc.text(`Sample Date: ${new Date(order.createdAt).toLocaleDateString()}`, 120, 74);

            // --- Results Table ---
            const tableColumn = ["Parameter", "Result", "Unit", "Ref. Range", "Analysis"];
            const tableRows = order.results.map((res: any) => [
                res.parameter_name,
                res.value,
                res.unit || '-',
                res.reference_range || '-',
                res.is_abnormal ? 'ABNORMAL' : 'Normal'
            ]);

            autoTable(doc, {
                startY: 85,
                head: [tableColumn],
                body: tableRows,
                theme: 'grid',
                headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 10, fontStyle: 'bold' },
                styles: { fontSize: 10, cellPadding: 4, textColor: 50 },
                columnStyles: {
                    4: { fontStyle: 'bold', textColor: [100, 100, 100] } // Default Status Color
                },
                didParseCell: function (data) {
                    if (data.section === 'body' && data.column.index === 4) {
                        if (data.cell.raw === 'ABNORMAL') {
                            data.cell.styles.textColor = [220, 53, 69]; // Red
                        } else {
                            data.cell.styles.textColor = [40, 167, 69]; // Green
                        }
                    }
                }
            });

            // --- Footer / Signatures ---
            // @ts-ignore
            let finalY = doc.lastAutoTable.finalY + 20;

            if (finalY > 250) {
                doc.addPage();
                finalY = 20;
            }

            doc.setFontSize(9);
            doc.setTextColor(150);
            doc.text('This is a computer generated report and does not require a physical signature.', 105, 280, { align: 'center' });

            doc.save(`LabReport_${order.id.split('-')[0]}.pdf`);
            toast.success('Report downloaded', { id: toastId });

        } catch (err) {
            console.error(err);
            toast.error('Failed to generate PDF', { id: toastId });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'sample_received': return 'bg-blue-100 text-blue-700';
            case 'processing': return 'bg-purple-100 text-purple-700';
            case 'completed': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-500';
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Lab Results</h1>
                <p className="text-gray-500">View your laboratory test history and reports</p>
            </div>

            {loading ? (
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-[#121212] rounded-xl border border-dashed border-gray-300">
                    {/* @ts-ignore */}
                    <FiActivity className="mx-auto text-4xl text-gray-300 mb-4" />
                    <p className="text-gray-500">No lab tests found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white dark:bg-[#121212] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-full ${order.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                        {order.status === 'completed' ? <FiCheckCircle size={24} /> : <FiClock size={24} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-lg dark:text-white">{order.test?.name}</h3>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusColor(order.status)}`}>
                                                {order.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-2">
                                            Ordered on {new Date(order.createdAt).toLocaleDateString()}
                                        </p>

                                        {/* Results Preview for Completed */}
                                        {order.status === 'completed' && order.results && order.results.length > 0 && (
                                            <div className="mt-3 bg-gray-50 dark:bg-white/5 p-3 rounded-lg text-sm">
                                                <div className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Results:</div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                                                    {order.results.map((res: any) => (
                                                        <div key={res.id} className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-1">
                                                            <span className="text-gray-500">{res.parameter_name}</span>
                                                            <span className="font-bold dark:text-gray-200">
                                                                {res.value} <span className="text-xs font-normal text-gray-400">{res.unit}</span>
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 min-w-[140px]">
                                    {order.status === 'completed' ? (
                                        <>
                                            <button
                                                onClick={() => handleDownloadReport(order)}
                                                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm"
                                            >
                                                <FiDownload /> {order.report_url ? 'Download Report' : 'Generate Report'}
                                            </button>
                                            {order.technicianNotes && (
                                                <button
                                                    onClick={() => setViewNotesOrder(order)}
                                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition font-medium text-sm"
                                                >
                                                    <FiEye /> View Comments
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center text-xs text-gray-400 italic">
                                            Results pending...
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* View Notes Modal */}
            {viewNotesOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-md rounded-2xl shadow-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            {/* @ts-ignore */}
                            <FiActivity className="text-blue-500 text-2xl" />
                            <h3 className="text-lg font-bold dark:text-white">Technician Comments</h3>
                        </div>
                        <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap max-h-60 overflow-y-auto">
                            {viewNotesOrder.technicianNotes}
                        </div>
                        <button
                            onClick={() => setViewNotesOrder(null)}
                            className="mt-6 w-full py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-bold transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
