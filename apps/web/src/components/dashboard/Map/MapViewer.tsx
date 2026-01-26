'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FiNavigation, FiSearch, FiFilter, FiCrosshair, FiMapPin, FiUser, FiX, FiCheck, FiActivity, FiPhone, FiMail } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth, UserRole } from '@/lib/auth';

// Fix for Leaflet default marker icons - though we use custom ones
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Specialty Color Mapping
const specialtyConfig: Record<string, { color: string; code: string; icon: string }> = {
    'Pediatrics': { color: '#F59E0B', code: 'PD', icon: '👶' },
    'Cardiologist': { color: '#EF4444', code: 'CD', icon: '❤️' },
    'Dermatologist': { color: '#EC4899', code: 'DR', icon: '✨' },
    'Neurologist': { color: '#8B5CF6', code: 'NR', icon: '🧠' },
    'General Surgeon': { color: '#3B82F6', code: 'GS', icon: '🩺' },
    'Psychiatrist': { color: '#6366F1', code: 'PS', icon: '💭' },
    'Nurse': { color: '#10B981', code: 'RN', icon: '💉' },
    'Medic': { color: '#06B6D4', code: 'MD', icon: '🩺' },
    'Emergency': { color: '#DC2626', code: 'ER', icon: '🚑' },
    'Dentist': { color: '#D946EF', code: 'DN', icon: '🦷' },
    'Default': { color: '#6B7280', code: 'DR', icon: '👨‍⚕️' }
};

const getDocConfig = (doc: any) => {
    const type = doc.dr_type || doc.speciality || 'Default';
    // Deep match
    for (const key in specialtyConfig) {
        if (type.toLowerCase().includes(key.toLowerCase())) return specialtyConfig[key];
    }
    return specialtyConfig.Default;
};

// Component to handle map clicks and movement
function MapController({ onMapClick }: { onMapClick: () => void }) {
    useMapEvents({
        click: () => onMapClick(),
    });
    return null;
}

function RecenterAutomatically({ pos }: { pos: [number, number] | null }) {
    const map = useMap();
    const centeredRef = useRef(false);

    useEffect(() => {
        if (pos && !centeredRef.current) {
            map.flyTo(pos, 16, { duration: 2.5 });
            centeredRef.current = true;
        }
    }, [pos, map]);

    return null;
}

