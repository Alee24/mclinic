'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { FiX, FiSearch, FiMapPin, FiUser, FiDollarSign, FiCalendar, FiClock, FiArrowRight, FiArrowLeft, FiCheckCircle, FiActivity, FiFilter } from 'react-icons/fi';
import { useAuth } from '@/lib/auth';
import CompleteProfileModal from '../CompleteProfileModal';

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
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
    approved_status?: string;
}

interface BookAppointmentModalProps {
    onClose: () => void;
    onSuccess: () => void;
    initialDoctor?: any;
    initialType?: 'PHYSICAL' | 'VIRTUAL';
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://portal.mclinic.co.ke/api';

const DoctorAvatar = ({ doctor }: { doctor: Doctor }) => {
    const [error, setError] = useState(false);

    if (!doctor.profile_image || error) {
        return <>{'👨‍⚕️'}</>;
    }

    return (
        <img
            src={(doctor.profile_image.startsWith('http') ? doctor.profile_image : `${API_URL}/uploads/profiles/${doctor.profile_image}`)}
            alt={doctor.fname}
            className="w-full h-full object-cover"
            onError={() => setError(true)}
        />
    );
};

export default function BookAppointmentModal({ onClose, onSuccess, initialDoctor, initialType }: BookAppointmentModalProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [profileComplete, setProfileComplete] = useState(true);
    const [checkingProfile, setCheckingProfile] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Filters
    const [speciality, setSpeciality] = useState('');
    const [gender, setGender] = useState('');
    const [drTypeFilter, setDrTypeFilter] = useState('');
    const [maxPrice, setMaxPrice] = useState<number>(50000); // Increased default limit
    const [searchTerm, setSearchTerm] = useState('');

    // Booking Stage
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [currentStep, setCurrentStep] = useState(1);

    // Step 2: Details
    const [isForSelf, setIsForSelf] = useState(true);
    const [beneficiaryDetails, setBeneficiaryDetails] = useState({
        name: '',
        gender: 'Male',
        age: '',
        relation: 'Family Member'
    });

    // Step 3: Schedule
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('');

    // Step 4: Medical & Location
    const [bookingNote, setBookingNote] = useState('');
    const [medicalInfo, setMedicalInfo] = useState({ medications: '', prescriptions: '' });
    const [customHomeAddress, setCustomHomeAddress] = useState('');
    const [selectedService, setSelectedService] = useState<any | null>(null);
    const [services, setServices] = useState<any[]>([]);

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (initialDoctor) {
            setSelectedDoctor(initialDoctor);
        }
    }, [initialDoctor]);

    useEffect(() => {
        fixLeafletIcons();

        const checkProfile = async () => {
            try {
                const res = await api.get('/patients/profile');
                if (res && res.ok) {
                    const data = await res.json();
                    const p = data.patient;
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
            const res = await api.get('/doctors?include_offline=true');
            if (res && res.ok) {
                const data = await res.json();
                console.log('Fetched Medics:', data.length);
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
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const getDisplayFee = (doc: Doctor) => {
        if (initialType === 'VIRTUAL') return 900;
        const type = (doc.dr_type || '').toLowerCase();
        if (type.includes('nurse') || type.includes('clinician')) return 1500;
        return doc.fee;
    };

    useEffect(() => {
        let result = doctors.map(doc => {
            let dist = 9999;
            if (userLocation && doc.latitude && doc.longitude) {
                dist = calculateDistance(userLocation.lat, userLocation.lng, Number(doc.latitude), Number(doc.longitude));
            }
            return { ...doc, distance: dist };
        });

        if (speciality) result = result.filter(d => d.speciality?.toLowerCase().includes(speciality.toLowerCase()));
        if (gender) result = result.filter(d => d.sex?.toLowerCase() === gender.toLowerCase());
        if (drTypeFilter) result = result.filter(d => (d.dr_type || '').toLowerCase().includes(drTypeFilter.toLowerCase()));
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(d =>
                (d.fname || '').toLowerCase().includes(lower) ||
                (d.lname || '').toLowerCase().includes(lower) ||
                (d.address || '').toLowerCase().includes(lower) ||
                (d.dr_type || '').toLowerCase().includes(lower)
            );
        }
        if (maxPrice) result = result.filter(d => getDisplayFee(d) <= maxPrice);

        // Sort by distance (closest first)
        result.sort((a, b) => (a.distance || 9999) - (b.distance || 9999));

        setFilteredDoctors(result);
    }, [doctors, speciality, gender, maxPrice, searchTerm, userLocation, drTypeFilter]);

    const handleBook = async () => {
        if (!selectedDoctor) return;
        setSubmitting(true);

        try {
            const isVirtual = initialType === 'VIRTUAL' || selectedService?.id === 'VIRTUAL_DOC' || selectedService?.id === 'VIRTUAL_NURSE' || selectedService?.name?.toLowerCase().includes('virtual');

            const payload = {
                doctorId: selectedDoctor.id,
                appointmentDate: bookingDate,
                appointmentTime: bookingTime,
                reason: bookingNote,
                serviceId: (selectedService && selectedService.id !== 'VIRTUAL_DOC') ? selectedService.id : null,
                isVirtual,
                patientLocation: userLocation,
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
                if (data && data.id) {
                    router.push(`/dashboard/appointments/${data.id}/pay`);
                } else {
                    alert('Appointment booked successfully!');
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

    const uniqueSpecialities = Array.from(new Set(doctors.map(d => d.speciality).filter(Boolean)));
    const totalSteps = 4;

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold dark:text-white">Who is this visit for?</h3>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setIsForSelf(true)}
                                className={`flex-1 py-6 rounded-2xl border-2 font-bold transition-all ${isForSelf
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-[#121212] text-gray-500'}`}
                            >
                                <span className="block text-2xl mb-2">👤</span>
                                Myself
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsForSelf(false)}
                                className={`flex-1 py-6 rounded-2xl border-2 font-bold transition-all ${!isForSelf
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-[#121212] text-gray-500'}`}
                            >
                                <span className="block text-2xl mb-2">👥</span>
                                Someone Else
                            </button>
                        </div>
                        {!isForSelf && (
                            <div className="grid grid-cols-2 gap-4 animate-in fade-in">
                                <input type="text" placeholder="Full Name" className="p-4 rounded-xl border dark:border-gray-700 bg-white dark:bg-[#121212] outline-none"
                                    value={beneficiaryDetails.name} onChange={e => setBeneficiaryDetails({ ...beneficiaryDetails, name: e.target.value })} />
                                <input type="number" placeholder="Age" className="p-4 rounded-xl border dark:border-gray-700 bg-white dark:bg-[#121212] outline-none"
                                    value={beneficiaryDetails.age} onChange={e => setBeneficiaryDetails({ ...beneficiaryDetails, age: e.target.value })} />
                                <select className="p-4 rounded-xl border dark:border-gray-700 bg-white dark:bg-[#121212] outline-none"
                                    value={beneficiaryDetails.gender} onChange={e => setBeneficiaryDetails({ ...beneficiaryDetails, gender: e.target.value })}>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                                <select className="p-4 rounded-xl border dark:border-gray-700 bg-white dark:bg-[#121212] outline-none"
                                    value={beneficiaryDetails.relation} onChange={e => setBeneficiaryDetails({ ...beneficiaryDetails, relation: e.target.value })}>
                                    <option value="Family Member">Family Member</option>
                                    <option value="Child">Child</option>
                                    <option value="Parent">Parent</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        )}
                        <h3 className="text-xl font-bold dark:text-white mt-8">Reason for Visit</h3>
                        <textarea
                            rows={3}
                            placeholder="Briefly describe symptoms..."
                            className="w-full p-4 rounded-xl border dark:border-gray-700 bg-white dark:bg-[#121212] outline-none resize-none"
                            value={bookingNote}
                            onChange={(e) => setBookingNote(e.target.value)}
                        />
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold dark:text-white">Select Date</h3>
                        <input
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full p-4 rounded-xl border dark:border-gray-700 bg-white dark:bg-[#121212] outline-none font-bold"
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                        />
                        <h3 className="text-xl font-bold dark:text-white mt-4">Select Time</h3>
                        {!bookingDate ? <p className="text-gray-500">Select a date first</p> : (
                            <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                                {Array.from({ length: 24 }).map((_, i) => {
                                    const h = (i + 8) % 24; // Start from 8 AM
                                    if (h < 6) return null; // Skip night hours if needed
                                    const time = `${h.toString().padStart(2, '0')}:00`;
                                    const time30 = `${h.toString().padStart(2, '0')}:30`;
                                    return (
                                        <>
                                            <button key={time} onClick={() => setBookingTime(time)} className={`py-2 rounded-lg text-xs font-bold ${bookingTime === time ? 'bg-primary text-black' : 'bg-gray-100 dark:bg-[#121212] text-gray-500'}`}>{time}</button>
                                            <button key={time30} onClick={() => setBookingTime(time30)} className={`py-2 rounded-lg text-xs font-bold ${bookingTime === time30 ? 'bg-primary text-black' : 'bg-gray-100 dark:bg-[#121212] text-gray-500'}`}>{time30}</button>
                                        </>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold dark:text-white">Location</h3>
                                <p className="text-sm text-gray-500">Where should the medic visit you?</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    if (navigator.geolocation) {
                                        const btn = document.getElementById('geo-btn');
                                        if (btn) btn.innerText = 'Locating...';
                                        navigator.geolocation.getCurrentPosition(
                                            (position) => {
                                                const ll = { lat: position.coords.latitude, lng: position.coords.longitude };
                                                setUserLocation(ll);
                                                fetchAddressFromCoords(ll.lat, ll.lng);
                                                if (btn) btn.innerText = 'Updated!';
                                                setTimeout(() => { if (btn) btn.innerText = 'Use Current Location'; }, 2000);
                                            },
                                            (error) => {
                                                console.error(error);
                                                alert('Could not get location. Please allow GPS access.');
                                                if (btn) btn.innerText = 'Use Current Location';
                                            }
                                        );
                                    } else {
                                        alert('Geolocation is not supported by this browser.');
                                    }
                                }}
                                className="flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                            >
                                <FiMapPin /> <span id="geo-btn">Use Current Location</span>
                            </button>
                        </div>
                        <div className="h-64 rounded-xl overflow-hidden border dark:border-gray-700 relative">
                            <MapContainer center={[userLocation?.lat || -1.2921, userLocation?.lng || 36.8219]} zoom={13} style={{ height: '100%', width: '100%' }}>
                                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                                <LocationPicker location={userLocation} onLocationSelect={(ll: any) => { setUserLocation(ll); fetchAddressFromCoords(ll.lat, ll.lng); }} />
                            </MapContainer>
                        </div>
                        <input
                            type="text"
                            placeholder="Address description..."
                            className="w-full p-4 rounded-xl border dark:border-gray-700 bg-white dark:bg-[#121212] outline-none"
                            value={customHomeAddress}
                            onChange={(e) => setCustomHomeAddress(e.target.value)}
                        />
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-6 text-center">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-4xl">
                            <FiCheckCircle />
                        </div>
                        <h3 className="text-2xl font-black dark:text-white">Ready to Book?</h3>
                        <div className="bg-gray-50 dark:bg-[#121212] p-6 rounded-2xl text-left space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Medic</span>
                                <span className="font-bold dark:text-white">{selectedDoctor?.fname} {selectedDoctor?.lname}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Date & Time</span>
                                <span className="font-bold dark:text-white">{bookingDate} at {bookingTime}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Service</span>
                                <span className="font-bold dark:text-white">{selectedService?.name || 'Consultation'}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200 dark:border-gray-800 pt-4 mt-2">
                                <span className="text-gray-500 font-bold">Estimated Cost</span>
                                <span className="font-black text-xl text-primary">KES {getDisplayFee(selectedDoctor!)}</span>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4">
            <div className={`bg-white dark:bg-[#1A1A1A] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] h-full md:h-auto`}>

                {/* Header */}
                <div className="p-4 md:p-6 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h2 className="text-2xl font-black dark:text-white leading-tight">
                                {selectedDoctor ? `Book ${selectedDoctor.fname}` : 'Find a Medic'}
                            </h2>
                            {!selectedDoctor ? (
                                <p className="text-xs font-bold text-green-600 mt-1 flex items-center gap-1">
                                    <FiMapPin /> Medics listed from closest to furthest
                                </p>
                            ) : (
                                <div className="flex gap-2 mt-2">
                                    {Array.from({ length: totalSteps }).map((_, i) => (
                                        <div key={i} className={`h-1.5 w-8 rounded-full transition-all ${currentStep > i ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-800'}`} />
                                    ))}
                                </div>
                            )}
                        </div>
                        <button onClick={onClose} className="p-2 ml-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition bg-gray-50 dark:bg-gray-800/50">
                            <FiX size={24} className="dark:text-white" />
                        </button>
                    </div>

                    {/* Mobile Filter Toggle */}
                    {!selectedDoctor && (
                        <button
                            onClick={() => setShowMobileFilters(!showMobileFilters)}
                            className="mt-4 md:hidden w-full py-3 bg-gray-100 dark:bg-[#121212] rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-800"
                        >
                            <FiFilter /> {showMobileFilters ? 'Hide Filters' : 'Filter & Search Medics'}
                        </button>
                    )}
                </div>

                {!selectedDoctor ? (
                    <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                        {/* Filters Sidebar */}
                        <div className={`w-full md:w-72 bg-gray-50 dark:bg-[#121212] p-6 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 overflow-y-auto transition-all ${showMobileFilters ? 'block h-auto max-h-[50vh]' : 'hidden md:block'}`}>
                            <h3 className="font-bold text-gray-400 uppercase tracking-wider text-xs mb-4">Filters</h3>
                            <div className="space-y-4">
                                <input type="text" placeholder="Search name..." className="w-full p-4 rounded-xl border dark:border-gray-800 bg-white dark:bg-black outline-none text-sm font-medium" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                                <select className="w-full p-4 rounded-xl border dark:border-gray-800 bg-white dark:bg-black outline-none text-sm font-medium" value={drTypeFilter} onChange={e => setDrTypeFilter(e.target.value)}>
                                    <option value="">All Medic Types</option>
                                    <option value="Doctor">Doctor</option>
                                    <option value="Nurse">Nurse</option>
                                    <option value="Clinician">Clinician</option>
                                </select>
                                <select className="w-full p-4 rounded-xl border dark:border-gray-800 bg-white dark:bg-black outline-none text-sm font-medium" value={speciality} onChange={e => setSpeciality(e.target.value)}>
                                    <option value="">All Specialities</option>
                                    {uniqueSpecialities.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>

                                {userLocation && (
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl text-xs text-blue-600 dark:text-blue-400 font-bold flex gap-2 items-center">
                                        <FiMapPin size={16} />
                                        <span>Sort: Closest First</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-white dark:bg-[#161616]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20 md:pb-0">
                                {loading ? <div className="col-span-2 text-center py-10">Loading Medics...</div> : filteredDoctors.map(doc => (
                                    <div key={doc.id} onClick={() => setSelectedDoctor(doc)} className="border border-gray-100 dark:border-gray-800 p-4 md:p-5 rounded-2xl hover:bg-green-50/50 dark:hover:bg-[#1A1A1A] cursor-pointer transition-all hover:shadow-lg flex gap-4 items-center group">
                                        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                                            <DoctorAvatar doctor={doc} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">{doc.fname} {doc.lname}</h4>
                                            <p className="text-xs text-primary font-black uppercase tracking-wide mt-0.5">{doc.dr_type || 'Medic'}</p>
                                            <p className="text-xs text-gray-500 font-medium">{doc.speciality}</p>
                                            {doc.distance !== undefined && doc.distance < 1000 && (
                                                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1 font-medium bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md w-fit">
                                                    <FiMapPin size={10} />
                                                    {doc.distance.toFixed(1)} km away
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {!loading && filteredDoctors.length === 0 && (
                                    <div className="col-span-2 text-center py-10 text-gray-500 px-4">
                                        No medics found matching your criteria. Try adjusting filters.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col">
                        <div className="flex-1 overflow-y-auto p-6 md:p-12">
                            <div className="max-w-2xl mx-auto">
                                {renderStepContent()}
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#121212] flex justify-between">
                            <button
                                onClick={() => currentStep === 1 ? setSelectedDoctor(null) : setCurrentStep(s => s - 1)}
                                className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 transition"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => currentStep === 4 ? handleBook() : setCurrentStep(s => s + 1)}
                                disabled={submitting || (currentStep === 2 && (!bookingDate || !bookingTime))}
                                className="px-8 py-3 bg-primary text-black rounded-xl font-black shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all disabled:opacity-50 disabled:transform-none"
                            >
                                {submitting ? 'Processing...' : currentStep === 4 ? 'Confirm Booking' : 'Continue'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
