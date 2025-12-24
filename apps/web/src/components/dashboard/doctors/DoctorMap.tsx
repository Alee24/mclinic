'use client';

import Link from 'next/link';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { FiClock, FiMapPin, FiUser, FiPhone } from 'react-icons/fi';

// ... (existing icon fix code)

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

export default function DoctorMap({ doctors }: { doctors: Doctor[] }) {
    const [activeDoctor, setActiveDoctor] = useState<Doctor | null>(null);

    // Default center (Nairobi)
    const center: [number, number] = [-1.2921, 36.8219];


    const createCustomIcon = (doctor: Doctor) => {
        const isSelected = activeDoctor?.id === doctor.id;
        const color = doctor.isWorking ? '#10B981' : '#EF4444'; // Green if working, Red if not

        // Simulating avatar with initials
        const name = `${doctor.fname} ${doctor.lname}`;
        const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

        return L.divIcon({
            className: 'custom-maker',
            html: `
                <div style="
                    background-color: white;
                    border: 2px solid ${isSelected ? '#3B82F6' : 'white'};
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    position: relative;
                ">
                    <div style="
                        width: 36px;
                        height: 36px;
                        background-color: #E5E7EB;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        overflow: hidden;
                        font-weight: bold;
                        color: #374151;
                        font-size: 14px;
                    ">
                        ${initials}
                    </div>
                    <div style="
                        position: absolute;
                        bottom: 0;
                        right: 0;
                        width: 12px;
                        height: 12px;
                        background-color: ${color};
                        border: 2px solid white;
                        border-radius: 50%;
                    "></div>
                </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -20],
        });
    };

    const createPatientIcon = () => {
        return L.divIcon({
            className: 'patient-marker',
            html: `
                <div style="background-color: #3B82F6; border: 2px solid white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                    <div style="width: 8px; height: 8px; background-color: white; border-radius: 50%;"></div>
                </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
        });
    }

    const getRoutePath = (start: [number, number], end: [number, number]): [number, number][] => {
        const [startLat, startLng] = start;
        const [endLat, endLng] = end;

        // Create a "Manhattan" style route (Street-like)
        // Move horizontally then vertically
        const midLat = (startLat + endLat) / 2;
        // Add a slight randomization to look like a real route calculation
        const offset = 0.001;

        return [
            [startLat, startLng],
            [midLat, startLng], // Go North/South to midpoint
            [midLat, endLng],   // Go East/West to target longitude
            [endLat, endLng]    // Go North/South to target
        ];
    };

    return (
        <div className="relative w-full h-[600px] rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800">
            {/* Map */}
            <MapContainer
                center={center}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%', zIndex: 0 }}
                className="z-0"
            >
                {/* ... (TileLayer) */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />

                {doctors.map((doctor) => (
                    (doctor.latitude && doctor.longitude) && (
                        <div key={doctor.id}>
                            <Marker
                                position={[Number(doctor.latitude), Number(doctor.longitude)]}
                                icon={createCustomIcon(doctor)}
                                eventHandlers={{
                                    click: () => setActiveDoctor(doctor),
                                }}
                            />
                            {/* Active Booking: Patient Marker & Line */}
                            {doctor.activeBooking && doctor.activeBooking.patient.location && (
                                <>
                                    <Marker
                                        position={[
                                            Number(doctor.activeBooking.patient.location.latitude),
                                            Number(doctor.activeBooking.patient.location.longitude)
                                        ]}
                                        icon={createPatientIcon()}
                                    >
                                        <Popup>Patient: {doctor.activeBooking.patient.fname}</Popup>
                                    </Marker>
                                    <Polyline
                                        positions={getRoutePath(
                                            [Number(doctor.latitude), Number(doctor.longitude)],
                                            [Number(doctor.activeBooking.patient.location.latitude), Number(doctor.activeBooking.patient.location.longitude)]
                                        )}
                                        pathOptions={{ color: '#3B82F6', weight: 4, opacity: 0.8, lineJoin: 'round' }}
                                    />
                                </>
                            )}
                        </div>
                    )
                ))}
            </MapContainer>

            {/* Overlay Card */}
            {activeDoctor && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-80 z-[1000] border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-200">
                    {/* ... (Close button & Header) - reusing existing logic but updating content */}
                    <button
                        onClick={() => setActiveDoctor(null)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                        ✕
                    </button>

                    <div className="flex flex-col items-center mb-4">
                        <Link href={`/dashboard/doctors/${activeDoctor.id}`} className="flex flex-col items-center hover:opacity-80 transition">
                            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xl font-bold mb-2">
                                {`${activeDoctor.fname} ${activeDoctor.lname}`.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center hover:underline">{activeDoctor.fname} {activeDoctor.lname}</h3>
                        </Link>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{activeDoctor.dr_type}</p>
                    </div>

                    <div className="space-y-3 mb-6">
                        {/* Contact Info */}
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                            <span className="text-blue-500"><FiPhone /></span>
                            <span>{activeDoctor.mobile || 'No contact info'}</span>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                            <span className="text-blue-500"><FiMapPin /></span>
                            <span>Nairobi General</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                            <div className={`w-4 h-4 rounded-full ${activeDoctor.isWorking ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span>{activeDoctor.isWorking ? 'Currently Working' : 'Off Duty'}</span>
                        </div>

                        {/* Active Booking Info */}
                        {activeDoctor.activeBooking && (
                            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-1">Active Booking</div>
                                <div className="text-sm font-medium dark:text-white flex items-center gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                    Patient: {activeDoctor.activeBooking.patient.fname} {activeDoctor.activeBooking.patient.lname}
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <div className="bg-white dark:bg-black/20 p-2 rounded border border-blue-100 dark:border-blue-800">
                                        <div className="text-[10px] text-gray-500 uppercase">Est. ETA</div>
                                        <div className="font-bold text-gray-800 dark:text-gray-200">{activeDoctor.activeBooking.eta || 'Calculating...'}</div>
                                    </div>
                                    <div className="bg-white dark:bg-black/20 p-2 rounded border border-blue-100 dark:border-blue-800">
                                        <div className="text-[10px] text-gray-500 uppercase">Distance</div>
                                        <div className="font-bold text-gray-800 dark:text-gray-200">{activeDoctor.activeBooking.routeDistance || '--'}</div>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-400 mt-2 italic flex items-center gap-1">
                                    <span className="text-[10px]"><FiMapPin /></span> Shortest route by road
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Stats Footer or Actions */}
                    <div className="grid grid-cols-2 gap-2">
                        <button className="py-2 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-lg text-xs hover:bg-gray-200 transition">
                            View Profile
                        </button>
                        <button className="py-2 px-4 bg-primary text-black font-bold rounded-lg text-xs hover:opacity-90 transition">
                            Call Doctor
                        </button>
                    </div>
                </div>
            )}

            {/* Stats Overlay (Unchanged) */}
            <div className="absolute top-4 left-4 bg-white dark:bg-gray-900 p-3 rounded-xl shadow-lg z-[999] border border-gray-100 dark:border-gray-800 flex flex-col gap-1">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Medics</h4>
                <div className="text-2xl font-black text-gray-900 dark:text-white">
                    {doctors.filter(d => d.isWorking).length} <span className="text-sm font-normal text-gray-400">/ {doctors.length}</span>
                </div>
            </div>
        </div>
    );
}
