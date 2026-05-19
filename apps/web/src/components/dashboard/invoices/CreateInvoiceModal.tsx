'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FiX, FiSearch, FiCheck, FiUser, FiBriefcase, FiPlus, FiTrash2 } from 'react-icons/fi';

interface User {
    id: number;
    email: string;
    fname: string;
    lname: string;
    role: string;
    mobile?: string;
}

interface Doctor {
    id: number;
    fname: string;
    lname: string;
    email: string;
    dr_type: string;
    speciality?: string;
}

interface InvoiceItemState {
    id: string;
    type: 'custom' | 'lab' | 'pharmacy';
    description: string;
    quantity: number;
    unitPrice: number;
    itemId?: number;
}

interface CreateInvoiceModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateInvoiceModal({ onClose, onSuccess }: CreateInvoiceModalProps) {
    // Data State
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
    
    // New Data State
    const [labTests, setLabTests] = useState<any[]>([]);
    const [medications, setMedications] = useState<any[]>([]);

    // Selection State
    const [selectedPatient, setSelectedPatient] = useState<User | null>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [isNewUser, setIsNewUser] = useState(false);

    // Form State
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [doctorSearchTerm, setDoctorSearchTerm] = useState('');
    const [newUserForm, setNewUserForm] = useState({ fname: '', lname: '', email: '', mobile: '' });
    
    const [items, setItems] = useState<InvoiceItemState[]>([
        { id: Date.now().toString(), type: 'custom', description: '', quantity: 1, unitPrice: 0 }
    ]);
    
    const [dueDate, setDueDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);

    // Fetch Initial Data
    useEffect(() => {
        const loadData = async () => {
            setDataLoading(true);
            try {
                const [usersRes, doctorsRes, labsRes, medsRes] = await Promise.all([
                    api.get('/users').catch(() => null),
                    api.get('/doctors/admin/all').catch(() => null),
                    api.get('/laboratory/tests').catch(() => null),
                    api.get('/pharmacy/medications').catch(() => null)
                ]);

                if (usersRes?.ok) {
                    const users = await usersRes.json();
                    setAllUsers(users);
                    setFilteredUsers(users.slice(0, 5)); // Initial display
                }

                if (doctorsRes?.ok) {
                    const doctors = await doctorsRes.json();
                    setAllDoctors(doctors);
                    setFilteredDoctors(doctors);
                }

                if (labsRes?.ok) {
                    const tests = await labsRes.json();
                    setLabTests(tests);
                }

                if (medsRes?.ok) {
                    const meds = await medsRes.json();
                    setMedications(meds);
                }
            } catch (e) {
                console.error("Failed to load users/doctors", e);
            } finally {
                setDataLoading(false);
            }
        };
        loadData();
    }, []);

    // Filter Users
    useEffect(() => {
        if (!userSearchTerm) {
            setFilteredUsers(allUsers.slice(0, 5));
            return;
        }
        const lower = userSearchTerm.toLowerCase();
        const results = allUsers.filter(u =>
            (u.fname?.toLowerCase().includes(lower)) ||
            (u.lname?.toLowerCase().includes(lower)) ||
            (u.email?.toLowerCase().includes(lower))
        );
        setFilteredUsers(results.slice(0, 10));
    }, [userSearchTerm, allUsers]);

    // Filter Doctors
    useEffect(() => {
        if (!doctorSearchTerm) {
            setFilteredDoctors(allDoctors);
            return;
        }
        const lower = doctorSearchTerm.toLowerCase();
        const results = allDoctors.filter(d =>
            (d.fname?.toLowerCase().includes(lower)) ||
            (d.lname?.toLowerCase().includes(lower)) ||
            (d.speciality?.toLowerCase().includes(lower))
        );
        setFilteredDoctors(results);
    }, [doctorSearchTerm, allDoctors]);

    const handleCreateInvoice = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
            
            const payload = {
                customerEmail: isNewUser ? newUserForm.email : selectedPatient?.email,
                customerName: isNewUser ? `${newUserForm.fname} ${newUserForm.lname}` : `${selectedPatient?.fname} ${selectedPatient?.lname}`,
                doctorId: selectedDoctor?.id,
                totalAmount: totalAmount,
                dueDate: dueDate || new Date().toISOString(),
                status: 'pending',
                items: items.filter(i => i.description.trim() !== '').map(i => ({
                    description: i.description,
                    quantity: i.quantity,
                    unitPrice: i.unitPrice
                }))
            };

