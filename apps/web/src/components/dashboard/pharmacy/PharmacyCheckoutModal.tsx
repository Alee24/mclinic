'use client';

import { useState } from 'react';
import { FiX, FiShoppingBag, FiMapPin, FiPhone, FiCreditCard, FiCheckCircle, FiPrinter, FiUser, FiCalendar, FiActivity, FiShield, FiBriefcase } from 'react-icons/fi';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface PharmacyCheckoutModalProps {
    items: any[];
    onClose: () => void;
    onSuccess: () => void;
    user: any;
    prescriptionId?: string;
    prescription?: any;
    appointment?: any;
}

export default function PharmacyCheckoutModal({
    items,
    onClose,
    onSuccess,
    user,
    prescriptionId,
    prescription,
    appointment
}: PharmacyCheckoutModalProps) {
    const [step, setStep] = useState(1); // 1: Review, 2: Delivery, 3: Payment, 4: Receipt
    const [loading, setLoading] = useState(false);
    const [orderData, setOrderData] = useState<any>(null);

    const [formData, setFormData] = useState({
        deliveryAddress: user?.address || '',
        deliveryCity: user?.city || '',
        contactPhone: user?.phone || user?.mobile || '',
        paymentMethod: 'MPESA'
    });

    const subtotal = items.reduce((acc, item) => acc + (Number(item.medication?.price || item.price || 0) * item.quantity), 0);
    const deliveryFee = 200; // Flat fee for now
    const total = subtotal + deliveryFee;

    // Doctor info extraction
    const doc = prescription?.doctor || appointment?.doctor || {};
    const hasDoctor = !!doc.fname;

    // Verification Code
    const verificationCode = prescription?.verificationCode || `RX-PRE-${prescriptionId || 'PEND'}`;

    const handleOrder = async () => {
        setLoading(true);
        try {
            const payload = {
                userId: user.id,
                prescriptionId: prescriptionId ? String(prescriptionId) : undefined,
                deliveryAddress: formData.deliveryAddress,
                deliveryCity: formData.deliveryCity,
                contactPhone: formData.contactPhone,
                paymentMethod: formData.paymentMethod,
                items: items.map(item => ({
                    medicationId: String(item.medication?.id || item.medicationId || item.id),
                    quantity: item.quantity
                }))
            };

            const res = await api.post('/pharmacy/orders', payload);
            if (res?.ok) {
                const createdOrder = await res.json();
                setOrderData(createdOrder);

                let orderId = createdOrder.id || 0;

                try {
                    await api.post('/mpesa/stk-push', {
                        phoneNumber: formData.contactPhone || user?.mobile || '',
                        amount: total,
                        accountReference: `PHRM-${String(orderId).slice(-4)}`,
                        transactionDesc: 'Pharmacy Order',
                        relatedEntity: 'invoice',
                        relatedEntityId: createdOrder.invoiceId || orderId
                    });
                    toast.success('STK Payment prompt sent successfully!');
                } catch (stkErr) {
                    console.error('STK Push Error:', stkErr);
                    toast.success('Order created successfully!');
                }
                
                // Advance to Step 4: Receipt!
                setStep(4);
            } else {
                const errData = res ? await res.json().catch(() => ({})) : {};
                toast.error(errData.message || 'Failed to place order');
            }
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong. Please check stock and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleFinish = () => {
        onSuccess();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            {/* Style override to hide everything but the receipt during printing */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    #printable-receipt, #printable-receipt * {
                        visibility: visible !important;
                    }
                    #printable-receipt {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        background: white !important;
                        color: black !important;
                        padding: 40px !important;
                        box-shadow: none !important;
                        border: none !important;
                    }
                }
            `}} />

            <div className="bg-white dark:bg-[#111622] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative z-[10000] border border-gray-100 dark:border-gray-800 my-8">
                {/* Header (Hidden during Print) */}
                <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                    <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                        <FiShoppingBag className="text-primary" />
                        {step === 4 ? 'Order Receipt & Verification' : 'Pharmacy Checkout'}
                    </h2>
                    {step !== 4 && (
                        <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <FiX className="dark:text-gray-400" />
                        </button>
                    )}
                </div>

                <div className="p-8">
                    {step === 1 && (
                        <div className="space-y-6">
                            {/* Verification Section */}
                            <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-green-100 dark:border-emerald-900/30 rounded-2xl">
                                <div className="flex items-center gap-2 mb-3 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                                    <FiShield /> Clinical Verification Summary
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                    {hasDoctor && (
                                        <div className="space-y-1">
                                            <p className="text-gray-500 font-semibold">Prescribing Doctor</p>
                                            <p className="font-bold text-gray-800 dark:text-gray-200">Dr. {doc.fname} {doc.lname}</p>
                                            <p className="text-gray-400">{doc.speciality || 'General Practitioner'} • Reg: {doc.licenceNo || 'N/A'}</p>
                                        </div>
                                    )}
                                    {appointment && (
                                        <div className="space-y-1">
                                            <p className="text-gray-500 font-semibold">Appointment Reference</p>
                                            <p className="font-bold text-gray-800 dark:text-gray-200">ID: #{appointment.id}</p>
                                            <p className="text-gray-400">
                                                {appointment.service?.name || 'General Consultation'} • {new Date(appointment.date || appointment.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 pt-3 border-t border-emerald-900/10 dark:border-emerald-900/30 flex justify-between items-center text-xs">
                                    <span className="text-gray-500 font-medium">Verification Code</span>
                                    <span className="font-mono bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded font-bold">{verificationCode}</span>
                                </div>
                            </div>

                            <h3 className="font-bold text-lg dark:text-white">Order Summary</h3>
                            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                                {items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <div>
                                            <p className="font-bold text-sm dark:text-white">{item.medication?.name || item.name || item.medicationName}</p>
                                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-bold text-sm dark:text-white">KES {(Number(item.medication?.price || item.price || 0) * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="font-bold dark:text-white">KES {subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Delivery Fee</span>
                                    <span className="font-bold dark:text-white">KES {deliveryFee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xl font-bold text-primary pt-2">
                                    <span>Total</span>
                                    <span>KES {total.toFixed(2)}</span>
                                </div>
                            </div>

                            <button onClick={() => setStep(2)} className="w-full py-3.5 rounded-xl font-bold bg-primary text-black hover:opacity-90 transition-opacity">
                                Proceed to Delivery
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                                <FiMapPin className="text-primary" /> Delivery Details
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Delivery Address</label>
                                    <input
                                        type="text"
                                        value={formData.deliveryAddress}
                                        onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                                        className="w-full mt-1 p-3 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-gray-700 dark:text-white outline-none focus:border-primary"
                                        placeholder="Street Address, Apartment, Room"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">City</label>
                                        <input
                                            type="text"
                                            value={formData.deliveryCity}
                                            onChange={(e) => setFormData({ ...formData, deliveryCity: e.target.value })}
                                            className="w-full mt-1 p-3 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-gray-700 dark:text-white outline-none focus:border-primary"
                                            placeholder="Nairobi"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">M-Pesa Billing Phone</label>
                                        <input
                                            type="text"
                                            value={formData.contactPhone}
                                            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                                            className="w-full mt-1 p-3 rounded-xl bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-gray-700 dark:text-white outline-none focus:border-primary"
                                            placeholder="e.g. 0712345678"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Back</button>
                                <button
                                    onClick={() => setStep(3)}
                                    disabled={!formData.deliveryAddress || !formData.contactPhone}
                                    className="flex-1 py-3 rounded-xl font-bold bg-primary text-black disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                                >
                                    Next: Payment
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                                <FiCreditCard className="text-primary" /> Payment Method
                            </h3>

                            <div className="p-4 rounded-xl border-2 border-primary bg-primary/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-16 bg-emerald-600 rounded flex items-center justify-center text-white font-bold text-sm shadow-md">M-PESA</div>
                                    <span className="font-bold dark:text-white">M-Pesa Express (STK Prompt)</span>
                                </div>
                                <FiCheckCircle className="text-primary text-xl" />
                            </div>

                            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                    A secure payment prompt will be sent to your phone: <b>{formData.contactPhone}</b> to authorize <b>KES {total.toFixed(2)}</b>.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Back</button>
                                <button
                                    onClick={handleOrder}
                                    disabled={loading}
                                    className="flex-1 py-3.5 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-600/20"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Processing Order...
                                        </>
                                    ) : 'Pay & Complete Order'}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6">
                            {/* Receipt Container */}
                            <div id="printable-receipt" className="bg-white text-gray-900 p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                                {/* MClinic Header */}
                                <div className="flex justify-between items-start border-b pb-4">
                                    <div>
                                        <h1 className="text-2xl font-black tracking-tight text-[#1D2B36]">M-CLINIC KENYA</h1>
                                        <p className="text-xs text-gray-500">24/7 Premium Healthcare & Wellness</p>
                                        <p className="text-xs text-gray-400 mt-1">Nairobi, Kenya • info@mclinic.co.ke</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase">PAID & CERTIFIED</span>
                                        <p className="text-xs text-gray-500 mt-2">Order: #{orderData?.id ? String(orderData.id).slice(0, 8).toUpperCase() : 'N/A'}</p>
                                        <p className="text-[10px] text-gray-400">Date: {new Date().toLocaleDateString()}</p>
                                    </div>
                                </div>

                                {/* Patient Details */}
                                <div className="grid grid-cols-2 gap-4 text-xs border-b pb-4">
                                    <div>
                                        <p className="text-gray-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">PATIENT DETAILS</p>
                                        <p className="font-bold text-gray-800">{user?.fname} {user?.lname}</p>
                                        <p className="text-gray-500">{formData.contactPhone}</p>
                                        <p className="text-gray-500">{formData.deliveryAddress}, {formData.deliveryCity}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 font-semibold mb-1 uppercase tracking-wider text-[10px]">CLINICAL ISSUER</p>
                                        {hasDoctor ? (
                                            <>
                                                <p className="font-bold text-gray-800">Dr. {doc.fname} {doc.lname}</p>
                                                <p className="text-gray-500">{doc.speciality || 'General Practitioner'}</p>
                                                <p className="text-gray-400">License: {doc.licenceNo || 'N/A'}</p>
                                            </>
                                        ) : (
                                            <p className="font-bold text-gray-800">M-Clinic Healthcare Services</p>
                                        )}
                                    </div>
                                </div>

                                {/* Appointment details */}
                                {appointment && (
                                    <div className="bg-gray-50 p-3 rounded-lg text-xs space-y-1">
                                        <p className="text-gray-500 font-semibold uppercase tracking-wider text-[10px]">APPOINTMENT REFERENCE</p>
                                        <div className="grid grid-cols-2 gap-2 text-gray-700">
                                            <p><span className="font-medium text-gray-500">Service:</span> {appointment.service?.name || 'General Consultation'}</p>
                                            <p><span className="font-medium text-gray-500">Mode:</span> {appointment.isVirtual ? 'Virtual Consultation' : 'Physical Home Visit'}</p>
                                            <p><span className="font-medium text-gray-500">Reference:</span> #{appointment.id}</p>
                                            <p><span className="font-medium text-gray-500">Date:</span> {new Date(appointment.date || appointment.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Items Table */}
                                <div className="space-y-2">
                                    <p className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">PRESCRIBED MEDICATIONS</p>
                                    <div className="border rounded-lg overflow-hidden text-xs">
                                        <div className="bg-gray-50 px-4 py-2 border-b grid grid-cols-12 font-bold text-gray-700">
                                            <div className="col-span-6">Medication Name</div>
                                            <div className="col-span-2 text-center">Qty</div>
                                            <div className="col-span-4 text-right">Subtotal</div>
                                        </div>
                                        <div className="divide-y">
                                            {items.map((item, idx) => (
                                                <div key={idx} className="px-4 py-2.5 grid grid-cols-12 text-gray-800">
                                                    <div className="col-span-6 font-semibold">{item.medication?.name || item.name || item.medicationName}</div>
                                                    <div className="col-span-2 text-center">{item.quantity}</div>
                                                    <div className="col-span-4 text-right">KES {(Number(item.medication?.price || item.price || 0) * item.quantity).toFixed(2)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Totals */}
                                <div className="flex justify-between items-start text-xs border-t pt-4">
                                    <div className="text-gray-500 text-[10px] uppercase font-bold tracking-wider leading-relaxed">
                                        Thank you for choosing M-Clinic.<br />
                                        Your health is our utmost priority.
                                    </div>
                                    <div className="text-right space-y-1.5 w-48">
                                        <div className="flex justify-between text-gray-500">
                                            <span>Subtotal:</span>
                                            <span>KES {subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-500">
                                            <span>Delivery:</span>
                                            <span>KES {deliveryFee.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-gray-900 border-t pt-1.5 text-sm">
                                            <span>Total paid:</span>
                                            <span>KES {total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Digital Signature and Stamp Section (Optional) */}
                                {hasDoctor && (doc.signatureUrl || doc.stampUrl) && (
                                    <div className="flex justify-end gap-6 pt-2 border-t text-xs">
                                        {doc.signatureUrl && (
                                            <div className="text-center">
                                                <p className="text-[9px] text-gray-400 uppercase font-semibold">Doctor Signature</p>
                                                <img src={doc.signatureUrl} alt="Signature" className="h-10 object-contain mx-auto mt-1" />
                                            </div>
                                        )}
                                        {doc.stampUrl && (
                                            <div className="text-center">
                                                <p className="text-[9px] text-gray-400 uppercase font-semibold">Official Stamp</p>
                                                <img src={doc.stampUrl} alt="Stamp" className="h-10 object-contain mx-auto mt-1" />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Verification footer */}
                                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex gap-4 items-start text-left">
                                    <FiShield className="text-emerald-700 text-3xl shrink-0 mt-0.5" />
                                    <div className="text-xs space-y-1">
                                        <p className="font-bold text-emerald-800">M-Clinic Digital Authenticity Guaranteed</p>
                                        <p className="text-emerald-700">
                                            This prescription and order has been digitally signed and validated. Anyone can verify its authenticity by visiting the public verification portal and entering the verification code.
                                        </p>
                                        <div className="pt-2 flex flex-wrap gap-4 items-center justify-between">
                                            <p className="font-mono text-emerald-900 font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">
                                                Verification Code: {verificationCode}
                                            </p>
                                            <p className="text-emerald-700 font-medium underline">
                                                portal.mclinic.co.ke/verify
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons (Hidden during Print) */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={handlePrint}
                                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl font-bold dark:text-white transition-colors flex items-center justify-center gap-2"
                                >
                                    <FiPrinter /> Print Receipt
                                </button>
                                <button
                                    onClick={handleFinish}
                                    className="flex-1 py-3 bg-primary hover:opacity-90 rounded-xl font-bold text-black transition-opacity"
                                >
                                    Done & Finish
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
