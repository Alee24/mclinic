import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { FiX, FiLock, FiCheck } from 'react-icons/fi';
import { api } from '@/lib/api';

interface ChangePasswordModalProps {
    user: any;
    onClose: () => void;
}

export default function ChangePasswordModal({ user, onClose }: ChangePasswordModalProps) {
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post(`/users/${user.id}/reset`, { password });
            if (res && res.ok) {
                alert('Password updated successfully');
                onClose();
            } else {
                alert('Failed to update password');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred');
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
                                    <FiLock className="text-orange-500" /> Change Password
                                </Dialog.Title>
                                <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition">
                                    <FiX className="dark:text-white" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">New Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full p-2 rounded-lg border dark:bg-black dark:border-gray-700 dark:text-white text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full p-2 rounded-lg border dark:bg-black dark:border-gray-700 dark:text-white text-sm"
                                        required
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-800">
                                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={loading} className="px-6 py-2 text-sm font-bold bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition flex items-center gap-2">
                                        {loading ? 'Updating...' : <><FiCheck /> Update Password</>}
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
