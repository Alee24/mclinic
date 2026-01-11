'use client';

import { useAuth } from '@/lib/auth';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRef } from 'react';
import { FiActivity, FiShield, FiEdit2, FiCamera, FiBriefcase } from 'react-icons/fi';
import EditMedicalProfileModal from '@/components/dashboard/patients/EditMedicalProfileModal';
import EditPersonalDetailsModal from '@/components/dashboard/patients/EditPersonalDetailsModal';
import ChangePasswordModal from '@/components/dashboard/patients/ChangePasswordModal';
import EditMedicProfileModal from '@/components/dashboard/doctors/EditMedicProfileModal';
import UserAvatar from '@/components/dashboard/UserAvatar';

export default function ProfilePage() {
    const { user, refreshUser } = useAuth();

    // Reload user data without page refresh
    const reloadUser = async () => {
        await refreshUser();
    };

    if (!user) return null;

    // Patient State
    const [medProfile, setMedProfile] = useState<any>(null);
    const [loadingMed, setLoadingMed] = useState(true);
    const [records, setRecords] = useState<any[]>([]);
    const [loadingRecords, setLoadingRecords] = useState(true);

    // Doctor State
    const [docProfile, setDocProfile] = useState<any>(null);
    const [loadingDoc, setLoadingDoc] = useState(true);

    // Modal States
    const [showEditMedModal, setShowEditMedModal] = useState(false);
    const [showEditDocModal, setShowEditDocModal] = useState(false);
    const [showEditPersonalModal, setShowEditPersonalModal] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

    // Profile Picture Ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Helper to identify any medic role
    const isMedic = ['doctor', 'nurse', 'clinician', 'medic'].includes(user.role);

    useEffect(() => {
        const fetchMedicalProfile = async () => {
            try {
                const res = await api.get('/medical-profiles/me');
                if (res && res.ok) {
                    const data = await res.json();
                    setMedProfile(data); // Returns flattened object now
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingMed(false);
            }
        };

        const fetchMedicalRecords = async () => {
            try {
                if (!user?.id) return;
                const res = await api.get(`/medical-records/patient/${user.id}`);
                if (res && res.ok) {
                    const data = await res.json();
                    setRecords(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingRecords(false);
            }
        };

        const fetchDoctorProfile = async () => {
            try {
                const res = await api.get('/doctors/profile/me');
                if (res && res.ok) {
                    const data = await res.json();
                    setDocProfile(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingDoc(false);
            }
        };

        if (user.role === 'patient') {
            fetchMedicalProfile();
            fetchMedicalRecords();
        } else if (isMedic) {
            fetchDoctorProfile();
        }
    }, [showEditMedModal, showEditDocModal, user?.id, user?.role]);

    // Handle Image Upload
    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        let uploadUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3434'}/users/${user.id}/upload-profile`;
        // If doctor/medic, use doctor endpoint to sync with doctor entity if needed
        if (isMedic && docProfile?.id) {
            uploadUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3434'}/doctors/${docProfile.id}/upload-profile`;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(uploadUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            });

            if (res.ok) {
                alert('Profile picture updated!');
                reloadUser();
                if (isMedic) {
                    // trigger refetch doc profile
                    setShowEditDocModal(prev => !prev); // tiny hack to re-trigger effect or just manually call fetch
                }
            } else {
                alert('Failed to upload image');
            }
        } catch (err) {
            console.error(err);
            alert('Upload error');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="bg-white dark:bg-[#121212] rounded-2xl p-8 border border-gray-200 dark:border-gray-800 flex items-center gap-6 shadow-sm">
                <div className="relative group cursor-pointer" onClick={handleImageClick}>
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 p-1">
                        <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 overflow-hidden">
                            <UserAvatar user={user} className="w-full h-full object-cover" />
                        </div>
                    </div>
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <FiCamera className="text-white text-xl" />
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                </div>

                <div className="flex-1">
                    <h1 className="text-3xl font-bold dark:text-white capitalize">{user?.fname} {user?.lname}</h1>
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase mt-2 inline-block">
                        {user?.role}
                    </span>
                    <p className="text-sm text-gray-400 mt-2">{user?.email}</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setShowEditPersonalModal(true)}
                        className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                        title="Edit Personal Information"
                    >
                        <FiEdit2 className="dark:text-white" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Personal Info and Security */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#121212] rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold dark:text-white">Personal Information</h2>
                            <button onClick={() => setShowEditPersonalModal(true)}><FiEdit2 className="text-gray-400 hover:text-blue-500" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold">Full Name</label>
                                <div className="dark:text-gray-300 font-medium">{user?.fname} {user?.lname}</div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold">National ID</label>
                                <div className="dark:text-gray-300 font-medium">{user?.national_id || 'Not Set'}</div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold">Date of Birth</label>
                                <div className="dark:text-gray-300 font-medium">
                                    {user?.dob ? new Date(user.dob).toLocaleDateString() : 'Not Set'}
                                </div>
                                {user?.dob && (
                                    <span className="text-sm text-blue-500 font-bold">
                                        {new Date().getFullYear() - new Date(user.dob).getFullYear()} Years Old
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#121212] rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 dark:text-white">Account Security</h2>
                        <div className="space-y-3">
                            <button
                                onClick={() => setShowChangePasswordModal(true)}
                                className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition flex justify-between items-center group"
                            >
                                <span>Change Password</span>
                                <span className="text-gray-400 group-hover:text-gray-600">→</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Medical Profile (Only for Patients) */}
                {user.role === 'patient' && (
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-[#121212] rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm relative">
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-lg font-bold dark:text-white flex items-center gap-2">
                                    <FiActivity className="text-blue-500" /> Medical Profile
                                </h2>
                                <button
                                    onClick={() => setShowEditMedModal(true)}
                                    className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100 transition"
                                >
                                    Edit Details
                                </button>
                            </div>

                            {loadingMed ? (
                                <div className="animate-pulse space-y-4">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Vitals */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                                        <div className="text-center">
                                            <div className="text-xs text-gray-500 uppercase font-bold">Blood Group</div>
                                            <div className="text-xl font-black text-gray-900 dark:text-white">{medProfile?.blood_group || '-'}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xs text-gray-500 uppercase font-bold">Genotype</div>
                                            <div className="text-xl font-black text-gray-900 dark:text-white">{medProfile?.genotype || '-'}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xs text-gray-500 uppercase font-bold">Height</div>
                                            <div className="text-xl font-black text-gray-900 dark:text-white">{medProfile?.height ? `${medProfile.height} cm` : '-'}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xs text-gray-500 uppercase font-bold">Weight</div>
                                            <div className="text-xl font-black text-gray-900 dark:text-white">{medProfile?.weight ? `${medProfile.weight} kg` : '-'}</div>
                                        </div>
                                    </div>

                                    {/* Histories */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
                                            <label className="text-xs text-red-600 dark:text-red-400 uppercase font-bold mb-1 block">Allergies</label>
                                            <p className="text-sm text-gray-900 dark:text-gray-200 font-medium">
                                                {medProfile?.allergies || 'No known allergies.'}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-gray-800">
                                            <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Chronic Conditions</label>
                                            <p className="text-sm text-gray-900 dark:text-gray-200 font-medium">
                                                {medProfile?.medical_history || 'None reported.'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Detailed Stats */}
                                    <div className="space-y-4 pt-4 border-t dark:border-gray-800">
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase font-bold mb-2 block">Current Medications</label>
                                            <p className="text-sm dark:text-gray-300 p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-gray-800">
                                                {medProfile?.current_medications || 'No active medications.'}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="text-xs text-gray-500 uppercase font-bold mb-2 block">Surgical History</label>
                                                <p className="text-sm dark:text-gray-300">
                                                    {medProfile?.surgical_history || 'None.'}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 uppercase font-bold mb-2 block">Disability Status</label>
                                                <p className="text-sm dark:text-gray-300">
                                                    {medProfile?.disability_status || 'None reported.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Insurance & Emergency */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t dark:border-gray-800">
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase font-bold mb-3 block flex items-center gap-2"><FiShield /> Emergency Contact</label>
                                            <div className="text-sm dark:text-gray-300 bg-gray-50 dark:bg-white/5 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                                                <span className="font-bold block text-base">{medProfile?.emergency_contact_name || 'Not set'}</span>
                                                {medProfile?.emergency_contact_phone && (
                                                    <div className="text-gray-500 mt-1">{medProfile.emergency_contact_phone} <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full ml-1">{medProfile.emergency_contact_relation}</span></div>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase font-bold mb-3 block flex items-center gap-2"><FiShield /> Insurance & Plan</label>
                                            <div className="text-sm dark:text-gray-300 bg-gray-50 dark:bg-white/5 p-3 rounded-lg border border-gray-100 dark:border-gray-800 space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-500">Provider</span>
                                                    <span className="font-bold">{medProfile?.insurance_provider || 'None'}</span>
                                                </div>
                                                {medProfile?.insurance_policy_no && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-500">Policy No.</span>
                                                        <span className="font-mono">{medProfile.insurance_policy_no}</span>
                                                    </div>
                                                )}
                                                {medProfile?.shif_number && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-500">SHIF No.</span>
                                                        <span className="font-mono text-purple-600 font-bold">{medProfile.shif_number}</span>
                                                    </div>
                                                )}
                                                <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                                    <span className="text-xs font-bold uppercase text-gray-400">Current Plan</span>
                                                    <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded uppercase">
                                                        {medProfile?.subscription_plan || 'PAY-AS-YOU-GO'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Medical Records History */}
                        <div className="bg-white dark:bg-[#121212] rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                            <h2 className="text-lg font-bold mb-4 dark:text-white flex items-center gap-2">
                                Medical Records
                            </h2>
                            {loadingRecords ? (
                                <div className="text-gray-500 text-sm">Loading records...</div>
                            ) : records.length > 0 ? (
                                <div className="space-y-4">
                                    {records.map((rec: any) => (
                                        <div key={rec.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 transition">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-gray-900 dark:text-white">{rec.diagnosis}</h4>
                                                <span className="text-xs text-gray-400">{new Date(rec.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            {rec.prescription && (
                                                <div className="mb-2">
                                                    <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded uppercase">Prescription</span>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{rec.prescription}</p>
                                                </div>
                                            )}
                                            {rec.notes && (
                                                <div className="mt-2 text-sm text-gray-500 italic border-l-2 border-gray-200 pl-3">
                                                    "{rec.notes}"
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    No medical records found.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Right Column: Doctor Professional Profile (Only for Medics) */}
                {isMedic && (
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-[#121212] rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm relative">
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-lg font-bold dark:text-white flex items-center gap-2">
                                    <FiBriefcase className="text-blue-500" /> Professional Profile
                                </h2>
                                <button
                                    onClick={() => setShowEditDocModal(true)}
                                    className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100 transition"
                                >
                                    Edit Details
                                </button>
                            </div>

                            {loadingDoc ? (
                                <div className="animate-pulse space-y-4">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl space-y-2">
                                        <h3 className="font-bold text-gray-900 dark:text-white">Bio</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            {docProfile?.about || 'No bio provided.'}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Speciality</label>
                                            <div className="font-medium dark:text-gray-200">{docProfile?.speciality || '-'}</div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Experience</label>
                                            <div className="font-medium dark:text-gray-200">{docProfile?.years_of_experience || 0} Years</div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Regulatory Body</label>
                                            <div className="font-medium dark:text-gray-200">{docProfile?.regulatory_body || '-'}</div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Licence / Reg No.</label>
                                            <div className="font-medium dark:text-gray-200">{docProfile?.licenceNo || docProfile?.reg_code || '-'}</div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Hospital Attachment</label>
                                            <div className="font-medium dark:text-gray-200">{docProfile?.hospital_attachment || '-'}</div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Consultation Fee</label>
                                            <div className="font-medium dark:text-gray-200">KES {docProfile?.fee || 0}</div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4 border-t dark:border-gray-800">
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${docProfile?.telemedicine ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            Telemedicine: {docProfile?.telemedicine ? 'Yes' : 'No'}
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${docProfile?.on_call ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            On-Call: {docProfile?.on_call ? 'Yes' : 'No'}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {showEditMedModal && (
                <EditMedicalProfileModal
                    user={user}
                    patient={medProfile}
                    onClose={() => setShowEditMedModal(false)}
                    onSuccess={() => {
                        setShowEditMedModal(false);
                    }}
                />
            )}

            {showEditDocModal && (
                <EditMedicProfileModal
                    doctor={docProfile}
                    onClose={() => setShowEditDocModal(false)}
                    onSuccess={() => {
                        setShowEditDocModal(false);
                        reloadUser(); // Sync Global User State (Avatar, etc)
                        // trigger refetch hack or state update
                        api.get('/doctors/profile/me').then(res => {
                            if (res && res.ok) {
                                res.json().then(data => setDocProfile(data));
                            }
                        });
                    }}
                />
            )}

            {showEditPersonalModal && (
                <EditPersonalDetailsModal
                    user={user}
                    onClose={() => setShowEditPersonalModal(false)}
                    onSuccess={() => {
                        setShowEditPersonalModal(false);
                        reloadUser();
                    }}
                />
            )}

            {showChangePasswordModal && (
                <ChangePasswordModal
                    user={user}
                    onClose={() => setShowChangePasswordModal(false)}
                />
            )}
        </div>
    );
}
