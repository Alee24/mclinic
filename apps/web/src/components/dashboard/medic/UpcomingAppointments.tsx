import Link from 'next/link';

interface UpcomingAppointmentsProps {
    appointments: any[];
    loading?: boolean;
    onSelect: (appointment: any) => void;
}

export default function UpcomingAppointments({ appointments, loading, onSelect }: UpcomingAppointmentsProps) {
    if (loading) {
        return <div className="h-64 bg-gray-100 rounded-3xl animate-pulse" />;
    }

    return (
        <div className="lg:col-span-2 bg-white dark:bg-[#161616] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg dark:text-white">Upcoming Appointments</h3>
                <Link href="/dashboard/appointments" className="text-sm font-bold text-donezo-dark hover:underline">View Schedule</Link>
            </div>
            <div className="space-y-4">
                {appointments.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 italic">No appointments found.</div>
                ) : appointments.map((apt) => (
                    <div
                        key={apt.id}
                        onClick={() => onSelect(apt)}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 dark:bg-black/20 border border-gray-100 dark:border-gray-800/50 hover:border-donezo-dark/30 transition-colors group cursor-pointer"
                    >
                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center font-bold text-donezo-dark shadow-sm group-hover:bg-donezo-dark group-hover:text-white transition-colors capitalize">
                            {apt.patient?.fname?.[0] || 'P'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 dark:text-white">{apt.patient?.fname || 'Guest Patient'}</h4>
                            <p className="text-xs text-gray-500 font-medium">
                                {apt.appointment_time} • {new Date(apt.appointment_date).toDateString()}
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                apt.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                    'bg-orange-100 text-orange-700'
                                }`}>
                                {apt.status}
                            </span>
                            <button className="text-[10px] font-bold text-donezo-dark hover:underline">View Details</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
