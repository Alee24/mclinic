'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { FiX, FiCheck, FiUploadCloud, FiFile } from 'react-icons/fi';

interface UploadLabResultModalProps {
    order: any;
    onClose: () => void;
    onSuccess: () => void;
}

export default function UploadLabResultModal({ order, onClose, onSuccess }: UploadLabResultModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [notes, setNotes] = useState('');
    const [uploading, setUploading] = useState(false);

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('notes', notes);

        try {
            // Updated endpoint for file upload
            const res = await api.post(`/laboratory/orders/${order.id}/upload-report`, formData);

            if (res) {
                alert('Results uploaded successfully! The patient has been notified via email.');
                onSuccess();
            } else {
                alert('Upload failed.');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred during upload.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1A1A1A] w-full max-w-md rounded-3xl shadow-2xl p-6 text-center">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-xl text-gray-900 dark:text-white">Upload Results</h3>
                    <button onClick={onClose}><FiX size={20} className="dark:text-white" /></button>
                </div>

                <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-2">Patient: <span className="font-bold text-gray-900 dark:text-white">{order.isForSelf ? `${order.patient.fname} ${order.patient.lname}` : order.beneficiaryName}</span></p>
                    <p className="text-sm text-gray-500">Test: <span className="font-bold text-gray-900 dark:text-white">{order.test.name}</span></p>
                </div>

                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 mb-6 bg-gray-50 dark:bg-white/5 relative">
                    <input
                        type="file"
                        accept=".pdf,.jpg,.png"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                        {file ? (
                            <>
                                <FiFile size={40} className="text-primary" />
                                <span className="text-sm font-bold text-gray-900 dark:text-white">{file.name}</span>
                            </>
                        ) : (
                            <>
                                <FiUploadCloud size={40} />
                                <span className="text-sm font-medium">Click or Drag to upload PDF report</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="mb-6 text-left">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Technician Notes / Result Explanation</label>
                    <textarea
                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black dark:text-white text-sm focus:ring-2 focus:ring-primary outline-none resize-none h-24"
                        placeholder="Enter detailed explanation of results..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    ></textarea>
                </div>

                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="w-full py-3 bg-primary text-black font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {uploading ? 'Uploading & Sending Email...' : 'Upload & Notify Patient'}
                </button>
            </div>
        </div>
    );
}
