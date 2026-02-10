'use client';

import { useState } from 'react';
import { FiActivity, FiPlus } from 'react-icons/fi';
import { useAuth } from '@/lib/auth';
import ApprovalStatusBanner from '../ApprovalStatusBanner';
import DoctorIdCard from '../DoctorIdCard';
import EditMedicProfileModal from './doctors/EditMedicProfileModal';
import ViewAppointmentDetailsModal from './appointments/ViewAppointmentDetailsModal';
import { useMedicDashboard } from '@/hooks/useMedicDashboard';
import MedicStats from './medic/MedicStats';
import UpcomingAppointments from './medic/UpcomingAppointments';
import QuickActions from './medic/QuickActions';

export default function DoctorView() {
    const { user } = useAuth();
    const {
        doctorProfile,
        stats,
        upcomingAppointments,
        isOnline,
        toggleOnlineStatus,
        loading,
        refresh
    } = useMedicDashboard();

    // Modal States
    const [showEditProfileModal, setShowEditProfileModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

    // Profile Warning Logic
    const profileWarning = doctorProfile && (!doctorProfile.about || !doctorProfile.speciality || !doctorProfile.qualification || !doctorProfile.address);

    // Dynamic Prefix Logic
    const getPrefix = () => {
        if (!doctorProfile?.dr_type) return 'Medic';
        const type = doctorProfile.dr_type.toLowerCase();
        if (type.includes('doctor') || type.includes('specialist')) return 'Dr.';
        if (type.includes('nurse')) return 'Nurse';
        if (type.includes('clinician')) return 'Clinician';
        return 'Medic';
    };

    const prefix = getPrefix();

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {profileWarning && (
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-xl flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <FiActivity className="text-orange-500 text-xl" />
                        <div>
                            <p className="font-bold text-orange-800">Action Required: Complete your Profile</p>
                            <p className="text-sm text-orange-700">You must update your bio, speciality, and location to appear in search results.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowEditProfileModal(true)}
                        className="text-sm font-bold bg-white text-orange-600 px-4 py-2 rounded-lg border border-orange-200 hover:bg-orange-100 transition"
                    >
                        Edit Profile
                    </button>
                </div>
            )}

            {/* Approval Status Banner */}
            {doctorProfile && (
                <ApprovalStatusBanner
                    status={doctorProfile.approvalStatus || 'pending'}
                    rejectionReason={doctorProfile.rejectionReason}
                    licenseStatus={doctorProfile.licenseStatus || 'valid'}
                    licenseExpiryDate={doctorProfile.licenseExpiryDate}
                />
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-bold dark:text-white">Welcome back, {prefix} {user?.fname}</h1>
                    <p className="text-gray-500 font-medium tracking-tight">You have {stats.appointmentsToday} appointments scheduled for today.</p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowEditProfileModal(true)}
                        className="text-sm font-bold text-gray-500 hover:text-black dark:hover:text-white underline"
                    >
                        Edit Profile
                    </button>
                    <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-2 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <span className={`text-sm font-bold ${isOnline ? 'text-green-600' : 'text-gray-400'}`}>
                            {isOnline ? 'ONLINE' : 'OFFLINE'}
                        </span>
                        <button
                            onClick={toggleOnlineStatus}
                            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isOnline ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {/* Safety Button - Only show when doctor has appointments */}
                    {stats.appointmentsToday > 0 && (
                        <button
                            onClick={() => {
                                const roomName = `${prefix.replace('.', '')}-${user?.fname}-${user?.id}`;
                                const url = `https://virtual.mclinic.co.ke/${roomName}`;
                                window.open(url, '_blank');
                            }}
                            className="bg-red-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-red-600/30 hover:scale-[1.02] transition-transform"
                        >
                            <FiPlus /> Safety Button
                        </button>
                    )}
                </div>
            </div>

            {/* Restrict features for pending/rejected doctors */}
            {doctorProfile && (doctorProfile.approvalStatus === 'pending' || doctorProfile.approvalStatus === 'rejected') ? (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-8 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="text-6xl mb-4">🔒</div>
                        <h3 className="text-xl font-bold dark:text-white mb-2">Limited Access</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            {doctorProfile.approvalStatus === 'pending'
                                ? 'Your account is pending approval. You can update your profile while waiting for admin review.'
                                : 'Your account application was not approved. Please contact support for more information.'}
                        </p>
                        <button
                            onClick={() => setShowEditProfileModal(true)}
                            className="bg-primary hover:bg-primary/90 text-black px-6 py-3 rounded-lg font-medium transition"
                        >
                            Update Profile
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <MedicStats stats={stats} profile={doctorProfile} loading={loading} />

                    {/* ID Card Generation Section - Only for Approved Doctors */}
                    {doctorProfile && doctorProfile.approvalStatus === 'approved' && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold dark:text-white mb-4">Professional ID Card</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                                Generate and print your official M-Clinic Kenya ID card with QR code verification.
                            </p>
                            <DoctorIdCard doctorId={doctorProfile.id} />
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <UpcomingAppointments
                            appointments={upcomingAppointments}
                            loading={loading}
                            onSelect={(apt) => {
                                setSelectedAppointment(apt);
                                setShowDetailsModal(true);
                            }}
                        />
                        <QuickActions />
                    </div>
                </>
            )}

            {/* Modals */}
            {showEditProfileModal && doctorProfile && (
                <EditMedicProfileModal
                    doctor={doctorProfile}
                    onClose={() => setShowEditProfileModal(false)}
                    onSuccess={() => {
                        refresh(); // Refresh data after profile update
                    }}
                />
            )}

            {showDetailsModal && selectedAppointment && (
                <ViewAppointmentDetailsModal
                    appointment={selectedAppointment}
                    onClose={() => setShowDetailsModal(false)}
                />
            )}

            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
                {/* Footer content can stay or be removed if layout handles it */}
            </div>
        </div>
    );
}
