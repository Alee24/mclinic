import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { FiX, FiSave, FiUser } from 'react-icons/fi';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface EditPersonalDetailsModalProps {
    user: any;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditPersonalDetailsModal({ user, onClose, onSuccess }: EditPersonalDetailsModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fname: user?.fname || '',
        lname: user?.lname || '',
        mobile: user?.mobile || '',
        national_id: user?.national_id || '',
        address: user?.address || '',
        city: user?.city || '',
    });

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Using /users/:id to handle generic profile updates for ALL roles (Admin, Medic, Patient)
            const res = await api.patch(`/users/${user.id}`, formData);
            if (res && res.ok) {
                toast.success('Personal details updated successfully');
                onSuccess();
            } else {
                toast.error('Failed to update details');
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Transition appear show={true} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-[#1C1C1C] p-6 text-left align-middle shadow-xl transition-all">
                            <div className="flex justify-between items-center mb-6">
                                <Dialog.Title as="h3" className="text-xl font-bold dark:text-white flex items-center gap-2">
                                    <FiUser className="text-blue-500" /> Edit Personal Details
                                </Dialog.Title>
                                <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition">
                                    <FiX className="dark:text-white" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">First Name</label>
                                        <input type="text" name="fname" value={formData.fname} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-black dark:border-gray-700 dark:text-white text-sm" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Last Name</label>
                                        <input type="text" name="lname" value={formData.lname} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-black dark:border-gray-700 dark:text-white text-sm" required />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Mobile Number</label>
                                    <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-black dark:border-gray-700 dark:text-white text-sm" required />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">National ID</label>
                                    <input type="text" name="national_id" value={formData.national_id} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-black dark:border-gray-700 dark:text-white text-sm" placeholder="ID Number" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">City</label>
                                        <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-black dark:border-gray-700 dark:text-white text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Address</label>
                                        <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full p-2 rounded-lg border dark:bg-black dark:border-gray-700 dark:text-white text-sm" />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-800">
                                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={loading} className="px-6 py-2 text-sm font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
                                        {loading ? 'Saving...' : <><FiSave /> Save Changes</>}
                                    </button>
                                </div>
                            </form>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
