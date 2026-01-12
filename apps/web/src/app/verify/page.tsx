'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { FiSearch, FiCheckCircle, FiXCircle, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function VerifyPrescriptionPage() {
    const searchParams = useSearchParams();
    const initialId = searchParams.get('id');

    const [serialNumber, setSerialNumber] = useState(initialId || '');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleVerify = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setError(null);
        setResult(null);

        if (!serialNumber.trim()) {
            toast.error('Please enter a valid Serial Number');
            return;
        }

        // Parse ID from Serial (RX-ID-DATE format)
        // e.g. RX-54-202511
        const parts = serialNumber.split('-');
        if (parts.length < 2 || parts[0] !== 'RX') {
            setError('Invalid Serial Number Format. It should look like RX-123-2025...');
            return;
        }

        const prescriptionId = parts[1];
        setLoading(true);

        try {
            const res = await api.get(`/pharmacy/prescriptions/${prescriptionId}`);
            if (res && res.ok) {
                const data = await res.json();
                setResult(data);
                toast.success('Prescription Verified!');
            } else {
                setError('Prescription not found or invalid.');
            }
        } catch (err) {
            console.error(err);
            setError('System Error. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Auto-verify if ID is in URL
    if (initialId && !result && !loading && !error) {
        // This causing loop if not careful, but initialId comes from router which is stable?
        // Better to use useEffect
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white border-b py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-2 font-black text-2xl text-[#1D2B36]">
                    <div className="w-8 h-8 bg-[#00C65E] rounded-full flex items-center justify-center text-white text-base">M</div>
                    M-Clinic
                </div>
                <a href="/" className="text-sm font-bold text-gray-500 hover:text-[#00C65E]">Back to Home</a>
            </header>

            <main className="flex-1 max-w-3xl mx-auto w-full p-6 md:p-12 flex flex-col items-center">

                <h1 className="text-3xl md:text-4xl font-black text-[#1D2B36] text-center mb-4">Verify Prescription</h1>
                <p className="text-gray-500 text-center max-w-lg mb-8">
                    Ensure the authenticity of M-Clinic prescriptions by entering the unique Serial Number found on the document.
                </p>

                {/* Search Box */}
                <form onSubmit={handleVerify} className="w-full max-w-md relative mb-12">
                    <input
                        type="text"
                        placeholder="e.g RX-123-20261"
                        value={serialNumber}
                        onChange={(e) => setSerialNumber(e.target.value)}
                        className="w-full pl-5 pr-14 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-[#00C65E]/20 shadow-xl shadow-gray-200/50 text-lg font-mono placeholder:font-sans transition-all"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="absolute right-2 top-2 bottom-2 bg-[#00C65E] text-white rounded-xl px-4 flex items-center justify-center hover:bg-[#00A14C] transition disabled:opacity-50"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSearch size={20} />}
                    </button>
                </form>

                {/* Status Display */}
                {error && (
                    <div className="w-full bg-red-50 border border-red-100 rounded-3xl p-8 text-center animate-in fade-in slide-in-from-bottom-4">
                        <FiXCircle className="mx-auto text-4xl text-red-500 mb-4" />
                        <h3 className="text-xl font-bold text-red-700 mb-2">Verification Failed</h3>
                        <p className="text-red-500">{error}</p>
                    </div>
                )}

                {result && (
                    <div className="w-full bg-white rounded-3xl border border-gray-200 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8">
                        {/* Success Header */}
                        <div className="bg-[#00C65E] p-6 text-white text-center">
                            <FiCheckCircle className="mx-auto text-4xl mb-2" />
                            <h2 className="text-2xl font-bold">Valid Prescription</h2>
                            <p className="opacity-90 text-sm mt-1">This document is authentic and issued by M-Clinic.</p>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Doctor & Date */}
                            <div className="flex flex-col md:flex-row justify-between gap-6 border-b border-dashed border-gray-100 pb-8">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Prescribed By</h4>
                                    <p className="text-lg font-bold text-[#1D2B36]">
                                        {result.doctor?.fname ? `Dr. ${result.doctor.fname} ${result.doctor.lname}` :
                                            result.doctor?.user?.fname ? `Dr. ${result.doctor.user.fname} ${result.doctor.user.lname}` : 'Medical Practitioner'}
                                    </p>
                                    <p className="text-sm text-gray-500 italic mb-2">Licensed M-Clinic Provider</p>

                                    {result.doctor?.licenceNo && (
                                        <div className="mt-2 text-sm">
                                            <p className="text-gray-600"><span className="font-semibold">License No:</span> {result.doctor.licenceNo}</p>
                                            {result.doctor.licenceExpiry && (
                                                <p className="text-gray-600"><span className="font-semibold">Expiry:</span> {new Date(result.doctor.licenceExpiry).toLocaleDateString()}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="md:text-right">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Date Issued</h4>
                                    <p className="text-lg font-bold text-[#1D2B36]">{new Date(result.createdAt).toLocaleDateString()}</p>
                                    <p className="text-sm text-gray-500">{new Date(result.createdAt).toLocaleTimeString()}</p>
                                </div>
                            </div>

                            {/* Patient (Masked) */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Patient Details</h4>
                                <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500"><FiInfo /></div>
                                    <div>
                                        <p className="font-bold text-gray-700">Protected Patient Information</p>
                                        <p className="text-xs text-gray-500">Identity verified. Details linked to account ID ending in ...{result.patient?.id % 1000}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Medications */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Medications Prescribed</h4>
                                <div className="space-y-3">
                                    {result.items?.map((item: any, i: number) => (
                                        <div key={i} className="flex justify-between items-center py-3 border-b last:border-0 border-gray-100">
                                            <span className="font-bold text-gray-700">{item.medicationName || item.medication?.name}</span>
                                            <span className="text-sm font-medium px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
                                                {item.dosage} x {item.quantity}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Footer Signature */}
                            {(result.doctorSignatureUrl || result.doctorStampUrl) && (
                                <div className="pt-8 border-t border-gray-100 flex items-center justify-end gap-6 opacity-70 grayscale">
                                    {result.doctorStampUrl && <img src={result.doctorStampUrl} alt="Stamp" className="h-16 -rotate-12 mix-blend-multiply" />}
                                    {result.doctorSignatureUrl && <div className="text-center"><img src={result.doctorSignatureUrl} alt="Sign" className="h-12" /></div>}
                                </div>
                            )}

                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
