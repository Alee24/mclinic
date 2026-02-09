import Link from 'next/link';

export default function QuickActions() {
    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-[#161616] rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
                <h3 className="font-bold text-lg dark:text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                    <Link href="/dashboard/pharmacy" className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30 hover:scale-105 transition-transform text-center group">
                        <div className="w-10 h-10 mx-auto bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            💊
                        </div>
                        <div className="text-xs font-bold text-blue-800 dark:text-blue-300">Pharmacy</div>
                    </Link>
                    <Link href="/dashboard/lab" className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-900/30 hover:scale-105 transition-transform text-center group">
                        <div className="w-10 h-10 mx-auto bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-2 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            🔬
                        </div>
                        <div className="text-xs font-bold text-purple-800 dark:text-purple-300">Lab Request</div>
                    </Link>
                    {/* Add more quick actions if needed, e.g. "Add Patient" or "New Appointment" */}
                </div>
            </div>
        </div>
    );
}
