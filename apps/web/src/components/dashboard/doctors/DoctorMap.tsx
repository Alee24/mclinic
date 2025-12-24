'use client';

import Link from 'next/link';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState, useMemo } from 'react';
import { FiClock, FiMapPin, FiUser, FiPhone, FiSearch, FiNavigation, FiActivity, FiSearch as FiStethoscope, FiHeart, FiScissors, FiSmile, FiEye, FiZap } from 'react-icons/fi';

// Fixing Leaflet default icon issues in Next.js
// This useEffect needs to be inside a component or a custom hook.
// Placing it here within the DoctorMap component for global effect on Leaflet icons.

interface Doctor {
    id: number;
    fname: string;
    lname: string;
    dr_type: string;
    latitude: number;
    longitude: number;
    isWorking: boolean;
    mobile?: string;
    activeBooking?: {
        id: number;
        status: string;
        eta?: string;
        routeDistance?: string;
        patient: {
            id: number;
            fname: string;
            lname: string;
            location: {
                latitude: number;
                longitude: number;
            }
        }
    };
}

// Map specialties to colors and icons
const specialtyConfig: Record<string, { color: string; icon: string }> = {
    'Cardiologist': { color: '#EF4444', icon: '❤️' },
    'Pediatrician': { color: '#F59E0B', icon: '👶' },
    'Dermatologist': { color: '#EC4899', icon: '✨' },
    'General Surgeon': { color: '#10B981', icon: '🩺' },
    'Neurologist': { color: '#8B5CF6', icon: '🧠' },
    'Psychiatrist': { color: '#6366F1', icon: '💭' },
    'Orthopedic Surgeon': { color: '#F97316', icon: '🦴' },
    'Emergency Physician': { color: '#DC2626', icon: '🚑' },
    'Optometrist': { color: '#06B6D4', icon: '👁️' },
    'Dentist': { color: '#3B82F6', icon: '🦷' },
};

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
    const map = useMap();
    map.setView(center, zoom);
    return null;
}

