'use client';
import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FiNavigation, FiSearch, FiFilter, FiCrosshair, FiMapPin, FiUser, FiX, FiCheck, FiMoreHorizontal } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

// Fix for Leaflet default marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon.src,
    iconRetinaUrl: markerIcon2x.src,
    shadowUrl: markerShadow.src,
});

// Component to handle map clicks and movement
function MapController({ onMapClick }: { onMapClick: () => void }) {
    useMapEvents({
        click: () => onMapClick(),
    });
    return null;
}

function RecenterAutomatically({ lat, lng }: { lat: number, lng: number }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo([lat, lng], 14, { duration: 2 });
    }, [lat, lng, map]);
    return null;
}

export default function MapViewer() {
    const [position, setPosition] = useState<[number, number] | null>(null);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [filteredDoctors, setFilteredDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
    const [activeFilter, setActiveFilter] = useState('All');
    // Force Light Mode always
    const mapRef = useRef<L.Map>(null);
    const router = useRouter();

    // Nairobi default
    const defaultCenter: [number, number] = [-1.2921, 36.8219];

    // Fetch ALL Doctors (including offline/pending)
    useEffect(() => {
        const fetchAllDoctors = async () => {
            setLoading(true);
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://portal.mclinic.co.ke/api';
                // Fetch ALL doctors including offline and pending
                const res = await fetch(`${API_URL}/doctors/admin/all`);
                if (res.ok) {
                    const data = await res.json();
                    setDoctors(data || []);
                    setFilteredDoctors(data || []); // Initialize filtered doctors with all doctors
                } else {
                    console.error('Failed to fetch doctors:', res.statusText);
                }
            } catch (error) {
                console.error('Failed to fetch doctors:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllDoctors();
    }, []);

    const handleGetLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                const { latitude, longitude } = pos.coords;
                setPosition([latitude, longitude]);
                // No longer calling fetchDoctors here as we fetch all initially
            }, (err) => {
                alert('Location access required to find nearby medics.');
            });
        }
    };

    // Initial load - get user location
    useEffect(() => {
        handleGetLocation();
    }, []);

    // Filter Logic
    useEffect(() => {
        if (activeFilter === 'All') {
            setFilteredDoctors(doctors);
        } else {
            setFilteredDoctors(doctors.filter(d =>
                (d.dr_type || '').toLowerCase().includes(activeFilter.toLowerCase()) ||
                (d.speciality || '').toLowerCase().includes(activeFilter.toLowerCase())
            ));
        }
    }, [activeFilter, doctors]);

    // Marker Icon Generator
    const createMarkerIcon = (doc: any, isSelected: boolean) => {
        const avatarUrl = doc.profile_image
            ? (doc.profile_image.startsWith('http') ? doc.profile_image : `${process.env.NEXT_PUBLIC_API_URL || 'https://portal.mclinic.co.ke/api'}/uploads/profiles/${doc.profile_image}`)
            : `https://ui-avatars.com/api/?name=${doc.fname}+${doc.lname}&background=random`;

        const isOnline = doc.isWorking;

        return L.divIcon({
            html: `
                <div class="relative transition-all duration-300 ${isSelected ? 'scale-125 z-50' : 'scale-100 hover:scale-110 z-10'}">
                    <div class="w-12 h-12 rounded-full border-2 ${isSelected ? 'border-blue-600 shadow-xl' : 'border-white shadow-lg'} overflow-hidden bg-gray-100">
                        <img src="${avatarUrl}" class="w-full h-full object-cover" />
                    </div>
                    <div class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}"></div>
                </div>
            `,
            className: '',
            iconSize: [48, 48],
            iconAnchor: [24, 24],
        });
    };

    // Derived Specialties from actual data
    const specialties = ['All', ...Array.from(new Set(doctors.map(d => d.speciality).filter(Boolean))).sort()];

    return (
        <div className="relative w-full h-[85vh] min-h-[600px] rounded-3xl overflow-hidden shadow-xl bg-gray-50 border border-gray-200 flex flex-row">

            {/* 1. Left Sidebar Filters */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col z-[1000] overflow-y-auto">
                <div className="p-4 border-b border-gray-100">
                    <h3 className="text-sm font-bold text-gray-700 mb-3">Filter by Specialty</h3>
                    <div className="flex flex-col gap-2">
                        {specialties.map(spec => (
                            <button
                                key={spec}
                                onClick={() => setActiveFilter(spec)}
                                className={`px-4 py-2.5 rounded-lg text-xs font-bold transition text-left ${activeFilter === spec
                                    ? 'bg-black text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-100 bg-gray-50'
                                    }`}
                            >
                                {spec}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="p-4 text-xs text-gray-500">
                    <p className="font-semibold mb-1">Total Doctors: {doctors.length}</p>
                    <p>Filtered: {filteredDoctors.length}</p>
                </div>
            </div>

            {/* 2. Map Layer - ALWAYS LIGHT */}
            <div className="flex-1 relative">
                <MapContainer
                    ref={mapRef}
                    center={defaultCenter}
                    zoom={13}
                    zoomControl={false}
                    style={{ height: '100%', width: '100%', background: '#f8f9fa', zIndex: 0 }}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; CARTO'
                        maxZoom={20}
                    />

                    <MapController onMapClick={() => setSelectedDoctor(null)} />

                    {position && <RecenterAutomatically lat={position[0]} lng={position[1]} />}

                    {/* User Location */}
                    {position && (
                        <Marker position={position} icon={L.divIcon({
                            className: '',
                            html: `
                            <div class="relative w-12 h-12 flex items-center justify-center -ml-3 -mt-3">
                                <div class="absolute inset-0 bg-green-500 rounded-full opacity-30 animate-ping"></div>
                                <div class="relative z-10 w-10 h-10 bg-green-600 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                </div>
                                <div class="absolute -bottom-2 bg-white px-2 py-0.5 rounded text-[10px] font-bold shadow-sm whitespace-nowrap">You</div>
                            </div>
                        `,
                            iconSize: [40, 40],
                            iconAnchor: [20, 20]
                        })} />
                    )}

                    {/* Doctor Markers */}
                    {filteredDoctors.map((doc) => (
                        <Marker
                            key={doc.id}
                            position={[doc.latitude, doc.longitude]}
                            icon={createMarkerIcon(doc, selectedDoctor?.id === doc.id)}
                            eventHandlers={{
                                click: () => {
                                    setSelectedDoctor(doc);
                                    // Optional: Fly to doctor
                                    // mapRef.current?.flyTo([doc.latitude, doc.longitude], 15);
                                }
                            }}
                        />
                    ))}
                </MapContainer>

                {/* 3. Floating Controls (Bottom Right) */}
                <div className="absolute bottom-8 right-6 z-[1000] flex flex-col gap-3">
                    <button
                        onClick={handleGetLocation}
                        className="w-12 h-12 bg-white rounded-2xl text-blue-600 border border-gray-100 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition"
                        title="Locate Me"
                    >
                        <FiCrosshair size={24} />
                    </button>
                </div>

                {/* 4. Selected Doctor Card (Bottom Left / Bottom Sheet) */}
                {selectedDoctor && (
                    <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:w-96 z-[1000] animate-in slide-in-from-bottom-5 fade-in duration-300">
                        <div className="bg-white/95 backdrop-blur-xl border border-gray-100 rounded-3xl p-5 shadow-2xl relative overflow-hidden group">

                            {/* Background Gradient Blob */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                            <button
                                onClick={() => setSelectedDoctor(null)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition"
                            >
                                <FiX />
                            </button>

                            <div className="flex items-start gap-4">
                                <div className="w-20 h-20 rounded-2xl bg-gray-50 overflow-hidden shadow-sm border border-gray-100 shrink-0">
                                    <img
                                        src={selectedDoctor.profile_image
                                            ? (selectedDoctor.profile_image.startsWith('http') ? selectedDoctor.profile_image : `${process.env.NEXT_PUBLIC_API_URL || 'https://portal.mclinic.co.ke/api'}/uploads/profiles/${selectedDoctor.profile_image}`)
                                            : `https://ui-avatars.com/api/?name=${selectedDoctor.fname}+${selectedDoctor.lname}&background=random`
                                        }
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0 pr-6">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-lg font-bold text-gray-900 truncate">
                                            Dr. {selectedDoctor.fname} {selectedDoctor.lname}
                                        </h3>
                                        {selectedDoctor.verified_status && <FiCheck className="text-blue-500" />}
                                    </div>
                                    <div className="text-sm font-medium text-blue-600 mb-2">{selectedDoctor.dr_type}</div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className={`w-2 h-2 rounded-full ${selectedDoctor.isWorking ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                        {selectedDoctor.isWorking ? 'Available Now' : 'Offline'}
                                        <span className="mx-1">•</span>
                                        <span>{selectedDoctor.distance ? `${selectedDoctor.distance.toFixed(1)} km` : 'Nearby'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Specs Grid */}
                            <div className="grid grid-cols-2 gap-3 mt-5 mb-5">
                                <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Fee</div>
                                    <div className="font-bold text-gray-900 text-lg">KES {selectedDoctor.fee}</div>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Reviews</div>
                                    <div className="font-bold text-gray-900 text-lg flex items-center justify-center gap-1">
                                        ⭐ 4.8
                                    </div>
                                </div>
                            </div>

                            {/* Booking Button Logic: Only Approved & Valid License */}
                            {(selectedDoctor.approvalStatus === 'approved' || (selectedDoctor.Verified_status === 1 || selectedDoctor.verified_status)) &&
                                (selectedDoctor.licenseStatus === 'valid' || !selectedDoctor.licenseExpiryDate || new Date(selectedDoctor.licenseExpiryDate) > new Date()) ? (
                                <button
                                    onClick={() => router.push(`/dashboard/doctors/${selectedDoctor.id}`)}
                                    className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition active:scale-[0.98] shadow-xl shadow-gray-900/10"
                                >
                                    View Profile & Book
                                    <FiNavigation />
                                </button>
                            ) : (
                                <div className="w-full py-4 bg-gray-100 text-gray-400 rounded-xl font-bold flex flex-col items-center justify-center gap-1 cursor-not-allowed border border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <FiX className="text-red-400" />
                                        <span>Booking Unavailable</span>
                                    </div>
                                    <span className="text-[10px] uppercase tracking-wider">Verification or License Pending</span>
                                </div>
                            )}

                        </div>
                    </div>
                )}

                {/* Loading Indicator */}
                {loading && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 text-gray-900 px-6 py-3 rounded-full flex items-center gap-3 backdrop-blur-md z-[2000] shadow-xl border border-gray-100">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="font-bold text-sm">Scanning Area...</span>
                    </div>
                )}
            </div>
        </div>
    );
}
