'use client';

import { useState, useEffect } from 'react';
import { FiShoppingBag, FiSearch, FiPackage, FiFilter, FiPlus, FiMinus, FiClock, FiCheckCircle, FiX } from 'react-icons/fi';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import PharmacyCheckoutModal from './PharmacyCheckoutModal';
import { useAuth } from '@/lib/auth';

export default function PatientPharmacyView() {
    const { user } = useAuth();
    const [medications, setMedications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'browse' | 'orders'>('browse');
    const [cart, setCart] = useState<any[]>([]);
    const [showCheckout, setShowCheckout] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        fetchMedications();
        fetchOrders();
    }, []);

    const fetchMedications = async () => {
        try {
            const res = await api.get('/pharmacy/medications');
            if (res?.ok) setMedications(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        if (!user?.id) return;
        try {
            const res = await api.get(`/pharmacy/orders/user/${user.id}`);
            if (res?.ok) setOrders(await res.json());
        } catch (err) {
            console.error(err);
        }
    };

    const addToCart = (med: any) => {
        const existing = cart.find(c => c.medicationId === med.id);
        if (existing) {
            if (existing.quantity >= med.stock) {
                toast.error('Max stock reached');
                return;
            }
            setCart(cart.map(c => c.medicationId === med.id ? { ...c, quantity: c.quantity + 1 } : c));
        } else {
            setCart([...cart, { medication: med, medicationId: med.id, quantity: 1, price: med.price }]);
        }
        toast.success(`Added ${med.name}`);
    };

    const removeFromCart = (medId: number) => {
        setCart(cart.filter(c => c.medicationId !== medId));
    };

    const updateQuantity = (medId: number, delta: number) => {
        setCart(cart.map(c => {
            if (c.medicationId === medId) {
                const newQty = Math.max(1, c.quantity + delta);
                if (newQty > c.medication.stock) {
                    toast.error('Max stock reached');
                    return c;
                }
                return { ...c, quantity: newQty };
            }
            return c;
        }));
    };

    const cartTotal = cart.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);

    const filteredMeds = medications.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 md:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black dark:text-white flex items-center gap-3">
                        <span className="p-3 bg-blue-500 rounded-2xl text-white shadow-lg shadow-blue-500/30">
                            <FiShoppingBag size={24} />
                        </span>
                        Pharmacy Store
                    </h1>
                    <p className="text-gray-500 mt-1 ml-16">Browse medications and order instantly.</p>
                </div>

                <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('browse')}
                        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'browse' ? 'bg-white dark:bg-gray-800 shadow-sm text-primary' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        Browse Store
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'orders' ? 'bg-white dark:bg-gray-800 shadow-sm text-primary' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                        My Orders
                    </button>
                </div>
            </div>

            {activeTab === 'browse' && (
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Store Grid */}
                    <div className="flex-1">
                        <div className="flex gap-4 mb-6">
                            <div className="relative flex-1">
                                <FiSearch className="absolute left-4 top-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search for medicines..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-gray-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="h-64 bg-gray-100 dark:bg-white/5 rounded-2xl"></div>
                                ))}
                            </div>
                        ) : filteredMeds.length === 0 ? (
                            <div className="text-center py-20 text-gray-400">
                                <FiPackage className="text-4xl mx-auto mb-4 opacity-50" />
                                <p>No medications found.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredMeds.map(med => (
                                    <div key={med.id} className="group bg-white dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-3xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                                        <div className="h-40 bg-gray-50 dark:bg-white/5 rounded-2xl mb-4 flex items-center justify-center overflow-hidden relative">
                                            {med.image_url ? (
                                                <img src={med.image_url} alt={med.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <FiPackage className="text-4xl text-gray-300" />
                                            )}
                                            {med.stock <= 0 && (
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                                    <span className="font-bold text-white text-sm bg-red-500 px-3 py-1 rounded-full">Out of Stock</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mb-4">
                                            <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{med.category}</div>
                                            <h3 className="font-bold text-lg dark:text-white line-clamp-1">{med.name}</h3>
                                            <p className="text-sm text-gray-500 line-clamp-2 mt-1 h-10">{med.description || 'No description available.'}</p>
                                        </div>

                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="font-black text-xl dark:text-white">
                                                <span className="text-xs text-gray-400 font-normal mr-1">KES</span>
                                                {Number(med.price).toLocaleString()}
                                            </div>
                                            <button
                                                onClick={() => addToCart(med)}
                                                disabled={med.stock <= 0}
                                                className="w-10 h-10 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <FiPlus />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Cart Sidebar */}
                    <div className="w-full lg:w-96 bg-white dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 h-fit sticky top-6 shadow-xl shadow-black/5">
                        <h2 className="font-bold text-xl dark:text-white mb-6 flex items-center gap-2">
                            <FiShoppingBag /> Your Cart ({cart.reduce((a, c) => a + c.quantity, 0)})
                        </h2>

                        {cart.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
                                <p className="text-gray-400 text-sm">Cart is empty</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                    {cart.map((item) => (
                                        <div key={item.medicationId} className="flex gap-3 items-center">
                                            <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-xl flex-shrink-0 overflow-hidden">
                                                {item.medication.image_url ? (
                                                    <img src={item.medication.image_url} alt="" className="w-full h-full object-cover" />
                                                ) : <div className="w-full h-full flex items-center justify-center text-gray-300"><FiPackage /></div>}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-sm dark:text-white line-clamp-1">{item.medication.name}</h4>
                                                <p className="text-xs text-gray-500">KES {Number(item.price).toLocaleString()}</p>
                                            </div>
                                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 rounded-lg p-1">
                                                <button onClick={() => updateQuantity(item.medicationId, -1)} className="w-6 h-6 flex items-center justify-center hover:bg-white dark:hover:bg-white/10 rounded-md transition-colors text-xs disabled:opacity-30" disabled={item.quantity <= 1}>
                                                    <FiMinus />
                                                </button>
                                                <span className="text-xs font-bold w-4 text-center dark:text-white">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.medicationId, 1)} className="w-6 h-6 flex items-center justify-center hover:bg-white dark:hover:bg-white/10 rounded-md transition-colors text-xs">
                                                    <FiPlus />
                                                </button>
                                            </div>
                                            <button onClick={() => removeFromCart(item.medicationId)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                <FiX />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="font-bold dark:text-white">KES {cartTotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Delivery Est.</span>
                                        <span className="font-bold dark:text-white">KES 200</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-black text-primary pt-2">
                                        <span>Total</span>
                                        <span>KES {(cartTotal + 200).toLocaleString()}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowCheckout(true)}
                                    className="w-full py-4 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    Proceed to Checkout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'orders' && (
                <div className="max-w-4xl mx-auto">
                    <h2 className="font-bold text-xl dark:text-white mb-6">Order History</h2>
                    {orders.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-gray-800">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                <FiClock size={24} />
                            </div>
                            <p className="text-gray-500">No past orders found.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div key={order.id} className="bg-white dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center font-bold text-lg">
                                                #{order.id.slice(0, 4)}
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Order ID: {order.id}</p>
                                                <p className="font-bold dark:text-white text-lg">KES {Number(order.totalAmount).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            {order.status}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-black/20 rounded-xl p-4 mb-4">
                                        <div className="space-y-2">
                                            {order.items?.map((item: any, i: number) => (
                                                <div key={i} className="flex justify-between text-sm">
                                                    <span className="text-gray-600 dark:text-gray-300">
                                                        <span className="font-bold mr-2">{item.quantity}x</span>
                                                        {item.medicationName}
                                                    </span>
                                                    <span className="font-bold dark:text-gray-400">KES {Number(item.subtotal).toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1"><FiClock /> {new Date(order.createdAt).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1"><FiCheckCircle /> {order.paymentMethod}</span>
                                            {order.invoice && (
                                                <a
                                                    href={`/dashboard/invoices`}
                                                    className="flex items-center gap-1 text-primary hover:underline font-bold"
                                                >
                                                    <FiPackage /> Invoice #{order.invoice.invoiceNumber}
                                                </a>
                                            )}
                                        </div>
                                        <div>
                                            {order.deliveryAddress && <span className="flex items-center gap-1"><FiPackage /> To: {order.deliveryCity}</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {showCheckout && (
                <PharmacyCheckoutModal
                    items={cart}
                    user={user}
                    onClose={() => setShowCheckout(false)}
                    onSuccess={() => {
                        setCart([]);
                        setShowCheckout(false);
                        setActiveTab('orders');
                        fetchOrders();
                        fetchMedications(); // Update stock view
                    }}
                />
            )}
        </div>
    );
}
