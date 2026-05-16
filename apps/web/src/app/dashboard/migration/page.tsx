'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FiUsers, FiUser, FiCalendar, FiDollarSign, FiFileText, FiTrash2, FiAlertCircle, FiCheckCircle, FiLoader, FiArrowRight, FiUpload, FiDownload, FiFolder, FiActivity, FiMapPin, FiSettings, FiBarChart2, FiDatabase, FiPackage, FiDroplet } from 'react-icons/fi';
import { useAuth, UserRole } from '@/lib/auth';

interface MigrationStats {
    totalRecords: number;
    transformed: number;
    skipped: number;
    errors: string[];
}

interface PreviewData {
    type: 'users' | 'medics' | 'appointments' | 'invoices' | 'transactions' | 'departments' | 'specialities' | 'locations' | 'services' | 'pharmacy' | 'lab_tests';
    sample: any[];
    total: number;
}

export default function DataMigrationPage() {
    const { user } = useAuth();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dataType, setDataType] = useState<'users' | 'medics' | 'appointments' | 'invoices' | 'transactions' | 'departments' | 'specialities' | 'locations' | 'services' | 'pharmacy' | 'lab_tests'>('users');
    const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
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
            const isSql = file.name.endsWith('.sql');
            const isCsv = file.name.endsWith('.csv');
            
            if (!isSql && !isCsv) {
                setError('Please select a .sql or .csv file');
                return;
            }
            setSelectedFile(file);
            setError(null);
            setPreview(null);
            setStats(null);
            setSuccess(false);
        }
    };

    const downloadTemplate = async (type: string) => {
        try {
            const response = await api.get(`/migration/template/${type}`);
            if (!response || !response.ok) throw new Error('Failed to download template');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${type}_template.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err: any) {
            setError(err.message);
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

            const response = await api.post('/migration/preview', formData);

            if (!response || !response.ok) {
                const errData = response ? await response.json().catch(() => ({})) : {};
                throw new Error(errData.message || 'Failed to process file');
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

            const response = await api.post('/migration/execute', formData);

            if (!response || !response.ok) {
                const errData = response ? await response.json().catch(() => ({})) : {};
                throw new Error(errData.message || 'Migration failed');
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

    const handleClearDatabase = async () => {
        if (!confirm('CRITICAL WARNING: This will delete ALL data (Users, Doctors, Appointments, etc.) from the database.\n\nAre you sure you want to proceed?')) return;
        if (!confirm('This action cannot be undone. Confirm clear database?')) return;


        setUploading(true);
        try {
            const res = await api.post('/migration/clear', {});

            if (!res) {
                alert('No response from server');
                return;
            }

            if (res && res.ok) {
                alert('Database cleared successfully!');
                window.location.reload();
            } else {
                const errData = await res.json().catch(() => ({}));
                alert(`Failed to clear database: ${errData.message || 'Unknown Error'}`);
            }
        } catch (error: any) {
            alert(`Error connecting to server: ${error.message || 'Unknown error'}`);
        } finally {
            setUploading(false);
        }
    };

    const handleExportAssets = async () => {
        try {
            const response = await api.get('/migration/export/assets');
            if (!response || !response.ok) throw new Error('Failed to export assets');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'mclinic_assets_backup.zip';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const dataTypeOptions = [
        { value: 'users', label: 'Patients/Users', icon: FiUsers, color: 'blue' },
        { value: 'medics', label: 'Medics/Doctors', icon: FiUser, color: 'green' },
        { value: 'appointments', label: 'Appointments', icon: FiCalendar, color: 'purple' },
        { value: 'invoices', label: 'Invoices', icon: FiDollarSign, color: 'orange' },
        { value: 'transactions', label: 'Transactions', icon: FiBarChart2, color: 'cyan' },
        { value: 'departments', label: 'Departments', icon: FiFolder, color: 'indigo' },
        { value: 'specialities', label: 'Specialities', icon: FiActivity, color: 'rose' },
        { value: 'locations', label: 'Locations', icon: FiMapPin, color: 'emerald' },
        { value: 'services', label: 'Services', icon: FiSettings, color: 'slate' },
        { value: 'pharmacy', label: 'Pharmacy/Medications', icon: FiPackage, color: 'teal' },
        { value: 'lab_tests', label: 'Lab Tests', icon: FiDroplet, color: 'amber' },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">Data Migration</h1>
                    <p className="text-gray-500 font-medium mt-1">
                        Seamlessly import data from CSV templates or M-Clinic SQL backups
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl text-xs font-bold border border-blue-100 dark:border-blue-900/30">
                        ADMIN ONLY
                    </div>
                </div>
            </div>

            {/* Main Content */}
            {/* Tab Navigation */}
            <div className="flex gap-4 mb-8 p-1 bg-gray-100 dark:bg-gray-800/50 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab('import')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'import'
                        ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    <FiUpload />
                    Data Import
                </button>
                <button
                    onClick={() => setActiveTab('export')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'export'
                        ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    <FiDownload />
                    Data Export
                </button>
            </div>

            {activeTab === 'import' ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Upload Section */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-[#161616] rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-800 p-8">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center">
                                <FiDatabase size={20} />
                            </div>
                            Migration Source
                        </h2>

                        {/* Data Type Selection */}
                        <div className="mb-8">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                                1. Select Entity Type
                            </label>
                            <div className="grid grid-cols-1 gap-2">
                                {dataTypeOptions.map((option) => {
                                    const Icon = option.icon;
                                    const isSelected = dataType === option.value;
                                    return (
                                        <div key={option.value} className="relative group flex items-center gap-2">
                                            <button
                                                onClick={() => setDataType(option.value as any)}
                                                className={`flex-1 flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${isSelected
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                                                    : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                                                    }`}
                                            >
                                                <span className={isSelected ? 'text-blue-600' : 'text-gray-400'}>
                                                    <Icon size={20} />
                                                </span>
                                                <span className={`font-bold text-sm ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-600 dark:text-gray-400'}`}>
                                                    {option.label}
                                                </span>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    downloadTemplate(option.value);
                                                }}
                                                className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-500 hover:bg-blue-600 hover:text-white rounded-xl transition-all flex flex-col items-center justify-center gap-1 min-w-[70px]"
                                                title={`Download ${option.label} CSV Template`}
                                            >
                                                <FiFileText size={16} />
                                                <span className="text-[9px] font-black uppercase tracking-tighter">Template</span>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* File Upload */}
                        <div className="mb-8">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                                2. Upload CSV or SQL File
                            </label>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".csv,.sql"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id="sql-file-input"
                                />
                                <label
                                    htmlFor="sql-file-input"
                                    className={`flex flex-col items-center justify-center gap-2 w-full p-8 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all ${selectedFile 
                                        ? 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/10' 
                                        : 'border-gray-200 dark:border-gray-800 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10'
                                    }`}
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedFile ? 'bg-green-100 text-green-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                                        <FiUpload size={24} />
                                    </div>
                                    <span className="text-sm font-bold text-gray-600 dark:text-gray-300 text-center">
                                        {selectedFile ? selectedFile.name : 'Choose File'}
                                    </span>
                                    <span className="text-[10px] text-gray-400">Max size: 10MB</span>
                                </label>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-4">
                            <button
                                onClick={handleUploadAndPreview}
                                disabled={!selectedFile || uploading}
                                className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                <FiFileText size={18} />
                                {uploading ? 'Processing Sample...' : 'Preview Data'}
                            </button>

                            {preview && (
                                <button
                                    onClick={handleMigrate}
                                    disabled={migrating}
                                    className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-600/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    <FiDatabase size={18} />
                                    {migrating ? 'Migrating Records...' : 'Start Migration'}
                                </button>
                            )}
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-start gap-3">
                                <FiAlertCircle className="text-red-600 mt-1" size={20} />
                                <p className="text-xs text-red-800 dark:text-red-400 font-medium">{error}</p>
                            </div>
                        )}
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 rounded-[2rem] p-8">
                        <h3 className="font-bold text-rose-900 dark:text-rose-100 mb-2 flex items-center gap-2">
                            <FiAlertCircle /> Database Reset
                        </h3>
                        <p className="text-xs text-rose-800 dark:text-rose-300 mb-6 leading-relaxed">
                            Wipe all existing data to start fresh. This is useful for testing migrations.
                        </p>
                        <button
                            onClick={handleClearDatabase}
                            className="w-full py-3 bg-white dark:bg-rose-950 text-rose-600 border border-rose-200 dark:border-rose-900 rounded-xl font-bold text-sm hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                        >
                            Clear All Data
                        </button>
                    </div>
                </div>

                {/* Preview/Results Section */}
                <div className="lg:col-span-8">
                    <div className="bg-white dark:bg-[#161616] rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-800 p-8 min-h-[600px]">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                                {stats ? 'Migration Analytics' : 'Data Preview'}
                            </h2>
                            {preview && (
                                <div className="px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-black uppercase tracking-widest">
                                    {preview.type}
                                </div>
                            )}
                        </div>

                        {!preview && !stats && (
                            <div className="flex flex-col items-center justify-center py-32 text-center">
                                <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] flex items-center justify-center mb-6">
                                    <FiDatabase className="text-gray-300" size={48} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-400">Ready for Migration</h3>
                                <p className="text-gray-400 max-w-sm mt-2 font-medium">Select a data type and upload a template to begin the preview process.</p>
                                
                                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-lg">
                                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                                        <div className="font-bold text-gray-900 dark:text-white text-sm mb-1">Step 1: Get Template</div>
                                        <div className="text-xs text-gray-500">Download the CSV template for your data type.</div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
                                        <div className="font-bold text-gray-900 dark:text-white text-sm mb-1">Step 2: Fill & Upload</div>
                                        <div className="text-xs text-gray-500">Fill in your data and upload for preview.</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Preview Table */}
                        {preview && !stats && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="mb-6 flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-500">
                                        Scan results: <span className="text-gray-900 dark:text-white font-bold">{preview.total}</span> records found. Showing first 10.
                                    </p>
                                </div>

                                <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-800">
                                    <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                                        <thead className="bg-gray-50 dark:bg-black/50">
                                            <tr>
                                                {preview.sample[0] && Object.keys(preview.sample[0]).map((key) => (
                                                    <th
                                                        key={key}
                                                        className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest"
                                                    >
                                                        {key}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-transparent divide-y divide-gray-100 dark:divide-gray-800">
                                            {preview.sample.map((row, idx) => (
                                                <tr key={idx} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/5 transition-colors">
                                                    {Object.values(row).map((value: any, cellIdx) => (
                                                        <td key={cellIdx} className="px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                                            {value === null ? (
                                                                <span className="text-gray-300 dark:text-gray-600 italic font-normal">null</span>
                                                            ) : (
                                                                String(value).substring(0, 30)
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
                            <div className="space-y-8 animate-in slide-in-from-right duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-3xl p-6 border border-blue-100 dark:border-blue-900/30 text-center">
                                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Total Records</p>
                                        <p className="text-4xl font-black text-blue-900 dark:text-blue-100">{stats.totalRecords}</p>
                                    </div>
                                    <div className="bg-green-50 dark:bg-green-900/20 rounded-3xl p-6 border border-green-100 dark:border-green-900/30 text-center">
                                        <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-widest mb-1">Imported</p>
                                        <p className="text-4xl font-black text-green-900 dark:text-green-100">{stats.transformed}</p>
                                    </div>
                                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-3xl p-6 border border-orange-100 dark:border-orange-900/30 text-center">
                                        <p className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-1">Issues/Skip</p>
                                        <p className="text-4xl font-black text-orange-900 dark:text-orange-100">{stats.skipped}</p>
                                    </div>
                                </div>

                                {stats.errors.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Migration Logs</h3>
                                        <div className="bg-gray-50 dark:bg-black rounded-[2rem] border border-gray-100 dark:border-gray-800 p-8 max-h-[400px] overflow-y-auto custom-scrollbar">
                                            <ul className="space-y-2">
                                                {stats.errors.map((err, idx) => (
                                                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                                                        <span className="text-rose-500 font-bold shrink-0">•</span>
                                                        {err}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {!stats.errors.length && (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mb-4">
                                            <FiCheckCircle size={40} />
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white">Perfect Import!</h3>
                                        <p className="text-gray-500 font-medium">All records were successfully migrated without any conflicts.</p>
                                        <button 
                                            onClick={() => window.location.reload()}
                                            className="mt-8 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold hover:scale-105 transition-transform"
                                        >
                                            Start New Migration
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto py-12">
                    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-12 border border-gray-100 dark:border-gray-800 text-center shadow-xl shadow-gray-200/50 dark:shadow-none">
                        <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse">
                            <FiDownload size={48} />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Export System Assets</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-12 max-w-lg mx-auto">
                            Download a compressed ZIP archive containing all uploaded profile pictures, 
                            medical records, and other system assets. This is useful for backups or 
                            migrating to another server.
                        </p>

                        <button
                            onClick={handleExportAssets}
                            className="flex items-center gap-3 px-12 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-200 dark:shadow-none"
                        >
                            <FiDownload size={24} />
                            Download Assets ZIP
                        </button>

                        <div className="mt-12 p-6 rounded-2xl bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/20 text-left">
                            <h4 className="font-bold text-yellow-800 dark:text-yellow-500 mb-2 flex items-center gap-2">
                                <FiAlertCircle />
                                Note for Migration
                            </h4>
                            <p className="text-sm text-yellow-700 dark:text-yellow-600/80">
                                This export includes all files in the uploads directory. When migrating, ensure you extract these files into the same directory on the target server so that database references remain valid.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
