import { FiDollarSign, FiCalendar, FiUsers, FiClock } from 'react-icons/fi';
import Link from 'next/link';
import { DashboardStats } from '@/hooks/useMedicDashboard';

interface MedicStatsProps {
    stats: DashboardStats;
    profile: any;
    loading?: boolean;
}

export default function MedicStats({ stats, profile, loading }: MedicStatsProps) {
    if (loading) {
        return <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-32 bg-gray-100 rounded-xl" />;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/dashboard/finance/transactions">
                <MedicStatCard
                    label="Wallet Balance"
                    value={`KES ${stats.earningsAmount.toLocaleString()}`}
                    icon={<FiDollarSign />}
                    color="green"
                />
            </Link>
            <Link href="/dashboard/appointments">
                <MedicStatCard
                    label="Today's Appointments"
                    value={stats.appointmentsToday}
                    icon={<FiCalendar />}
                    color="blue"
                />
            </Link>
            <Link href="/dashboard/patients">
                <MedicStatCard
                    label="My Patients"
                    value={stats.totalPatients || profile?.patients_count || "0"}
                    icon={<FiUsers />}
                    color="purple"
                />
            </Link>
            <Link href="/dashboard/appointments?status=pending_report">
                <MedicStatCard
                    label="Pending Reports"
                    value={stats.pendingReports}
                    icon={<FiClock />}
                    color="orange"
                />
            </Link>
        </div>
    );
}

function MedicStatCard({ label, value, icon, color }: any) {
    const colors: any = {
        green: 'bg-green-50 text-green-600 dark:bg-green-900/20',
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20',
        orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20',
    };
    return (
        <div className="bg-white dark:bg-[#161616] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4 group hover:border-primary/50 transition-all cursor-pointer h-full">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-transform group-hover:scale-110 duration-500 ${colors[color] || 'bg-gray-50'}`}>
                {icon}
            </div>
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white leading-tight">{value}</p>
            </div>
        </div>
    );
}
