'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

interface Service {
    id: number;
    name: string;
    description: string;
    price: number;
    duration: number;
    isActive: boolean;
}

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        duration: '30',
    });

    const fetchServices = async () => {
        setLoading(true);
        try {
            const res = await api.get('/services');
            if (res?.ok) {
                setServices(await res.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                duration: parseInt(formData.duration),
                isActive: true,
            };

            if (editingService) {
                await api.patch(`/services/${editingService.id}`, payload);
            } else {
                await api.post('/services', payload);
            }

            setShowModal(false);
            setEditingService(null);
            setFormData({ name: '', description: '', price: '', duration: '30' });
            fetchServices();
        } catch (err) {
            console.error(err);
            alert('Failed to save service');
        }
    };

    const handleEdit = (service: Service) => {
        setEditingService(service);
        setFormData({
            name: service.name,
            description: service.description || '',
            price: service.price.toString(),
            duration: service.duration.toString(),
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this service?')) return;
        try {
            await api.delete(`/services/${id}`);
            fetchServices();
        } catch (err) {
            console.error(err);
            alert('Failed to delete service');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold dark:text-white">Services Management</h1>
                <button
                    onClick={() => {
                        setEditingService(null);
                        setFormData({ name: '', description: '', price: '', duration: '30' });
                        setShowModal(true);
                    }}
                    className="bg-primary text-black font-bold px-4 py-2 rounded-lg hover:opacity-90 transition flex items-center gap-2"
                >
                    <FiPlus /> Add Service
                </button>
            </div>

            <div className="bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs uppercase text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">Service Name</th>
                            <th className="px-6 py-4">Description</th>
                            <th className="px-6 py-4">Price (KES)</th>
                            <th className="px-6 py-4">Duration (mins)</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-4 text-center">Loading...</td></tr>
                        ) : services.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">No services found</td></tr>
                        ) : (
                            services.map((service) => (
                                <tr key={service.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium dark:text-white">{service.name}</td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">{service.description || 'N/A'}</td>
                                    <td className="px-6 py-4 text-gray-900 dark:text-white font-bold">
                                        {service.price.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{service.duration}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${service.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {service.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(service)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <FiEdit2 />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(service.id)}
                                                className="text-red-600 hover:text-red-800"
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

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-lg rounded-xl shadow-2xl p-6">
                        <h2 className="text-xl font-bold dark:text-white mb-6">
                            {editingService ? 'Edit Service' : 'Add New Service'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Service Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black dark:text-white"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Description</label>
                                <textarea
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black dark:text-white"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Price (KES)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black dark:text-white"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Duration (mins)</label>
                                    <input
                                        type="number"
                                        required
                                        min="5"
                                        step="5"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black dark:text-white"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingService(null);
                                    }}
                                    className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-primary text-black font-bold rounded-lg hover:opacity-90"
                                >
                                    {editingService ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
