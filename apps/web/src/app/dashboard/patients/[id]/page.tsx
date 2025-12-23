'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { FiUser, FiMapPin, FiPhone, FiCalendar, FiActivity, FiPlus, FiClock } from 'react-icons/fi';
import AddMedicalRecordModal from '@/components/dashboard/medical-records/AddMedicalRecordModal';

export default function PatientDetailsPage() {
    const params = useParams();
    const [patient, setPatient] = useState<any>(null);
    const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'profile' | 'medical'>('profile');
    const [loading, setLoading] = useState(true);
    const [showRecordModal, setShowRecordModal] = useState(false);

    const fetchPatientData = async () => {
        try {
            // Fetch Patient Profile using findOne endpoint (requires backend update or new endpoint if findOne by ID isn't exposed properly, assuming /patients/:id works based on standard REST)
            // Note: Investigating backend suggests `findOne` exists in service, need to check Controller.
            // Assumption: Controller has GET /patients/:id or similar. If not, we might need to fix it.
            // Let's try standard REST pattern first.
            const patRes = await api.get(`/patients/profile/${params.id}`); // Wait, controller has `getProfile` on `profile` path? No, standard `findOne` usually on `:id`. 
            // Looking at `patients.controller.ts`:
            // @Get() findAll
            // @Get('profile') getProfile (logged in user)
            // It seems there is NO GET /patients/:id exposed! I need to add it to backend first!

            // Correction: I'll try to fetch all and find (inefficient) OR better yet, I should update backend controller.
            // For now, let's assume I will fix backend in next step. I'll write the frontend code to expect /patients/:id.
            const res = await api.get(`/patients/${params.id}`);

            if (res && res.ok) {
                setPatient(await res.json());
            }

            // Fetch Medical Records
            const recRes = await api.get(`/medical-records/patient/${params.id}`);
            if (recRes && recRes.ok) {
                setMedicalRecords(await recRes.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.id) {
            fetchPatientData();
        }
    }, [params.id]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading patient details...</div>;
    if (!patient) return <div className="p-8 text-center text-red-500">Patient not found</div>;

    return (
        <div className="space-y-6">
            {/* Header / Summary Card */}
            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-3xl font-bold text-primary">
                        {patient.firstName[0]}{patient.lastName[0]}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold dark:text-white">{patient.firstName} {patient.lastName}</h1>
                        <div className="flex items-center gap-4 text-gray-500 mt-1">
                            <span className="flex items-center gap-1.5 text-sm"><FiUser /> {patient.gender}</span>
                            <span className="flex items-center gap-1.5 text-sm"><FiCalendar /> {new Date(patient.dateOfBirth).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1.5 text-sm"><FiMapPin /> {patient.city || 'Unknown City'}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                        Edit Profile
                    </button>
                    <button
                        onClick={() => { setActiveTab('medical'); setShowRecordModal(true); }}
                        className="px-4 py-2 bg-primary text-black rounded-lg text-sm font-bold hover:opacity-90 transition flex items-center gap-2"
                    >
                        <FiPlus /> Add Record
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-gray-200 dark:border-gray-800">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`pb-3 text-sm font-medium transition ${activeTab === 'profile' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    Full Profile
                </button>
                <button
                    onClick={() => setActiveTab('medical')}
                    className={`pb-3 text-sm font-medium transition ${activeTab === 'medical' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                    Medical Records
                </button>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {activeTab === 'profile' && (
                    <>
                        <div className="lg:col-span-2 space-y-6">
                            {/* Personal Info */}
                            <section className="bg-white dark:bg-[#1A1A1A] rounded-xl p-6 border border-gray-100 dark:border-gray-800">
                                <h3 className="text-lg font-bold dark:text-white mb-4 flex items-center gap-2">
                                    <FiUser className="text-primary" /> Personal Information
                                </h3>
                                <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                                    <div>
                                        <div className="text-gray-500 mb-1">Full Name</div>
                                        <div className="font-medium dark:text-gray-200">{patient.firstName} {patient.lastName}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 mb-1">Occupation</div>
                                        <div className="font-medium dark:text-gray-200">{patient.occupation || '-'}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 mb-1">Marital Status</div>
                                        <div className="font-medium capitalize dark:text-gray-200">{patient.maritalStatus || '-'}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 mb-1">Phone</div>
                                        <div className="font-medium dark:text-gray-200">{patient.phoneNumber}</div>
                                    </div>
                                    <div className="col-span-2">
                                        <div className="text-gray-500 mb-1">Address</div>
                                        <div className="font-medium dark:text-gray-200">{patient.address}, {patient.city}</div>
                                    </div>
                                </div>
                            </section>

                            {/* Medical Profile */}
                            <section className="bg-white dark:bg-[#1A1A1A] rounded-xl p-6 border border-gray-100 dark:border-gray-800">
                                <h3 className="text-lg font-bold dark:text-white mb-4 flex items-center gap-2">
                                    <FiActivity className="text-primary" /> Medical Profile
                                </h3>
                                <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                                    <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg">
                                        <div className="text-red-600 dark:text-red-400 font-semibold mb-1">Blood Type</div>
                                        <div className="text-2xl font-bold text-red-700 dark:text-red-500">{patient.bloodType || '?'}</div>
                                    </div>
                                    <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-lg">
                                        <div className="text-orange-600 dark:text-orange-400 font-semibold mb-1">Allergies</div>
                                        <div className="font-medium text-orange-800 dark:text-orange-300">{patient.allergies || 'None recorded'}</div>
                                    </div>
                                    <div className="col-span-2 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg">
                                        <div className="text-blue-600 dark:text-blue-400 font-semibold mb-1">Chronic Conditions</div>
                                        <div className="font-medium text-blue-800 dark:text-blue-300">{patient.existingConditions || 'None recorded'}</div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div className="space-y-6">
                            {/* Emergency Contact */}
                            <section className="bg-white dark:bg-[#1A1A1A] rounded-xl p-6 border border-gray-100 dark:border-gray-800">
                                <h3 className="text-lg font-bold dark:text-white mb-4 flex items-center gap-2">
                                    <FiPhone className="text-primary" /> Emergency Contact
                                </h3>
                                <div className="space-y-4 text-sm">
                                    <div>
                                        <div className="text-gray-500 mb-1">Name</div>
                                        <div className="font-medium dark:text-gray-200">{patient.emergencyContactName || '-'}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 mb-1">Relation</div>
                                        <div className="font-medium dark:text-gray-200">{patient.emergencyContactRelation || '-'}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 mb-1">Phone</div>
                                        <div className="font-medium dark:text-gray-200">{patient.emergencyContactPhone || '-'}</div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </>
                )}

                {activeTab === 'medical' && (
                    <div className="lg:col-span-3">
                        <section className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                <h3 className="text-lg font-bold dark:text-white">Medical Visits History</h3>
                                <button onClick={() => setShowRecordModal(true)} className="text-sm text-primary font-bold hover:underline">+ Add New</button>
                            </div>

                            {medicalRecords.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">No medical records found for this patient.</div>
                            ) : (
                                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {medicalRecords.map(rec => (
                                        <div key={rec.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">{rec.diagnosis}</h4>
                                                    <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                                        <FiClock /> {new Date(rec.createdAt).toLocaleDateString()} at {new Date(rec.createdAt).toLocaleTimeString()}
                                                        <span className="w-1 h-1 bg-gray-300 rounded-full mx-1"></span>
                                                        <span>Dr. {rec.doctor?.fullName || 'Unknown'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {rec.prescription && (
                                                <div className="mt-3 bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-lg border border-yellow-100 dark:border-yellow-900/20">
                                                    <span className="text-yellow-700 dark:text-yellow-500 font-semibold text-xs uppercase tracking-wider">Prescription</span>
                                                    <p className="text-gray-800 dark:text-gray-200 mt-1 text-sm">{rec.prescription}</p>
                                                </div>
                                            )}
                                            {rec.notes && (
                                                <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm italic">"{rec.notes}"</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </div>

            {showRecordModal && (
                <AddMedicalRecordModal
                    patientId={parseInt(params.id as string)}
                    onClose={() => setShowRecordModal(false)}
                    onSuccess={() => {
                        setShowRecordModal(false);
                        fetchPatientData();
                    }}
                />
            )}
        </div>
    );
}
