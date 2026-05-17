'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getApiBaseUrl } from '@/lib/api';
import { 
    FiShield, 
    FiCheckCircle, 
    FiAlertTriangle, 
    FiSearch, 
    FiLoader, 
    FiPrinter,
    FiExternalLink,
    FiCalendar,
    FiUser,
    FiDollarSign
} from 'react-icons/fi';

function VerificationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const queryCode = searchParams.get('code') || '';

    // States
    const [serialCode, setSerialCode] = useState<string>(queryCode);
    const [verifying, setVerifying] = useState<boolean>(false);
    const [verificationResult, setVerificationResult] = useState<any | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const performVerification = async (codeToVerify: string) => {
        if (!codeToVerify.trim()) return;
        
        setVerifying(true);
        setErrorMsg(null);
        setVerificationResult(null);

        try {
            const apiBase = getApiBaseUrl();
            const url = `${apiBase}/financial/verify/${encodeURIComponent(codeToVerify.trim())}`;
            
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setVerificationResult(data);
            } else {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `The receipt serial number "${codeToVerify}" is invalid or could not be verified.`);
            }
        } catch (err: any) {
            console.error('Verification failed:', err);
            setErrorMsg(err.message || 'Verification system is currently offline. Please try again shortly.');
        } finally {
            setVerifying(false);
        }
    };

    // Auto-run if query param exists
    useEffect(() => {
        if (queryCode) {
            setSerialCode(queryCode);
            performVerification(queryCode);
        }
    }, [queryCode]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!serialCode.trim()) return;
        
        // Update URL query parameter
        router.push(`/verify?code=${encodeURIComponent(serialCode.trim())}`);
        performVerification(serialCode);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
            <div className="max-w-3xl mx-auto w-full space-y-8">
                {/* Header Logo & Verification Banner */}
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <img 
                            src="https://mclinic.co.ke/wp-content/uploads/2025/04/M-Clinic-Logo.png" 
                            alt="M-Clinic Logo" 
                            className="h-14 object-contain rounded-lg"
                        />
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl flex items-center justify-center gap-2">
                        <FiShield className="text-[#0B6E40]" /> Secure Receipt Audit
                    </h2>
                    <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                        Validate the authenticity, payment status, and medical details of any official M-Clinic invoice or transaction receipt.
                    </p>
                </div>

                {/* Input verification form */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200/60 dark:border-zinc-800 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 uppercase tracking-wider">
                                Enter Receipt Serial Number or Transaction Reference
                            </label>
                            <div className="relative rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiSearch className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={serialCode}
                                    onChange={(e) => setSerialCode(e.target.value)}
                                    placeholder="e.g. REC-12 or M-Pesa Code"
                                    className="block w-full pl-10 pr-24 py-3 sm:text-sm border border-gray-300 dark:border-zinc-700 rounded-xl bg-transparent dark:text-white focus:ring-1 focus:ring-[#0B6E40] focus:border-[#0B6E40] transition"
                                    required
                                />
                                <div className="absolute inset-y-1.5 right-1.5">
                                    <button
                                        type="submit"
                                        disabled={verifying}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-bold rounded-lg text-white bg-[#0B6E40] hover:bg-[#08522e] transition shadow-sm disabled:opacity-50 h-full"
                                    >
                                        {verifying ? (
                                            <>
                                                <FiLoader className="animate-spin mr-1.5" /> Auditing...
                                            </>
                                        ) : (
                                            'Verify'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Verification result details */}
                {verifying && (
                    <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200/60 dark:border-zinc-800 shadow-sm space-y-3">
                        <FiLoader className="w-8 h-8 text-[#0B6E40] animate-spin" />
                        <p className="text-xs text-gray-500 font-semibold animate-pulse">Running cryptographic audit & fetching verification index...</p>
                    </div>
                )}

                {errorMsg && (
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl p-6 flex items-start gap-4 shadow-sm animate-fade-in">
                        <FiAlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <div className="space-y-1">
                            <h3 className="font-extrabold text-sm text-red-800 dark:text-red-300">Verification Failure</h3>
                            <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed">
                                {errorMsg}
                            </p>
                            <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
                                Please check that the spelling is exactly as displayed on the receipt metadata, or verify that the document is indeed registered in the live M-Clinic database.
                            </p>
                        </div>
                    </div>
                )}

                {verificationResult && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Verified Banner */}
                        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
                            <FiCheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-extrabold text-sm text-emerald-800 dark:text-emerald-300">Authentic M-Clinic Document</h3>
                                    <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Verified Secure</span>
                                </div>
                                <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                                    This invoice receipt has been securely authenticated by M-Clinic Kenya's financial database system. The records below are definitive.
                                </p>
                            </div>
                        </div>

                        {/* Quick summary cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-zinc-900 border border-gray-200/60 dark:border-zinc-800 rounded-xl p-4 flex items-center gap-3">
                                <FiUser className="w-5 h-5 text-[#0B6E40]" />
                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Patient</span>
                                    <span className="text-sm font-bold dark:text-white">{verificationResult.patientName}</span>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-zinc-900 border border-gray-200/60 dark:border-zinc-800 rounded-xl p-4 flex items-center gap-3">
                                <FiCalendar className="w-5 h-5 text-[#0B6E40]" />
                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Issued Date</span>
                                    <span className="text-sm font-bold dark:text-white">
                                        {new Date(verificationResult.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-zinc-900 border border-gray-200/60 dark:border-zinc-800 rounded-xl p-4 flex items-center gap-3">
                                <FiDollarSign className="w-5 h-5 text-[#0B6E40]" />
                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Amount Paid</span>
                                    <span className="text-sm font-extrabold text-[#0B6E40]">KES {Number(verificationResult.totalAmount).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Receipt HTML View Frame */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-lg overflow-hidden">
                            <div className="bg-gray-50 dark:bg-zinc-900/60 px-6 py-4 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-600 dark:text-zinc-300 uppercase tracking-wider">
                                    Official Printed Form Preview
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            const printWindow = window.open('', '_blank');
                                            if (printWindow) {
                                                printWindow.document.write(verificationResult.html);
                                                printWindow.document.close();
                                                setTimeout(() => printWindow.print(), 500);
                                            }
                                        }}
                                        className="bg-white dark:bg-black text-gray-700 dark:text-zinc-300 border border-gray-300 dark:border-zinc-700 font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-gray-50 dark:hover:bg-zinc-900 flex items-center gap-1.5 transition shadow-sm"
                                    >
                                        <FiPrinter className="w-3.5 h-3.5" /> Print/Export PDF
                                    </button>
                                </div>
                            </div>
                            
                            {/* Embedded print HTML preview */}
                            <div className="bg-slate-100 dark:bg-black/40 p-4 sm:p-6 overflow-x-auto flex justify-center">
                                <div 
                                    className="bg-white text-black rounded-xl shadow-inner max-w-full overflow-hidden p-1.5 scale-90 sm:scale-100 origin-top"
                                    style={{ width: '850px', transformOrigin: 'top center' }}
                                    dangerouslySetInnerHTML={{ __html: verificationResult.html }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Public Audit Footer */}
            <div className="text-center text-xs text-gray-400 dark:text-zinc-600 py-8 border-t border-gray-200/60 dark:border-zinc-900 mt-12 max-w-3xl mx-auto w-full">
                <p>&copy; {new Date().getFullYear()} M-Clinic Kenya Services. Cryptographically validated receipt records are protected by database hashes.</p>
                <div className="flex justify-center gap-4 mt-2">
                    <a href="https://mclinic.co.ke" className="hover:text-gray-600 dark:hover:text-zinc-400 flex items-center gap-0.5">
                        mclinic.co.ke <FiExternalLink className="w-2.5 h-2.5" />
                    </a>
                    <span>&bull;</span>
                    <a href="https://portal.mclinic.co.ke" className="hover:text-gray-600 dark:hover:text-zinc-400">
                        Patient Care Portal
                    </a>
                </div>
            </div>
        </div>
    );
}

export default function VerificationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-12">
                <FiLoader className="w-10 h-10 text-[#0B6E40] animate-spin mb-4" />
                <p className="text-sm text-gray-500 font-semibold animate-pulse">Initializing Audit Portal...</p>
            </div>
        }>
            <VerificationContent />
        </Suspense>
    );
}
