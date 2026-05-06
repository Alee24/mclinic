'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  BadgeCheck, 
  MapPin, 
  Stethoscope, 
  Award, 
  Calendar, 
  Share2, 
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';

export default function MedicProfilePage() {
  const params = useParams();
  const id = params?.id;
  const [medic, setMedic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7899'}/users/profile/${id}`)
        .then(res => {
          if (res.status === 409) throw new Error('PRIVATE_PROFILE');
          if (!res.ok) throw new Error('NOT_FOUND');
          return res.json();
        })
        .then(data => {
          setMedic(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Profile link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">
          {error === 'PRIVATE_PROFILE' ? 'Profile Not Public' : 'Medic Not Found'}
        </h1>
        <p className="text-slate-500 mt-2 max-w-md">
          {error === 'PRIVATE_PROFILE' 
            ? 'This healthcare professional has chosen to keep their profile private for now.' 
            : 'The medic profile you are looking for does not exist or has been removed.'}
        </p>
        <a href="/" className="mt-6 px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
          Return Home
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-5xl mx-auto px-6 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column: Profile Basics */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center text-center sticky top-24">
              <div className="relative group">
                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-emerald-500/10 mb-6">
                  <img 
                    src={medic.profilePicture ? `/api/uploads/profiles/${medic.profilePicture}` : `https://ui-avatars.com/api/?name=${medic.fname}+${medic.lname}&background=10b981&color=fff&size=512`}
                    alt={`${medic.fname} ${medic.lname}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="absolute bottom-6 right-4 bg-white p-1.5 rounded-full shadow-lg border border-emerald-50 font-bold">
                  <BadgeCheck className="w-6 h-6 text-emerald-500" />
                </div>
              </div>

              <h1 className="text-2xl font-bold text-slate-800 mb-1">
                {medic.fname} {medic.lname}
              </h1>
              <p className="text-emerald-600 font-semibold mb-4 flex items-center justify-center gap-1.5 uppercase tracking-wider text-xs">
                <Stethoscope className="w-4 h-4" />
                {medic.specialization || 'Healthcare Professional'}
              </p>

              <div className="w-full pt-6 border-t border-slate-50 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 font-medium">License No</span>
                  <span className="text-slate-700 font-bold font-mono">{medic.licenseNumber || 'VERIFIED'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 font-medium">Availability</span>
                  <span className="text-emerald-500 font-bold">Available Now</span>
                </div>
              </div>

              <div className="w-full mt-8 space-y-3">
                <a 
                  href={`/dashboard/appointments?medicId=${medic.id}`}
                  className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Book Appointment
                </a>
                <button 
                  onClick={handleShare}
                  className="w-full py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  Share Profile
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Experience/Bio */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <Award className="w-6 h-6 text-emerald-500" />
                Professional Summary
              </h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line text-lg">
                {medic.bio || `${medic.fname} ${medic.lname} is a highly dedicated healthcare professional at MClinic, committed to providing exceptional care and medical expertise to patients. With a specialization in ${medic.specialization || 'General Practice'}, ${medic.fname} ensures a patient-centric approach to every consultation.`}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4">Practice Locations</h3>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-slate-800 font-bold">MClinic HQ</p>
                    <p className="text-slate-500 text-sm">Upper Hill, Nairobi</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4">Patient Care</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?u=${i}`} alt="patient" />
                      </div>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-slate-500">100+ Patients helped</span>
                </div>
              </div>
            </div>

            {/* Verification Footer */}
            <div className="p-10 rounded-3xl bg-emerald-900 text-white relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Verified Professional</h3>
                  <p className="text-emerald-100/80">This profile is certified by MClinic Medical Board.</p>
                </div>
                <BadgeCheck className="w-16 h-16 text-emerald-400 opacity-50" />
              </div>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-800 to-transparent"></div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
