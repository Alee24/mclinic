'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { Download, Printer, FileDown } from 'lucide-react';
import html2canvas from 'html2canvas';

interface IdCardProps {
    doctorId: number;
}

export default function DoctorIdCard({ doctorId }: IdCardProps) {
    const [idCardData, setIdCardData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const generateIdCard = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/doctors/${doctorId}/id-card`);
            if (res && res.ok) {
                const data = await res.json();
                setIdCardData(data);
            } else {
                alert(`Failed to generate ID card. Server returned ${res?.status} ${res?.statusText}`);
            }
        } catch (error: any) {
            console.error('Failed to generate ID card:', error);
            alert(`Failed to generate ID card: ${error.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    const cardRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = async () => {
        if (!cardRef.current) return;
        setLoading(true);
        try {
            const canvas = await html2canvas(cardRef.current, {
                useCORS: true,
                scale: 3, // High-res
                backgroundColor: null,
                logging: false,
            });
            const link = document.createElement('a');
            link.download = `M-Clinic-ID-${idCardData?.serialNumber || 'Card'}.png`;
            link.href = canvas.toDataURL('image/png', 1.0);
            link.click();
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download image. Try printing to PDF instead.');
        } finally {
            setLoading(false);
        }
    };

    if (!idCardData) {
        return (
            <button
                onClick={generateIdCard}
                disabled={loading}
                className="bg-primary hover:bg-primary/90 text-black px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 flex items-center gap-2"
            >
                <Download className="h-5 w-5" />
                {loading ? 'Generating...' : 'Generate ID Card'}
            </button>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-3 print:hidden">
                <button
                    onClick={handleDownload}
                    disabled={loading}
                    className="bg-primary hover:bg-primary/90 text-black px-6 py-3 rounded-xl font-black transition flex items-center gap-2 shadow-lg shadow-primary/20 active:scale-95"
                >
                    <FileDown className="h-5 w-5" />
                    {loading ? 'Processing...' : 'Download ID'}
                </button>
                <button
                    onClick={handlePrint}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold transition flex items-center gap-2"
                >
                    <Printer className="h-5 w-5" />
                    Print
                </button>
                <button
                    onClick={() => setIdCardData(null)}
                    className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-xl font-medium transition ml-auto"
                >
                    Close
                </button>
            </div>

            {/* ID Card Design */}
            <div ref={cardRef} className="bg-white p-8 rounded-xl shadow-2xl max-w-2xl mx-auto print:shadow-none print:p-0">
                {/* Front Side */}
                <div className="border-[6px] border-primary rounded-2xl p-6 bg-gradient-to-br from-white to-gray-50 relative overflow-hidden shadow-inner">
                    {/* Watermark/Background Decoration */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none rotate-12">
                        <img src="/logo.png" alt="Watermark" className="w-[400px] grayscale" />
                    </div>

                    {/* Header */}
                    <div className="flex items-center justify-between border-b-2 border-primary pb-4 mb-6 relative z-10">
                        <img src="/logo.png" alt="M-Clinic Kenya" className="h-10 object-contain" />
                        <div className="text-right">
                            <h1 className="text-lg font-black text-primary leading-tight">PROFESSIONAL MEDICAL ID</h1>
                            <p className="text-[10px] text-gray-500 font-mono font-bold">{idCardData.serialNumber}</p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex gap-8 relative z-10">
                        {/* Left: Photo & QR */}
                        <div className="flex flex-col gap-4 w-1/3">
                            <div className="aspect-[4/5] bg-gray-100 rounded-xl overflow-hidden border-2 border-primary/30 shadow-lg">
                                {idCardData.doctor?.profileImage ? (
                                    <img
                                        src={idCardData.doctor.profileImage}
                                        alt={idCardData.doctor.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-50">
                                        <div className="text-4xl mb-2">🧑‍⚕️</div>
                                        <span className="text-[10px] font-bold">MISSING PHOTO</span>
                                    </div>
                                )}
                            </div>
                            <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm text-center">
                                {idCardData.qrCode ? (
                                    <img src={idCardData.qrCode} alt="Verification QR" className="w-full h-auto mb-1 rounded-lg" />
                                ) : (
                                    <div className="w-full h-16 bg-gray-50 rounded flex items-center justify-center text-[10px]">QR Pending</div>
                                )}
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Scan to Verify Credentials</p>
                            </div>
                        </div>

                        {/* Right: Details */}
                        <div className="flex-1 flex flex-col">
                            <div className="mb-6">
                                <h2 className="text-2xl font-black text-gray-900 leading-tight mb-1 uppercase tracking-tight">
                                    {idCardData.doctor?.name || 'NAME NOT SET'}
                                </h2>
                                <p className="text-primary font-black uppercase tracking-widest text-xs flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                                    {idCardData.doctor?.speciality || 'General Practitioner'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm mt-auto">
                                <div className="space-y-0.5">
                                    <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">License Number</p>
                                    <p className="font-bold text-gray-800 text-base">{idCardData.doctor?.licenseNumber || 'PENDING'}</p>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">ID Card Issued</p>
                                    <p className="font-bold text-gray-800 text-sm">
                                        {idCardData.issuedDate ? new Date(idCardData.issuedDate).toLocaleDateString('en-GB') : 'N/A'}
                                    </p>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">Medical Body</p>
                                    <p className="font-bold text-gray-800 text-sm">{idCardData.doctor?.drType || 'M-CLINIC KENYA'}</p>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">Status</p>
                                    <p className="font-black text-green-600 text-[10px] flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> ACTIVE MEMBER
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-3 border-t border-primary/20 text-center relative z-10 flex items-center justify-between">
                        <p className="text-[8px] text-gray-400 font-bold max-w-[280px] text-left leading-relaxed lowercase">
                            this card is the property of m-clinic kenya and remains m-clinic kenya's property. if found, please return to any m-clinic center or contact info@mclinic.co.ke
                        </p>
                        <div className="flex flex-col items-end">
                            <p className="text-[10px] font-black italic text-gray-300">verified credential</p>
                        </div>
                    </div>
                </div>

                {/* Print Helper */}
                <div className="hidden print:block page-break-after-always mt-12 px-8 py-10 border-4 border-dashed border-gray-200 rounded-3xl text-center">
                    <p className="text-gray-400 text-sm mb-4">M-Clinic Kenya • HQ Nairobi</p>
                    <p className="text-lg font-black dark:text-gray-900 mb-6 uppercase tracking-widest text-primary">Back of Medical ID</p>
                    <div className="text-sm text-gray-600 space-y-2 max-w-md mx-auto">
                        <p><strong>Contact:</strong> {idCardData.doctor?.email}</p>
                        <p><strong>Emergency:</strong> {idCardData.doctor?.mobile || '+254 XX XXX XXX'}</p>
                        <div className="pt-6 mt-6 border-t border-gray-100">
                            <p className="text-xs">This card grants access to the M-Clinic Portal and enables telemedicine services across Kenya.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
