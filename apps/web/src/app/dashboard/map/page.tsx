'use client';

import dynamic from 'next/dynamic';

const MapViewer = dynamic(() => import('@/components/dashboard/Map/MapViewer'), {
    ssr: false,
    loading: () => (
        <div className="h-[80vh] w-full rounded-3xl bg-[#0f0f13] border border-gray-800 flex flex-col items-center justify-center animate-pulse">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-mono text-sm">Initializing Map Radar...</p>
        </div>
    )
});

export default function MapPage() {
    return (
        <div className="p-4 md:p-6 h-[calc(100vh-80px)]">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white">Live Map</h1>
                    <p className="text-gray-500 text-sm">Find medical professionals near you in real-time.</p>
                </div>
            </div>

            <div className="h-[calc(100%-80px)]">
                <MapViewer />
            </div>
        </div>
    );
}
