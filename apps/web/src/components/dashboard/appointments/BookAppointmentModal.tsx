'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { FiX, FiSearch, FiMapPin, FiUser, FiDollarSign, FiCalendar, FiClock } from 'react-icons/fi';
import { useAuth } from '@/lib/auth';
import CompleteProfileModal from '../CompleteProfileModal';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
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

function LocationPicker({ location, onLocationSelect }: any) {
    const map = useMap();

    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    useEffect(() => {
        if (location) {
            map.flyTo([location.lat, location.lng], map.getZoom());
        }
    }, [location, map]);

    return location ? <Marker position={[location.lat, location.lng]} /> : null;
}

interface Doctor {
    id: number;
    fname: string;
    lname: string;
    speciality: string;
    sex: string;
    fee: number;
    address: string;
    latitude: number;
    longitude: number;
    distance?: number;
    dr_type: string;
    profile_image?: string;
    is_online?: number;
}

interface BookAppointmentModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3434';

const DoctorAvatar = ({ doctor }: { doctor: Doctor }) => {
    const [error, setError] = useState(false);

    if (!doctor.profile_image || error) {
        return <>{'👨‍⚕️'}</>;
    }

    return (
        <img
            src={`${API_URL}/uploads/profiles/${doctor.profile_image}`}
            alt={doctor.fname}
            className="w-full h-full object-cover"
            onError={() => setError(true)}
        />
    );
};

