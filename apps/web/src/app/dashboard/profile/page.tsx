'use client';

import { useAuth } from '@/lib/auth';

export default function ProfilePage() {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white dark:bg-[#121212] rounded-2xl p-8 border border-gray-200 dark:border-gray-800 flex items-center gap-6 shadow-sm">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 p-1">
                    <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 overflow-hidden">
                        <img
                            src={`https://ui-avatars.com/api/?name=${user?.fname}+${user?.lname}&size=200`}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
                <div>
                    <h1 className="text-3xl font-bold dark:text-white capitalize">{user?.fname} {user?.lname}</h1>
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase mt-2 inline-block">
                        {user?.role}
                    </span>
                    <p className="text-sm text-gray-400 mt-2">{user?.email}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#121212] rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                    <h2 className="text-lg font-bold mb-4 dark:text-white">Personal Information</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-gray-500 uppercase font-bold">Full Name</label>
                            <div className="dark:text-gray-300 font-medium">{user?.fname} {user?.lname}</div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 uppercase font-bold">Email</label>
                            <div className="dark:text-gray-300 font-medium">{user?.email}</div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 uppercase font-bold">Contact Details</label>
                            <div className="dark:text-gray-300">{user?.mobile || 'No mobile number'}</div>
                            <div className="dark:text-gray-300 text-sm text-gray-500">{user?.address || 'No address provided'}</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#121212] rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                    <h2 className="text-lg font-bold mb-4 dark:text-white">Account Security</h2>
                    <p className="text-gray-500 text-sm mb-6">Manage your account security and authentication methods.</p>

                    <div className="space-y-3">
                        <button className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition flex justify-between items-center group">
                            <span>Change Password</span>
                            <span className="text-gray-400 group-hover:text-gray-600">→</span>
                        </button>
                        <button className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition flex justify-between items-center group">
                            <span>Two-Factor Authentication</span>
                            <span className="text-gray-400 group-hover:text-gray-600">Setup</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
