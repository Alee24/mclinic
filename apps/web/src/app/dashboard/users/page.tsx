'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FiUsers, FiLock, FiSearch, FiEdit2, FiTrash2, FiCheck, FiX } from 'react-icons/fi';

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [resettingUser, setResettingUser] = useState<any>(null);
    const [newPassword, setNewPassword] = useState('');
    const [resetLoading, setResetLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            if (res && res.ok) {
                setUsers(await res.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resettingUser || !newPassword) return;

        setResetLoading(true);
        try {
            const res = await api.post(`/users/${resettingUser.id}/reset`, { password: newPassword });
            if (res && res.ok) {
                alert('Password reset successfully!');
                setResettingUser(null);
                setNewPassword('');
            } else {
                alert('Failed to reset password.');
            }
        } catch (err) {
            console.error(err);
            alert('Error resetting password.');
        } finally {
            setResetLoading(false);
        }
    };

    const [editingUser, setEditingUser] = useState<any>(null);
    const [editForm, setEditForm] = useState<{ fname: string; lname: string; email: string; role: string; status: boolean; profilePicture?: File | null }>({ fname: '', lname: '', email: '', role: '', status: true, profilePicture: null });

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            await api.delete(`/users/${id}`);
            setUsers(users.filter(u => u.id !== id));
        } catch (err) {
            console.error(err);
            alert('Failed to delete user.');
        }
    };

    const startEdit = (user: any) => {
        setEditingUser(user);
        setEditForm({
            fname: user.fname || '',
            lname: user.lname || '',
            email: user.email || '',
            role: user.role || 'patient',
            status: user.status,
            profilePicture: null
        });
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Upload Profile Picture if exists
            if (editForm.profilePicture) {
                const formData = new FormData();
                formData.append('file', editForm.profilePicture);
                await api.post(`/users/${editingUser.id}/upload-profile`, formData);
            }

            // Update User Details
            const res = await api.patch(`/users/${editingUser.id}`, {
                fname: editForm.fname,
                lname: editForm.lname,
                email: editForm.email,
                role: editForm.role,
                status: editForm.status
            });

            if (res && res.ok) {
                const updated = await res.json();
                setUsers(users.map(u => u.id === editingUser.id ? updated : u));
                setEditingUser(null);
                alert('User updated successfully!');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to update user.');
        }
    };

    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.fname || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.lname || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = roleFilter === 'all' || user.role === roleFilter;

        const matchesStatus = statusFilter === 'all'
            ? true
            : statusFilter === 'active'
                ? user.status === true
                : user.status === false;

        return matchesSearch && matchesRole && matchesStatus;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <h1 className="text-2xl font-black dark:text-white flex items-center gap-2">
                    <span className="text-primary"><FiUsers /></span> User Management
                </h1>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Role Filter */}
                    <select
                        className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="all">All Roles</option>
                        <option value="patient">Patients</option>
                        <option value="doctor">Doctors</option>
                        <option value="admin">Admins</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    {/* Search */}
                    <div className="relative w-64">
                        <span className="absolute left-3 top-3 text-gray-400"><FiSearch /></span>
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1A1A1A] outline-none focus:ring-2 focus:ring-primary"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-[#161616] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-800">
                                <th className="p-4 font-bold text-sm text-gray-500 uppercase">User</th>
                                <th className="p-4 font-bold text-sm text-gray-500 uppercase">Role</th>
                                <th className="p-4 font-bold text-sm text-gray-500 uppercase">Status</th>
                                <th className="p-4 font-bold text-sm text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {loading ? (
                                <tr><td colSpan={4} className="p-8 text-center text-gray-500">Loading users...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-gray-500">No users found.</td></tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
                                                    {user.profilePicture ? (
                                                        <img
                                                            src={`http://localhost:3001/uploads/profiles/${user.profilePicture}`}
                                                            alt="Profile"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-sm font-bold text-gray-500 uppercase">
                                                            {(user.fname?.[0] || user.email?.[0] || '?')}
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 dark:text-white">{user.fname} {user.lname}</div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                                                user.role === 'doctor' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                                    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`flex items-center gap-1.5 text-xs font-bold ${user.status ? 'text-green-500' : 'text-red-500'}`}>
                                                <span className={`w-2 h-2 rounded-full ${user.status ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                {user.status ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => startEdit(user)}
                                                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                                                    title="Edit User"
                                                >
                                                    <FiEdit2 />
                                                </button>
                                                <button
                                                    onClick={() => setResettingUser(user)}
                                                    className="p-2 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition"
                                                    title="Reset Password"
                                                >
                                                    <FiLock />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                                                    title="Delete User"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-md rounded-2xl p-6 shadow-xl animate-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg dark:text-white">Edit User</h3>
                            <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                                <FiX />
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="flex justify-center mb-6">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-[#1A1A1A] shadow-lg">
                                        {(editForm.profilePicture || editingUser.profilePicture) ? (
                                            <img
                                                src={editForm.profilePicture ? URL.createObjectURL(editForm.profilePicture) : `http://localhost:3001/uploads/profiles/${editingUser.profilePicture}`}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-3xl font-bold text-gray-300">
                                                {editForm.fname?.[0]}{editForm.lname?.[0]}
                                            </span>
                                        )}
                                    </div>
                                    <label className="absolute bottom-0 right-0 bg-primary text-black p-2 rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform">
                                        <FiEdit2 size={14} />
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                                if (e.target.files?.[0]) {
                                                    setEditForm({ ...editForm, profilePicture: e.target.files[0] });
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">First Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black outline-none"
                                        value={editForm.fname}
                                        onChange={(e) => setEditForm({ ...editForm, fname: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Last Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black outline-none"
                                        value={editForm.lname}
                                        onChange={(e) => setEditForm({ ...editForm, lname: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Email</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black outline-none"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Role</label>
                                <select
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black outline-none"
                                    value={editForm.role}
                                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                >
                                    <option value="patient">Patient</option>
                                    <option value="doctor">Doctor</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Status</label>
                                <select
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black outline-none"
                                    value={editForm.status ? 'active' : 'inactive'}
                                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value === 'active' })}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-primary text-black font-bold rounded-xl transition-colors shadow-lg"
                            >
                                Save Changes
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Password Reset Modal */}
            {resettingUser && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-md rounded-2xl p-6 shadow-xl animate-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg dark:text-white">Reset Password</h3>
                            <button onClick={() => setResettingUser(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                                <FiX />
                            </button>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-black rounded-xl mb-4">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <FiLock />
                                </div>
                                <div>
                                    <div className="font-bold text-sm dark:text-white">Resetting for:</div>
                                    <div className="text-sm text-gray-500 truncate max-w-[200px]">{resettingUser.email}</div>
                                </div>
                            </div>

                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">New Password</label>
                                    <input
                                        type="text"
                                        placeholder="Enter new password"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black outline-none focus:ring-2 focus:ring-primary"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={resetLoading}
                                    className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-500/30"
                                >
                                    {resetLoading ? 'Resetting...' : 'Confirm Reset'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
