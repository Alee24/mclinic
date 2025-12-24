'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FiX, FiSearch, FiMapPin, FiUser, FiDollarSign, FiFilter, FiCalendar } from 'react-icons/fi';
import { useAuth } from '@/lib/auth';

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
}

interface BookAppointmentModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function BookAppointmentModal({ onClose, onSuccess }: BookAppointmentModalProps) {
    const { user } = useAuth();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

    // Filters
    const [speciality, setSpeciality] = useState('');
    const [gender, setGender] = useState('');
    const [maxPrice, setMaxPrice] = useState<number>(10000);
    const [searchTerm, setSearchTerm] = useState('');

    // Booking Stage
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('');
    const [bookingNote, setBookingNote] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
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
    }, []);

    const fetchDoctors = async () => {
        try {
            const res = await api.get('/doctors/map'); // Using this endpoint as it returns verified docs with location
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
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(d =>
                d.fname.toLowerCase().includes(lower) ||
                d.lname.toLowerCase().includes(lower) ||
                d.address?.toLowerCase().includes(lower)
            );
        }
        if (maxPrice) {
            result = result.filter(d => d.fee <= maxPrice);
        }

        // Sort by distance if location available
        if (userLocation) {
            result.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        }

        setFilteredDoctors(result);
    }, [doctors, speciality, gender, maxPrice, searchTerm, userLocation]);

    const handleBook = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDoctor) return;
        setSubmitting(true);

        try {
            // Check availability (mock)
            const payload = {
                doctor_id: selectedDoctor.id,
                appointment_date: bookingDate,
                appointment_time: bookingTime,
                reason: bookingNote
            };

            const res = await api.post('/appointments', payload);
            if (res && res.ok) {
                alert('Appointment booked successfully!');
                onSuccess();
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

                {!selectedDoctor ? (
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
                                                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl">
                                                    👨‍⚕️
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1">{doc.fname} {doc.lname}</h4>
                                                    <p className="text-xs text-primary font-bold uppercase tracking-wide">{doc.speciality || 'General'}</p>
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
                                                <FiDollarSign /> <span className="font-bold text-gray-900 dark:text-white">KES {doc.fee}</span> / Visit
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
                                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-2xl shadow-sm">
                                    👨‍⚕️
                                </div>
                                <div>
                                    <h3 className="font-black text-xl text-gray-900 dark:text-white">Dr. {selectedDoctor.fname} {selectedDoctor.lname}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 font-medium">{selectedDoctor.speciality} • {selectedDoctor.address}</p>
                                    <div className="mt-2 text-sm font-bold text-primary">Consulation Fee: KES {selectedDoctor.fee}</div>
                                </div>
                            </div>

                            <div className="space-y-6">
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
                                            <FiCalendar className="absolute left-3 top-3 text-gray-400" />
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
