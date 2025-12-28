'use client';

import { useState } from 'react';
import { FiX, FiShoppingBag, FiMapPin, FiPhone, FiCreditCard, FiCheckCircle } from 'react-icons/fi';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface PharmacyCheckoutModalProps {
    items: any[];
    onClose: () => void;
    onSuccess: () => void;
    user: any;
    prescriptionId?: string;
}

export default function PharmacyCheckoutModal({ items, onClose, onSuccess, user, prescriptionId }: PharmacyCheckoutModalProps) {
    const [step, setStep] = useState(1); // 1: Review, 2: Delivery, 3: Payment
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        deliveryAddress: user?.address || '',
        deliveryCity: user?.city || '',
        contactPhone: user?.phone || '',
        paymentMethod: 'MPESA'
    });

    const subtotal = items.reduce((acc, item) => acc + (Number(item.medication?.price || item.price || 0) * item.quantity), 0);
    const deliveryFee = 200; // Flat fee for now
    const total = subtotal + deliveryFee;

    const handleOrder = async () => {
        setLoading(true);
        try {
            const payload = {
                userId: user.id,
                prescriptionId,
                ...formData,
                items: items.map(item => ({
                    medicationId: item.medication?.id || item.medicationId,
                    quantity: item.quantity
                }))
            };

            const res = await api.post('/pharmacy/orders', payload);
            if (res?.ok) {
                toast.success('Order placed successfully!');
                onSuccess();
                onClose();
            } else {
                toast.error('Failed to place order');
            }
        } catch (err) {
            console.error(err);
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative z-[10000]">
                <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                    <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                        <FiShoppingBag className="text-primary" />
                        Pharmacy Checkout
                    </h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <FiX />
                    </button>
                </div>

                <div className="p-8">
                    {step === 1 && (
                        <div className="space-y-6">
                            <h3 className="font-bold text-lg dark:text-white">Order Summary</h3>
                            <div className="space-y-3">
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
                            <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="font-bold dark:text-white">KES {subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Delivery Fee</span>
                                <span className="font-bold dark:text-white">KES {deliveryFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xl font-bold text-primary">
                                <span>Total</span>
                                <span>KES {total.toFixed(2)}</span>
                            </div>
                            <button onClick={() => setStep(2)} className="w-full py-3 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                                Proceed to Delivery
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                                <FiMapPin /> Delivery Details
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Delivery Address</label>
                                    <input
                                        type="text"
                                        value={formData.deliveryAddress}
                                        onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                                        className="w-full mt-1 p-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700"
                                        placeholder="Enter your street address"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">City</label>
                                        <input
                                            type="text"
                                            value={formData.deliveryCity}
                                            onChange={(e) => setFormData({ ...formData, deliveryCity: e.target.value })}
                                            className="w-full mt-1 p-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700"
                                            placeholder="City"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Phone</label>
                                        <input
                                            type="text"
                                            value={formData.contactPhone}
                                            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                                            className="w-full mt-1 p-3 rounded-xl bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-700"
                                            placeholder="+254..."
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">Back</button>
                                <button
                                    onClick={() => setStep(3)}
                                    disabled={!formData.deliveryAddress || !formData.contactPhone}
                                    className="flex-1 py-3 rounded-xl font-bold bg-primary text-white shadow-lg disabled:opacity-50"
                                >
                                    Next: Payment
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                                <FiCreditCard /> Payment Method
                            </h3>

                            <div className="p-4 rounded-xl border-2 border-primary bg-primary/5 cursor-pointer flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-16 bg-green-500 rounded flex items-center justify-center text-white font-bold text-sm">M-PESA</div>
                                    <span className="font-bold dark:text-white">M-Pesa Express</span>
                                </div>
                                <FiCheckCircle className="text-primary text-xl" />
                            </div>

                            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-500 text-center">
                                    A prompt will be sent to <b>{formData.contactPhone}</b> to pay <b>KES {total.toFixed(2)}</b>.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">Back</button>
                                <button
                                    onClick={handleOrder}
                                    disabled={loading}
                                    className="flex-1 py-3 rounded-xl font-bold bg-green-600 text-white shadow-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Processing...' : 'Pay & Order'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
