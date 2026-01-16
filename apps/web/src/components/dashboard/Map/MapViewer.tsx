'use client';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet default marker icons in Next.js
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

function RecenterAutomatically({ lat, lng }: { lat: number, lng: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng]);
    }, [lat, lng, map]);
    return null;
}

export default function MapViewer() {
    const [position, setPosition] = useState<[number, number] | null>(null);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGetLocation = () => {
        setLoading(true);
        setError(null);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const { latitude, longitude } = pos.coords;
                setPosition([latitude, longitude]);

                // Fetch doctors
                try {
                    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://portal.mclinic.co.ke/api';
                    const res = await fetch(`${API_URL}/doctors/nearby?lat=${latitude}&lng=${longitude}&radius=50`);
                    if (!res.ok) throw new Error('Failed to fetch');
                    const data = await res.json();
                    setDoctors(data);
                } catch (e) {
                    setError('Failed to load nearby doctors');
                } finally {
                    setLoading(false);
                }
            }, (err) => {
                setError('Location access denied. Please enable GPS in your browser settings.');
                setLoading(false);
            });
        } else {
            setError('Geolocation is not supported by this browser.');
            setLoading(false);
        }
    };

    // Nairobi default
    const defaultCenter: [number, number] = [-1.2921, 36.8219];

    return (
        <div className="relative w-full h-full min-h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-gray-800 bg-[#0f0f13]">

            {/* Overlay Card - Floating Control */}
            <div className="absolute top-6 left-6 z-[1000] w-72 bg-[#1a1a20]/95 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl text-white">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg">Radar</h3>
                    <div className="animate-pulse w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                    <div className="bg-white/5 rounded-xl p-2 text-center">
                        <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                            {doctors.length}
                        </div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider">Medics</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-2 text-center">
                        <div className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                            50
                        </div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider">Km Range</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-2 text-center">
                        <div className="text-xl font-bold text-white">
                            {position ? 'ON' : 'OFF'}
                        </div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider">GPS</div>
                    </div>
                </div>

                <button
                    onClick={handleGetLocation}
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-bold text-sm shadow-xl shadow-blue-900/20 hover:shadow-blue-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group ring-1 ring-white/10"
                >
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Scanning...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5 group-hover:animate-ping absolute opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" /></svg>
                            <svg className="w-5 h-5 relative" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" /></svg>
                            ENABLE GPS
                        </>
                    )}
                </button>
                {error && <p className="text-red-400 text-xs mt-3 text-center bg-red-900/20 p-2 rounded-lg">{error}</p>}
            </div>

            <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%', background: '#09090b', zIndex: 0 }}>
                {/* Dark Matter Map Style */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                    subdomains="abcd"
                    maxZoom={20}
                />

                {position && <RecenterAutomatically lat={position[0]} lng={position[1]} />}

                {/* Current User Marker - Pulse Effect */}
                {position && (
                    <Marker position={position} icon={L.divIcon({
                        className: '', // Reset
                        html: `<div class="relative w-8 h-8">
                                 <div class="absolute inset-0 bg-blue-500 rounded-full opacity-50 animate-ping"></div>
                                 <div class="absolute inset-2 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
                               </div>`,
                        iconSize: [32, 32],
                        iconAnchor: [16, 16]
                    })}>
                        <Popup className="custom-popup">You are here</Popup>
                    </Marker>
                )}

                {/* Doctor Markers */}
                {doctors.map((doc: any) => {
                    const avatarUrl = doc.profile_image
                        ? (doc.profile_image.startsWith('http') ? doc.profile_image : `${process.env.NEXT_PUBLIC_API_URL || 'https://portal.mclinic.co.ke/api'}/uploads/profiles/${doc.profile_image}`)
                        : `https://ui-avatars.com/api/?name=${doc.fname}+${doc.lname}&background=random`;

                    return (
                        <Marker
                            key={doc.id}
                            position={[doc.latitude, doc.longitude]}
                            icon={L.divIcon({
                                html: `<div class="relative w-12 h-12 group transition-transform hover:scale-110">
                                         <div class="absolute inset-0 bg-gradient-to-tr from-green-500 to-emerald-400 rounded-full p-[2px] shadow-lg shadow-green-900/50">
                                            <img src="${avatarUrl}" class="w-full h-full rounded-full object-cover border-2 border-[#1a1a20]" />
                                         </div>
                                         <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#1a1a20] rounded-full"></div>
                                       </div>`,
                                className: '',
                                iconSize: [48, 48],
                                iconAnchor: [24, 48]
                            })}
                        >
                            <Popup>
                                <div className="p-1 min-w-[200px]">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full overflow-hidden">
                                            <img src={avatarUrl} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 text-sm">{doc.fname} {doc.lname}</div>
                                            <div className="text-xs text-green-600 font-bold uppercase">{doc.dr_type}</div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                                        <span>📍</span> {doc.distance ? doc.distance.toFixed(1) : '?'} km away
                                    </div>
                                    <a href={`/dashboard/doctors/${doc.id}`} className="block w-full text-center py-2 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition">
                                        VIEW PROFILE
                                    </a>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
