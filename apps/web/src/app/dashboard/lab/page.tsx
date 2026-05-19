'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { api, getApiBaseUrl } from '@/lib/api';
import { FiSearch, FiFilter, FiActivity, FiShoppingCart, FiClock, FiInfo, FiDownload, FiEye, FiCheckCircle, FiFileText } from 'react-icons/fi';
import BookLabTestModal from '@/components/dashboard/lab/BookLabTestModal';
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

export default function LabTestsPage() {
    const { user } = useAuth();
    const [tests, setTests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    
    // Tab State: 'browse' (catalog) or 'orders' (history)
    const [activeTab, setActiveTab] = useState<'browse' | 'orders'>('browse');

    // Orders History State
    const [orders, setOrders] = useState<any[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [viewNotesOrder, setViewNotesOrder] = useState<any>(null);

    // Booking State
    const [selectedTest, setSelectedTest] = useState<any | null>(null);

    useEffect(() => {
        fetchTests();
        fetchOrders();
    }, []);

    // Get tab from URL if present
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const tabParam = params.get('tab');
            if (tabParam === 'orders') {
                setActiveTab('orders');
            }
        }
    }, []);

    const fetchTests = async () => {
        try {
            const res = await api.get('/laboratory/tests');
            if (res?.ok) {
                const data = await res.json();
                // Sort by price ascending (cheapest to most expensive)
                const sorted = data.sort((a: any, b: any) => Number(a.price) - Number(b.price));
                setTests(sorted);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        setOrdersLoading(true);
        try {
            const res = await api.get('/laboratory/orders');
            if (res && res.ok) {
                setOrders(await res.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setOrdersLoading(false);
        }
    };

    const handleDownloadReport = async (order: any) => {
        // 1. Prefer Uploaded Report by Technician
        if (order.report_url) {
            const url = `${getApiBaseUrl()}/uploads/reports/${order.report_url}`;
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
            const logoData = await getDataUrl('https://mclinic.co.ke/wp-content/uploads/2025/04/M-Clinic-Logo.png').catch(() => null);

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

            // Order (Right)
            doc.setFont('helvetica', 'bold');
            doc.text('TEST DETAILS', 120, 55);
            doc.setFont('helvetica', 'normal');
            doc.text(`Test Name: ${order.test?.name}`, 120, 62);
            doc.text(`Order ID: #${order.id.split('-')[0]}`, 120, 68);
            doc.text(`Sample Date: ${new Date(order.createdAt).toLocaleDateString()}`, 120, 74);

            // --- Results Table ---
            const tableColumn = ["Parameter", "Result", "Unit", "Ref. Range", "Analysis"];
            const tableRows = order.results?.map((res: any) => [
                res.parameter_name,
                res.value,
                res.unit || '-',
                res.reference_range || '-',
                res.is_abnormal ? 'ABNORMAL' : 'Normal'
            ]) || [];

            autoTable(doc, {
                startY: 85,
                head: [tableColumn],
                body: tableRows,
                theme: 'grid',
                headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 10, fontStyle: 'bold' },
                styles: { fontSize: 10, cellPadding: 4, textColor: 50 },
                columnStyles: {
                    4: { fontStyle: 'bold', textColor: [100, 100, 100] }
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

            // --- Footer ---
            // @ts-ignore
            let finalY = doc.lastAutoTable?.finalY || 120;
            finalY += 20;

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
            case 'pending': return 'bg-yellow-100 dark:bg-yellow-950/20 text-yellow-750 dark:text-yellow-405 border-yellow-200';
            case 'sample_received': return 'bg-blue-100 dark:bg-blue-950/20 text-blue-750 dark:text-blue-405 border-blue-200';
            case 'processing': return 'bg-purple-100 dark:bg-purple-950/20 text-purple-750 dark:text-purple-405 border-purple-200';
            case 'completed': return 'bg-green-100 dark:bg-green-950/20 text-green-755 dark:text-green-405 border-green-200';
            default: return 'bg-gray-100 dark:bg-white/5 text-gray-500 border-gray-200';
        }
    };

    const categories = ['All', ...Array.from(new Set(tests.map(t => t.category)))];

    const filteredTests = tests.filter(test => {
        const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            test.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || test.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black dark:text-white flex items-center gap-3">
                        <span className="p-3 bg-[#087c46] rounded-2xl text-white shadow-lg shadow-[#087c46]/20">
                            <FiActivity size={24} />
                        </span>
                        My Laboratory
                    </h1>
                    <p className="text-gray-500 mt-1 ml-16">Browse clinical test packages and track lab results.</p>
                </div>

                {/* Unified Premium Tab bar */}
                <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <button
                        onClick={() => setActiveTab('browse')}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'browse' ? 'bg-white dark:bg-gray-800 shadow-md text-[#087c46] dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        <FiActivity size={16} /> Browse Tests
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'orders' ? 'bg-white dark:bg-gray-800 shadow-md text-[#087c46] dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        <FiClock size={16} /> My Orders
                    </button>
                </div>
            </div>

            {activeTab === 'browse' ? (
                <>
                    {/* Search & Filter Section */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-[#121212] p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="relative w-full sm:max-w-md">
                            <FiSearch className="absolute left-4 top-3.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search clinical tests..."
                                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-black/40 outline-none focus:ring-2 focus:ring-[#087c46]/20 transition-all font-medium text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <FiFilter className="text-gray-400 hidden sm:block" />
                            <select
                                className="w-full sm:w-48 px-4 py-3 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-black/40 outline-none focus:ring-2 focus:ring-[#087c46]/20 transition-all font-bold text-sm cursor-pointer"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Catalog Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-60 bg-gray-100 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-gray-850"></div>
                            ))}
                        </div>
                    ) : filteredTests.length === 0 ? (
                        <div className="text-center py-24 bg-white dark:bg-[#121212] rounded-[32px] border border-dashed border-gray-200 dark:border-gray-800">
                            <FiInfo className="mx-auto text-4xl text-gray-300 mb-4" />
                            <p className="text-gray-500 font-medium">No diagnostic tests found matching your criteria.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredTests.map(test => (
                                <div key={test.id} className="bg-white dark:bg-[#121212] rounded-3xl p-6 border border-gray-100 dark:border-gray-800/80 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-start justify-between mb-5">
                                            <div className="w-12 h-12 rounded-2xl bg-[#087c46]/10 flex items-center justify-center text-[#087c46] dark:text-[#087c46] shadow-sm">
                                                <FiActivity size={22} />
                                            </div>
                                            <span className="bg-gray-100 dark:bg-white/5 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                {test.category}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 group-hover:text-[#087c46] transition-colors">{test.name}</h3>
                                        <p className="text-sm text-gray-550 dark:text-gray-400 font-medium leading-relaxed mb-6 line-clamp-3">{test.description}</p>
                                    </div>

                                    <div className="pt-5 border-t border-gray-50 dark:border-gray-800/60 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] text-gray-450 dark:text-gray-500 uppercase tracking-widest font-black">Price</p>
                                            <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">KES {Number(test.price).toLocaleString()}</p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedTest(test)}
                                            className="bg-[#087c46] hover:bg-[#076b3c] text-white px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md shadow-[#087c46]/10 flex items-center gap-2"
                                        >
                                            Book Now <FiShoppingCart />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                /* My Orders Tab */
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="font-black text-xl dark:text-white">Diagnostic Order History</h2>
                        <button 
                            onClick={fetchOrders}
                            className="text-xs font-bold text-[#087c46] hover:underline flex items-center gap-1.5 bg-[#087c46]/5 dark:bg-[#087c46]/10 px-3 py-2 rounded-xl transition"
                        >
                            Refresh List
                        </button>
                    </div>

                    {ordersLoading ? (
                        <div className="animate-pulse space-y-4">
                            {[1, 2, 3].map(i => <div key={i} className="h-28 bg-gray-150 dark:bg-white/5 rounded-3xl" />)}
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-[#121212] rounded-[32px] border border-dashed border-gray-200 dark:border-gray-800">
                            <FiFileText className="mx-auto text-4xl text-gray-300 mb-4" />
                            <p className="text-gray-505 dark:text-gray-400 font-medium mb-1">No laboratory tests ordered yet.</p>
                            <p className="text-xs text-gray-400">Your booked tests will show up here.</p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {orders.map((order) => (
                                <div key={order.id} className="bg-white dark:bg-[#121212] p-6 rounded-[30px] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition duration-300">
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-50 dark:border-gray-800 pb-4 mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-[#087c46] flex items-center justify-center font-bold text-lg shadow-inner">
                                                <FiActivity />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono tracking-wider">ORDER ID: #{order.id.split('-')[0].toUpperCase()}</p>
                                                <h3 className="font-black text-lg dark:text-white mt-0.5">{order.test?.name}</h3>
                                            </div>
                                        </div>
                                        
                                        <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border self-start sm:self-auto ${getStatusColor(order.status)}`}>
                                            {order.status.replace('_', ' ')}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                                        <div className="md:col-span-2 space-y-4">
                                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500 font-medium">
                                                <span className="flex items-center gap-1.5"><FiClock /> Ordered on {new Date(order.createdAt).toLocaleDateString()}</span>
                                                {order.sample_collection_date && (
                                                    <span className="flex items-center gap-1.5"><FiClock /> Sample Date: {new Date(order.sample_collection_date).toLocaleDateString()}</span>
                                                )}
                                                {!order.isForSelf && (
                                                    <span className="bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400 font-bold">For: {order.beneficiaryName}</span>
                                                )}
                                            </div>

                                            {/* Results block preview */}
                                            {order.status === 'completed' && order.results && order.results.length > 0 && (
                                                <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-2xl text-xs space-y-2.5 border border-gray-100 dark:border-gray-800">
                                                    <p className="font-black text-gray-450 uppercase tracking-widest text-[9px] mb-1">Parameter Analysis Results</p>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                                                        {order.results.map((res: any) => (
                                                            <div key={res.id} className="flex justify-between border-b border-gray-100/60 dark:border-gray-850 pb-1">
                                                                <span className="text-gray-500 font-medium">{res.parameter_name}</span>
                                                                <span className={`font-black ${res.is_abnormal ? 'text-red-500' : 'text-gray-900 dark:text-gray-200'}`}>
                                                                    {res.value} <span className="text-[10px] font-normal text-gray-400 ml-0.5">{res.unit}</span>
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-2.5 min-w-[150px]">
                                            {order.status === 'completed' ? (
                                                <>
                                                    <button
                                                        onClick={() => handleDownloadReport(order)}
                                                        className="w-full py-3 bg-[#087c46] hover:bg-[#076b3c] text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-[#087c46]/10"
                                                    >
                                                        <FiDownload /> {order.report_url ? 'Download PDF' : 'Generate PDF'}
                                                    </button>
                                                    {order.technicianNotes && (
                                                        <button
                                                            onClick={() => setViewNotesOrder(order)}
                                                            className="w-full py-3 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <FiEye /> View Comments
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-center text-xs text-gray-450 italic">
                                                    Results pending processing...
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Booking Modal */}
            {selectedTest && (
                <BookLabTestModal
                    test={selectedTest}
                    onClose={() => setSelectedTest(null)}
                    onSuccess={() => {
                        setSelectedTest(null);
                        setActiveTab('orders');
                        fetchOrders();
                    }}
                />
            )}

            {/* View Notes Modal */}
            {viewNotesOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-md rounded-[32px] p-6 shadow-2xl border border-gray-100 dark:border-gray-800 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-[#087c46] flex items-center justify-center">
                                <FiActivity className="text-xl" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black dark:text-white">Technician Comments</h3>
                                <p className="text-xs text-gray-400">Diagnosis & remarks notes</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-2xl text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap max-h-60 overflow-y-auto font-medium leading-relaxed border border-gray-100 dark:border-gray-800">
                            {viewNotesOrder.technicianNotes}
                        </div>
                        <button
                            onClick={() => setViewNotesOrder(null)}
                            className="mt-6 w-full py-3.5 bg-gray-900 dark:bg-white text-white dark:text-black hover:opacity-90 rounded-2xl font-bold transition-all text-xs uppercase tracking-widest"
                        >
                            Close Comments
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
