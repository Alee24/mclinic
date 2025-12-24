'use client';

import { FiFileText, FiPlus } from 'react-icons/fi';

export default function MedicalRecordsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Medical Records</h1>
                    <p className="text-gray-500 text-sm">View your history, prescriptions and lab results.</p>
                </div>
                <button className="bg-primary text-black font-bold px-4 py-2 rounded-lg hover:opacity-90 transition flex items-center gap-2 text-sm">
                    <FiPlus /> Request Record
                </button>
            </div>

            <div className="bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-gray-800 p-12 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <FiFileText size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Records Found</h3>
                <p className="text-gray-500 max-w-sm mb-6">
                    You don't have any medical records uploaded yet. Records from your appointments will appear here automatically.
                </p>
            </div>
        </div>
    );
}
