import { useState } from 'react';
import { api } from '@/lib/api';
import { FiStar, FiX } from 'react-icons/fi';

interface RateDoctorModalProps {
    appointment: any;
    onClose: () => void;
    onSuccess: () => void;
}

export default function RateDoctorModal({ appointment, onClose, onSuccess }: RateDoctorModalProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [hover, setHover] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            alert('Please select a rating');
            return;
        }

        setLoading(true);
        try {
            await api.post('/reviews', {
                rating,
                comment,
                appointmentId: appointment.id,
                doctorId: appointment.doctorId
            });
            alert('Review submitted successfully!');
            onSuccess();
        } catch (err) {
            console.error(err);
            alert('Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-lg dark:text-white">Rate Your Medic</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
                        <FiX />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-gray-100 mb-3 overflow-hidden">
                            {/* Medic Image Placeholder */}
                            <img
                                src={`https://ui-avatars.com/api/?name=${appointment.doctor?.fname}+${appointment.doctor?.lname}&background=random`}
                                alt="Medic"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <h4 className="font-bold text-lg dark:text-white">Dr. {appointment.doctor?.fname} {appointment.doctor?.lname}</h4>
                        <p className="text-sm text-gray-500">How was your consultation?</p>
                    </div>

                    <div className="flex justify-center gap-2 mb-6">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="text-3xl focus:outline-none transition-transform hover:scale-110"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                            >
                                <FiStar
                                    className={`${star <= (hover || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-700'
                                        } transition-colors duration-200`}
                                />
                            </button>
                        ))}
                    </div>

                    <div className="mb-6">
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Leave a comment (Optional)</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                            rows={3}
                            placeholder="Share your experience..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary text-black font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50"
                    >
                        {loading ? 'Submitting...' : 'Submit Review'}
                    </button>
                </form>
            </div>
        </div>
    );
}