            const res = await api.post('/financial/invoices', payload);
            if (res?.ok) {
                alert('Invoice created successfully!');
                onSuccess();
            } else {
                alert('Failed to create invoice');
            }
        } catch (error) {
            console.error(error);
            alert('Error creating invoice');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-[#1A1A1A] z-10">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Create New Invoice</h2>
                        <p className="text-sm text-gray-500">Generate a billing request for a patient.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <FiX size={24} className="text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    <form onSubmit={handleCreateInvoice} className="space-y-8">

                        {/* Section 1: Patient Selection */}
                        <section>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 block">1. Select Patient</label>

                            {/* Toggle */}
                            <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit mb-6">
                                <button
                                    type="button"
                                    onClick={() => setIsNewUser(false)}
                                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${!isNewUser ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    Existing User
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setIsNewUser(true); setSelectedPatient(null); }}
                                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${isNewUser ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    Guest / New
                                </button>
                            </div>

                            {!isNewUser ? (
                                <div className="space-y-4">
                                    {!selectedPatient ? (
                                        <>
                                            <div className="relative">
                                                <div className="absolute left-4 top-3.5 text-gray-400">
                                                    <FiSearch />
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Search by name or email..."
                                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-donezo-dark focus:bg-white dark:focus:bg-black rounded-xl transition-all outline-none font-medium"
                                                    value={userSearchTerm}
                                                    onChange={(e) => setUserSearchTerm(e.target.value)}
                                                />
                                            </div>

                                            <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden max-h-[300px] overflow-y-auto">
                                                {dataLoading ? (
                                                    <div className="p-8 text-center text-gray-500">Loading patients...</div>
                                                ) : filteredUsers.length === 0 ? (
                                                    <div className="p-8 text-center text-gray-500">No patients found.</div>
                                                ) : (
                                                    filteredUsers.map(user => (
                                                        <div
                                                            key={user.id}
                                                            onClick={() => setSelectedPatient(user)}
                                                            className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-50 dark:border-gray-800 last:border-0 transition-colors group"
                                                        >
                                                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center font-bold">
                                                                {user.fname?.[0] || 'U'}
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{user.fname} {user.lname}</h4>
                                                                <p className="text-xs text-gray-500">{user.email}</p>
                                                            </div>
                                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{user.role}</div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 p-4 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-100 flex items-center justify-center text-xl">
                                                    <FiCheck />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-1">Selected Patient</p>
                                                    <h3 className="font-black text-lg text-gray-900 dark:text-white">{selectedPatient.fname} {selectedPatient.lname}</h3>
                                                    <p className="text-sm text-gray-500">{selectedPatient.email}</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedPatient(null)}
                                                className="px-4 py-2 bg-white dark:bg-black text-gray-900 dark:text-white font-bold text-sm rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                            >
                                                Change
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-left-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-2">First Name</label>
                                        <input
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                                            placeholder="John"
                                            required={isNewUser}
                                            onChange={e => setNewUserForm({ ...newUserForm, fname: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-2">Last Name</label>
                                        <input
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                                            placeholder="Doe"
                                            required={isNewUser}
                                            onChange={e => setNewUserForm({ ...newUserForm, lname: e.target.value })}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                                            placeholder="john@example.com"
                                            required={isNewUser}
                                            onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}
                        </section>

                        <hr className="border-gray-100 dark:border-gray-800" />

                        {/* Section 2: Doctor Selection */}
                        <section>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 block">2. Assign Doctor (Optional)</label>

                            {!selectedDoctor ? (
                                <div className="relative group">
                                    <div className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                        <FiBriefcase />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search doctor to assign..."
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-black rounded-xl transition-all outline-none font-medium"
                                        value={doctorSearchTerm}
                                        onChange={(e) => setDoctorSearchTerm(e.target.value)}
                                    />

                                    {/* Dropdown list that appears when typing or focused could be better, but inline list works for now */}
                                    {doctorSearchTerm && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl max-h-[200px] overflow-y-auto z-20">
                                            {filteredDoctors.map(doc => (
                                                <div
                                                    key={doc.id}
                                                    onClick={() => { setSelectedDoctor(doc); setDoctorSearchTerm(''); }}
                                                    className="p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer flex items-center justify-between"
                                                >
                                                    <span className="font-bold">Dr. {doc.fname} {doc.lname}</span>
                                                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{doc.dr_type}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 p-4 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-100 flex items-center justify-center text-xl">
                                            👨‍⚕️
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Assigned Doctor</p>
                                            <h3 className="font-black text-lg text-gray-900 dark:text-white">Dr. {selectedDoctor.fname} {selectedDoctor.lname}</h3>
                                            <p className="text-sm text-gray-500">{selectedDoctor.dr_type}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedDoctor(null)}
                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <FiX size={20} />
                                    </button>
                                </div>
                            )}

                            {/* Logic to show list if no doctor selected and no search term yet, maybe just first few? */}
                            {!selectedDoctor && !doctorSearchTerm && (
                                <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                                    {filteredDoctors.slice(0, 4).map(doc => (
                                        <button
                                            key={doc.id}
                                            type="button"
                                            onClick={() => setSelectedDoctor(doc)}
                                            className="flex-shrink-0 px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            Dr. {doc.fname} {doc.lname}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </section>

                        <hr className="border-gray-100 dark:border-gray-800" />

                        {/* Section 3: Invoice Details */}
                        <section>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 block">3. Invoice Details</label>

                            <div className="space-y-4">
                                {items.map((item, index) => (
                                    <div key={item.id} className="grid grid-cols-12 gap-3 items-end p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <div className="col-span-12 md:col-span-3">
                                            <label className="block text-xs font-bold mb-1">Type</label>
                                            <select
                                                className="w-full px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                                                value={item.type}
                                                onChange={(e) => {
                                                    const newItems = [...items];
                                                    newItems[index].type = e.target.value as any;
                                                    newItems[index].description = '';
                                                    newItems[index].unitPrice = 0;
                                                    setItems(newItems);
                                                }}
                                            >
                                                <option value="custom">Custom Service</option>
                                                <option value="lab">Lab Test</option>
                                                <option value="pharmacy">Pharmacy / Medicine</option>
                                            </select>
                                        </div>

                                        <div className="col-span-12 md:col-span-4">
                                            <label className="block text-xs font-bold mb-1">Description / Item</label>
                                            {item.type === 'custom' ? (
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                                                    value={item.description}
                                                    onChange={(e) => {
                                                        const newItems = [...items];
                                                        newItems[index].description = e.target.value;
                                                        setItems(newItems);
                                                    }}
                                                />
                                            ) : item.type === 'lab' ? (
                                                <select
                                                    required
                                                    className="w-full px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                                                    value={item.itemId || ''}
                                                    onChange={(e) => {
                                                        const testId = Number(e.target.value);
                                                        const selected = labTests.find(t => t.id === testId);
                                                        const newItems = [...items];
                                                        newItems[index].itemId = testId;
                                                        if (selected) {
                                                            newItems[index].description = selected.name;
                                                            newItems[index].unitPrice = Number(selected.price || 0);
                                                        }
                                                        setItems(newItems);
                                                    }}
                                                >
                                                    <option value="" disabled>Select Lab Test...</option>
                                                    {labTests.map(t => (
                                                        <option key={t.id} value={t.id}>{t.name} (KES {t.price})</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <select
                                                    required
                                                    className="w-full px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                                                    value={item.itemId || ''}
                                                    onChange={(e) => {
                                                        const medId = Number(e.target.value);
                                                        const selected = medications.find(m => m.id === medId);
                                                        const newItems = [...items];
                                                        newItems[index].itemId = medId;
                                                        if (selected) {
                                                            newItems[index].description = selected.name;
                                                            newItems[index].unitPrice = Number(selected.price || 0);
                                                        }
                                                        setItems(newItems);
                                                    }}
                                                >
                                                    <option value="" disabled>Select Medicine...</option>
                                                    {medications.map(m => (
                                                        <option key={m.id} value={m.id}>{m.name} - {m.strength} (KES {m.price})</option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>

                                        <div className="col-span-6 md:col-span-2">
                                            <label className="block text-xs font-bold mb-1">Qty</label>
                                            <input
                                                type="number"
                                                min="1"
                                                required
                                                className="w-full px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                                                value={item.quantity}
                                                onChange={(e) => {
                                                    const newItems = [...items];
                                                    newItems[index].quantity = Number(e.target.value);
                                                    setItems(newItems);
                                                }}
                                            />
                                        </div>

                                        <div className="col-span-5 md:col-span-2">
                                            <label className="block text-xs font-bold mb-1">Price (KES)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                required
                                                className="w-full px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono"
                                                value={item.unitPrice}
                                                onChange={(e) => {
                                                    const newItems = [...items];
                                                    newItems[index].unitPrice = Number(e.target.value);
                                                    setItems(newItems);
                                                }}
                                            />
                                        </div>

                                        <div className="col-span-1 md:col-span-1 flex justify-end pb-1">
                                            {items.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setItems(items.filter((_, i) => i !== index))}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={() => setItems([...items, { id: Date.now().toString(), type: 'custom', description: '', quantity: 1, unitPrice: 0 }])}
                                    className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    <FiPlus /> Add Another Item
                                </button>
                            </div>

                            <div className="mt-6 flex justify-between items-center border-t border-gray-100 dark:border-gray-800 pt-6">
                                <div>
                                    <label className="block text-xs font-bold mb-1 uppercase tracking-wider text-gray-500">Due Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-green-500/20 font-medium text-sm"
                                        value={dueDate}
                                        onChange={e => setDueDate(e.target.value)}
                                    />
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Amount</div>
                                    <div className="text-2xl font-black text-[#0B6E40] font-mono">
                                        KES {items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Footer Buttons */}
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-8 py-4 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || (!selectedPatient && !isNewUser)}
                                className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black font-black rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                            >
                                {loading ? 'Creating...' : 'Create Invoice'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
