'use client';

import { useState, useEffect } from 'react';
import { FiX, FiUser, FiActivity, FiFileText, FiClock, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import AddMedicalRecordModal from '@/components/dashboard/medical-records/AddMedicalRecordModal';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
    const isDoctor = user?.role === 'doctor';
    const [showAddRecordModal, setShowAddRecordModal] = useState(false);

    // State for Medical Profile
    const [medicalProfile, setMedicalProfile] = useState<any>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    const patient = appointment?.patient || {};
    const patientUserId = patient.user_id; // Using user_id from patient relation in Appointment

    useEffect(() => {
        fixLeafletIcons();
        // ... existing fetch profile logic
        const fetchProfile = async () => {
            if (!patientUserId) {
                setLoadingProfile(false);
                return;
            }
            try {
                const res = await api.get(`/medical-profiles/user/${patientUserId}`);
                if (res && res.ok) {
                    const data = await res.json();
                    setMedicalProfile(data);
                }
            } catch (err) {
                console.error('Failed to fetch medical profile:', err);
            } finally {
                setLoadingProfile(false);
            }
        };

        if (appointment) {
            fetchProfile();
        }
    }, [appointment, patientUserId]);

    if (!appointment) return null;

    const age = patient.dob ?
        Math.floor((new Date().getTime() - new Date(patient.dob).getTime()) / 3.15576e+10) :
        'Unknown';

    // Merge patient info with medicalProfile for display
    const displayConditions = medicalProfile?.medical_history || patient.conditions || "No known conditions recorded.";
    const displayBlood = medicalProfile?.blood_group || patient.blood_group || 'N/A';
    const displayGenotype = medicalProfile?.genotype || 'N/A';
    const displayAllergies = medicalProfile?.allergies || 'No allergies recorded.';

    const hasLocation = patient.latitude && patient.longitude;
    const position: [number, number] = hasLocation ? [Number(patient.latitude), Number(patient.longitude)] : [-1.2921, 36.8219];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                    <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                        <FiFileText className="text-primary" />
                        Appointment Details
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <FiX />
                    </button>
                </div>

                <div className="p-8 max-h-[80vh] overflow-y-auto">
                    {/* Patient Profile Section */}
                    <div className="flex items-start gap-6 mb-8">
                        <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-4xl shrink-0">
                            {appointment.isForSelf === false ? (
                                appointment.beneficiaryGender === 'Male' ? '👨' : '👩'
                            ) : (
                                patient.sex === 'Male' ? '👨' : patient.sex === 'Female' ? '👩' : '🧑'
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-black dark:text-white mb-2">
                                {appointment.isForSelf === false ? appointment.beneficiaryName : `${patient.fname} ${patient.lname}`}
                            </h3>
                            {appointment.isForSelf === false && (
                                <p className="text-sm text-gray-500 mb-2 font-bold uppercase tracking-wider">
                                    Beneficiary ({appointment.beneficiaryRelation})
                                </p>
                            )}
                            <div className="flex flex-wrap gap-3">
                                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
                                    Age: {appointment.isForSelf === false ? appointment.beneficiaryAge : age}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-bold uppercase tracking-wider">
                                    {appointment.isForSelf === false ? appointment.beneficiaryGender : (patient.sex || 'Unknown')}
                                </span>
                                {appointment.isForSelf !== false && (
                                    <>
                                        <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-xs font-bold uppercase tracking-wider">
                                            Blood: {displayBlood}
                                        </span>
                                        {displayGenotype !== 'N/A' && (
                                            <span className="px-3 py-1 rounded-full bg-yellow-50 text-yellow-600 text-xs font-bold uppercase tracking-wider">
                                                Genotype: {displayGenotype}
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Contact Info Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                            <h4 className="flex items-center gap-2 text-blue-700 font-bold mb-4 uppercase text-xs tracking-widest">
                                <FiUser /> Contact Info
                            </h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 flex items-center justify-center text-blue-500 shadow-sm">
                                        <FiPhone />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase font-bold">Mobile</div>
                                        <div className="text-sm font-bold dark:text-white">{patient.mobile || 'N/A'}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 flex items-center justify-center text-blue-500 shadow-sm">
                                        <FiMail />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase font-bold">Email</div>
                                        <div className="text-sm font-bold dark:text-white">{patient.email || 'N/A'}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 flex items-center justify-center text-blue-500 shadow-sm">
                                        <FiMapPin />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase font-bold">Address</div>
                                        <div className="text-sm font-bold dark:text-white">{patient.address || 'N/A'}, {patient.city}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Session & Location */}
                        <div className="space-y-6">
                            <div className="p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800">
                                <h4 className="flex items-center gap-2 text-gray-500 font-bold mb-3 uppercase text-xs tracking-widest">
                                    <FiClock /> Session Info
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Date:</span>
                                        <span className="font-bold dark:text-white">{new Date(appointment.appointment_date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Time:</span>
                                        <span className="font-bold dark:text-white">{appointment.appointment_time}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Status:</span>
                                        <span className={`font-bold capitalize ${appointment.status === 'confirmed' ? 'text-green-600' : 'text-orange-500'
                                            }`}>{appointment.status}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Map & Conditions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Medical Info */}
                        <div className="md:col-span-1 space-y-4">
                            {/* Booking Specific Medical Info */}
                            {(appointment.activeMedications || appointment.currentPrescriptions) && (
                                <div className="p-5 rounded-2xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30">
                                    <h4 className="flex items-center gap-2 text-orange-700 font-bold mb-3 uppercase text-xs tracking-widest">
                                        <FiActivity /> Visit Medical Context
                                    </h4>
                                    {appointment.activeMedications && (
                                        <div className="mb-3">
                                            <p className="text-xs font-bold text-orange-600 mb-1">Active Meds:</p>
                                            <p className="text-sm dark:text-gray-300">{appointment.activeMedications}</p>
                                        </div>
                                    )}
                                    {appointment.currentPrescriptions && (
                                        <div>
                                            <p className="text-xs font-bold text-orange-600 mb-1">Prescriptions:</p>
                                            <p className="text-sm dark:text-gray-300">{appointment.currentPrescriptions}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30">
                                <h4 className="flex items-center gap-2 text-red-700 font-bold mb-3 uppercase text-xs tracking-widest">
                                    <FiActivity /> {appointment.isForSelf === false ? 'Beneficiary Health Checks' : 'Known Conditions'}
                                </h4>
                                <p className="text-gray-900 dark:text-gray-200 font-medium leading-relaxed">
                                    {appointment.isForSelf === false ? "No historical records for beneficiary." : (loadingProfile ? 'Loading...' : displayConditions)}
                                </p>
                                {displayAllergies && displayAllergies !== 'No allergies recorded.' && appointment.isForSelf !== false && (
                                    <div className="mt-2 pt-2 border-t border-red-200/50">
                                        <h5 className="text-xs font-bold text-red-600 mb-1">ALLERGIES</h5>
                                        <p className="text-sm text-red-800 dark:text-red-300">{displayAllergies}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Location Map */}
                        <div className="md:col-span-2 h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 relative">
                            {/* Logic: 
                                - For Doctor: Show Patient's Location (for home visits/knowing where patient exists)
                                - For Patient: Show Doctor's Location (Clinic), unless unavailable then fallback
                            */}
                            {(() => {
                                const doctorLoc = (appointment.doctor?.latitude && appointment.doctor?.longitude)
                                    ? [Number(appointment.doctor.latitude), Number(appointment.doctor.longitude)] as [number, number]
                                    : null;

                                const targetPosition = isDoctor
                                    ? position // Doctor sees Patient
                                    : (doctorLoc || position); // Patient sees Doctor (or fallback)

                                const hasTargetLoc = isDoctor ? hasLocation : (doctorLoc || hasLocation);

                                if (!hasTargetLoc) {
                                    return (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50 dark:bg-white/5">
                                            <div className="text-center">
                                                <FiMapPin className="text-4xl mx-auto mb-2 opacity-50" />
                                                <p className="text-sm font-medium">No location data available</p>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <MapContainer
                                        center={targetPosition}
                                        zoom={13}
                                        scrollWheelZoom={false}
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <ChangeView center={targetPosition} />
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                        />
                                        <Marker position={targetPosition}>
                                            <Popup>
                                                <div className="font-bold">
                                                    {isDoctor
                                                        ? `${appointment.isForSelf === false ? appointment.beneficiaryName : patient.fname}'s Location`
                                                        : (doctorLoc ? `Dr. ${appointment.doctor?.lname}'s Clinic` : "Patient Location")}
                                                </div>
                                                <div className="text-xs">
                                                    {isDoctor
                                                        ? (appointment.homeAddress || patient.address)
                                                        : (doctorLoc ? (appointment.doctor?.address || appointment.doctor?.residance || "Medical Center") : (appointment.homeAddress || patient.address))}
                                                </div>
                                            </Popup>
                                        </Marker>
                                    </MapContainer>
                                );
                            })()}
                        </div>
                    </div>

                    {/* Diagnosis / Notes */}
                    <div className="mb-6">
                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Reason / Diagnosis</h4>
                        <div className="p-5 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20">
                            <p className="text-gray-700 dark:text-gray-300 italic">
                                "{appointment.reason || appointment.notes || "No notes provided for this session."}"
                            </p>
                        </div>
                    </div>



                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            Close
                        </button>
                        {isDoctor && (
                            <button
                                onClick={() => setShowAddRecordModal(true)}
                                className="px-6 py-3 rounded-xl font-bold bg-primary text-black hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
                                Add Medical Record
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {showAddRecordModal && (
                <AddMedicalRecordModal
                    patientId={patient.user_id || patient.id}
                    appointmentId={appointment.id}
                    onClose={() => setShowAddRecordModal(false)}
                    onSuccess={() => {
                        setShowAddRecordModal(false);
                        // Optionally refresh appointment details?
                    }}
                />
            )}
        </div>
    );
}
