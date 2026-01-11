'use client';

import { useState, useEffect } from 'react';
import { FiX, FiUser, FiActivity, FiFileText, FiClock, FiPhone, FiMail, FiMapPin, FiBriefcase, FiAward, FiShield, FiShoppingBag, FiCalendar, FiDollarSign } from 'react-icons/fi';
import AddMedicalRecordModal from '@/components/dashboard/medical-records/AddMedicalRecordModal';
import PrescribeMedicationModal from '@/components/dashboard/pharmacy/PrescribeMedicationModal';
import PharmacyCheckoutModal from '@/components/dashboard/pharmacy/PharmacyCheckoutModal';
import MedicRecommendationsCard from '@/components/dashboard/appointments/MedicRecommendationsCard';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3434';

// Fix Leaflet Icons
const fixLeafletIcons = () => {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
};

function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap();
    map.setView(center, 13);
    return null;
}

interface ViewAppointmentDetailsModalProps {
    appointment: any;
    onClose: () => void;
}

export default function ViewAppointmentDetailsModal({ appointment, onClose }: ViewAppointmentDetailsModalProps) {
    const { user } = useAuth();
    const isDoctor = user?.role === 'doctor' || user?.role === 'medic' || user?.role === 'nurse' || user?.role === 'clinician';
    const isPatient = user?.role === 'patient';
    const isAdmin = user?.role === 'admin';

    // Modals
    const [showAddRecordModal, setShowAddRecordModal] = useState(false);
    const [showPrescribeModal, setShowPrescribeModal] = useState(false);
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [activePrescription, setActivePrescription] = useState<any>(null);

    // Data State
    const [medicalProfile, setMedicalProfile] = useState<any>(null);
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [loadingData, setLoadingData] = useState(true);

    const patient = appointment?.patient || {};
    const doctor = appointment?.doctor || {};
    const patientUserId = patient.id;

    // Debug doctor data
    // Debug doctor data removed

    useEffect(() => {
        fixLeafletIcons();

        const fetchData = async () => {
            setLoadingData(true);
            try {
                // 1. Fetch Medical Profile (If Doctor viewing or needed)
                if (patientUserId) {
                    const res = await api.get(`/medical-profiles/user/${patientUserId}`);
                    if (res?.ok) setMedicalProfile(await res.json());
                }

                // 2. Fetch Prescriptions (Actual Rx from doctor)
                if (appointment.id) {
                    const rxRes = await api.get(`/pharmacy/prescriptions/appointment/${appointment.id}`);
                    if (rxRes?.ok) {
                        setPrescriptions(await rxRes.json());
                    }

                    // 3. Fetch Medical Records (Diagnosis from doctor)
                    const recRes = await api.get(`/medical-records/appointment/${appointment.id}`);
                    if (recRes?.ok) {
                        setMedicalRecords(await recRes.json());
                    }
                }
            } catch (err) {
                console.error('Failed to fetch appointment details:', err);
            } finally {
                setLoadingData(false);
            }
        };

        if (appointment) fetchData();
    }, [appointment, patientUserId, refreshTrigger]);

    if (!appointment) return null;

    // Derived Data
    const age = patient.dob ? Math.floor((new Date().getTime() - new Date(patient.dob).getTime()) / 3.15576e+10) : 'Unknown';

    // Medical Info (from Profile or Appointment snapshot)
    const displayConditions = medicalProfile?.medical_history || patient.conditions || "No known conditions.";
    const displayBloodType = medicalProfile?.blood_type || patient.blood_type || "Unknown";

    // Location for map
    const patientLat = patient.latitude || -1.286389;
    const patientLng = patient.longitude || 36.817223;

    // Status badge color
    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return 'bg-green-100 text-green-700 dark:bg-green-900/20';
            case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20';
            case 'completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20';
            case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/20';
            case 'missed': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#0A0F1C] w-full max-w-7xl max-h-[95vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="relative px-8 py-6 bg-gradient-to-r from-primary/10 via-blue-500/10 to-purple-500/10 border-b border-gray-100 dark:border-gray-800">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-white dark:hover:bg-black transition-colors z-10"
                    >
                        <FiX size={20} />
                    </button>

                    <div className="flex items-start gap-6">
                        {/* Profile Picture */}
                        <div className="relative">
                            {(isDoctor || isAdmin) && patient.profilePicture ? (
                                <img
                                    src={`${API_URL}/uploads/profiles/${patient.profilePicture}`}
                                    alt={`${patient.fname} ${patient.lname}`}
                                    className="w-24 h-24 rounded-2xl object-cover shadow-lg"
                                    onError={(e) => {
                                        // Fallback to initials if image fails to load
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                    }}
                                />
                            ) : (!isDoctor && !isAdmin) && doctor.profile_image ? (
                                <img
                                    src={doctor.profile_image.startsWith('http') ? doctor.profile_image : `${API_URL}/uploads/profiles/${doctor.profile_image}`}
                                    alt={`${doctor.fname} ${doctor.lname}`}
                                    className="w-24 h-24 rounded-2xl object-cover shadow-lg"
                                    onLoad={() => {
                                        console.log('Doctor image loaded successfully:', doctor.profile_image);
                                    }}
                                    onError={(e) => {
                                        console.error('Doctor image failed to load:', doctor.profile_image);
                                        console.error('Attempted path:', e.currentTarget.src);
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                    }}
                                />
                            ) : null}
                            <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg ${(isDoctor || isAdmin) && patient.profilePicture ? 'hidden' : (!isDoctor && !isAdmin) && doctor.profile_image ? 'hidden' : ''}`}>
                                {isDoctor || isAdmin ? (
                                    patient.fname?.charAt(0) || 'P'
                                ) : (
                                    doctor.fname?.charAt(0) || 'D'
                                )}
                            </div>
                            <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(appointment.status)}`}>
                                {appointment.status}
                            </div>
                        </div>

                        {/* Main Info */}
                        <div className="flex-1">
                            <h2 className="text-2xl font-black dark:text-white mb-2">
                                {isDoctor || isAdmin ? (
                                    `${patient.fname} ${patient.lname}`
                                ) : (
                                    `${doctor.fname} ${doctor.lname}`
                                )}
                            </h2>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                                {isDoctor || isAdmin ? (
                                    <>
                                        <span className="flex items-center gap-2">
                                            <FiUser className="text-primary" />
                                            ID: #{patient.id}
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <FiCalendar className="text-primary" />
                                            {age} Years Old
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <FiActivity className="text-primary" />
                                            {displayBloodType}
                                        </span>
                                        {patient.sex && (
                                            <span className="flex items-center gap-2">
                                                <FiUser className="text-primary" />
                                                {patient.sex}
                                            </span>
                                        )}
                                        {patient.national_id && (
                                            <span className="flex items-center gap-2">
                                                <FiShield className="text-primary" />
                                                ID: {patient.national_id}
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <span className="flex items-center gap-2">
                                            <FiAward className="text-primary" />
                                            {doctor.speciality || 'General Practitioner'}
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <FiBriefcase className="text-primary" />
                                            {doctor.years_of_experience || '5+'} Years Experience
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <FiShield className="text-primary" />
                                            License: {doctor.licenceNo || 'N/A'}
                                        </span>
                                        {doctor.hospital_attachment && (
                                            <span className="flex items-center gap-2">
                                                <FiMapPin className="text-primary" />
                                                {doctor.hospital_attachment}
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {isDoctor && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowAddRecordModal(true)}
                                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                                >
                                    <FiFileText /> Add Record
                                </button>
                                <button
                                    onClick={() => setShowPrescribeModal(true)}
                                    className="px-4 py-2 bg-primary text-black rounded-xl font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
                                >
                                    <FiShoppingBag /> Prescribe
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Contact & Details */}
                        <div className="space-y-6">
                            {/* Appointment Info Card */}
                            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-2xl p-6 border border-blue-100 dark:border-blue-900/20">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Appointment Details</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-white dark:bg-black/20 flex items-center justify-center">
                                            <FiCalendar className="text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Date & Time</p>
                                            <p className="font-bold dark:text-white">
                                                {appointment.appointment_date ? new Date(appointment.appointment_date).toLocaleDateString() : 'Not set'}
                                                {appointment.appointment_time && ` at ${appointment.appointment_time}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                            <FiActivity className="text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Appointment Status</p>
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                appointment.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                                    appointment.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {appointment.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-white dark:bg-black/20 flex items-center justify-center">
                                            <FiBriefcase className="text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Service Type</p>
                                            <p className="font-bold dark:text-white">{appointment.service?.name || 'General Consultation'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-white dark:bg-black/20 flex items-center justify-center">
                                            <FiDollarSign className="text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Fee</p>
                                            <p className="font-bold dark:text-white">KES {Number(appointment.fee || 0).toLocaleString()}</p>
                                            {appointment.transportFee > 0 && (
                                                <p className="text-xs text-gray-500 mt-1">Transport: KES {Number(appointment.transportFee).toLocaleString()}</p>
                                            )}
                                        </div>
                                    </div>
                                    {appointment.reason && (
                                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                            <p className="text-xs text-gray-500 mb-1">Reason for Visit</p>
                                            <p className="text-sm dark:text-white">{appointment.reason}</p>
                                        </div>
                                    )}
                                    {appointment.activeMedications && (
                                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                            <p className="text-xs text-gray-500 mb-1">Active Medications</p>
                                            <p className="text-sm dark:text-white">{appointment.activeMedications}</p>
                                        </div>
                                    )}
                                    {appointment.currentPrescriptions && (
                                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                            <p className="text-xs text-gray-500 mb-1">Current Prescriptions</p>
                                            <p className="text-sm dark:text-white">{appointment.currentPrescriptions}</p>
                                        </div>
                                    )}
                                    {!appointment.isForSelf && appointment.beneficiaryName && (
                                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                            <p className="text-xs text-gray-500 mb-2">Beneficiary Information</p>
                                            <div className="space-y-1 text-sm dark:text-white">
                                                <p><span className="font-bold">Name:</span> {appointment.beneficiaryName}</p>
                                                {appointment.beneficiaryAge && <p><span className="font-bold">Age:</span> {appointment.beneficiaryAge}</p>}
                                                {appointment.beneficiaryGender && <p><span className="font-bold">Gender:</span> {appointment.beneficiaryGender}</p>}
                                                {appointment.beneficiaryRelation && <p><span className="font-bold">Relation:</span> {appointment.beneficiaryRelation}</p>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Contact Details Card */}
                            <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Contact Details</h3>
                                <div className="space-y-3">
                                    {(isDoctor || isAdmin) ? (
                                        <>
                                            <div className="flex items-center gap-3">
                                                <FiPhone className="text-gray-400" />
                                                <span className="text-sm dark:text-gray-300">{patient.mobile || patient.phone || 'No phone'}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <FiMail className="text-gray-400" />
                                                <span className="text-sm dark:text-gray-300">{patient.email || 'No email'}</span>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <FiMapPin className="text-gray-400 mt-1" />
                                                <span className="text-sm dark:text-gray-300">{patient.address || 'No address provided'}</span>
                                            </div>
                                            {patient.city && (
                                                <div className="flex items-center gap-3">
                                                    <FiMapPin className="text-gray-400" />
                                                    <span className="text-sm dark:text-gray-300">{patient.city}</span>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-3">
                                                <FiPhone className="text-gray-400" />
                                                <span className="text-sm dark:text-gray-300">{doctor.mobile || 'No phone'}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <FiMail className="text-gray-400" />
                                                <span className="text-sm dark:text-gray-300">{doctor.email || 'No email'}</span>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <FiMapPin className="text-gray-400 mt-1" />
                                                <span className="text-sm dark:text-gray-300">{doctor.hospital_attachment || doctor.address || 'M-Clinic'}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Patient Vitals (Doctor/Admin View) */}
                            {(isDoctor || isAdmin) && (
                                <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Patient Biodata</h3>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Blood Type</p>
                                                <p className="text-lg font-black text-primary">{displayBloodType}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Age</p>
                                                <p className="text-lg font-black dark:text-white">{age} yrs</p>
                                            </div>
                                        </div>
                                        {patient.sex && (
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Gender</p>
                                                <p className="text-sm font-bold dark:text-white capitalize">{patient.sex}</p>
                                            </div>
                                        )}
                                        {patient.national_id && (
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">National ID</p>
                                                <p className="text-sm font-bold dark:text-white">{patient.national_id}</p>
                                            </div>
                                        )}
                                        {patient.dob && (
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Date of Birth</p>
                                                <p className="text-sm font-bold dark:text-white">{patient.dob}</p>
                                            </div>
                                        )}
                                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                            <p className="text-xs text-gray-500 mb-1">Medical Conditions</p>
                                            <p className="text-sm dark:text-white">{displayConditions}</p>
                                        </div>
                                        {medicalProfile?.allergies && (
                                            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                                <p className="text-xs text-gray-500 mb-1">Allergies</p>
                                                <p className="text-sm dark:text-white">{medicalProfile.allergies}</p>
                                            </div>
                                        )}
                                        {appointment.homeAddress && (
                                            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                                <p className="text-xs text-gray-500 mb-1">Home Address (for this visit)</p>
                                                <p className="text-sm dark:text-white">{appointment.homeAddress}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Middle Column - Map or Doctor Info */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Admin Specific: Medic & Financials */}
                            {isAdmin && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Assigned Medic Details */}
                                    <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <FiBriefcase className="text-primary" />
                                            Assigned Medic
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold">
                                                    {doctor.fname?.[0] || 'D'}
                                                </div>
                                                <div>
                                                    <p className="font-bold dark:text-white">{doctor.fname} {doctor.lname}</p>
                                                    <p className="text-xs text-gray-500">{doctor.speciality || 'General Practitioner'}</p>
                                                </div>
                                            </div>
                                            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <FiPhone size={14} />
                                                    <span>{doctor.mobile || 'No Phone'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <FiMail size={14} />
                                                    <span>{doctor.email || 'No Email'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <FiShield size={14} />
                                                    <span>License: {doctor.licenceNo || 'N/A'}</span>
                                                </div>
                                                {doctor.hospital_attachment && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                        <FiMapPin size={14} />
                                                        <span>{doctor.hospital_attachment}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Financial Details */}
                                    <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <FiDollarSign className="text-primary" />
                                            Financials
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500">Status</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${(appointment.invoice?.status === 'paid' || (!appointment.invoice && (appointment.status === 'confirmed' || appointment.status === 'completed'))) ? 'bg-green-100 text-green-700' :
                                                    (appointment.invoice?.status === 'pending' || appointment.status === 'pending') ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {appointment.invoice?.status || (appointment.status === 'confirmed' || appointment.status === 'completed' ? 'paid' : 'pending')}
                                                </span>
                                            </div>
                                            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
                                                <div className="flex justify-between items-center text-sm text-gray-500">
                                                    <span>Consultation Fee</span>
                                                    <span className="dark:text-gray-300">KES {Number(appointment.fee || 0).toLocaleString()}</span>
                                                </div>
                                                {appointment.transportFee > 0 && (
                                                    <div className="flex justify-between items-center text-sm text-gray-500">
                                                        <span>Transport Cost</span>
                                                        <span className="dark:text-gray-300">KES {Number(appointment.transportFee).toLocaleString()}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-800">
                                                <span className="text-sm text-gray-500">Total Amount</span>
                                                <span className="font-bold text-lg dark:text-white">
                                                    KES {Number(appointment.invoice?.totalAmount || (Number(appointment.fee || 0) + Number(appointment.transportFee || 0))).toLocaleString()}
                                                </span>
                                            </div>
                                            {appointment.invoice && (
                                                <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                                                    <div className="flex justify-between items-center text-sm mb-1">
                                                        <span className="text-gray-500">Invoice #</span>
                                                        <span className="font-mono dark:text-gray-300">{appointment.invoice.invoiceNumber}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-gray-500">Date</span>
                                                        <span className="dark:text-gray-300">{new Date(appointment.invoice.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* Map (Doctor/Admin View) */}
                            {(isDoctor || isAdmin) && (
                                <div className="bg-white dark:bg-white/5 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
                                    <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                            <FiMapPin className="text-primary" />
                                            Patient Location
                                        </h3>
                                    </div>
                                    <div className="h-80">
                                        <MapContainer
                                            center={[patientLat, patientLng]}
                                            zoom={13}
                                            style={{ height: '100%', width: '100%' }}
                                            scrollWheelZoom={false}
                                        >
                                            <TileLayer
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            />
                                            <Marker position={[patientLat, patientLng]}>
                                                <Popup>
                                                    <strong>{patient.fname} {patient.lname}</strong><br />
                                                    {patient.address}
                                                </Popup>
                                            </Marker>
                                            <ChangeView center={[patientLat, patientLng]} />
                                        </MapContainer>
                                    </div>
                                </div>
                            )}

                            {/* Prescriptions Section */}
                            <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                        <FiShoppingBag className="text-primary" />
                                        Prescriptions
                                    </h3>
                                </div>

                                {loadingData ? (
                                    <div className="text-center py-8 text-gray-400">Loading prescriptions...</div>
                                ) : prescriptions.length === 0 ? (
                                    <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                                        <p className="text-gray-400 text-sm">No active prescriptions</p>
                                        <p className="text-xs text-gray-500 mt-1">Use the Prescribe button to add one.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {prescriptions.map((rx) => (
                                            <div key={rx.id} className="p-4 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-100 dark:border-gray-800">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Prescription #{rx.id}</p>
                                                        <p className="text-xs text-gray-400">{new Date(rx.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${rx.status === 'ordered' ? 'bg-blue-100 text-blue-700' :
                                                        rx.status === 'dispensed' ? 'bg-green-100 text-green-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {rx.status}
                                                    </span>
                                                </div>
                                                <div className="space-y-2">
                                                    {rx.items?.map((item: any, idx: number) => (
                                                        <div key={idx} className="flex justify-between text-sm">
                                                            <span className="font-bold dark:text-white">{item.medicationName}</span>
                                                            <span className="text-gray-500">{item.dosage} • {item.frequency}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                {isPatient && rx.status === 'pending' && (
                                                    <button
                                                        onClick={() => {
                                                            setActivePrescription(rx);
                                                            setShowCheckoutModal(true);
                                                        }}
                                                        className="mt-3 w-full py-2 bg-primary text-black rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
                                                    >
                                                        Order Medication
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <FiFileText className="text-primary" />
                                    Diagnosis & Records
                                </h3>

                                {loadingData ? (
                                    <div className="text-center py-8 text-gray-400">Loading records...</div>
                                ) : medicalRecords.length === 0 ? (
                                    <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                                        <p className="text-gray-400 text-sm">No medical records found for this visit.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {medicalRecords.map((record) => (
                                            <div key={record.id} className="p-4 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-100 dark:border-gray-800">
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className="text-xs text-gray-500">Record #{record.id}</p>
                                                    <p className="text-xs text-gray-400">{new Date(record.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <p className="text-sm font-bold dark:text-white mb-2">{record.diagnosis}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{record.notes}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Medic Recommendations */}
                            <MedicRecommendationsCard
                                appointmentId={appointment.id}
                                isMedic={isDoctor || isAdmin}
                                isPatient={isPatient}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showAddRecordModal && (
                <AddMedicalRecordModal
                    patientId={patient.id}
                    appointmentId={appointment.id}
                    onClose={() => setShowAddRecordModal(false)}
                    onSuccess={() => {
                        setShowAddRecordModal(false);
                        setShowAddRecordModal(false);
                        // Refresh data
                        setRefreshTrigger(prev => prev + 1);
                    }}
                />
            )}

            {showPrescribeModal && (
                <PrescribeMedicationModal
                    appointment={appointment}
                    onClose={() => setShowPrescribeModal(false)}
                    onSuccess={() => {
                        setShowPrescribeModal(false);
                        setShowPrescribeModal(false);
                        // trigger refresh
                        setRefreshTrigger(prev => prev + 1);
                    }}
                />
            )}

            {showCheckoutModal && activePrescription && (
                <PharmacyCheckoutModal
                    items={activePrescription.items || []}
                    user={user}
                    prescriptionId={activePrescription.id}
                    onClose={() => setShowCheckoutModal(false)}
                    onSuccess={() => {
                        // potentially refresh to show status change
                    }}
                />
            )}
        </div>
    );
}
