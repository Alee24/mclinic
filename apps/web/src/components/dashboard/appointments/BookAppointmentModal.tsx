'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { FiX, FiSearch, FiMapPin, FiUser, FiDollarSign, FiCalendar, FiClock } from 'react-icons/fi';
import { useAuth } from '@/lib/auth';

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
}

interface BookAppointmentModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

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
            const res = await api.get('/doctors');
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
            const isVirtual = selectedService?.id === 'VIRTUAL_DOC' || selectedService?.id === 2 || selectedService?.name?.toLowerCase().includes('virtual');

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
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
                        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-3xl">
                            📋
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Profile Update Required</h3>
                        <p className="text-gray-500 max-w-sm">
                            To ensure the best care, please complete your medical profile (Blood Group, Emergency Contact, etc.) before booking.
                        </p>
                        <button
                            onClick={() => router.push('/dashboard/profile')}
                            className="bg-primary text-black font-bold px-8 py-3 rounded-xl hover:opacity-90 transition shadow-lg shadow-primary/20"
                        >
                            Go to Profile
                        </button>
                    </div>
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
                                    <div key={doc.id} className="border border-gray-100 dark:border-gray-800 rounded-2xl p-4 hover:shadow-lg transition-shadow bg-white dark:bg-[#1A1A1A] group">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl overflow-hidden shrink-0">
                                                    {doc.profile_image ? (
                                                        <img
                                                            src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/profiles/${doc.profile_image}`}
                                                            alt={doc.fname}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        '👨‍⚕️'
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1">{doc.fname} {doc.lname}</h4>
                                                    <p className="text-xs text-primary font-bold uppercase tracking-wide">{doc.dr_type || doc.speciality || 'General'}</p>
                                                </div>
                                            </div>
                                            {doc.distance !== undefined && (
                                                <span className="text-xs font-medium text-gray-400 bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded">
                                                    {doc.distance < 1 ? '< 1 km' : `${doc.distance.toFixed(1)} km`}
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <FiMapPin /> <span className="truncate">{doc.address || 'Nairobi, Kenya'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <FiDollarSign /> <span className="font-bold text-gray-900 dark:text-white">KES {getDisplayFee(doc)}</span> / Visit
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setSelectedDoctor(doc)}
                                            className="w-full py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-donezo-dark hover:text-white text-gray-900 dark:text-white font-bold rounded-xl transition-colors text-sm"
                                        >
                                            Book Appointment
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    // Booking Form
                    <div className="p-8 flex-1 overflow-y-auto">
                        <form onSubmit={handleBook} className="max-w-xl mx-auto space-y-8">

                            <div className="bg-primary/10 rounded-2xl p-6 flex items-center gap-4 border border-primary/20">
                                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-2xl shadow-sm overflow-hidden shrink-0">
                                    {selectedDoctor.profile_image ? (
                                        <img
                                            src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/profiles/${selectedDoctor.profile_image}`}
                                            alt={selectedDoctor.fname}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        '👨‍⚕️'
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-black text-xl text-gray-900 dark:text-white">Dr. {selectedDoctor.fname} {selectedDoctor.lname}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 font-medium">{selectedDoctor.speciality} • {selectedDoctor.address}</p>
                                    <div className="mt-2 text-sm font-bold text-primary">
                                        Consulation Fee: KES {selectedService ? selectedService.price : getDisplayFee(selectedDoctor)}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* 1. Who is this for? */}
                                <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Who is this appointment for?</label>
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsForSelf(true)}
                                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold border transition-colors ${isForSelf
                                                ? 'bg-primary text-black border-primary'
                                                : 'bg-white dark:bg-black border-gray-200 dark:border-gray-700 dark:text-gray-300 hover:border-primary/50'}`}
                                        >
                                            For Me
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsForSelf(false)}
                                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold border transition-colors ${!isForSelf
                                                ? 'bg-primary text-black border-primary'
                                                : 'bg-white dark:bg-black border-gray-200 dark:border-gray-700 dark:text-gray-300 hover:border-primary/50'}`}
                                        >
                                            Someone Else
                                        </button>
                                    </div>

                                    {!isForSelf && (
                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div>
                                                <label className="text-xs uppercase font-bold text-gray-500 mb-1 block">Full Name</label>
                                                <input
                                                    type="text"
                                                    required={!isForSelf}
                                                    placeholder="Patient Name"
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white outline-none focus:ring-2 focus:ring-primary"
                                                    value={beneficiaryDetails.name}
                                                    onChange={(e) => setBeneficiaryDetails({ ...beneficiaryDetails, name: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs uppercase font-bold text-gray-500 mb-1 block">Relation</label>
                                                <select
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white outline-none focus:ring-2 focus:ring-primary"
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
                                                <label className="text-xs uppercase font-bold text-gray-500 mb-1 block">Age</label>
                                                <input
                                                    type="number"
                                                    placeholder="Age"
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white outline-none focus:ring-2 focus:ring-primary"
                                                    value={beneficiaryDetails.age}
                                                    onChange={(e) => setBeneficiaryDetails({ ...beneficiaryDetails, age: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs uppercase font-bold text-gray-500 mb-1 block">Gender</label>
                                                <select
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white outline-none focus:ring-2 focus:ring-primary"
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

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Date</label>
                                        <div className="relative">
                                            <FiCalendar className="absolute left-3 top-3 text-gray-400" />
                                            <input
                                                type="date"
                                                required
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white outline-none focus:ring-2 focus:ring-primary"
                                                value={bookingDate}
                                                onChange={(e) => setBookingDate(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Time</label>
                                        <div className="relative">
                                            <FiClock className="absolute left-3 top-3 text-gray-400" />
                                            <input
                                                type="time"
                                                required
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white outline-none focus:ring-2 focus:ring-primary"
                                                value={bookingTime}
                                                onChange={(e) => setBookingTime(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Address for Home Visit */}
                                {(!selectedService?.id?.toString().includes('VIRTUAL') && !selectedService?.name?.toLowerCase().includes('virtual')) && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center justify-between">
                                            <span>Home Visit Location</span>
                                            <span className="text-xs text-primary font-normal">Step 1: Pin Location</span>
                                        </label>

                                        {/* Map Section */}
                                        <div className="h-64 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 mb-3 relative z-0">
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
                                            <div className="absolute top-2 right-2 flex flex-col gap-2 z-[9999]">
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
                                                    className="bg-white text-black p-2 rounded-lg shadow-md hover:bg-gray-50 text-xs font-bold"
                                                >
                                                    📍 Use My Location
                                                </button>
                                            </div>
                                        </div>

                                        <label className="block text-xs font-bold text-gray-500 mb-1">Confirm Specific Address</label>
                                        <div className="relative">
                                            <FiMapPin className="absolute left-3 top-3 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Enter house no, street, or landmark..."
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white outline-none focus:ring-2 focus:ring-primary"
                                                value={customHomeAddress}
                                                onChange={(e) => setCustomHomeAddress(e.target.value)}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 ml-1">Click on the map to set location, then edit the address above if needed.</p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Service (Optional)</label>
                                    <select
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white outline-none focus:ring-2 focus:ring-primary"
                                        value={selectedService?.id || ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === 'VIRTUAL_DOC') {
                                                // Special Virtual Session for Doctors
                                                setSelectedService({ id: 'VIRTUAL_DOC', name: 'Virtual Session', price: getDisplayFee(selectedDoctor) } as any);
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
                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Medical Information</label>

                                    <div>
                                        <textarea
                                            rows={2}
                                            placeholder="Active Medications (e.g. Aspirin 75mg daily)..."
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                                            value={medicalInfo.medications}
                                            onChange={(e) => setMedicalInfo({ ...medicalInfo, medications: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <textarea
                                            rows={2}
                                            placeholder="Current Prescriptions..."
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                                            value={medicalInfo.prescriptions}
                                            onChange={(e) => setMedicalInfo({ ...medicalInfo, prescriptions: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Reason for Visit</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Briefly describe your symptoms..."
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black dark:text-white outline-none focus:ring-2 focus:ring-primary resize-none"
                                        value={bookingNote}
                                        onChange={(e) => setBookingNote(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setSelectedDoctor(null)}
                                    className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-3 bg-primary text-black font-bold rounded-xl hover:opacity-90 transition-colors shadow-lg shadow-primary/30"
                                >
                                    {submitting ? 'Confirming...' : 'Confirm Booking'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
