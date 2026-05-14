'use client';

import { useState, useEffect, useRef } from 'react';
import { FiArrowLeft, FiArrowRight, FiPhone, FiCalendar, FiLock } from 'react-icons/fi';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import CreateAppointmentModal from '../dashboard/appointments/CreateAppointmentModal';

interface Doctor {
  id: number;
  fname: string;
  lname: string;
  dr_type: string;
  speciality: string;
  profile_image: string;
  isPrivate?: boolean;
  unlockMessage?: string;
}

export default function MedicSlider() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const { user } = useAuth();
  
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://portal.mclinic.co.ke/api'}/doctors`, {
          headers
        });
        
        if (res.ok) {
          const data = await res.json();
          // Shuffle for "random" effect
          setDoctors(data.sort(() => Math.random() - 0.5));
        }
      } catch (err) {
        console.error('Failed to fetch doctors for slider', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const nextSlide = () => {
    if (doctors.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % doctors.length);
  };

  const prevSlide = () => {
    if (doctors.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + doctors.length) % doctors.length);
  };

  // Auto-play
  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [doctors.length]);

  const handleMedicClick = (doctor: Doctor) => {
    if (!user) {
        // Redirect to login or show message
        window.location.href = '/login?redirect=/';
        return;
    }
    setSelectedDoctor(doctor);
    setShowBooking(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mc-green"></div>
      </div>
    );
  }

  if (!user && !loading && doctors.length === 0) {
    return (
      <div className="py-20 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-mc-crimson/10 text-mc-crimson mb-4">
            <FiLock size={32} />
        </div>
        <h4 className="text-3xl font-black">Medic Data is Private</h4>
        <p className="text-gray-400 max-w-md mx-auto italic">
          To protect our medical professionals' privacy, you must be logged in to view our directory and book appointments.
        </p>
        <Link href="/login" className="inline-block bg-mc-dark text-white px-8 py-3 rounded-xl font-bold hover:bg-mc-crimson transition-all">
          Login / Register to View
        </Link>
      </div>
    );
  }

  if (doctors.length === 0 && !loading) return null;

  return (
    <div className="relative w-full overflow-hidden py-10">
      <div 
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * (100 / (typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 4))}%)` }}
      >
        {doctors.map((doctor) => (
          <div 
            key={doctor.id} 
            className="w-full md:w-1/2 lg:w-1/4 flex-shrink-0 px-4"
          >
            <div 
              onClick={() => handleMedicClick(doctor)}
              className="group cursor-pointer bg-mc-light rounded-[2.5rem] p-8 space-y-6 hover:bg-white hover:shadow-2xl transition-all border border-transparent hover:border-gray-100 h-full flex flex-col"
            >
              <div className="relative aspect-square rounded-3xl overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500">
                <img 
                  src={doctor.profile_image ? (doctor.profile_image.startsWith('http') ? doctor.profile_image : `${process.env.NEXT_PUBLIC_API_URL || 'https://portal.mclinic.co.ke/api'}/uploads/profiles/${doctor.profile_image}`) : 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80'} 
                  alt={doctor.fname} 
                  className="w-full h-full object-cover" 
                />
                {doctor.isPrivate && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                    <FiLock className="text-white text-4xl opacity-70" />
                  </div>
                )}
              </div>
              
              <div className="text-left space-y-2 flex-grow">
                <div className="flex items-center justify-between">
                    <h5 className="text-xl font-black">{doctor.fname} {doctor.lname}</h5>
                    {doctor.isPrivate && <span className="bg-mc-crimson/10 text-mc-crimson text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Private</span>}
                </div>
                <p className="text-mc-green font-bold text-sm uppercase tracking-wider">{doctor.speciality || doctor.dr_type}</p>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-mc-dark text-white py-3 rounded-xl font-bold text-sm hover:bg-mc-crimson transition-all flex items-center justify-center gap-2">
                  <FiPhone size={14} /> Call Now
                </button>
                <button className="flex-1 border-2 border-mc-dark py-3 rounded-xl font-bold text-sm hover:bg-mc-dark hover:text-white transition-all flex items-center justify-center gap-2">
                  <FiCalendar size={14} /> Book
                </button>
              </div>
              
              {doctor.isPrivate && (
                <p className="text-[10px] text-gray-400 italic text-center mt-2">
                  {doctor.unlockMessage}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <button 
        onClick={(e) => { e.stopPropagation(); prevSlide(); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center hover:bg-mc-dark hover:text-white transition-all z-10"
      >
        <FiArrowLeft />
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); nextSlide(); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center hover:bg-mc-dark hover:text-white transition-all z-10"
      >
        <FiArrowRight />
      </button>

      {/* Booking Modal */}
      {showBooking && selectedDoctor && (
        <CreateAppointmentModal 
          onClose={() => setShowBooking(false)}
          onSuccess={() => {
            setShowBooking(false);
            // Maybe redirect to appointments
          }}
          initialData={{
            doctorId: selectedDoctor.id,
            doctorName: `${selectedDoctor.fname} ${selectedDoctor.lname}`
          }}
        />
      )}
    </div>
  );
}