export default function MapViewer() {
    const { user } = useAuth();
    const [position, setPosition] = useState<[number, number] | null>(null);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [filteredDoctors, setFilteredDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
    const [activeFilter, setActiveFilter] = useState('All');
    const mapRef = useRef<L.Map>(null);
    const router = useRouter();

    const defaultCenter: [number, number] = [-1.2921, 36.8219];

    useEffect(() => {
        const fetchAllDoctors = async () => {
            setLoading(true);
            try {
                const res = await api.get('/doctors/admin/all');
                if (res && res.ok) {
                    const data = await res.json();
                    setDoctors(data || []);
                    setFilteredDoctors(data || []);
                }
            } catch (error) {
                console.error('Failed to fetch doctors:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllDoctors();
    }, []);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setPosition([pos.coords.latitude, pos.coords.longitude]);
            });
        }
    }, []);

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

    const createMarkerIcon = (doc: any, isSelected: boolean) => {
        const config = getDocConfig(doc);
        const avatarUrl = doc.profile_image
            ? (doc.profile_image.startsWith('http') ? doc.profile_image : `https://portal.mclinic.co.ke/api/uploads/profiles/${doc.profile_image}`)
            : null;

        const initials = `${doc.fname?.[0] || ''}${doc.lname?.[0] || ''}`.toUpperCase() || config.code;
        const statusColor = doc.isWorking ? '#22C55E' : '#9CA3AF';

        return L.divIcon({
            html: `
                <div class="relative transition-all duration-300 ${isSelected ? 'scale-125 z-50' : 'scale-100 hover:scale-110 z-10'}">
                    <div class="w-12 h-12 rounded-full border-2 ${isSelected ? 'border-primary shadow-2xl ring-4 ring-primary/20' : 'border-white shadow-lg'} overflow-hidden flex items-center justify-center" style="background-color: ${config.color}${avatarUrl ? '' : 'dd'};">
                        ${avatarUrl
                    ? `<img src="${avatarUrl}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />`
                    : ''
                }
                        <span class="text-xs font-black text-white ${avatarUrl ? 'hidden' : 'flex'}">${initials}</span>
                    </div>
                    <div class="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${doc.isWorking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}"></div>
                </div>
            `,
            className: '',
            iconSize: [48, 48],
            iconAnchor: [24, 24],
        });
    };

    const patientIcon = L.divIcon({
        html: `
            <div class="relative w-20 h-20 flex items-center justify-center -ml-10 -mt-10">
                <div class="absolute inset-0 bg-blue-500/20 rounded-full animate-ping duration-[3s]"></div>
                <div class="absolute inset-4 bg-blue-500/10 rounded-full animate-pulse"></div>
                <div class="relative z-10 w-14 h-14 bg-white rounded-full border-[5px] border-blue-600 shadow-[0_15px_35px_rgba(37,99,235,0.4)] flex items-center justify-center text-blue-600 transition-transform hover:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div class="absolute -bottom-2 bg-blue-600 text-white px-2 py-0.5 rounded-full text-[10px] font-black shadow-lg uppercase tracking-wider">You</div>
            </div>
        `,
        className: '',
        iconSize: [80, 80],
        iconAnchor: [40, 40]
    });

    const specialties = ['All', ...Array.from(new Set(doctors.map(d => d.speciality || d.dr_type).filter(Boolean)))].sort();

    return (
        <div className="relative w-full h-[85vh] min-h-[600px] rounded-3xl overflow-hidden shadow-2xl bg-gray-50 border border-gray-100 flex flex-row">

            <style dangerouslySetInnerHTML={{
                __html: `
                .leaflet-container { background: #f8f9fa !important; }
                .custom-loading-pulse { animation: pulse 2s infinite; }
                @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
            ` }} />

            {/* Sidebar */}
            <div className="w-72 bg-white/95 backdrop-blur-md border-r border-gray-100 flex flex-col z-[1000] overflow-y-auto hidden md:flex">
                <div className="p-6 border-b border-gray-50">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Medical Radar</h3>
                    <div className="flex flex-col gap-1.5">
                        {specialties.map(spec => (
                            <button
                                key={spec}
                                onClick={() => setActiveFilter(spec)}
                                className={`group flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeFilter === spec
                                    ? 'bg-black text-white shadow-xl translate-x-1'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getDocConfig({ dr_type: spec }).color }}></div>
                                <span className="flex-1 text-left truncate">{spec}</span>
                                {activeFilter === spec && <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mt-auto p-6 bg-gray-50/50">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase text-gray-400 tracking-tighter">
                        <span>Active Units</span>
                        <span className="text-black">{doctors.length}</span>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 relative">
                <MapContainer
                    center={defaultCenter}
                    zoom={13}
                    zoomControl={false}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; CARTO'
                    />

                    <MapController onMapClick={() => setSelectedDoctor(null)} />
                    <RecenterAutomatically pos={position} />

                    {/* Patient Marker */}
                    {position && <Marker position={position} icon={patientIcon} />}

                    {/* Doctor Markers */}
                    {filteredDoctors
                        .filter(doc => doc.latitude && doc.longitude)
                        .map((doc) => (
                            <Marker
                                key={doc.id}
                                position={[doc.latitude, doc.longitude]}
                                icon={createMarkerIcon(doc, selectedDoctor?.id === doc.id)}
                                eventHandlers={{
                                    click: () => {
                                        setSelectedDoctor(doc);
                                        mapRef.current?.flyTo([doc.latitude, doc.longitude], 16);
                                    }
                                }}
                            />
                        ))}
                </MapContainer>

                {/* Floating Controls */}
                <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-3">
                    <button
                        onClick={() => {
                            if (position) mapRef.current?.flyTo(position, 16);
                        }}
                        className="w-12 h-12 bg-white rounded-2xl text-blue-600 shadow-xl border border-gray-50 flex items-center justify-center hover:scale-110 active:scale-95 transition"
                    >
                        <FiCrosshair size={22} />
                    </button>
                </div>

                {/* Selected Doctor Card */}
                {selectedDoctor && (
                    <div className="absolute bottom-6 left-6 right-6 md:left-auto md:w-96 z-[1000] animate-in slide-in-from-bottom-5 fade-in duration-500">
                        <div className="bg-white/95 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.15)] relative overflow-hidden group">

                            <button
                                onClick={() => setSelectedDoctor(null)}
                                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition"
                            >
                                <FiX />
                            </button>

                            <div className="flex items-center gap-5 mb-6">
                                <div className="w-20 h-20 rounded-[2rem] bg-gray-50 overflow-hidden shadow-inner border border-gray-100 shrink-0">
                                    <img
                                        src={selectedDoctor.profile_image
                                            ? (selectedDoctor.profile_image.startsWith('http') ? selectedDoctor.profile_image : `https://portal.mclinic.co.ke/api/uploads/profiles/${selectedDoctor.profile_image}`)
                                            : `https://ui-avatars.com/api/?name=${selectedDoctor.fname}+${selectedDoctor.lname}&background=random`
                                        }
                                        className="w-full h-full object-cover"
                                        alt=""
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-xl font-black text-gray-900 truncate">
                                            {selectedDoctor.fname} {selectedDoctor.lname}
                                        </h3>
                                        {selectedDoctor.Verified_status === 1 && <FiCheck className="text-blue-500" />}
                                    </div>
                                    <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-2">
                                        {selectedDoctor.dr_type || 'Specialist'}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <div className={`w-2 h-2 rounded-full ${selectedDoctor.isWorking ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                        {selectedDoctor.isWorking ? 'Available' : 'Offline'}
                                    </div>

                                    {/* Admin Only Contact Details */}
                                    {user?.role === UserRole.ADMIN && (
                                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                                            {selectedDoctor.mobile && (
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
                                                    <FiPhone className="text-blue-500" />
                                                    {selectedDoctor.mobile}
                                                </div>
                                            )}
                                            {selectedDoctor.email && (
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
                                                    <FiMail className="text-blue-500" />
                                                    {selectedDoctor.email}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => router.push(`/dashboard/doctors/${selectedDoctor.id}`)}
                                className="w-full py-5 bg-black text-white rounded-[1.5rem] font-black text-sm flex items-center justify-center gap-3 hover:translate-y-[-2px] transition active:scale-95 shadow-2xl shadow-black/20"
                            >
                                VIEW MEDICAL PROFILE
                                <FiNavigation />
                            </button>
                        </div>
                    </div>
                )}

                {/* Global Loading */}
                {loading && (
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-sm z-[2000] flex flex-col items-center justify-center">
                        <div className="w-20 h-20 border-[6px] border-blue-600 border-t-transparent rounded-full animate-spin mb-4 shadow-2xl"></div>
                        <span className="font-black text-blue-600 tracking-[0.3em] uppercase text-xs animate-pulse">Syncing Radar</span>
                    </div>
                )}
            </div>
        </div>
    );
}