export default function DoctorMap({ doctors }: { doctors: Doctor[] }) {
    const [activeDoctor, setActiveDoctor] = useState<Doctor | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [mapCenter, setMapCenter] = useState<[number, number]>([-1.2921, 36.8219]);
    const [mapZoom, setMapZoom] = useState(13);

    useEffect(() => {
        // @ts-ignore
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        });
    }, []);

    const filteredDoctors = useMemo(() => {
        return doctors.filter(d =>
            `${d.fname} ${d.lname} ${d.dr_type}`.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [doctors, searchTerm]);

    const createCustomIcon = (doctor: Doctor) => {
        const isSelected = activeDoctor?.id === doctor.id;
        const config = specialtyConfig[doctor.dr_type] || { color: '#10B981', icon: '👨‍⚕️' };
        const statusColor = doctor.isWorking ? '#10B981' : '#9CA3AF';

        return L.divIcon({
            className: 'custom-maker',
            html: `
                <div style="
                    background-color: white;
                    border: 2px solid ${isSelected ? '#3B82F6' : 'white'};
                    border-radius: 50%;
                    width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s;
                    transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
                ">
                    <div style="
                        width: 40px;
                        height: 40px;
                        background-color: ${config.color}20;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 20px;
                    ">
                        ${config.icon}
                    </div>
                    <div style="
                        position: absolute;
                        bottom: 2px;
                        right: 2px;
                        width: 12px;
                        height: 12px;
                        background-color: ${statusColor};
                        border: 2px solid white;
                        border-radius: 50%;
                    "></div>
                </div>
            `,
            iconSize: [48, 48],
            iconAnchor: [24, 24],
            popupAnchor: [0, -24],
        });
    };

    const handleSelectDoctor = (doctor: Doctor) => {
        setActiveDoctor(doctor);
        setMapCenter([Number(doctor.latitude), Number(doctor.longitude)]);
        setMapZoom(15);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[700px]">
            {/* Sidebar Medic List */}
            <div className="w-full lg:w-80 flex flex-col bg-white dark:bg-[#121212] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Find a medic..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {filteredDoctors.map(doctor => (
                        <button
                            key={doctor.id}
                            onClick={() => handleSelectDoctor(doctor)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeDoctor?.id === doctor.id
                                ? 'bg-primary/10 border border-primary/20 shadow-sm'
                                : 'hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent'
                                }`}
                        >
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg">
                                {specialtyConfig[doctor.dr_type]?.icon || '👨‍⚕️'}
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <div className="text-sm font-bold text-gray-900 dark:text-white truncate">Dr. {doctor.fname}</div>
                                <div className="text-[10px] text-gray-500 uppercase font-bold truncate">{doctor.dr_type}</div>
                            </div>
                            <div className={`w-2 h-2 rounded-full ${doctor.isWorking ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        </button>
                    ))}
                    {filteredDoctors.length === 0 && (
                        <div className="p-8 text-center text-gray-500 text-sm">No medics matching your search.</div>
                    )}
                </div>
            </div>

            {/* Map Area */}
            <div className="flex-1 relative rounded-2xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-800">
                <MapContainer
                    center={mapCenter}
                    zoom={mapZoom}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%', zIndex: 0 }}
                >
                    <ChangeView center={mapCenter} zoom={mapZoom} />
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    />

                    {filteredDoctors.map((doctor) => (
                        (doctor.latitude && doctor.longitude) && (
                            <Marker
                                key={doctor.id}
                                position={[Number(doctor.latitude), Number(doctor.longitude)]}
                                icon={createCustomIcon(doctor)}
                                eventHandlers={{
                                    click: () => handleSelectDoctor(doctor),
                                }}
                            >
                                <Popup>
                                    <div className="p-1">
                                        <div className="font-bold">Dr. {doctor.fname} {doctor.lname}</div>
                                        <div className="text-xs text-gray-500">{doctor.dr_type}</div>
                                    </div>
                                </Popup>
                            </Marker>
                        )
                    ))}
                </MapContainer>

                {/* Medic Details Overlay */}
                {activeDoctor && (
                    <div className="absolute bottom-6 left-6 right-6 lg:left-auto lg:top-6 lg:right-6 lg:bottom-auto lg:w-80 bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-2xl p-6 z-[1000] border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-right-4 duration-300">
                        <button
                            onClick={() => setActiveDoctor(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white transition"
                        >
                            ✕
                        </button>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl shadow-inner">
                                {specialtyConfig[activeDoctor.dr_type]?.icon || '👨‍⚕️'}
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-white">Dr. {activeDoctor.fname} {activeDoctor.lname}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-400 font-bold uppercase tracking-tighter">
                                        {activeDoctor.dr_type}
                                    </span>
                                    <div className={`w-2 h-2 rounded-full ${activeDoctor.isWorking ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-black/40 flex items-center justify-center text-blue-500">
                                    <FiPhone />
                                </div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">{activeDoctor.mobile || '+254 7XX XXX XXX'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-black/40 flex items-center justify-center text-green-500">
                                    <FiMapPin />
                                </div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Available in Nairobi CBD</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Link
                                href={`/dashboard/doctors/${activeDoctor.id}`}
                                className="flex items-center justify-center gap-2 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-xl text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition active:scale-95"
                            >
                                <FiUser /> Profile
                            </Link>
                            <a
                                href={`tel:${activeDoctor.mobile}`}
                                className="flex items-center justify-center gap-2 py-3 bg-primary text-black font-bold rounded-xl text-xs hover:opacity-90 shadow-lg shadow-primary/20 transition active:scale-95"
                            >
                                <FiPhone /> Call Medic
                            </a>
                        </div>
                    </div>
                )}

                {/* Legend / Stats Overlay */}
                <div className="absolute top-6 left-6 bg-white/90 dark:bg-black/80 backdrop-blur-md p-4 rounded-2xl shadow-lg z-[999] border border-white/20 flex flex-col gap-2 min-w-[140px]">
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Status</span>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">{doctors.filter(d => d.isWorking).length} Online</span>
                        </div>
                    </div>
                    <div className="h-px bg-gray-200 dark:bg-gray-700 my-1"></div>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Total Units</span>
                        <span className="text-sm font-black text-gray-900 dark:text-white">{doctors.length}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
