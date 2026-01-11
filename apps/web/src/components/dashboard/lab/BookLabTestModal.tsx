'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { FiX, FiCheck, FiUser, FiCalendar, FiCreditCard } from 'react-icons/fi';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface BookLabTestModalProps {
    test: any;
    onClose: () => void;
    onSuccess: () => void;
}

export default function BookLabTestModal({ test, onClose, onSuccess }: BookLabTestModalProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [isForSelf, setIsForSelf] = useState(true);
    const [beneficiaryDetails, setBeneficiaryDetails] = useState({
        name: '',
        age: '',
        gender: 'Male',
        relation: 'Family Member'
    });
    const [sampleDate, setSampleDate] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const payload = {
                testId: test.id,
                isForSelf,
                beneficiaryName: !isForSelf ? beneficiaryDetails.name : null,
                beneficiaryAge: !isForSelf ? beneficiaryDetails.age : null,
                beneficiaryGender: !isForSelf ? beneficiaryDetails.gender : null,
                beneficiaryRelation: !isForSelf ? beneficiaryDetails.relation : null,
                sampleDate: sampleDate || new Date().toISOString()
            };

            const res = await api.post('/laboratory/orders', payload);

            if (res?.ok) {
                const data = await res.json();
                // Redirect to payment or show success
                // Assuming we redirect to a payment page or invoice
                // For now, let's show success and close
                alert('Lab test booked successfully! Please proceed to payment.');
                onSuccess();
            } else {
                alert('Failed to book test. Please try again.');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                    <div>
                        <h3 className="font-black text-xl text-gray-900 dark:text-white">Book Lab Test</h3>
                        <p className="text-sm text-gray-500">{test.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <FiX size={20} className="dark:text-white" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Step 1: Who is this for? */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Who is this test for?</label>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setIsForSelf(true)}
                                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold border transition-all ${isForSelf
                                    ? 'bg-primary text-black border-primary shadow-lg shadow-primary/20'
                                    : 'bg-white dark:bg-black border-gray-200 dark:border-gray-700 dark:text-gray-300 hover:border-primary/50'}`}
                            >
                                <span className="block mb-1 text-lg">👤</span>
                                For Me
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsForSelf(false)}
                                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold border transition-all ${!isForSelf
                                    ? 'bg-primary text-black border-primary shadow-lg shadow-primary/20'
                                    : 'bg-white dark:bg-black border-gray-200 dark:border-gray-700 dark:text-gray-300 hover:border-primary/50'}`}
                            >
                                <span className="block mb-1 text-lg">👥</span>
                                Someone Else
                            </button>
                        </div>
                    </div>

                    {/* Beneficiary Details */}
                    {!isForSelf && (
                        <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl space-y-4 border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-2">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required={!isForSelf}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white outline-none focus:ring-2 focus:ring-primary"
                                    value={beneficiaryDetails.name}
                                    onChange={(e) => setBeneficiaryDetails({ ...beneficiaryDetails, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Age</label>
                                    <input
                                        type="number"
                                        required={!isForSelf}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white outline-none focus:ring-2 focus:ring-primary"
                                        value={beneficiaryDetails.age}
                                        onChange={(e) => setBeneficiaryDetails({ ...beneficiaryDetails, age: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Gender</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white outline-none focus:ring-2 focus:ring-primary"
                                        value={beneficiaryDetails.gender}
                                        onChange={(e) => setBeneficiaryDetails({ ...beneficiaryDetails, gender: e.target.value })}
                                    >
                                        <option>Male</option>
                                        <option>Female</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Relation</label>
                                <select
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white outline-none focus:ring-2 focus:ring-primary"
                                    value={beneficiaryDetails.relation}
                                    onChange={(e) => setBeneficiaryDetails({ ...beneficiaryDetails, relation: e.target.value })}
                                >
                                    <option>Family Member</option>
                                    <option>Child</option>
                                    <option>Parent</option>
                                    <option>Spouse</option>
                                    <option>Friend</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Schedule */}
                    <div>
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">Preferred Sample Collection Date</label>
                        <div className="relative">
                            <FiCalendar className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="date"
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white outline-none focus:ring-2 focus:ring-primary"
                                value={sampleDate}
                                onChange={(e) => setSampleDate(e.target.value)}
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Leave blank for immediate/walk-in.</p>
                    </div>

                    {/* Price Summary */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-center justify-between border border-blue-100 dark:border-blue-900/30">
                        <div>
                            <p className="text-sm font-bold text-blue-900 dark:text-blue-300">Total Amount</p>
                            <p className="text-xs text-blue-700 dark:text-blue-400">Includes consultation & report</p>
                        </div>
                        <p className="text-2xl font-black text-blue-600 dark:text-blue-400">KES {Number(test.price).toLocaleString()}</p>
                    </div>
                </form>

                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5">
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-xl text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <>Processing...</>
                        ) : (
                            <>
                                <FiCreditCard /> Confirm & Pay
                            </>
                        )}
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                        <FiCheck className="text-green-500" /> Secure Payment via M-PESA or Card
                    </p>
                </div>
            </div>
        </div>
    );
}
