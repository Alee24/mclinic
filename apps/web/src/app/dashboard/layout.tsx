'use client';

import Link from 'next/link';
import { ReactNode, useEffect } from 'react';
import { FiGrid, FiList, FiCalendar, FiBarChart2, FiUsers, FiSettings, FiHelpCircle, FiLogOut, FiSearch, FiBell, FiMail, FiMap, FiPackage, FiFileText, FiDatabase, FiPlusCircle, FiUser, FiTruck, FiCheckCircle, FiActivity } from 'react-icons/fi';
import { useAuth, UserRole } from '@/lib/auth';
import UserAvatar from '@/components/dashboard/UserAvatar';
import { usePathname, useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-black">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-donezo-dark"></div>
            </div>
        );
    }

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
                            <NavItem href="/dashboard" icon={<FiGrid />} label="Dashboard" active={pathname === '/dashboard'} />

                            {/* ADMIN & LAB TECH: CLINICAL OPERATIONS */}
                            {(user.role === UserRole.ADMIN || user.role === UserRole.LAB_TECH) && (
                                <div className="mt-4">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Clinical Operations</div>
                                    <NavItem href="/dashboard/appointments" icon={<FiCalendar />} label="All Appointments" active={pathname === '/dashboard/appointments'} />

                                    {/* Laboratory Group */}
                                    <NavGroup
                                        label="Laboratory"
                                        icon={<FiActivity />}
                                        active={pathname?.startsWith('/dashboard/lab')}
                                        items={[
                                            { href: '/dashboard/lab/orders', label: 'Lab Orders' },
                                            { href: '/dashboard/lab/tests', label: 'Test Catalog' }
                                        ]}
                                        pathname={pathname}
                                    />

                                    {/* Pharmacy Group (Admin Only) */}
                                    {user.role === UserRole.ADMIN && (
                                        <NavGroup
                                            label="Pharmacy"
                                            icon={<FiPackage />}
                                            active={pathname?.startsWith('/dashboard/admin/pharmacy')}
                                            items={[
                                                { href: '/dashboard/admin/pharmacy', label: 'Inventory' },
                                                { href: '/dashboard/admin/pharmacy/orders', label: 'Orders' }
                                            ]}
                                            pathname={pathname}
                                        />
                                    )}

                                    {user.role === UserRole.ADMIN && (
                                        <>
                                            <NavItem href="/dashboard/services" icon={<FiList />} label="Service Catalog" active={pathname === '/dashboard/services'} />
                                            <NavItem href="/dashboard/admin/ambulance-packages" icon={<FiTruck />} label="Ambulance Plans" active={pathname === '/dashboard/admin/ambulance-packages'} />
                                        </>
                                    )}
                                </div>
                            )}

                            {/* ADMIN: USER MANAGEMENT */}
                            {user.role === UserRole.ADMIN && (
                                <div className="mt-4">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">User Management</div>
                                    <NavGroup
                                        label="Users & Access"
                                        icon={<FiUsers />}
                                        active={['/dashboard/users', '/dashboard/doctors', '/dashboard/patients', '/dashboard/doctors/map', '/dashboard/admin/doctors/pending'].some(p => pathname?.startsWith(p))}
                                        items={[
                                            { href: '/dashboard/users', label: 'All Users' },
                                            { href: '/dashboard/doctors', label: 'Doctors & Staff' },
                                            { href: '/dashboard/patients', label: 'Patients' },
                                            { href: '/dashboard/admin/doctors/pending', label: 'Medic Approvals' },
                                            { href: '/dashboard/doctors/map', label: 'Live Map' }
                                        ]}
                                        pathname={pathname}
                                    />
                                </div>
                            )}

                            {/* ADMIN: FINANCE */}
                            {user.role === UserRole.ADMIN && (
                                <div className="mt-4">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Financials</div>
                                    <NavGroup
                                        label="Finance & Billing"
                                        icon={<FiBarChart2 />}
                                        active={pathname?.startsWith('/dashboard/finance') || pathname?.startsWith('/dashboard/invoices')}
                                        items={[
                                            { href: '/dashboard/finance/transactions', label: 'Overview' },
                                            { href: '/dashboard/invoices', label: 'Invoices' },
                                            { href: '/dashboard/finance/settings', label: 'Settings' },
                                            { href: '/dashboard/admin/settings/notifications', label: 'Notifications' },
                                            { href: '/dashboard/admin/settings/payments', label: 'Payment Gateways' },
                                            { href: '/dashboard/admin/settings/mpesa', label: 'M-Pesa Config' }
                                        ]}
                                        pathname={pathname}
                                    />
                                </div>
                            )}

                            {/* PROVIDER MENU (Doctor, Nurse, Clinician, Medic) */}
                            {(user.role === UserRole.DOCTOR || user.role === UserRole.NURSE || user.role === UserRole.CLINICIAN || user.role === UserRole.MEDIC) && (
                                <>
                                    <div className="mt-4">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Practice</div>
                                        <NavItem href="/dashboard/appointments" icon={<FiCalendar />} label="My Appointments" active={pathname === '/dashboard/appointments'} />
                                        <NavItem href="/dashboard/patients" icon={<FiList />} label="My Patients" active={pathname === '/dashboard/patients'} />
                                        <NavItem href="/dashboard/ambulance" icon={<FiMap />} label="Ambulance Service" active={pathname?.startsWith('/dashboard/ambulance')} />
                                    </div>
                                    <div className="mt-4">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Personal</div>
                                        <NavItem href="/dashboard/finance/transactions" icon={<FiBarChart2 />} label="Wallet & Earnings" active={pathname === '/dashboard/finance/transactions'} />
                                        <NavItem href="/dashboard/profile" icon={<FiUser />} label="My Profile" active={pathname === '/dashboard/profile'} />
                                    </div>
                                </>
                            )}

                            {/* PATIENT MENU */}
                            {user.role === UserRole.PATIENT && (
                                <>
                                    <div className="mt-4">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">My Care</div>
                                        <NavItem href="/dashboard/services-hub" icon={<FiGrid />} label="Services Hub" active={pathname === '/dashboard/services-hub'} />
                                        <NavItem href="/dashboard/appointments" icon={<FiCalendar />} label="Appointments" active={pathname === '/dashboard/appointments'} />
                                        <NavItem href="/dashboard/records" icon={<FiPlusCircle />} label="Medical Records" active={pathname === '/dashboard/records'} />
                                        <NavItem href="/dashboard/pharmacy" icon={<FiPackage />} label="My Pharmacy" active={pathname === '/dashboard/pharmacy'} />
                                        <NavItem href="/dashboard/lab/results" icon={<FiActivity />} label="Lab Results" active={pathname === '/dashboard/lab/results'} />
                                    </div>
                                    <div className="mt-4">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Services & Billing</div>
                                        <NavItem href="/dashboard/ambulance" icon={<FiTruck />} label="Ambulance" active={pathname?.startsWith('/dashboard/ambulance')} />

                                        <NavGroup
                                            label="Finances"
                                            icon={<FiBarChart2 />}
                                            active={pathname?.startsWith('/dashboard/invoices')}
                                            items={[
                                                { href: '/dashboard/invoices', label: 'Invoices' }
                                            ]}
                                            pathname={pathname}
                                        />
                                    </div>
                                    <NavItem href="/dashboard/profile" icon={<FiUser />} label="My Profile" active={pathname === '/dashboard/profile'} />
                                </>
                            )}
                        </nav>
                    </div>

                    <div>
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">General</div>
                        <nav className="space-y-1">
                            {user.role === UserRole.ADMIN && (
                                <>
                                    <NavItem href="/dashboard/migration" icon={<FiDatabase />} label="Data Migration" active={pathname === '/dashboard/migration'} />
                                    <NavItem href="/dashboard/finance/settings" icon={<FiSettings />} label="Settings" active={pathname === '/dashboard/finance/settings'} />
                                </>
                            )}
                            <NavItem href="#" icon={<FiHelpCircle />} label="Help" active={false} />
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-500 hover:text-red-500 transition-colors rounded-xl"
                            >
                                <span className="text-xl text-gray-400 group-hover:text-red-500">
                                    <FiLogOut />
                                </span>
                                <span className="font-medium text-sm">Logout</span>
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Promo Card */}
                <div className="mt-6 bg-[#161616] rounded-2xl p-5 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center mb-3">
                            <FiGrid />
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
            </aside >

            {/* Main Content */}
            < main className="flex-1 flex flex-col overflow-hidden" >
                {/* Header */}
                < header className="h-20 flex items-center justify-between px-8 bg-transparent" >
                    {/* Search */}
                    < div className="flex items-center bg-white dark:bg-[#161616] rounded-full px-4 py-2.5 w-96 shadow-sm border border-gray-100 dark:border-gray-800" >
                        <span className="text-gray-400 text-xl font-bold flex items-center">
                            <FiSearch />
                        </span>
                        <input
                            type="text"
                            placeholder="Search everything..."
                            className="bg-transparent border-none focus:ring-0 text-sm ml-3 flex-1 placeholder-gray-400 text-gray-700 dark:text-gray-200"
                        />
                        <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 rounded">
                            ⌘ F
                        </kbd>
                    </div >

                    {/* Right Actions */}
                    < div className="flex items-center gap-6" >
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
                                <div className="text-sm font-bold text-gray-900 dark:text-white capitalize">{user.fname} {user.lname || user.role}</div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 p-0.5">
                                <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 border-2 border-transparent overflow-hidden">
                                    <UserAvatar user={user} />
                                </div>
                            </div>
                        </div>
                    </div >
                </header >

                {/* Horizontal Quick Navigation */}
                <div className="bg-white dark:bg-[#0D0D0D] border-b border-gray-100 dark:border-gray-800 px-4 py-2">
                    <div className="flex items-center gap-2 overflow-x-auto">
                        <Link
                            href="/dashboard"
                            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all flex items-center gap-2 ${pathname === '/dashboard' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                        >
                            <FiGrid /> Dashboard
                        </Link>
                        <Link
                            href="/dashboard/appointments"
                            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all flex items-center gap-2 ${pathname?.startsWith('/dashboard/appointments') ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                        >
                            <FiCalendar /> Appointments
                        </Link>
                        {user.role === UserRole.ADMIN && (
                            <>
                                <Link
                                    href="/dashboard/patients"
                                    className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all flex items-center gap-2 ${pathname === '/dashboard/patients' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                                >
                                    <FiUsers /> Patients
                                </Link>
                                <Link
                                    href="/dashboard/lab/orders"
                                    className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all flex items-center gap-2 ${pathname?.startsWith('/dashboard/lab') ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                                >
                                    <FiActivity /> Laboratory
                                </Link>
                                <Link
                                    href="/dashboard/admin/pharmacy"
                                    className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all flex items-center gap-2 ${pathname?.startsWith('/dashboard/admin/pharmacy') || pathname === '/dashboard/pharmacy' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                                >
                                    <FiPackage /> Pharmacy
                                </Link>
                                <Link
                                    href="/dashboard/finance/transactions"
                                    className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all flex items-center gap-2 ${pathname?.startsWith('/dashboard/finance') ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                                >
                                    <FiBarChart2 /> Finance
                                </Link>
                                <Link
                                    href="/dashboard/admin/settings/mpesa"
                                    className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all flex items-center gap-2 ${pathname === '/dashboard/admin/settings/mpesa' ? 'bg-green-600 text-white shadow-md' : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800'}`}
                                >
                                    <FiCheckCircle /> M-Pesa Config
                                </Link>
                            </>
                        )}
                        {(user.role === UserRole.PHARMACY) && (
                            <Link
                                href="/dashboard/pharmacy"
                                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all flex items-center gap-2 ${pathname === '/dashboard/pharmacy' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                            >
                                <FiPackage /> Pharmacy
                            </Link>
                        )}
                    </div>
                </div>


                {/* Dashboard Content */}
                < div className="flex-1 overflow-auto p-8 pt-2" >
                    {children}
                </div >
            </main >
        </div >
    );
}

function NavItem({ href, icon, label, active, badge }: { href: string; icon: any; label: string; active?: boolean; badge?: string }) {
    return (
        <Link
            href={href}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group ${active
                ? 'bg-donezo-dark/10 text-donezo-dark font-bold relative'
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

function NavGroup({ label, icon, active, items, pathname }: { label: string; icon: any; active?: boolean; items: { href: string; label: string }[]; pathname: string | null }) {
    return (
        <details className="group/navgroup" open={active}>
            <summary className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all list-none ${active ? 'bg-donezo-dark/5 text-donezo-dark font-bold' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>
                <div className="flex items-center gap-3">
                    <span className="text-xl">{icon}</span>
                    <span className="text-sm">{label}</span>
                </div>
                <div className="transition-transform group-open/navgroup:rotate-180">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </summary>
            <div className="pl-4 mt-1 space-y-1 border-l-2 border-gray-100 dark:border-gray-800 ml-5">
                {items.map((item) => (
                    <NavItem
                        key={item.href}
                        href={item.href}
                        icon={<div className={`w-1.5 h-1.5 rounded-full ${pathname === item.href ? 'bg-donezo-dark' : 'bg-gray-400'}`} />}
                        label={item.label}
                        active={pathname === item.href}
                    />
                ))}
            </div>
        </details>
    );
}
