'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { FiLoader, FiShield, FiXCircle, FiClock, FiAlertTriangle } from 'react-icons/fi';

export default function PanicSystem() {
    const { user } = useAuth();
    const [status, setStatus] = useState<'idle' | 'active' | 'panic'>('idle');
    const [timer, setTimer] = useState(0);
    const [alertId, setAlertId] = useState<number | null>(null);
    const [recording, setRecording] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Verify if user is a medic/provider
    const isMedic = user && ['doctor', 'nurse', 'medic', 'clinician', 'specialist', 'admin'].includes(user.role.toLowerCase());

    useEffect(() => {
        if (status === 'active') {
            timerRef.current = setInterval(() => {
                setTimer(t => t + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [status]);

    useEffect(() => {
        return () => {
            stopRecording();
            if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
        };
    }, []);

    const startSession = () => {
        setStatus('active');
        setTimer(0);
    };

    const endSession = () => {
        const confirmEnd = window.confirm('Are you sure you want to end the visit session?');
        if (confirmEnd) {
            setStatus('idle');
            setTimer(0);
        }
    };

    const triggerPanic = async () => {
        setStatus('panic');

        // 1. Get Location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                // Send Alert API
                try {
                    const res = await api.post('/emergency/alert', { lat: latitude, lng: longitude });
                    if (res && res.ok) {
                        const data = await res.json();
                        setAlertId(data.id);
                        startRecording(data.id);
                    }
                } catch (e) {
                    console.error('Failed to send panic alert', e);
                }
            }, (err) => {
                console.error('Geolocation failed', err);
                // Try sending without location?
                api.post('/emergency/alert', { lat: 0, lng: 0 }).then(res => {
                    if (res?.ok) {
                        res.json().then((d: any) => startRecording(d.id));
                    }
                });
            });
        }
    };

    const startRecording = async (currentAlertId: number) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.start();
            setRecording(true);

            // Upload chunk every 10 seconds
            recordingIntervalRef.current = setInterval(() => {
                // Upload chunk periodically
                uploadChunks(currentAlertId);
            }, 10000);

        } catch (err) {
            console.error('Microphone access denied', err);
        }
    };

    const uploadChunks = async (id: number) => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.requestData();
            // Wait slightly for data availability? 
            // Actually, requestData() fires available event synchronously or async.
            // We upload whatever is in chunksRef after a small delay.
            setTimeout(async () => {
                if (chunksRef.current.length === 0) return;
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                chunksRef.current = []; // Reset chunks

                const formData = new FormData();
                formData.append('audio', blob, `panic-${id}-${Date.now()}.webm`);

                try {
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://portal.mclinic.co.ke/api'}/emergency/${id}/audio`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                        },
                        body: formData
                    });
                } catch (e) { console.error('Upload failed', e); }
            }, 500);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
        if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
        setRecording(false);
    };

    const resolvePanic = () => {
        // Hidden gesture? Long press top right?
        const pin = prompt('Enter Admin PIN to de-escalate:');
        if (pin === '1234') { // Hardcoded for demo
            setStatus('active'); // Back to active session
            stopRecording();
        }
    };

    if (!isMedic) return null;

    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // Idle State: Do not render anything
    if (status === 'idle') {
        return null; // Button removed as per request
    }

    // Panic State: Black Screen
    if (status === 'panic') {
        return (
            <div className="fixed inset-0 bg-black z-[99999] flex items-center justify-center text-white/5 cursor-none touch-none select-none">
                {/* Fake Lock Screen Look (Very dimmed) */}
                <div className="text-center w-full h-full flex flex-col justify-between p-12">
                    <div className="h-20"></div>
                    {/* Hidden unlock trigger */}
                    <div className="text-9xl font-black opacity-0" onDoubleClick={resolvePanic}>.</div>
                    <div className="text-xs">System Locked</div>
                </div>
            </div>
        );
    }

    // Active Session State: Floating Bar
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-8 flex flex-col items-center gap-4 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-black">

            {/* Timer Badge */}
            <div className="bg-black/80 text-white px-4 py-1 rounded-full text-xs font-mono flex items-center gap-2 backdrop-blur-md">
                <FiClock /> {formatTime(timer)}
            </div>

            <div className="flex items-center gap-6 w-full max-w-sm justify-center relative">

                {/* Cancel/End Session - Small */}
                <button
                    onClick={endSession}
                    className="w-12 h-12 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-300 shadow-md"
                    title="End Session"
                >
                    <FiXCircle className="text-xl" />
                </button>

                {/* PANIC BUTTON - Large, Floating, Light Green */}
                <button
                    onClick={triggerPanic}
                    className="w-24 h-24 rounded-full bg-green-400 border-4 border-green-200 hover:bg-red-500 hover:border-red-300 transition-all duration-300 shadow-xl shadow-green-400/40 flex flex-col items-center justify-center gap-1 group relative overflow-hidden"
                >
                    <span className="absolute inset-0 bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <FiAlertTriangle className="text-3xl text-white relative z-10" />
                    <span className="text-[10px] font-black uppercase text-white tracking-widest relative z-10">Panic</span>

                    {/* Ripple Effect Animation */}
                    <span className="absolute inset-0 border-white/30 border rounded-full animate-ping"></span>
                    <span className="absolute inset-0 border-white/20 border-2 rounded-full animate-ping delay-75"></span>
                </button>

                {/* Spacer to balance layout */}
                <div className="w-12"></div>
            </div>
        </div>
    );
}
