'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  BadgeCheck, 
  MapPin, 
  Stethoscope, 
  Award, 
  Calendar, 
  Share2, 
  Loader2, 
  AlertCircle,
  LogIn,
  UserPlus,
  Wifi,
  WifiOff,
  Star
} from 'lucide-react';
import Footer from '@/components/landing/Footer';

export default function MedicProfilePage() {
  const params = useParams();
  const id = params?.id;
  const [medic, setMedic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      const apiUrl = `/api/users/profile/${id}`;
      fetch(apiUrl)
        .then(res => {
          if (res.status === 409) return res.json().then(d => { throw new Error(d.message || 'PRIVATE_PROFILE') });
          if (!res.ok) throw new Error('NOT_FOUND');
          return res.json();
        })
        .then(data => {
          setMedic(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('[ProfilePage] Fetch error:', err);
          setError(err.message === 'PRIVATE_PROFILE' || err.message === 'This profile is not currently public' ? 'PRIVATE_PROFILE' : 'NOT_FOUND');
          setLoading(false);
        });
    }
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Profile link copied to clipboard!');
  };

  const handleRate = async (value: number) => {
    if (!medic?.id) return;
    setRatingSubmitting(true);
    try {
      const response = await fetch(`/api/users/profile/${medic.id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating: value }),
      });
      if (response.ok) {
        const updatedUser = await response.json();
        // Enrich the updatedUser with online status from the existing state
        setMedic({ ...updatedUser, isOnline: medic.isOnline });
        alert(`Thank you for rating! Rating updated to ${value}.0`);
      } else {
        alert('Failed to submit rating. Please try again.');
      }
    } catch (e) {
      console.error(e);
      alert('Error submitting rating.');
    } finally {
      setRatingSubmitting(false);
    }
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

  const isOnline = medic?.isOnline;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Simple top bar with Logo + Login/Register */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-extrabold text-slate-800 tracking-tight">
            M-CLINIC<span className="text-emerald-500">.</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="flex items-center gap-2 px-5 py-2.5 text-slate-700 font-semibold hover:bg-slate-100 rounded-xl transition-colors text-sm"
            >
              <LogIn className="w-4 h-4" />
              Login
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all text-sm"
            >
              <UserPlus className="w-4 h-4" />
              Register Now
            </Link>
          </div>
        </div>
      </header>
      
      <main className="max-w-5xl mx-auto px-6 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column: Profile Basics */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center text-center sticky top-24">
              <div className="relative group">
                <div className="w-48 h-48 rounded-full overflow-hidden ring-4 ring-emerald-500/10 mb-6 shadow-xl relative">
                  <img 
                    src={medic.id ? `/api/users/profile-image/${medic.id}` : `https://ui-avatars.com/api/?name=${medic.fname}+${medic.lname}&background=10b981&color=fff&size=512`}
                    alt={`${medic.fname} ${medic.lname} profile`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={(e: any) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${medic.fname}+${medic.lname}&background=10b981&color=fff&size=512`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="absolute bottom-6 right-4 bg-white p-2 rounded-full shadow-lg border border-emerald-50 scale-110">
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
                  {isOnline ? (
                    <span className="text-emerald-500 font-bold flex items-center gap-1.5">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      Online Now
                    </span>
                  ) : (
                    <span className="text-slate-400 font-bold flex items-center gap-1.5">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-300"></span>
                      </span>
                      Offline
                    </span>
                  )}
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
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-slate-800 font-bold">MClinic HQ</p>
                    <p className="text-slate-500 text-sm">Upper Hill, Nairobi</p>
                  </div>
                </div>
                {/* Online status indicator */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  {isOnline ? (
                    <>
                      <Wifi className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-semibold text-emerald-600">Online — Available for consultations</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-400">Offline — Currently unavailable</span>
                    </>
                  )}
                </div>
              </div>

              {/* My Ratings Section replacing Patient Care */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-2">My Ratings</h3>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {Number(medic.rating || 4.9).toFixed(1)}
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const currentRating = Number(medic.rating || 4.9);
                      const isGold = star <= Math.round(currentRating);
                      return (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${isGold ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                        />
                      );
                    })}
                  </div>
                </div>
                
                {/* Rate this Professional Interactive Section */}
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider font-semibold">Rate this Professional</p>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isHovered = star <= hoverRating;
                      return (
                        <button
                          key={star}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => handleRate(star)}
                          disabled={ratingSubmitting}
                          className="focus:outline-none transition-transform active:scale-90 hover:scale-110"
                        >
                          <Star
                            className={`w-7 h-7 transition-colors duration-200 ${
                              isHovered 
                                ? 'text-amber-400 fill-amber-400 animate-pulse' 
                                : 'text-slate-300 hover:text-amber-400'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
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
