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
            }
        } catch (error) {
            console.error('Failed to generate ID card:', error);
            alert('Failed to generate ID card');
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
                <div className="border-4 border-primary rounded-xl p-6 bg-gradient-to-br from-white to-gray-50">
                    {/* Header */}
                    <div className="text-center mb-6 border-b-2 border-primary pb-4">
                        <h1 className="text-2xl font-bold text-primary">M-CLINIC HEALTH</h1>
                        <p className="text-sm text-gray-600">Medical Professional ID Card</p>
                    </div>

                    {/* Content */}
                    <div className="flex gap-6">
                        {/* Photo */}
                        <div className="flex-shrink-0">
                            {idCardData.doctor.profileImage ? (
                                <img
                                    src={idCardData.doctor.profileImage}
                                    alt={idCardData.doctor.name}
                                    className="w-32 h-32 rounded-lg object-cover border-2 border-gray-300"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-lg bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                                    <span className="text-4xl text-gray-400">👨‍⚕️</span>
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-800 mb-3">{idCardData.doctor.name}</h2>

                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="font-semibold text-gray-600">Speciality:</span>
                                    <p className="text-gray-800">{idCardData.doctor.speciality}</p>
                                </div>

                                <div>
                                    <span className="font-semibold text-gray-600">Type:</span>
                                    <p className="text-gray-800">{idCardData.doctor.drType}</p>
                                </div>

                                <div>
                                    <span className="font-semibold text-gray-600">License No:</span>
                                    <p className="text-gray-800 font-mono">{idCardData.doctor.licenseNumber}</p>
                                </div>

                                <div>
                                    <span className="font-semibold text-gray-600">Valid Until:</span>
                                    <p className="text-gray-800">
                                        {idCardData.doctor.licenseExpiry
                                            ? new Date(idCardData.doctor.licenseExpiry).toLocaleDateString()
                                            : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* QR Code */}
                        <div className="flex-shrink-0 text-center">
                            <img
                                src={idCardData.qrCode}
                                alt="QR Code"
                                className="w-24 h-24 border-2 border-gray-300 rounded"
                            />
                            <p className="text-xs text-gray-500 mt-2">Scan to Verify</p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 pt-4 border-t border-gray-300 text-center">
                        <p className="text-xs text-gray-500">
                            Issued: {new Date(idCardData.issuedDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            ID: {idCardData.doctor.id} • www.mclinic.co.ke
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
                            This card is property of M-Clinic Health and must be returned upon request.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
