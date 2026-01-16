'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { FiX, FiSearch, FiMapPin, FiUser, FiDollarSign, FiCalendar, FiClock, FiArrowRight } from 'react-icons/fi';
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
                    <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-[#121212]">
                        <form onSubmit={handleBook} className="max-w-3xl mx-auto p-4 md:p-8 space-y-8 pb-32">

                            {/* Navigation */}
                            <button
                                type="button"
                                onClick={() => setSelectedDoctor(null)}
                                className="group flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                    <span className="text-lg pb-1">←</span>
                                </div>
                                Back to Specialists
                            </button>

                            {/* Doctor Summary Card */}
                            <div className="bg-white dark:bg-[#1A1A1A] rounded-3xl p-1 shadow-sm border border-gray-100 dark:border-gray-800">
                                <div className="flex flex-col md:flex-row gap-6 p-5">
                                    <div className="w-24 h-24 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-4xl overflow-hidden shadow-sm border-4 border-white dark:border-gray-700 shrink-0">
                                        <DoctorAvatar doctor={selectedDoctor} />
                                    </div>
                                    <div className="flex-1 py-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-black text-2xl text-gray-900 dark:text-white leading-tight mb-2">
                                                    Dr. {selectedDoctor.fname} {selectedDoctor.lname}
                                                </h3>
                                                <p className="text-sm font-medium text-primary mb-1">{selectedDoctor.speciality}</p>
                                                <p className="text-xs font-bold text-gray-400 flex items-center gap-1">
                                                    <FiMapPin /> {selectedDoctor.address}
                                                </p>
                                            </div>
                                            <div className="text-right hidden md:block">
                                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Consultation</div>
                                                <div className="text-xl font-black text-gray-900 dark:text-white">
                                                    KES {selectedService ? selectedService.price : getDisplayFee(selectedDoctor)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                {/* LEFT COLUMN: Details */}
                                <div className="md:col-span-12 space-y-8">

                                    {/* SECTION 1: Patient Details */}
                                    <section className="bg-white dark:bg-[#1A1A1A] rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group hover:shadow-md transition-shadow">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-3xl"></div>
                                        <h4 className="text-lg font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center text-sm">1</span>
                                            Patient Details
                                        </h4>

                                        <div className="bg-gray-50 dark:bg-black/20 p-1.5 rounded-2xl inline-flex w-full mb-6">
                                            <button
                                                type="button"
                                                onClick={() => setIsForSelf(true)}
                                                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200 ${isForSelf
                                                    ? 'bg-white dark:bg-[#2A2A2A] text-black dark:text-white shadow-sm ring-1 ring-black/5'
                                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                            >
                                                Myself
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsForSelf(false)}
                                                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200 ${!isForSelf
                                                    ? 'bg-white dark:bg-[#2A2A2A] text-black dark:text-white shadow-sm ring-1 ring-black/5'
                                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                            >
                                                Someone Else
                                            </button>
                                        </div>

                                        {!isForSelf && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Name</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Full Name"
                                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-[#0A0A0A] border-transparent focus:bg-white dark:focus:bg-black focus:ring-2 focus:ring-blue-500/20 transition-all font-bold outline-none"
                                                        value={beneficiaryDetails.name}
                                                        onChange={(e) => setBeneficiaryDetails({ ...beneficiaryDetails, name: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Relation</label>
                                                    <select
                                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-[#0A0A0A] border-transparent focus:bg-white dark:focus:bg-black focus:ring-2 focus:ring-blue-500/20 transition-all font-bold outline-none appearance-none"
                                                        value={beneficiaryDetails.relation}
                                                        onChange={(e) => setBeneficiaryDetails({ ...beneficiaryDetails, relation: e.target.value })}
                                                    >
                                                        {['Family Member', 'Child', 'Spouse', 'Parent', 'Friend', 'Other'].map(r => <option key={r} value={r}>{r}</option>)}
                                                    </select>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Age</label>
                                                    <input
                                                        type="number"
                                                        placeholder="Years"
                                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-[#0A0A0A] border-transparent focus:bg-white dark:focus:bg-black focus:ring-2 focus:ring-blue-500/20 transition-all font-bold outline-none"
                                                        value={beneficiaryDetails.age}
                                                        onChange={(e) => setBeneficiaryDetails({ ...beneficiaryDetails, age: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Gender</label>
                                                    <select
                                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-[#0A0A0A] border-transparent focus:bg-white dark:focus:bg-black focus:ring-2 focus:ring-blue-500/20 transition-all font-bold outline-none appearance-none"
                                                        value={beneficiaryDetails.gender}
                                                        onChange={(e) => setBeneficiaryDetails({ ...beneficiaryDetails, gender: e.target.value })}
                                                    >
                                                        <option value="Male">Male</option>
                                                        <option value="Female">Female</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}
                                    </section>

                                    {/* SECTION 2: Date & Time */}
                                    <section className="bg-white dark:bg-[#1A1A1A] rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group hover:shadow-md transition-shadow">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 rounded-l-3xl"></div>
                                        <h4 className="text-lg font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center text-sm">2</span>
                                            Schedule
                                        </h4>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Select Date</label>
                                                <div className="relative group">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                        <FiCalendar className="text-gray-400 group-focus-within:text-purple-500" />
                                                    </div>
                                                    <input
                                                        type="date"
                                                        required
                                                        min={new Date().toISOString().split('T')[0]}
                                                        className="w-full pl-11 pr-5 py-4 rounded-2xl bg-gray-50 dark:bg-[#0A0A0A] border-transparent focus:bg-white dark:focus:bg-black focus:ring-2 focus:ring-purple-500/20 transition-all font-bold outline-none text-gray-700 dark:text-gray-200"
                                                        value={bookingDate}
                                                        onChange={(e) => setBookingDate(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Select Time (24H)</label>
                                                {!bookingDate ? (
                                                    <div className="h-[56px] rounded-2xl bg-gray-50 dark:bg-[#0A0A0A] flex items-center justify-center text-xs text-gray-400 font-bold border-2 border-dashed border-gray-200 dark:border-gray-800">
                                                        First select a date
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-2 custom-scrollbar p-1">
                                                        {Array.from({ length: 48 }).map((_, i) => {
                                                            const h = Math.floor(i / 2).toString().padStart(2, '0');
                                                            const m = i % 2 === 0 ? '00' : '30';
                                                            const time = `${h}:${m}`;
                                                            return (
                                                                <button
                                                                    key={time}
                                                                    type="button"
                                                                    onClick={() => setBookingTime(time)}
                                                                    className={`py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${bookingTime === time
                                                                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 dark:shadow-none scale-105'
                                                                        : 'bg-gray-100 dark:bg-[#0A0A0A] text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800'
                                                                        }`}
                                                                >
                                                                    {time}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </section>

                                    {/* SECTION 3: Location (If Home Visit) */}
                                    {(!selectedService?.id?.toString().includes('VIRTUAL') && !selectedService?.name?.toLowerCase().includes('virtual')) && (
                                        <section className="bg-white dark:bg-[#1A1A1A] rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group hover:shadow-md transition-shadow">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-3xl"></div>
                                            <h4 className="text-lg font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">3</span>
                                                Location
                                            </h4>

                                            {/* Map Container - PURE MAP */}
                                            <div className="h-64 w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 relative z-0 shadow-inner bg-gray-100 mb-4">
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
                                            </div>

                                            {/* External Controls */}
                                            <div className="flex flex-col md:flex-row gap-4 items-center">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (navigator.geolocation) {
                                                            const btn = document.getElementById('gps-btn-label');
                                                            if (btn) btn.innerText = 'Locating...';

                                                            navigator.geolocation.getCurrentPosition(p => {
                                                                const coords = { lat: p.coords.latitude, lng: p.coords.longitude };
                                                                setUserLocation(coords);
                                                                fetchAddressFromCoords(coords.lat, coords.lng);
                                                                if (btn) btn.innerText = 'Got it!';
                                                                setTimeout(() => { if (btn) btn.innerText = 'Use Current GPS Location'; }, 2000);
                                                            });
                                                        }
                                                    }}
                                                    className="w-full md:w-auto px-6 py-4 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2"
                                                >
                                                    <FiMapPin className="text-lg" />
                                                    <span id="gps-btn-label">Use Current GPS Location</span>
                                                </button>

                                                <div className="flex-1 w-full relative group">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                        <FiSearch className="text-gray-400 group-focus-within:text-primary" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="Or search address manually..."
                                                        className="w-full pl-11 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-[#0A0A0A] border-transparent focus:bg-white dark:focus:bg-black focus:ring-2 focus:ring-primary/20 transition-all font-medium outline-none text-sm"
                                                        value={customHomeAddress}
                                                        onChange={(e) => setCustomHomeAddress(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </section>
                                    )}

                                    {/* SECTION 4: Service & Medical */}
                                    <section className="bg-white dark:bg-[#1A1A1A] rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group hover:shadow-md transition-shadow">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 rounded-l-3xl"></div>
                                        <h4 className="text-lg font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center text-sm">4</span>
                                            Final Details
                                        </h4>

                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Service Type</label>
                                                <select
                                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-[#0A0A0A] border-transparent focus:bg-white dark:focus:bg-black focus:ring-2 focus:ring-orange-500/20 transition-all font-bold outline-none appearance-none"
                                                    value={selectedService?.id || ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val === 'VIRTUAL_DOC' || val === 'VIRTUAL_NURSE') {
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

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Reason for Visit</label>
                                                <textarea
                                                    rows={3}
                                                    placeholder="Briefly describe your symptoms..."
                                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-[#0A0A0A] border-transparent focus:bg-white dark:focus:bg-black focus:ring-2 focus:ring-orange-500/20 transition-all font-medium outline-none resize-none"
                                                    value={bookingNote}
                                                    onChange={(e) => setBookingNote(e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Medical Info (Optional)</label>
                                                <input
                                                    type="text"
                                                    placeholder="Current medications, allergies, etc."
                                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-[#0A0A0A] border-transparent focus:bg-white dark:focus:bg-black focus:ring-2 focus:ring-orange-500/20 transition-all font-medium outline-none"
                                                    value={medicalInfo.medications}
                                                    onChange={(e) => setMedicalInfo({ ...medicalInfo, medications: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </div>

                            {/* Sticky Bottom Actions */}
                            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-[#1A1A1A]/90 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 z-50 flex justify-center">
                                <div className="w-full max-w-3xl flex items-center justify-between gap-6">
                                    <div className="hidden md:block">
                                        <p className="text-xs text-gray-400 uppercase font-bold">Total to Pay</p>
                                        <p className="text-2xl font-black text-gray-900 dark:text-white">
                                            KES {selectedService ? selectedService.price : getDisplayFee(selectedDoctor)}
                                            <span className="text-xs font-normal text-gray-500 ml-1">(+ Transport if applicable)</span>
                                        </p>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={submitting || !bookingDate || !bookingTime}
                                        className={`flex-1 md:flex-none md:w-96 py-4 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 ${submitting || !bookingDate || !bookingTime
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            : 'bg-primary text-black hover:shadow-2xl hover:shadow-primary/30'
                                            }`}
                                    >
                                        {submitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
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
                            </div>

                        </form>
                    </div >
                )
                }
            </div >
        </div >
    );
}
