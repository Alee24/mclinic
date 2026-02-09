'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { FiDollarSign, FiClock, FiMapPin, FiCheckCircle, FiShare2, FiShield } from 'react-icons/fi';

export default function AppointmentPaymentPage() {
    const params = useParams();
    const router = useRouter();
    const [appointment, setAppointment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [processing, setProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('mpesa');
    const [success, setSuccess] = useState(false);
    const [waitingForMpesa, setWaitingForMpesa] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (waitingForMpesa && appointment?.id) {
            interval = setInterval(async () => {
                try {
                    const res = await api.get(`/appointments/${appointment.id}`);
                    if (res && res.ok) {
                        const data = await res.json();
                        if (data.invoice?.status === 'paid' || data.invoice?.status === 'PAID') {
                            setSuccess(true);
                            setWaitingForMpesa(false);
                            clearInterval(interval);
                        }
                    }
                } catch (e) { console.error(e); }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [waitingForMpesa, appointment?.id]);

    useEffect(() => {
        const fetchAppointment = async () => {
            console.log(`[PaymentPage] Fetching appointment ID: ${params.id}`);
            try {
                const res = await api.get(`/appointments/${params.id}`);
                console.log(`[PaymentPage] Response status: ${res?.status}`);

                if (res && res.ok) {
                    const data = await res.json();
                    console.log('[PaymentPage] Data received:', data);
                    setAppointment(data);
                } else {
                    console.error('[PaymentPage] Fetch failed:', res);
                }
            } catch (err) {
                console.error('[PaymentPage] Error:', err);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchAppointment();
        }
    }, [params.id]);

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        try {
            if (paymentMethod === 'mpesa') {
                const invoiceId = appointment.invoice?.id;
                if (!invoiceId) {
                    alert('Invoice not found. Proceeding with manual process.');
                    // Fallback to manual process-payment (simulated)
                    const res = await api.post(`/financial/process-payment`, {
                        appointmentId: appointment.id,
                        amount: (Number(appointment?.fee || 0) + Number(appointment?.transportFee || 0)),
                        phoneNumber
                    });
                    if (res && res.ok) {
                        setSuccess(true);
                        setTimeout(() => router.push('/dashboard/appointments'), 3000);
                    } else {
                        alert('Payment failed.');
                    }
                    return;
                }

                const res = await api.post(`/financial/mpesa/stk-push`, {
                    phoneNumber,
                    amount: (Number(appointment?.fee || 0) + Number(appointment?.transportFee || 0)),
                    invoiceId
                });

                if (res && res.ok) {
                    setWaitingForMpesa(true);
                    setProcessing(false); // Enable "Pay" if they need to retry? No, show waiting UI
                } else {
                    alert('Failed to initiate M-Pesa payment. Please try again.');
                    setProcessing(false);
                }

            } else {
                // Cash / Other (Simulated)
                const res = await api.post(`/financial/process-payment`, {
                    appointmentId: appointment.id,
                    amount: (Number(appointment?.fee || 0) + Number(appointment?.transportFee || 0)),
                    phoneNumber
                });

                if (res && res.ok) {
                    setSuccess(true);
                    setTimeout(() => router.push('/dashboard/appointments'), 3000);
                } else {
                    alert('Payment processing failed.');
                }
                setProcessing(false);
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred.');
            setProcessing(false);
        }
    };

    if (loading) return <div className="p-12 text-center text-gray-500">Loading payment details...</div>;
    if (!appointment) return <div className="p-12 text-center text-red-500">Appointment not found.</div>;

    const totalAmount = (Number(appointment.fee || 0) + Number(appointment.transportFee || 0));

    const distance = appointment ? (Number(appointment.transportFee) / 120).toFixed(1) : 0;

    if (success) {
        return (
            <div className="max-w-md mx-auto mt-12 text-center space-y-4 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center mx-auto text-5xl">
                    <FiCheckCircle />
                </div>
                <h1 className="text-2xl font-black dark:text-white">Payment Successful!</h1>
                <p className="text-gray-500">Your appointment has been confirmed.</p>
                <p className="text-sm text-gray-400">Redirecting to appointments...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-black dark:text-white flex items-center gap-2">
                <span className="text-primary"><FiDollarSign /></span> Complete Payment
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Summary Card */}
                <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
                    <h2 className="font-bold text-lg dark:text-white">Booking Summary</h2>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-black rounded-xl border border-gray-100 dark:border-gray-800">
                            <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-2xl shadow-sm">
                                👨‍⚕️
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 dark:text-white">Dr. {appointment.doctor?.fname} {appointment.doctor?.lname}</div>
                                <div className="text-xs text-primary font-bold uppercase">{appointment.doctor?.speciality || 'Specialist'}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                                <div className="text-xs text-gray-400 mb-1">Date</div>
                                <div className="font-bold dark:text-white flex items-center gap-2">
                                    <FiClock /> {new Date(appointment.appointment_date).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                                <div className="text-xs text-gray-400 mb-1">Time</div>
                                <div className="font-bold dark:text-white">
                                    {appointment.appointment_time}
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-dashed border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Distance</span>
                                <span className="font-medium dark:text-white">{distance} km</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Consultation Fee</span>
                                <span className="font-medium dark:text-white">KES {appointment.fee}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Transport Fee</span>
                                <span className="font-medium dark:text-white">KES {appointment.transportFee}</span>
                            </div>
                            <div className="flex justify-between text-lg font-black pt-2 border-t border-gray-100 dark:border-gray-800">
                                <span className="text-gray-900 dark:text-white">Total</span>
                                <span className="text-primary">KES {totalAmount}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Form */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 shadow-md border border-primary/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 bg-green-500 text-white text-[10px] font-bold uppercase rounded-bl-xl">
                            Secure Payment
                        </div>

                        <div className="mb-6 text-center">
                            <div className="text-sm text-gray-500 mb-1">Amount to Pay</div>
                            <div className="text-4xl font-black text-gray-900 dark:text-white">KES {totalAmount}</div>
                        </div>

                        {/* Payment Method Selector */}
                        <div className="grid grid-cols-3 gap-2 mb-6">
                            {['mpesa', 'card', 'cash'].map(method => (
                                <button
                                    key={method}
                                    onClick={() => setPaymentMethod(method)}
                                    className={`py-2 rounded-lg text-xs font-bold uppercase border transition-all ${paymentMethod === method
                                        ? 'bg-primary text-black border-primary'
                                        : 'bg-gray-50 dark:bg-black text-gray-400 border-transparent hover:border-gray-200'
                                        }`}
                                >
                                    {method}
                                </button>
                            ))}
                        </div>

                        {paymentMethod === 'mpesa' ? (
                            <form onSubmit={handlePayment} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">M-Pesa Number</label>
                                    <input
                                        type="tel"
                                        placeholder="07..."
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black font-bold text-lg outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing || waitingForMpesa}
                                    className="w-full py-4 bg-[#4CAF50] hover:bg-[#43A047] text-white font-black uppercase tracking-wider rounded-xl shadow-lg shadow-green-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {waitingForMpesa ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Waiting for M-Pesa...
                                        </>
                                    ) : processing ? 'Processing...' : (
                                        <>
                                            Pay with M-Pesa <FiShare2 />
                                        </>
                                    )}
                                </button>

                                {waitingForMpesa && (
                                    <div className="space-y-3">
                                        <div className="text-xs text-center text-gray-500 animate-pulse">
                                            Enter your M-Pesa PIN on your phone to complete payment
                                        </div>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                setProcessing(true);
                                                try {
                                                    const res = await api.get(`/appointments/${appointment.id}`);
                                                    if (res && res.ok) {
                                                        const data = await res.json();
                                                        if (data.invoice?.status === 'paid' || data.invoice?.status === 'PAID') {
                                                            setSuccess(true);
                                                            setWaitingForMpesa(false);
                                                        } else {
                                                            alert('Payment not yet confirmed. Please complete the M-Pesa payment on your phone.');
                                                        }
                                                    }
                                                } catch (e) {
                                                    console.error(e);
                                                    alert('Failed to check payment status.');
                                                } finally {
                                                    setProcessing(false);
                                                }
                                            }}
                                            disabled={processing}
                                            className="w-full py-3 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-bold uppercase text-sm rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <FiCheckCircle />
                                            {processing ? 'Checking...' : 'Check Payment Status'}
                                        </button>
                                    </div>
                                )}
                            </form>
                        ) : (
                            <div className="text-center py-8 text-gray-500 text-sm">
                                {paymentMethod === 'card' ? 'Card payments coming soon.' : 'Please pay cash at the facility.'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