export default function BookAppointmentModal({ onClose, onSuccess }: BookAppointmentModalProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [profileComplete, setProfileComplete] = useState(true);
    const [checkingProfile, setCheckingProfile] = useState(true);

    // Filters
    const [speciality, setSpeciality] = useState('');
    const [gender, setGender] = useState('');
    const [drTypeFilter, setDrTypeFilter] = useState('');
    const [maxPrice, setMaxPrice] = useState<number>(10000);
    const [searchTerm, setSearchTerm] = useState('');

    // Booking Stage
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('');
    const [bookingNote, setBookingNote] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [services, setServices] = useState<any[]>([]);
    const [selectedService, setSelectedService] = useState<any | null>(null);

    // Enhanced Booking State
    const [isForSelf, setIsForSelf] = useState(true);
    const [beneficiaryDetails, setBeneficiaryDetails] = useState({
        name: '',
        gender: 'Male',
        age: '',
        relation: 'Family Member'
    });
    const [medicalInfo, setMedicalInfo] = useState({
        medications: '',
        prescriptions: ''
    });
    const [customHomeAddress, setCustomHomeAddress] = useState(''); // Allow editing home address for transport fee logic

    useEffect(() => {
        // Fix Icons
        fixLeafletIcons();

        // Check Profile Completeness
        const checkProfile = async () => {
            try {
                const res = await api.get('/patients/profile');
                if (res && res.ok) {
                    const data = await res.json();
                    const p = data.patient;
                    // Check essential fields
                    if (!p || !p.blood_group || !p.emergency_contact_name) {
                        setProfileComplete(false);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setCheckingProfile(false);
            }
        };
        if (user?.role === 'patient') {
            checkProfile();
        } else {
            setCheckingProfile(false);
        }

        // Get User Location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => console.log('Geolocation error:', error)
            );
        }

        fetchDoctors();
        fetchServices();
    }, [user]);

    const fetchAddressFromCoords = async (lat: number, lng: number) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
                headers: { 'User-Agent': 'Mclinic-App/1.0' }
            });
            const data = await res.json();
            if (data && data.display_name) {
                setCustomHomeAddress(data.display_name);
            }
        } catch (e) {
            console.error("Reverse geocoding failed", e);
        }
    };

    const fetchDoctors = async () => {
        try {
            // Include offline doctors for booking purposes
            const res = await api.get('/doctors?include_offline=true');
            if (res && res.ok) {
                const data = await res.json();
                setDoctors(data);
                setFilteredDoctors(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchServices = async () => {
        try {
            const res = await api.get('/services');
            if (res && res.ok) {
                const data = await res.json();
                setServices(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const getDisplayFee = (doc: Doctor) => {
        const type = (doc.dr_type || '').toLowerCase();
        if (type.includes('nurse') || type.includes('clinician')) {
            return 1500;
        }
        return doc.fee;
    };

    useEffect(() => {
        let result = doctors.map(doc => {
            let dist = 0;
            if (userLocation && doc.latitude && doc.longitude) {
                dist = calculateDistance(userLocation.lat, userLocation.lng, Number(doc.latitude), Number(doc.longitude));
            }
            return { ...doc, distance: dist };
        });

        if (speciality) {
            result = result.filter(d => d.speciality?.toLowerCase().includes(speciality.toLowerCase()));
        }
        if (gender) {
            result = result.filter(d => d.sex?.toLowerCase() === gender.toLowerCase());
        }
        if (drTypeFilter) {
            result = result.filter(d => (d.dr_type || '').toLowerCase().includes(drTypeFilter.toLowerCase()));
        }
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(d =>
                (d.fname || '').toLowerCase().includes(lower) ||
                (d.lname || '').toLowerCase().includes(lower) ||
                (d.address || '').toLowerCase().includes(lower) ||
                (d.dr_type || '').toLowerCase().includes(lower) ||
                (d.speciality || '').toLowerCase().includes(lower)
            );
        }
        if (maxPrice) {
            result = result.filter(d => getDisplayFee(d) <= maxPrice);
        }

        // Sort by distance if location available
        if (userLocation) {
            result.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        }

        setFilteredDoctors(result);
    }, [doctors, speciality, gender, maxPrice, searchTerm, userLocation, drTypeFilter]);

    const handleBook = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDoctor) return;
        setSubmitting(true);

        try {
            // Determine if virtual
            const isVirtual = selectedService?.id === 'VIRTUAL_DOC' || selectedService?.id === 'VIRTUAL_NURSE' || selectedService?.id === 2 || selectedService?.name?.toLowerCase().includes('virtual');

            const payload = {
                doctorId: selectedDoctor.id,
                appointmentDate: bookingDate,
                appointmentTime: bookingTime,
                reason: bookingNote,
                serviceId: (selectedService && selectedService.id !== 'VIRTUAL_DOC') ? selectedService.id : null,
                isVirtual, // Pass flag to backend
                patientLocation: userLocation, // Pass location for transport fee calc
                // Enhanced Fields
                isForSelf,
                beneficiaryName: !isForSelf ? beneficiaryDetails.name : null,
                beneficiaryGender: !isForSelf ? beneficiaryDetails.gender : null,
                beneficiaryAge: !isForSelf ? beneficiaryDetails.age : null,
                beneficiaryRelation: !isForSelf ? beneficiaryDetails.relation : null,
                activeMedications: medicalInfo.medications,
                currentPrescriptions: medicalInfo.prescriptions,
                homeAddress: (!isVirtual && customHomeAddress) ? customHomeAddress : null,
            };

            const res = await api.post('/appointments', payload);
            if (res && res.ok) {
                const data = await res.json();
                console.log('Booking Success:', data);

                if (data && data.id) {
                    router.push(`/dashboard/appointments/${data.id}/pay`);
                } else {
                    alert('Appointment booked successfully! Please verify in "My Appointments".');
                    onSuccess();
                }
            } else {
                alert('Failed to book appointment.');
            }
        } catch (err) {
            console.error(err);
            alert('Error booking appointment.');
        } finally {
            setSubmitting(false);
        }
    };

    // Get unique specialities
    const uniqueSpecialities = Array.from(new Set(doctors.map(d => d.speciality).filter(Boolean)));

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`bg-white dark:bg-[#1A1A1A] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-300`}>
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black dark:text-white">
                            {selectedDoctor ? `Book ${selectedDoctor.fname}` : 'Find a Specialist'}
                        </h2>
                        <p className="text-sm text-gray-500 font-medium">
                            {selectedDoctor ? 'Select a time slot for your visit' : 'Choose from the best medics closest to you'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
                        <FiX size={24} className="dark:text-white" />
                    </button>
                </div>

                {checkingProfile ? (
                    <div className="flex-1 flex items-center justify-center p-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : !profileComplete && user?.role === 'patient' ? (
                    <CompleteProfileModal
                        onClose={onClose}
                        onSuccess={() => {
                            setProfileComplete(true);
                            // Refresh to continue booking
                        }}
                        user={user}
                    />
                ) : !selectedDoctor ? (
                    <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                        {/* Filters Sidebar */}
                        <div className="w-full md:w-80 bg-gray-50 dark:bg-[#121212] p-6 border-r border-gray-100 dark:border-gray-800 overflow-y-auto">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-black uppercase text-gray-400 mb-2 block">Search</label>
                                    <div className="relative">
                                        <FiSearch className="absolute left-3 top-3 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Doctor name or location..."
                                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white text-sm focus:ring-2 focus:ring-primary outline-none"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-black uppercase text-gray-400 mb-2 block">Speciality</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white text-sm outline-none"
                                        value={speciality}
                                        onChange={(e) => setSpeciality(e.target.value)}
                                    >
                                        <option value="">All Specialities</option>
                                        {uniqueSpecialities.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-black uppercase text-gray-400 mb-2 block">Doctor Type</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white text-sm outline-none"
                                        value={drTypeFilter}
                                        onChange={(e) => setDrTypeFilter(e.target.value)}
                                    >
                                        <option value="">All Types</option>
                                        <option value="Doctor">Doctor</option>
                                        <option value="Nurse">Nurse</option>
                                        <option value="Clinician">Clinician</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-black uppercase text-gray-400 mb-2 block">Gender</label>
                                    <div className="flex gap-2">
                                        {['Male', 'Female'].map(g => (
                                            <button
                                                key={g}
                                                onClick={() => setGender(gender === g ? '' : g)}
                                                className={`flex-1 py-2 rounded-lg text-sm font-bold border ${gender === g
                                                    ? 'bg-primary text-black border-primary'
                                                    : 'bg-white dark:bg-black border-gray-200 dark:border-gray-700 dark:text-gray-300'}`}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-black uppercase text-gray-400 mb-2 block flex justify-between">
                                        <span>Max Price</span>
                                        <span className="text-primary font-bold">KES {maxPrice}</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="10000"
                                        step="500"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                </div>

                                {userLocation && (
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-start gap-2">
                                        <FiMapPin className="text-blue-500 mt-1" />
                                        <div>
                                            <h5 className="text-sm font-bold text-blue-900 dark:text-blue-300">Location Active</h5>
                                            <p className="text-xs text-blue-700 dark:text-blue-400">Showing closest doctors first.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Results List */}
                        <div className="flex-1 p-6 overflow-y-auto bg-white dark:bg-[#161616]">
                            <div className="mb-4 flex items-center justify-between">
                                <span className="text-sm font-bold text-gray-500">{filteredDoctors.length} doctors found</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {loading && <div className="col-span-2 text-center py-12">Loading...</div>}

                                {filteredDoctors.map(doc => (
                                    <div
                                        key={doc.id}
                                        className="relative group bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                                        onClick={() => setSelectedDoctor(doc)}
                                    >
                                        {/* Header: Avatar & Status */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="relative">
                                                <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-2xl overflow-hidden shadow-sm border-2 border-white dark:border-gray-700">
                                                    <DoctorAvatar doctor={doc} />
                                                </div>
                                                {/* Online Status Dot */}
                                                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-[#1A1A1A] flex items-center justify-center ${doc.is_online === 1 ? 'bg-green-500' : 'bg-gray-300'}`}>
                                                    {doc.is_online === 1 && <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>}
                                                </div>
                                            </div>

                                            {/* Distance Badge */}
                                            {doc.distance !== undefined && (
                                                <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                                                    <FiMapPin className="w-3 h-3" />
                                                    {doc.distance < 1 ? '< 1 km' : `${doc.distance.toFixed(1)} km`}
                                                </span>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="space-y-1 mb-4">
                                            <h4 className="text-lg font-black text-gray-900 dark:text-white leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                                                {doc.fname} {doc.lname}
                                            </h4>

                                            {/* Role Badge */}
                                            <div className="flex flex-wrap gap-2">
                                                <span className="inline-block px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                                                    {doc.dr_type || 'Specialist'}
                                                </span>
                                                {doc.speciality && (
                                                    <span className="inline-block px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider">
                                                        {doc.speciality}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Details Details */}
                                        <div className="space-y-3 pt-4 border-t border-gray-50 dark:border-gray-800">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-400 flex items-center gap-1.5">
                                                    <FiMapPin />
                                                    <span className="truncate max-w-[120px] font-medium">{doc.address || 'Nairobi, Kenya'}</span>
                                                </span>

                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] text-gray-400 uppercase font-bold">Consultation</span>
                                                    <span className="font-black text-gray-900 dark:text-white">KES {getDisplayFee(doc)}</span>
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <div className="w-full py-2.5 bg-gray-50 dark:bg-gray-800 group-hover:bg-primary group-hover:text-black text-gray-500 font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2">
                                                <span>Book Appointment</span>
                                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    // Booking Form
                    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#121212]">
                        <form onSubmit={handleBook} className="max-w-2xl mx-auto p-6 md:p-8 space-y-8">

                            {/* Back Navigation */}
                            <button
                                type="button"
                                onClick={() => setSelectedDoctor(null)}
                                className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                <span className="text-lg">←</span> Back to Specialists
                            </button>

                            {/* Professional Header Card */}
                            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center gap-6">
                                <div className="w-20 h-20 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-3xl overflow-hidden shadow-sm border-2 border-white dark:border-gray-700 shrink-0">
                                    <DoctorAvatar doctor={selectedDoctor} />
                                </div>
                                <div className="text-center md:text-left flex-1">
                                    <h3 className="font-black text-2xl text-gray-900 dark:text-white leading-tight mb-1">
                                        {selectedDoctor.fname} {selectedDoctor.lname}
                                    </h3>
                                    <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-3">
                                        <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-bold uppercase tracking-wide">
                                            {selectedDoctor.speciality}
                                        </span>
                                        <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs font-bold">
                                            {selectedDoctor.address}
                                        </span>
                                    </div>
                                    <div className="inline-block px-4 py-1.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-bold border border-green-100 dark:border-green-900">
                                        Consultation Fee: KES {selectedService ? selectedService.price : getDisplayFee(selectedDoctor)}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8 bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                                {/* 1. Who is this for? */}
                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-400 mb-3 tracking-wider">Who is this appointment for?</label>
                                    <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => setIsForSelf(true)}
                                            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all duration-200 ${isForSelf
                                                ? 'bg-white dark:bg-[#2A2A2A] text-black dark:text-white shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                        >
                                            For Me
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsForSelf(false)}
                                            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all duration-200 ${!isForSelf
                                                ? 'bg-white dark:bg-[#2A2A2A] text-black dark:text-white shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                        >
                                            Someone Else
                                        </button>
                                    </div>

                                    {!isForSelf && (
                                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Full Name</label>
                                                <input
                                                    type="text"
                                                    required={!isForSelf}
                                                    placeholder="Patient Name"
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#121212] focus:bg-white dark:focus:bg-black focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                                                    value={beneficiaryDetails.name}
                                                    onChange={(e) => setBeneficiaryDetails({ ...beneficiaryDetails, name: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Relation</label>
                                                <select
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#121212] focus:bg-white dark:focus:bg-black focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                                                    value={beneficiaryDetails.relation}
                                                    onChange={(e) => setBeneficiaryDetails({ ...beneficiaryDetails, relation: e.target.value })}
                                                >
                                                    <option>Family Member</option>
                                                    <option>Friend</option>
                                                    <option>Child</option>
                                                    <option>Parent</option>
                                                    <option>Spouse</option>
                                                    <option>Other</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Age</label>
                                                <input
                                                    type="number"
                                                    placeholder="Age"
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#121212] focus:bg-white dark:focus:bg-black focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                                                    value={beneficiaryDetails.age}
                                                    onChange={(e) => setBeneficiaryDetails({ ...beneficiaryDetails, age: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 mb-1.5 block">Gender</label>
                                                <select
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#121212] focus:bg-white dark:focus:bg-black focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                                                    value={beneficiaryDetails.gender}
                                                    onChange={(e) => setBeneficiaryDetails({ ...beneficiaryDetails, gender: e.target.value })}
                                                >
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Date & Time */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-400 mb-2 tracking-wider">Date</label>
                                        <div className="relative group">
                                            <FiCalendar className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="date"
                                                required
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#121212] focus:bg-white dark:focus:bg-black focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-gray-700 dark:text-gray-200"
                                                value={bookingDate}
                                                onChange={(e) => setBookingDate(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-400 mb-2 tracking-wider">Time</label>
                                        <div className="relative group">
                                            <FiClock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="time"
                                                required
                                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#121212] focus:bg-white dark:focus:bg-black focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-gray-700 dark:text-gray-200"
                                                value={bookingTime}
                                                onChange={(e) => setBookingTime(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Address for Home Visit */}
                                {(!selectedService?.id?.toString().includes('VIRTUAL') && !selectedService?.name?.toLowerCase().includes('virtual')) && (
                                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center justify-between mb-4">
                                            <label className="text-xs font-black uppercase text-gray-400 tracking-wider">Home Visit Location</label>
                                            <span className="text-xs text-primary font-bold bg-primary/10 px-2 py-1 rounded">Step 1: Pin Location</span>
                                        </div>

                                        {/* Map Section */}
                                        <div className="h-64 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 mb-4 relative z-0 shadow-sm group hover:border-primary/50 transition-colors">
                                            <MapContainer
                                                center={[userLocation?.lat || -1.2921, userLocation?.lng || 36.8219]}
                                                zoom={13}
                                                style={{ height: '100%', width: '100%' }}
                                            >
                                                <TileLayer
                                                    attribution='&copy; OpenStreetMap contributors'
                                                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                                />
                                                <LocationPicker
                                                    location={userLocation}
                                                    onLocationSelect={(latlng: any) => {
                                                        setUserLocation({ lat: latlng.lat, lng: latlng.lng });
                                                        fetchAddressFromCoords(latlng.lat, latlng.lng);
                                                    }}
                                                />
                                            </MapContainer>

                                            {/* Overlay Buttons */}
                                            <div className="absolute top-3 right-3 flex flex-col gap-2 z-[9999]">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (navigator.geolocation) {
                                                            navigator.geolocation.getCurrentPosition(p => {
                                                                const coords = { lat: p.coords.latitude, lng: p.coords.longitude };
                                                                setUserLocation(coords);
                                                                fetchAddressFromCoords(coords.lat, coords.lng);
                                                            });
                                                        }
                                                    }}
                                                    className="bg-white text-gray-800 p-2.5 rounded-xl shadow-lg hover:bg-gray-50 text-xs font-bold flex items-center gap-2 transition-transform active:scale-95"
                                                >
                                                    📍 Use My Location
                                                </button>
                                            </div>
                                        </div>

                                        <label className="text-xs font-bold text-gray-500 mb-2 block">Confirm Specific Address</label>
                                        <div className="flex gap-3">
                                            <div className="relative flex-1 group">
                                                <FiMapPin className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                                <input
                                                    type="text"
                                                    placeholder="Enter house no, street, or landmark..."
                                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#121212] focus:bg-white dark:focus:bg-black focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                                                    value={customHomeAddress}
                                                    onChange={(e) => setCustomHomeAddress(e.target.value)}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    if (!customHomeAddress) return;
                                                    // Simple Search Indicator
                                                    const btn = document.getElementById('search-btn');
                                                    if (btn) btn.innerText = 'Searching...';

                                                    try {
                                                        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(customHomeAddress + ', Kenya')}`, {
                                                            headers: { 'User-Agent': 'Mclinic-App/1.0' }
                                                        });
                                                        const data = await res.json();
                                                        if (data && data.length > 0) {
                                                            const { lat, lon } = data[0];
                                                            setUserLocation({ lat: Number(lat), lng: Number(lon) });
                                                        } else {
                                                            alert('Location not found. Try adding a city name.');
                                                        }
                                                    } catch (e) {
                                                        console.error(e);
                                                    } finally {
                                                        if (btn) btn.innerText = 'Find on Map';
                                                    }
                                                }}
                                                id="search-btn"
                                                className="bg-gray-900 dark:bg-white text-white dark:text-black px-6 rounded-xl font-bold text-sm whitespace-nowrap hover:bg-gray-800 transition shadow-sm active:scale-95"
                                            >
                                                Find on Map
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-400 mb-2 tracking-wider">Service (Optional)</label>
                                    <select
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#121212] focus:bg-white dark:focus:bg-black focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium appearance-none"
                                        value={selectedService?.id || ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === 'VIRTUAL_DOC' || val === 'VIRTUAL_NURSE') {
                                                // Virtual Session
                                                setSelectedService({ id: val, name: 'Virtual Consultation', price: getDisplayFee(selectedDoctor) } as any);
                                            } else if (val === 'HOME_VISIT_NURSE') {
                                                setSelectedService({ id: val, name: 'Home Visit', price: getDisplayFee(selectedDoctor) } as any);
                                            } else {
                                                const sId = Number(val);
                                                const svc = services.find(s => s.id === sId) || null;
                                                setSelectedService(svc);
                                            }
                                        }}
                                    >
                                        {/* Logic for Doctors vs Nurses */}
                                        {(!selectedDoctor.dr_type || !['nurse', 'clinician'].some(t => selectedDoctor.dr_type.toLowerCase().includes(t))) ? (
                                            <>
                                                <option value="">General Consultation (Home Visit) - KES {getDisplayFee(selectedDoctor)} + Transport</option>
                                                <option value="VIRTUAL_DOC">Virtual Session - KES {getDisplayFee(selectedDoctor)} (No Transport)</option>
                                            </>
                                        ) : (
                                            <>
                                                <option value="">Select Service...</option>
                                                <option value="HOME_VISIT_NURSE">Home Visit - KES {getDisplayFee(selectedDoctor)} + Transport</option>
                                                <option value="VIRTUAL_NURSE">Virtual Consultation - KES {getDisplayFee(selectedDoctor)}</option>
                                                {services.map(s => (
                                                    <option key={s.id} value={s.id}>
                                                        {s.name} - KES {s.price}
                                                    </option>
                                                ))}
                                            </>
                                        )}
                                    </select>
                                </div>

                                {/* Medical Info */}
                                <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <label className="block text-xs font-black uppercase text-gray-400 tracking-wider">Medical Information</label>

                                    <div>
                                        <textarea
                                            rows={2}
                                            placeholder="Active Medications (e.g. Aspirin 75mg daily)..."
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#121212] focus:bg-white dark:focus:bg-black focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none text-sm transition-all"
                                            value={medicalInfo.medications}
                                            onChange={(e) => setMedicalInfo({ ...medicalInfo, medications: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <textarea
                                            rows={2}
                                            placeholder="Current Prescriptions / Allergies..."
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#121212] focus:bg-white dark:focus:bg-black focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none text-sm transition-all"
                                            value={medicalInfo.prescriptions}
                                            onChange={(e) => setMedicalInfo({ ...medicalInfo, prescriptions: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-400 mb-2 tracking-wider">Reason for Visit</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Briefly describe your symptoms..."
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#121212] focus:bg-white dark:focus:bg-black focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all"
                                        value={bookingNote}
                                        onChange={(e) => setBookingNote(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="sticky bottom-0 bg-gray-50 dark:bg-[#121212] pt-4 pb-0">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-4 bg-gray-900 dark:bg-white hover:bg-black hover:scale-[1.01] text-white dark:text-black font-black text-lg rounded-2xl transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            Confirm Appointment
                                            <span className="text-xl">→</span>
                                        </>
                                    )}
                                </button>
                                <p className="text-center text-xs text-gray-400 mt-3 pb-2">
                                    By booking, you agree to our terms of service.
                                </p>
                            </div>

                        </form>
                    </div >
                )
                }
            </div >
        </div >
    );
}
