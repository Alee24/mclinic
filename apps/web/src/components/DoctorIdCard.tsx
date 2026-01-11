'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Download, Printer } from 'lucide-react';

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

    const handlePrint = () => {
        window.print();
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
            <div className="flex gap-3 print:hidden">
                <button
                    onClick={handlePrint}
                    className="bg-primary hover:bg-primary/90 text-black px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
                >
                    <Printer className="h-5 w-5" />
                    Print ID Card
                </button>
                <button
                    onClick={() => setIdCardData(null)}
                    className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg font-medium transition"
                >
                    Close
                </button>
            </div>

            {/* ID Card Design */}
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-2xl mx-auto print:shadow-none">
                {/* Front Side */}
                <div className="border-4 border-primary rounded-xl p-6 bg-gradient-to-br from-white to-gray-50 relative overflow-hidden">
                    {/* Watermark/Background Decoration */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                        <img src="/mclinic-logo-full.png" alt="Watermark" className="w-64 grayscale" />
                    </div>

                    {/* Header */}
                    <div className="flex items-center justify-between border-b-2 border-primary pb-4 mb-6 relative z-10">
                        <img src="/mclinic-logo-full.png" alt="M-Clinic Kenya" className="h-12 object-contain" />
                        <div className="text-right">
                            <h1 className="text-xl font-bold text-primary">MEDICAL ID</h1>
                            <p className="text-xs text-gray-600 font-mono">{idCardData.serialNumber}</p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex gap-6 relative z-10">
                        {/* Left: Photo & QR */}
                        <div className="flex flex-col gap-4 w-1/3">
                            <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden border-2 border-primary shadow-md">
                                {idCardData.doctor.profileImage ? (
                                    <img
                                        src={idCardData.doctor.profileImage}
                                        alt={idCardData.doctor.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        No Photo
                                    </div>
                                )}
                            </div>
                            <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm text-center">
                                <img src={idCardData.qrCode} alt="Verification QR" className="w-full h-auto mb-1" />
                                <p className="text-[10px] text-gray-500">Scan to Verify</p>
                            </div>
                        </div>

                        {/* Right: Details */}
                        <div className="flex-1 space-y-3">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{idCardData.doctor.name}</h2>
                                <p className="text-primary font-medium uppercase tracking-wide text-sm">{idCardData.doctor.speciality || 'General Practitioner'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-x-2 gap-y-3 text-sm mt-4">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">License No</p>
                                    <p className="font-semibold">{idCardData.doctor.licenseNumber || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Expires</p>
                                    <p className="font-semibold text-red-600">
                                        {idCardData.doctor.licenseExpiry ? new Date(idCardData.doctor.licenseExpiry).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Designation</p>
                                    <p className="font-medium">{idCardData.doctor.drType}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Issued</p>
                                    <p className="font-medium">{new Date(idCardData.issuedDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 pt-2 border-t border-primary/20 text-center relative z-10">
                        <p className="text-[10px] text-gray-500">
                            Property of M-Clinic Kenya. If found, please return to P.O Box 12345 Nairobi or info@mclinic.co.ke
                        </p>
                    </div>
                </div>

                {/* Back Side (Optional - for print) */}
                <div className="hidden print:block mt-8 border-4 border-primary rounded-xl p-6 bg-gradient-to-br from-white to-gray-50">
                    <h3 className="text-lg font-bold text-center mb-4">Contact Information</h3>
                    <div className="space-y-2 text-sm">
                        <p><strong>Email:</strong> {idCardData.doctor.email}</p>
                        <p><strong>Mobile:</strong> {idCardData.doctor.mobile || 'N/A'}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-300">
                        <h4 className="font-semibold text-sm mb-2">Verification</h4>
                        <p className="text-xs text-gray-600">
                            Scan the QR code or visit: {idCardData.verificationUrl}
                        </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-300 text-center">
                        <p className="text-xs text-gray-500">
                            This card is property of M-Clinic Kenya and must be returned upon request.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
