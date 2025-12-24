'use client';

import { useState, useEffect } from 'react';
import { FiUpload, FiDatabase, FiCheckCircle, FiAlertCircle, FiFileText, FiUsers, FiUser, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { useAuth, UserRole } from '@/lib/auth';

interface MigrationStats {
    totalRecords: number;
    transformed: number;
    skipped: number;
    errors: string[];
}

interface PreviewData {
    type: 'users' | 'doctors' | 'appointments' | 'invoices';
    sample: any[];
    total: number;
}

export default function DataMigrationPage() {
    const { user } = useAuth();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dataType, setDataType] = useState<'users' | 'doctors' | 'appointments' | 'invoices'>('users');
    const [uploading, setUploading] = useState(false);
    const [migrating, setMigrating] = useState(false);
    const [preview, setPreview] = useState<PreviewData | null>(null);
    const [stats, setStats] = useState<MigrationStats | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    if (user?.role !== UserRole.ADMIN) {
        return <div className="p-12 text-center text-gray-500">Access Denied: Admin priviledges required for data migration.</div>;
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.name.endsWith('.sql')) {
                setError('Please select a .sql file');
                return;
            }
            setSelectedFile(file);
            setError(null);
            setPreview(null);
            setStats(null);
            setSuccess(false);
        }
    };

    const handleUploadAndPreview = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('dataType', dataType);

            const response = await fetch('http://localhost:3001/migration/preview', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to process file');
            }

            const data = await response.json();
            setPreview(data);
        } catch (err: any) {
            setError(err.message || 'Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    const handleMigrate = async () => {
        if (!selectedFile) return;

        setMigrating(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('dataType', dataType);

            const response = await fetch('http://localhost:3001/migration/execute', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Migration failed');
            }

            const data = await response.json();
            setStats(data.stats);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Migration failed');
        } finally {
            setMigrating(false);
        }
    };

    const dataTypeOptions = [
        { value: 'users', label: 'Patients/Users', icon: FiUsers, color: 'blue' },
        { value: 'doctors', label: 'Doctors', icon: FiUser, color: 'green' },
        { value: 'appointments', label: 'Appointments', icon: FiCalendar, color: 'purple' },
        { value: 'invoices', label: 'Invoices', icon: FiDollarSign, color: 'orange' },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Migration</h1>
                <p className="text-gray-600">
                    Upload SQL files from your old M-Clinic system to migrate data to the new platform
                </p>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upload Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FiDatabase className="w-5 h-5 text-blue-600" />
                            Upload Data
                        </h2>

                        {/* Data Type Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Select Data Type
                            </label>
                            <div className="space-y-2">
                                {dataTypeOptions.map((option) => {
                                    const Icon = option.icon;
                                    return (
                                        <button
                                            key={option.value}
                                            onClick={() => setDataType(option.value as any)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${dataType === option.value
                                                ? `border-${option.color}-500 bg-${option.color}-50`
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <Icon className={`w-5 h-5 ${dataType === option.value ? `text-${option.color}-600` : 'text-gray-400'
                                                }`} />
                                            <span className={`font-medium ${dataType === option.value ? `text-${option.color}-900` : 'text-gray-700'
                                                }`}>
                                                {option.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* File Upload */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                SQL File
                            </label>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".sql"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id="sql-file-input"
                                />
                                <label
                                    htmlFor="sql-file-input"
                                    className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                                >
                                    <FiUpload className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm text-gray-600">
                                        {selectedFile ? selectedFile.name : 'Choose SQL file'}
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2">
                            <button
                                onClick={handleUploadAndPreview}
                                disabled={!selectedFile || uploading}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                            >
                                <FiFileText className="w-4 h-4" />
                                {uploading ? 'Processing...' : 'Preview Data'}
                            </button>

                            {preview && (
                                <button
                                    onClick={handleMigrate}
                                    disabled={migrating}
                                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                >
                                    <FiDatabase className="w-4 h-4" />
                                    {migrating ? 'Migrating...' : 'Execute Migration'}
                                </button>
                            )}
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                                <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        )}

                        {/* Success Display */}
                        {success && (
                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                                <FiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-green-800">Migration completed successfully!</p>
                            </div>
                        )}
                    </div>

                    {/* Instructions */}
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-2">Instructions</h3>
                        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                            <li>Select the type of data you want to migrate</li>
                            <li>Upload the SQL file from your old system</li>
                            <li>Click "Preview Data" to see the transformation</li>
                            <li>Review the preview and click "Execute Migration"</li>
                            <li>Verify the imported data in the dashboard</li>
                        </ol>
                    </div>
                </div>

                {/* Preview/Results Section */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            {stats ? 'Migration Results' : 'Data Preview'}
                        </h2>

                        {!preview && !stats && (
                            <div className="text-center py-12">
                                <FiDatabase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">Upload a file to see preview</p>
                            </div>
                        )}

                        {/* Preview Table */}
                        {preview && !stats && (
                            <div>
                                <div className="mb-4 flex items-center justify-between">
                                    <p className="text-sm text-gray-600">
                                        Showing {preview.sample.length} of {preview.total} records
                                    </p>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                        {preview.type}
                                    </span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                {preview.sample[0] && Object.keys(preview.sample[0]).map((key) => (
                                                    <th
                                                        key={key}
                                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                    >
                                                        {key}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {preview.sample.map((row, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    {Object.values(row).map((value: any, cellIdx) => (
                                                        <td key={cellIdx} className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                                                            {value === null ? (
                                                                <span className="text-gray-400 italic">null</span>
                                                            ) : (
                                                                String(value).substring(0, 50)
                                                            )}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Migration Stats */}
                        {stats && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <p className="text-sm text-blue-600 font-medium mb-1">Total Records</p>
                                        <p className="text-3xl font-bold text-blue-900">{stats.totalRecords}</p>
                                    </div>
                                    <div className="bg-green-50 rounded-lg p-4">
                                        <p className="text-sm text-green-600 font-medium mb-1">Transformed</p>
                                        <p className="text-3xl font-bold text-green-900">{stats.transformed}</p>
                                    </div>
                                    <div className="bg-orange-50 rounded-lg p-4">
                                        <p className="text-sm text-orange-600 font-medium mb-1">Skipped</p>
                                        <p className="text-3xl font-bold text-orange-900">{stats.skipped}</p>
                                    </div>
                                </div>

                                {stats.errors.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Errors</h3>
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                                            <ul className="text-sm text-red-800 space-y-1">
                                                {stats.errors.map((err, idx) => (
                                                    <li key={idx}>• {err}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
