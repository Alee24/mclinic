'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { FiX, FiUser, FiCalendar, FiClock, FiArrowRight, FiCheckCircle, FiHome, FiInfo } from 'react-icons/fi';
import { useAuth } from '@/lib/auth';

interface MedicalConciergeModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const CONCIERGE_TYPES = [
    'Senior Care Concierge',
    'Child Care / Pediatrics Concierge',
    'Post-Surgery Recovery Support',
    'Chronic Care Management',
    'Wellness & Lifestyle Management',
    'General Medical Coordination'
];

export default function MedicalConciergeModal({ onClose, onSuccess }: MedicalConciergeModalProps) {
    const router = useRouter();
    const { user } = useAuth();
    
    const [currentStep, setCurrentStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [conciergeType, setConciergeType] = useState(CONCIERGE_TYPES[0]);
    const [numSessions, setNumSessions] = useState(1); // 1 session = 6 hours
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('08:00');
    const [homeAddress, setHomeAddress] = useState('');
    const [notes, setNotes] = useState('');

    const PRICE_PER_SESSION = 6000;
    const HOURS_PER_SESSION = 6;

    const totalPrice = numSessions * PRICE_PER_SESSION;
    const totalHours = numSessions * HOURS_PER_SESSION;

    const handleBook = async () => {
        setSubmitting(true);
        try {
            const payload = {
                isConcierge: true,
                conciergeType,
                durationHours: totalHours,
                appointmentDate: bookingDate,
                appointmentTime: bookingTime,
                homeAddress,
                reason: notes,
                isForSelf: true, // Defaulting to self for now, can be expanded
            };

            const res = await api.post('/appointments', payload);
            if (res && res.ok) {
                const data = await res.json();
                if (data && data.id) {
                    router.push(`/dashboard/appointments/${data.id}/pay`);
                } else {
                    onSuccess();
                }
            } else {
                alert('Failed to book Medical Concierge service.');
            }
        } catch (err) {
            console.error(err);
            alert('Error booking service.');
        } finally {
            setSubmitting(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl flex gap-3 items-start">
                            <FiInfo className="text-blue-500 mt-1 shrink-0" size={20} />
                            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                                Medical Concierge provides dedicated end-to-end health coordination. 
                                Each session lasts 6 hours for KES 6,000.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Type of Concierge Service</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {CONCIERGE_TYPES.map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setConciergeType(type)}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${conciergeType === type 
                                            ? 'border-primary bg-primary/10 text-primary' 
                                            : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-[#121212] text-gray-500 hover:border-gray-200'}`}
                                    >
                                        <h4 className="font-bold text-sm">{type}</h4>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Number of Sessions (6 Hours Each)</label>
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => setNumSessions(Math.max(1, numSessions - 1))}
                                    className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl font-bold hover:bg-gray-200 transition"
                                >-</button>
                                <div className="flex-1 text-center py-3 bg-white dark:bg-[#121212] border dark:border-gray-800 rounded-xl font-black text-xl">
                                    {numSessions} {numSessions === 1 ? 'Session' : 'Sessions'}
                                    <span className="block text-[10px] text-gray-400 font-bold uppercase mt-1">{totalHours} Hours Total</span>
                                </div>
                                <button 
                                    onClick={() => setNumSessions(numSessions + 1)}
                                    className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl font-bold hover:bg-gray-200 transition"
                                >+</button>
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider">Start Date</label>
                                <div className="relative">
                                    <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="date" 
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full pl-12 p-4 rounded-xl border dark:border-gray-800 bg-white dark:bg-[#121212] outline-none font-bold"
                                        value={bookingDate}
                                        onChange={(e) => setBookingDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider">Start Time</label>
                                <div className="relative">
                                    <FiClock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="time" 
                                        className="w-full pl-12 p-4 rounded-xl border dark:border-gray-800 bg-white dark:bg-[#121212] outline-none font-bold"
                                        value={bookingTime}
                                        onChange={(e) => setBookingTime(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider">Physical Address / Landmark</label>
                            <div className="relative">
                                <FiHome className="absolute left-4 top-4 text-gray-400" />
                                <textarea 
                                    rows={2}
                                    placeholder="Enter your street, house number or landmark..."
                                    className="w-full pl-12 p-4 rounded-xl border dark:border-gray-800 bg-white dark:bg-[#121212] outline-none font-medium resize-none"
                                    value={homeAddress}
                                    onChange={(e) => setHomeAddress(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider">Additional Requirements / Notes</label>
                            <textarea 
                                rows={3}
                                placeholder="Any specific requirements for the concierge agent?"
                                className="w-full p-4 rounded-xl border dark:border-gray-800 bg-white dark:bg-[#121212] outline-none font-medium resize-none"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-8 text-center animate-in zoom-in-95 duration-300">
                        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center mx-auto text-5xl">
                            <FiCheckCircle />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black dark:text-white mb-2">Service Summary</h3>
                            <p className="text-gray-500">Please review your booking details before proceeding to payment.</p>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-[#121212] p-8 rounded-[32px] text-left border border-gray-100 dark:border-gray-800 space-y-6">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-bold">Service Type</span>
                                <span className="font-black dark:text-white">{conciergeType}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-bold">Duration</span>
                                <span className="font-black dark:text-white">{totalHours} Hours ({numSessions} {numSessions === 1 ? 'Session' : 'Sessions'})</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-bold">Start Date</span>
                                <span className="font-black dark:text-white">{bookingDate} @ {bookingTime}</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-800 pt-6 mt-6">
                                <span className="text-xl font-black dark:text-white">Total Charge</span>
                                <span className="text-3xl font-black text-primary">KES {totalPrice.toLocaleString()}</span>
                            </div>
                        </div>

                        <p className="text-xs text-gray-400 font-medium px-8">
                            By clicking 'Confirm & Pay', you agree to our terms of service. An agent will be assigned to you within 30 minutes of payment confirmation.
                        </p>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in duration-300">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-8 right-8 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all z-10"
                >
                    <FiX size={24} className="dark:text-white" />
                </button>

                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100 dark:bg-gray-800">
                    <div 
                        className="h-full bg-primary transition-all duration-500" 
                        style={{ width: `${(currentStep / 3) * 100}%` }}
                    />
                </div>

                <div className="flex-1 overflow-y-auto p-8 md:p-12">
                    <div className="mb-10">
                        <span className="text-primary font-black uppercase tracking-[0.2em] text-[10px]">Medical Concierge</span>
                        <h2 className="text-4xl font-black dark:text-white mt-2 leading-tight">
                            {currentStep === 1 ? 'Tailor Your Care' : currentStep === 2 ? 'Schedule & Location' : 'Final Step'}
                        </h2>
                    </div>

                    {renderStepContent()}
                </div>

                {/* Footer Actions */}
                <div className="p-8 md:px-12 md:pb-12 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#121212]/50 flex items-center justify-between">
                    <button
                        onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onClose()}
                        className="px-8 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                        {currentStep === 1 ? 'Cancel' : 'Back'}
                    </button>
                    
                    <button
                        onClick={() => {
                            if (currentStep < 3) {
                                if (currentStep === 2 && (!bookingDate || !bookingTime || !homeAddress)) {
                                    alert('Please fill in all required fields.');
                                    return;
                                }
                                setCurrentStep(currentStep + 1);
                            } else {
                                handleBook();
                            }
                        }}
                        disabled={submitting}
                        className="px-10 py-4 bg-primary text-black rounded-2xl font-black shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center gap-3"
                    >
                        {submitting ? 'Processing...' : currentStep === 3 ? 'Confirm & Pay' : 'Next Step'}
                        <FiArrowRight />
                    </button>
                </div>
            </div>
        </div>
    );
}
