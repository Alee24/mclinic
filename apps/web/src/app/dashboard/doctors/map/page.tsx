'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Dynamic import for Leaflet map to avoid window is not defined error
const DoctorMap = dynamic(
    () => import('@/components/dashboard/doctors/DoctorMap'),
    {
        loading: () => <div className="w-full h-[600px] bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse flex items-center justify-center text-gray-400">Loading Map...</div>,
        ssr: false
    }
);

export default function DoctorsMapPage() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3434';
                const res = await fetch(`${API_URL}/doctors`);
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                setDoctors(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctors();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Live Doctor Locations</h1>
                    <p className="text-gray-500 dark:text-gray-400">Real-time view of active medical personnel.</p>
                </div>
            </div>

            <DoctorMap doctors={doctors} />
        </div>
    );
}
