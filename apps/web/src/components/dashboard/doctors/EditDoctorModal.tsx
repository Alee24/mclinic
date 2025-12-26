import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FiX } from 'react-icons/fi';

interface EditDoctorModalProps {
    doctorId: number;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditDoctorModal({ doctorId, onClose, onSuccess }: EditDoctorModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({
        fname: '',
        lname: '',
        sex: '',
        dob: '',
        email: '',
        mobile: '',
        address: '',
        speciality: '',
        dr_type: '',
        licenceNo: '',
        reg_code: '',
        licenceExpiryDate: '',
        hospitalAffiliation: '',
        qualification: '',
        fee: 0,
        bio: '',
    });

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const res = await api.get(`/doctors/${doctorId}`);
                if (res && res.ok) {
                    const data = await res.json();
                    setFormData({
                        fname: data.fname || '',
                        lname: data.lname || '',
                        sex: data.sex || 'Male',
                        dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '',
                        email: data.email || '',
                        mobile: data.mobile || '',
                        address: data.address || '',
                        speciality: data.speciality || '',
                        dr_type: data.dr_type || '',
                        licenceNo: data.licenceNo || '',
                        reg_code: data.reg_code || '',
                        licenceExpiryDate: data.licenceExpiryDate ? new Date(data.licenceExpiryDate).toISOString().split('T')[0] : '',
                        hospitalAffiliation: data.hospitalAffiliation || '',
                        qualification: data.qualification || '',
                        fee: data.fee || 0,
                        bio: data.bio || '',
                    });
                    if (data.profile_image) {
                        setPreviewUrl(`${process.env.NEXT_PUBLIC_API_URL}/uploads/profiles/${data.profile_image}`);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setFetching(false);
            }
        };
        fetchDoctor();
    }, [doctorId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Upload Image if selected
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                const uploadRes = await api.post(`/doctors/${doctorId}/upload-profile`, formData);
                if (!uploadRes || !uploadRes.ok) {
                    console.error('Image upload failed');
                    // Continue to save text data anyway, or stop?
                    // Let's warn but continue
                }
            }

            // 2. Update Profile Data
            const res = await api.patch(`/doctors/${doctorId}`, {
                ...formData,
                fee: Number(formData.fee)
            });

            if (res && res.ok) {
                // alert('Doctor updated successfully');
                // Replaced alert with callback or toast logic if avail, for now just call success
                onSuccess();
            } else {
                alert('Failed to update doctor profile text');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-bold dark:text-white">Edit Doctor Profile</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-black dark:hover:text-white transition">
                        <FiX size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">

                    {/* Image Upload Section */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 mb-3 overflow-hidden border-4 border-white dark:border-[#1A1A1A] shadow-lg relative group">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-3xl">👨‍⚕️</div>
                            )}

                            <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <span className="text-white text-xs font-bold">Change</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </label>
                        </div>
                        <p className="text-xs text-gray-500">Tap image to upload new photo</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Section: Personal Details */}
                        <div className="md:col-span-2 border-b pb-2 mb-2">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Personal Information</h3>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">First Name *</label>
                            <input name="fname" required className="w-full form-input" value={formData.fname} onChange={handleChange} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Last Name *</label>
                            <input name="lname" required className="w-full form-input" value={formData.lname} onChange={handleChange} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Gender *</label>
                            <select name="sex" className="w-full form-input" value={formData.sex} onChange={handleChange}>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Date of Birth</label>
                            <input type="date" name="dob" className="w-full form-input" value={formData.dob} onChange={handleChange} />
                        </div>

                        {/* Section: Contact Info */}
                        <div className="md:col-span-2 border-b border-t py-2 my-2 bg-gray-50/50 -mx-6 px-6">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Details</h3>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email Address *</label>
                            <input type="email" name="email" required className="w-full form-input" value={formData.email} onChange={handleChange} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Mobile Number *</label>
                            <input name="mobile" required className="w-full form-input" value={formData.mobile} onChange={handleChange} />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Physical Address</label>
                            <input name="address" className="w-full form-input" value={formData.address} onChange={handleChange} />
                        </div>

                        {/* Section: Professional Info */}
                        <div className="md:col-span-2 border-b border-t py-2 my-2 bg-gray-50/50 -mx-6 px-6">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Professional Profile</h3>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Specialty *</label>
                            <select name="speciality" required className="w-full form-input" value={formData.speciality} onChange={handleChange}>
                                <option value="">Select Specialty</option>
                                {[
                                    'Cardiology', 'Dermatology', 'Neurology', 'Pediatrics',
                                    'Psychiatry', 'Oncology', 'Radiology', 'Surgery',
                                    'Orthopedics', 'Gynecology', 'Urology', 'Internal Medicine',
                                    'Dentistry', 'Ophthalmology', 'ENT', 'General Practice'
                                ].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Doctor Type</label>
                            <select name="dr_type" className="w-full form-input" value={formData.dr_type} onChange={handleChange}>
                                <option value="Specialist">Specialist</option>
                                <option value="General Doctor">General Practitioner</option>
                                <option value="Consultant">Consultant</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">License Number</label>
                            <input name="licenceNo" className="w-full form-input font-mono" value={formData.licenceNo} onChange={handleChange} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Reg. Code (KMPDC)</label>
                            <input name="reg_code" className="w-full form-input font-mono" value={formData.reg_code} onChange={handleChange} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">License Expiry</label>
                            <input type="date" name="licenceExpiryDate" className="w-full form-input" value={formData.licenceExpiryDate} onChange={handleChange} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Hospital Affiliation</label>
                            <input name="hospitalAffiliation" className="w-full form-input" value={formData.hospitalAffiliation} onChange={handleChange} />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Qualifications</label>
                            <input name="qualification" className="w-full form-input" value={formData.qualification} onChange={handleChange} placeholder="MBBS, MD, PhD..." />
                        </div>

                        {/* Section: Financial & Other */}
                        <div className="md:col-span-2 border-b border-t py-2 my-2 bg-gray-50/50 -mx-6 px-6">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Financial & Other Details</h3>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Consultation Fee (KES)</label>
                            <input name="fee" type="number" className="w-full form-input" value={formData.fee} onChange={handleChange} min="0" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Bio</label>
                            <textarea name="bio" className="w-full form-input" rows={2} value={formData.bio} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800 mt-6">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="px-8 py-2.5 bg-primary text-black font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50">
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            <style jsx global>{`
                .form-input {
                    @apply px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition outline-none;
                }
            `}</style>
        </div>
    );
}
