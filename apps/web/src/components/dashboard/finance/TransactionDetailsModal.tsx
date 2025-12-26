import { Dialog } from '@headlessui/react';
import { FiX, FiDollarSign, FiCalendar, FiUser, FiFileText, FiMessageCircle, FiBriefcase } from 'react-icons/fi';

interface TransactionDetailsModalProps {
    transaction: any;
    onClose: () => void;
}

export default function TransactionDetailsModal({ transaction, onClose }: TransactionDetailsModalProps) {
    if (!transaction) return null;

    const invoice = transaction.invoice;
    const appointment = invoice?.appointment;
    const patient = appointment?.patient;
    const doctor = appointment?.doctor;

    return (
        <Dialog open={true} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-lg bg-white dark:bg-[#1A1A1A] rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                        <div>
                            <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                                <FiDollarSign className="text-green-500" />
                                Transaction Details
                            </h2>
                            <p className="text-xs text-gray-500">{transaction.reference || `TXN-${transaction.id}`}</p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                            <FiX />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Highlights */}
                        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-100 dark:border-green-900/30">
                            <div>
                                <p className="text-xs font-bold uppercase text-green-600 mb-1">Total Amount</p>
                                <p className="text-3xl font-black text-gray-900 dark:text-white">KES {Number(transaction.amount).toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold uppercase text-gray-500 mb-1">Source</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{transaction.source}</p>
                            </div>
                        </div>

                        {/* Invoice & Session Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Context</h3>

                            {invoice ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FiUser className="text-gray-400" />
                                            <span className="text-xs font-bold uppercase text-gray-500">Patient</span>
                                        </div>
                                        <p className="font-bold text-gray-900 dark:text-white truncate">
                                            {patient ? `${patient.fname} ${patient.lname}` : invoice.customerName || 'Unknown'}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FiBriefcase className="text-gray-400" />
                                            <span className="text-xs font-bold uppercase text-gray-500">Doctor</span>
                                        </div>
                                        <p className="font-bold text-gray-900 dark:text-white truncate">
                                            {doctor ? `Dr. ${doctor.fname || ''} ${doctor.lname || ''}` : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-center text-gray-500 italic">
                                    No invoice linked to this transaction.
                                </div>
                            )}

                            {appointment && (
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                    <div className="flex items-center gap-2 mb-2 text-blue-600">
                                        <FiMessageCircle />
                                        <span className="text-xs font-bold uppercase">Session Notes / Reason</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 italic">
                                        "{appointment.notes || appointment.reason || 'No specific notes recorded.'}"
                                    </p>
                                </div>
                            )}

                            <div className="flex items-center gap-2 text-xs text-gray-400 justify-center pt-2">
                                <FiCalendar />
                                <span>Recorded on {new Date(transaction.createdAt).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <button onClick={onClose} className="px-6 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-white font-bold rounded-xl transition">
                                Close
                            </button>
                        </div>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}
