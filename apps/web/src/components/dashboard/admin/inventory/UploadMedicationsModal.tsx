'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { FiUpload, FiX, FiCheckCircle } from 'react-icons/fi';

interface UploadMedicationsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UploadMedicationsModal({ isOpen, onClose }: UploadMedicationsModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/pharmacy/medications/upload', formData, {
                headers: {
                    // Content-Type is auto-set by FormData
                }
            });
            const data = await res.json();
            if (res && res.ok) {
                setResult(data.message);
                setTimeout(() => {
                    onClose();
                    setFile(null);
                    setResult(null);
                }, 2000);
            } else {
                setResult('Upload failed: ' + data.message);
            }
        } catch (err) {
            console.error(err);
            setResult('Upload failed.');
        } finally {
            setUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-black dark:hover:text-white"
                >
                    <FiX size={20} />
                </button>

                <h2 className="text-xl font-bold mb-1 dark:text-white">Upload Medications</h2>
                <p className="text-sm text-gray-500 mb-6">Bulk upload/update via CSV.</p>

                <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-8 text-center hover:border-primary transition cursor-pointer relative">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center gap-2 pointer-events-none">
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500">
                                <FiUpload />
                            </div>
                            <p className="text-sm font-medium dark:text-gray-300">
                                {file ? file.name : 'Click to select CSV'}
                            </p>
                        </div>
                    </div>

                    {result && (
                        <div className={`p-3 rounded-lg text-xs font-bold ${result.includes('failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {result}
                        </div>
                    )}

                    <button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className="w-full py-3 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {uploading ? 'Uploading...' : 'Upload Data'}
                    </button>
                </div>
            </div>
        </div>
    );
}
