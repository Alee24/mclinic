import Link from 'next/link';
import { ReactNode } from 'react';
import { FiGrid, FiList, FiCalendar, FiBarChart2, FiUsers, FiSettings, FiHelpCircle, FiLogOut, FiSearch, FiBell, FiMail } from 'react-icons/fi';

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex h-screen bg-[#F8FAFC] dark:bg-[#0a0a0a] text-gray-800 dark:text-gray-200 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-[#121212] flex flex-col p-6 border-r border-gray-100 dark:border-gray-800">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="w-8 h-8 bg-donezo-dark rounded-full flex items-center justify-center text-white font-bold text-lg">
                        M
                    </div>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">M-Clinic</span>
                </div>

                {/* Menu */}
                <div className="flex-1 space-y-8 overflow-y-auto">
                    <div>
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">Menu</div>
                        <nav className="space-y-1">
                            <NavItem href="/dashboard" icon={<FiGrid />} label="Dashboard" active />
                            <NavItem href="/dashboard/patients" icon={<FiList />} label="Patients" />
                            <NavItem href="/dashboard/appointments" icon={<FiCalendar />} label="Appointments" />
                            <NavItem href="/dashboard/finance/transactions" icon={<FiBarChart2 />} label="Finance" />
                            <NavItem href="/dashboard/doctors" icon={<FiUsers />} label="Doctors" badge="3" />
                        </nav>
                    </div>

                    <div>
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">General</div>
                        <nav className="space-y-1">
                            <NavItem href="/dashboard/finance/settings" icon={<FiSettings />} label="Settings" />
                            <NavItem href="#" icon={<FiHelpCircle />} label="Help" />
                            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-500 hover:text-red-500 transition-colors rounded-xl">
                                <FiLogOut className="w-5 h-5" />
                                <span className="font-medium text-sm">Logout</span>
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Promo Card */}
                <div className="mt-6 bg-[#161616] rounded-2xl p-5 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center mb-3">
                            <FiGrid className="text-white" />
                        </div>
                        <h4 className="font-semibold mb-1 text-sm">Download our Mobile App</h4>
                        <p className="text-xs text-gray-400 mb-3">Get easy in another way</p>
                        <button className="w-full py-2 bg-donezo-dark hover:bg-green-800 text-white rounded-lg text-xs font-medium transition-colors">
                            Download
                        </button>
                    </div>
                    {/* Abstract circles */}
                    <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-green-500/20 rounded-full blur-xl"></div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-20 flex items-center justify-between px-8 bg-transparent">
                    {/* Search */}
                    <div className="flex items-center bg-white dark:bg-[#161616] rounded-full px-4 py-2.5 w-96 shadow-sm border border-gray-100 dark:border-gray-800">
                        <FiSearch className="text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search task"
                            className="bg-transparent border-none focus:ring-0 text-sm ml-3 flex-1 placeholder-gray-400 text-gray-700 dark:text-gray-200"
                        />
                        <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 rounded">
                            ⌘ F
                        </kbd>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4">
                            <button className="w-10 h-10 bg-white dark:bg-[#161616] rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors shadow-sm text-lg">
                                <FiMail />
                            </button>
                            <button className="w-10 h-10 bg-white dark:bg-[#161616] rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors shadow-sm text-lg">
                                <FiBell />
                            </button>
                        </div>
                        <div className="flex items-center gap-3 pl-6 border-l border-gray-200 dark:border-gray-700">
                            <div className="text-right hidden md:block">
                                <div className="text-sm font-bold text-gray-900 dark:text-white">Admin User</div>
                                <div className="text-xs text-gray-500">admin@mclinic.com</div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 p-0.5">
                                <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 border-2 border-transparent overflow-hidden">
                                    <img src="https://ui-avatars.com/api/?name=Admin+User&background=random" alt="Admin" className="w-full h-full object-cover" />
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="flex-1 overflow-auto p-8 pt-2">
                    {children}
                </div>
            </main>
        </div>
    );
}

function NavItem({ href, icon, label, active, badge }: { href: string; icon: any; label: string; active?: boolean; badge?: string }) {
    return (
        <Link
            href={href}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group ${active
                ? 'text-donezo-dark font-bold relative'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
        >
            <div className="flex items-center gap-3">
                <span className={`text-xl ${active ? 'text-donezo-dark' : 'text-gray-400 group-hover:text-gray-600'}`}>
                    {icon}
                </span>
                <span className="text-sm">{label}</span>
            </div>
            {active && (
                <div className="absolute left-0 w-1 h-6 bg-donezo-dark rounded-r-full"></div>
            )}
            {badge && (
                <span className="bg-donezo-dark text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                    {badge}
                </span>
            )}
        </Link>
    );
}
