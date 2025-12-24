'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { FiUser, FiMapPin, FiAward, FiCheckCircle, FiAlertCircle, FiDollarSign, FiBriefcase, FiClock, FiPhone } from 'react-icons/fi';

export default function DoctorDetailsPage() {
    const params = useParams();
    const [doctor, setDoctor] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'profile' | 'schedule' | 'reviews'>('profile');

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const res = await api.get(`/doctors/${params.id}`);
                if (res && res.ok) {
                    setDoctor(await res.json());
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) fetchDoctor();
    }, [params.id]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading doctor profile...</div>;
    if (!doctor) return <div className="p-8 text-center text-red-500">Doctor not found</div>;

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-6 items-start">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-4xl font-bold text-primary overflow-hidden">
                    {/* Placeholder for now, later use doc.profile_image */}
                    {doctor.fname[0]}{doctor.lname[0]}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold dark:text-white">{doctor.fname} {doctor.lname}</h1>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${doctor.verified_status ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                            }`}>
                            {doctor.verified_status ? 'Verified' : 'Pending Verification'}
                        </span>
                    </div>
                    <div className="text-lg text-gray-500 dark:text-gray-400 font-medium mt-1">{doctor.dr_type}</div>

                    <div className="flex flex-wrap items-center gap-6 mt-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <span className="text-primary"><FiAward /></span>
                            <span>{doctor.qualification}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-primary"><FiDollarSign /></span>
                            <span>Fee: KES {doctor.fee}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-primary"><FiBriefcase /></span>
                            <span>{doctor.isWorking ? 'Available (Working)' : 'Off Duty'}</span>
                        </div>
                        {doctor.latitude && (
                            <div className="flex items-center gap-2">
                                <span className="text-primary"><FiMapPin /></span>
                                <span>Location Set</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="text-right">
                        <div className="text-xs text-gray-400 uppercase tracking-widest">Balance</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">KES {doctor.balance}</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-gray-200 dark:border-gray-800">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`pb-3 text-sm font-medium transition ${activeTab === 'profile' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    Profile Details
                </button>
                <button
                    onClick={() => setActiveTab('schedule')}
                    className={`pb-3 text-sm font-medium transition ${activeTab === 'schedule' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    Schedule & Availability
                </button>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {activeTab === 'profile' && (
                    <>
                        <div className="lg:col-span-2 space-y-6">
                            <section className="bg-white dark:bg-[#1A1A1A] rounded-xl p-6 border border-gray-100 dark:border-gray-800">
                                <h3 className="text-lg font-bold dark:text-white mb-4">About</h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {doctor.about || 'No bio available.'}
                                </p>
                            </section>

                            <section className="bg-white dark:bg-[#1A1A1A] rounded-xl p-6 border border-gray-100 dark:border-gray-800">
                                <h3 className="text-lg font-bold dark:text-white mb-4">Professional Details</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <div className="text-gray-500 mb-1">Qualification</div>
                                        <div className="font-medium dark:text-gray-200">{doctor.qualification}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 mb-1">Specialty</div>
                                        <div className="font-medium dark:text-gray-200">{doctor.dr_type}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 mb-1">National ID</div>
                                        <div className="font-medium dark:text-gray-200">{doctor.national_id}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 mb-1">Status</div>
                                        <div className="font-medium dark:text-gray-200 uppercase">{doctor.status ? 'Active' : 'Inactive'}</div>
                                    </div>
                                </div>
                            </section>
                        </div>
                        <div className="space-y-6">
                            <section className="bg-white dark:bg-[#1A1A1A] rounded-xl p-6 border border-gray-100 dark:border-gray-800">
                                <h3 className="text-lg font-bold dark:text-white mb-4">Contact</h3>
                                <div className="space-y-4 text-sm">
                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-400"><FiPhone /></span>
                                        <span className="dark:text-gray-200">{doctor.mobile}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-400"><FiMapPin /></span>
                                        <span className="dark:text-gray-200">{doctor.address}</span>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </>
                )}

                {activeTab === 'schedule' && (
                    <div className="lg:col-span-3">
                        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl p-12 text-center border border-gray-100 dark:border-gray-800">
                            <div className="mx-auto text-4xl text-gray-300 mb-4 inline-block"><FiClock /></div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Schedule Management</h3>
                            <p className="text-gray-500">Schedule view is currently under construction.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
