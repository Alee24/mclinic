'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { FiFileText, FiActivity, FiUser, FiCalendar, FiClock, FiDownload } from 'react-icons/fi';

export default function MedicalRecordsPage() {
    const { user } = useAuth();
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecords = async () => {
            if (!user) return;
            try {
                const res = await api.get(`/medical-records/patient/${user.id}`);
                if (res && res.ok) {
                    const data = await res.json();
                    setRecords(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchRecords();
    }, [user]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black dark:text-white tracking-tight">Medical History</h1>
                    <p className="text-gray-500 mt-1">
                        Comprehensive record of your diagnoses, prescriptions, and doctor's notes.
                    </p>
                </div>
            </div>

            {/* Quick Stats */}
            {!loading && records.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-6 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-xl">
                                <FiFileText size={24} />
                            </div>
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Total Records</p>
                                <h3 className="text-2xl font-bold">{records.length}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 rounded-2xl bg-white dark:bg-[#121212] border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl">
                                <FiActivity size={24} />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Last Visit</p>
                                <h3 className="text-xl font-bold dark:text-white">
                                    {new Date(records[0]?.createdAt).toLocaleDateString()}
                                </h3>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 rounded-2xl bg-white dark:bg-[#121212] border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl">
                                <FiUser size={24} />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Primary Medic</p>
                                <h3 className="text-lg font-bold dark:text-white truncate max-w-[150px]">
                                    {records[0]?.doctor?.user?.fname ? `Dr. ${records[0].doctor.user.fname}` : 'Various'}
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Records List */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-48 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                    ))}
                </div>
            ) : records.length === 0 ? (
                <div className="bg-white dark:bg-[#121212] rounded-3xl border border-gray-200 dark:border-gray-800 p-16 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                        <FiFileText size={40} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Medical Records Yet</h3>
                    <p className="text-gray-500 max-w-md">
                        Your medical history is empty. Records created by doctors after your appointments will appear here automatically.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {records.map((rec) => (
                        <div key={rec.id} className="group relative bg-white dark:bg-[#121212] rounded-3xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 hover:shadow-xl transition-all duration-300">
                            <div className="absolute top-6 right-8 text-sm font-bold text-gray-400">
                                #{rec.id.toString().padStart(4, '0')}
                            </div>

                            <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-10">
                                {/* Date Badge */}
                                <div className="shrink-0 flex md:flex-col items-center gap-2 md:gap-1 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl min-w-[100px] text-center">
                                    <FiCalendar className="text-gray-400 mb-1" />
                                    <span className="text-lg font-black dark:text-white block">
                                        {new Date(rec.createdAt).getDate()}
                                    </span>
                                    <span className="text-xs font-bold uppercase text-gray-400 block">
                                        {new Date(rec.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' })}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 space-y-6">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full">
                                                Diagnosis
                                            </span>
                                            {rec.appointment && (
                                                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                                                    <FiCalendar className="mb-0.5" />
                                                    Session: {new Date(rec.appointment.appointment_date).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-xl md:text-2xl font-bold dark:text-white group-hover:text-primary transition-colors">
                                            {rec.diagnosis}
                                        </h3>
                                        <p className="text-sm font-medium text-gray-500 mt-2 flex items-center gap-2">
                                            <FiUser />
                                            Attended by {rec.doctor?.user?.fname ? `Dr. ${rec.doctor.user.fname} ${rec.doctor.user.lname}` : 'Unknown Medic'}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {rec.prescription && (
                                            <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl">
                                                <h4 className="text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    💊 Prescription
                                                </h4>
                                                <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-line">
                                                    {rec.prescription}
                                                </p>
                                            </div>
                                        )}

                                        {rec.notes && (
                                            <div className="bg-gray-50 dark:bg-gray-800/20 p-5 rounded-2xl">
                                                <h4 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    📝 Doctor's Notes
                                                </h4>
                                                <p className="text-gray-600 dark:text-gray-400 text-sm italic leading-relaxed">
                                                    "{rec.notes}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
