import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FiX } from 'react-icons/fi';

interface EditPatientModalProps {
    patientId: number;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditPatientModal({ patientId, onClose, onSuccess }: EditPatientModalProps) {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [formData, setFormData] = useState({
        fname: '',
        lname: '',
        dob: '',
        sex: '',
        mobile: '',
        address: '',
    });

    useEffect(() => {
        const fetchPatient = async () => {
            try {
                const res = await api.get(`/patients/${patientId}`);
                if (res && res.ok) {
                    const data = await res.json();
                    setFormData({
                        fname: data.fname || '',
                        lname: data.lname || '',
                        dob: data.dob ? data.dob.split('T')[0] : '',
                        sex: data.sex || '',
                        mobile: data.mobile || '',
                        address: data.address || '',
                    });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setFetching(false);
            }
        };
        fetchPatient();
    }, [patientId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await api.patch(`/patients/${patientId}`, formData);

            if (res && res.ok) {
                alert('Patient updated successfully');
                onSuccess();
            } else {
                alert('Failed to update patient');
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
            <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-2xl rounded-xl shadow-2xl my-8 flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-bold dark:text-white">Edit Patient</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-black dark:hover:text-white transition">
                        <FiX size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">First Name</label>
                            <input name="fname" required className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition outline-none" value={formData.fname} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Last Name</label>
                            <input name="lname" required className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition outline-none" value={formData.lname} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Date of Birth</label>
                            <input type="date" name="dob" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition outline-none" value={formData.dob} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Gender</label>
                            <select name="sex" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition outline-none" value={formData.sex} onChange={handleChange}>
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Phone Number</label>
                            <input name="mobile" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition outline-none" value={formData.mobile} onChange={handleChange} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Address</label>
                            <input name="address" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition outline-none" value={formData.address} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="pt-8 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800 mt-8">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="px-8 py-2.5 bg-primary text-black font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50">
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>


        </div>
    );
}
