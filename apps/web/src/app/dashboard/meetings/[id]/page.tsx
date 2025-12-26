'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiSave } from 'react-icons/fi';

export default function MeetingPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [notes, setNotes] = useState('');

    const handleSaveNotes = () => {
        // In a real app, save to DB via API
        alert('Notes saved to session (mock)');
    };

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition"
                >
                    <FiArrowLeft /> Back to Appointments
                </button>
                <h1 className="text-xl font-bold dark:text-white">Virtual Consultation</h1>
                <div className="w-24"></div>
            </div>

            <div className="flex-1 flex gap-4 overflow-hidden">
                {/* Video Area (2/3) */}
                <div className="flex-[2] bg-black rounded-xl overflow-hidden shadow-lg border border-gray-800 relative">
                    <iframe
                        src={`https://virtual.mclinic.co.ke/${id}`}
                        allow="camera; microphone; fullscreen; display-capture; autoplay"
                        className="w-full h-full border-0"
                    ></iframe>
                    <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm pointer-events-none">
                        Room: {id}
                    </div>
                </div>

                {/* Notes Area (1/3) */}
                <div className="flex-1 bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden shadow-lg">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                        <h2 className="font-bold dark:text-white">Consultation Notes</h2>
                        <button
                            onClick={handleSaveNotes}
                            className="flex items-center gap-1.5 text-xs bg-primary text-black font-bold px-3 py-1.5 rounded hover:opacity-90 transition"
                        >
                            <FiSave /> Save
                        </button>
                    </div>
                    <div className="flex-1 p-4">
                        <textarea
                            className="w-full h-full resize-none outline-none text-gray-700 dark:text-gray-300 bg-transparent placeholder-gray-400"
                            placeholder="Type session notes here... Patients can see these notes if shared."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
