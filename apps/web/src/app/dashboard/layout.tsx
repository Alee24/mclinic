'use client';

import Link from 'next/link';
import { ReactNode, useEffect, useState } from 'react';
import { FiGrid, FiList, FiCalendar, FiBarChart2, FiUsers, FiSettings, FiHelpCircle, FiLogOut, FiSearch, FiBell, FiMail, FiMap, FiPackage, FiFileText, FiDatabase, FiPlusCircle, FiUser, FiTruck, FiCheckCircle, FiActivity, FiMenu, FiX, FiTrash2, FiMessageSquare, FiBook, FiShield, FiAlertTriangle, FiPhone, FiVideo } from 'react-icons/fi';
import { useAuth, UserRole } from '@/lib/auth';
import UserAvatar from '@/components/dashboard/UserAvatar';
import { ThemeToggle } from '@/components/ThemeToggle';
import SecureLoader from '@/components/SecureLoader';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

import { usePathname, useRouter } from 'next/navigation';
import { useMpesaMiniApp } from '@/providers/MpesaMiniAppProvider';

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const { isMiniApp } = useMpesaMiniApp();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeEmergencies, setActiveEmergencies] = useState<any[]>([]);
    const [showEmergencyModal, setShowEmergencyModal] = useState(false);
    const [lastEmergencyCount, setLastEmergencyCount] = useState(0);
    const [isResolving, setIsResolving] = useState<number | null>(null);

    const [sidebarCounts, setSidebarCounts] = useState({
        newUsers: 0,
        supportRequests: 0,
        dispatchedOrders: 0,
        totalUnread: 0
    });
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);

    const fetchSidebarCounts = async () => {
        try {
            const res = await api.get('/notifications/sidebar');
            if (res && res.ok) {
                const data = await res.json();
                setSidebarCounts(data);
            }
        } catch (e) {
            console.error('Failed to fetch sidebar counts', e);
        }
    };

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            if (res && res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (e) {
            console.error('Failed to fetch notifications', e);
        }
    };

    const handleMarkAsRead = async (id: number) => {
        try {
            const res = await api.patch(`/notifications/${id}/read`, {});
            if (res && res.ok) {
                fetchNotifications();
                fetchSidebarCounts();
            }
        } catch (e) {
            console.error('Failed to mark notification as read', e);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const res = await api.patch('/notifications/read-all', {});
            if (res && res.ok) {
                toast.success('All notifications marked as read.');
                fetchNotifications();
                fetchSidebarCounts();
            }
        } catch (e) {
            console.error('Failed to mark all as read', e);
        }
    };

    const isAdminOrMedic = user && ['admin', 'doctor', 'nurse', 'medic', 'clinician', 'specialist'].includes(user.role.toLowerCase());

    const fetchActiveEmergencies = async () => {
        if (!isAdminOrMedic) return;
        try {
            const res = await api.get('/emergency/active');
            if (res && res.ok) {
                const data = await res.json();
                setActiveEmergencies(data);
                
                // If count of active emergencies increased, play an audio tone and show alert toast!
                if (data.length > lastEmergencyCount) {
                    try {
                        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                        const oscillator = audioContext.createOscillator();
                        const gainNode = audioContext.createGain();
                        
                        oscillator.connect(gainNode);
                        gainNode.connect(audioContext.destination);
                        
                        oscillator.type = 'sawtooth';
                        oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
                        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                        
                        oscillator.start();
                        oscillator.stop(audioContext.currentTime + 0.8);
                    } catch (e) {
                        console.error('Audio alert failed', e);
                    }
                    
                    toast.error('🚨 URGENT: A new patient emergency evacuation alert has been triggered!', {
                        duration: 10000,
                        position: 'top-right'
                    });
                }
                setLastEmergencyCount(data.length);
            }
        } catch (e) {
            console.error('Failed to fetch active emergencies', e);
        }
    };

    useEffect(() => {
        if (isAdminOrMedic) {
            fetchActiveEmergencies();
            const interval = setInterval(fetchActiveEmergencies, 8000); // Poll every 8 seconds
            return () => clearInterval(interval);
        }
    }, [user, lastEmergencyCount]);

    useEffect(() => {
        if (user) {
            fetchSidebarCounts();
            fetchNotifications();
            const interval = setInterval(() => {
                fetchSidebarCounts();
                fetchNotifications();
            }, 10000); // Poll every 10 seconds
            return () => clearInterval(interval);
        }
    }, [user]);

    const handleResolveEmergency = async (id: number) => {
        setIsResolving(id);
        try {
            const res = await api.post(`/emergency/${id}/resolve`, { notes: 'De-escalated by Admin via active badge panel' });
            if (res && res.ok) {
                toast.success('Emergency alert resolved successfully.');
                fetchActiveEmergencies();
            } else {
                toast.error('Failed to resolve alert.');
            }
        } catch (e) {
            toast.error('An error occurred.');
        } finally {
            setIsResolving(null);
        }
    };

    // Close mobile menu on path change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0a0a0a]">
                <SecureLoader />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#F8FAFC] dark:bg-[#0a0a0a] text-gray-800 dark:text-gray-200 font-sans overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && !isMiniApp && (
                <div
                    className="fixed inset-0 bg-black/50 z-[9998] md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            {!isMiniApp && (
                <aside className={`
                    fixed inset-y-0 left-0 z-[9999] w-64 bg-white dark:bg-[#121212] flex flex-col p-6 border-r border-gray-100 dark:border-gray-800 transition-transform duration-300 ease-in-out md:relative md:translate-x-0
                    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                <div className="flex items-center justify-between mb-10 px-2">
                    <Link href="/dashboard">
                        <img
                            src="/logo.png"
                            alt="M-Clinic Kenya"
                            className="h-9 w-auto object-contain"
                        />
                    </Link>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <FiX size={24} />
                    </button>
                </div>

                {/* Menu */}
                <div className="flex-1 space-y-8 overflow-y-auto">
                    <div>
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">Menu</div>
                        <nav className="space-y-1">
                            <NavItem href="/dashboard" icon={<FiGrid />} label="Dashboard" active={pathname === '/dashboard'} />

                            {/* ADMIN & LAB TECH: CLINICAL OPERATIONS */}
                            {/* LAB TECH MENU */}
                            {user.role === UserRole.LAB_TECH && (
                                <div className="mt-4">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Laboratory</div>
                                    <NavItem href="/dashboard/appointments" icon={<FiCalendar />} label="Appointments" active={pathname === '/dashboard/appointments'} />
                                    <NavGroup
                                        label="Lab Management"
                                        icon={<FiActivity />}
                                        active={pathname?.startsWith('/dashboard/lab')}
                                        items={[
                                            { href: '/dashboard/lab/orders', label: 'Lab Orders' },
                                            { href: '/dashboard/lab/tests', label: 'Test Catalog' }
                                        ]}
                                        pathname={pathname}
                                    />
                                </div>
                            )}

                            {/* ADMIN COMPLETE MENU */}
                            {user.role === UserRole.ADMIN && (
                                <>
                                    {/* Management */}
                                    <div className="mt-4">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Management</div>
                                        <NavGroup
                                            label="Users & Staff"
                                            icon={<FiUsers />}
                                            active={['/dashboard/users', '/dashboard/doctors', '/dashboard/patients'].some(p => pathname === p || pathname?.startsWith(p))}
                                            items={[
                                                { href: '/dashboard/users', label: 'All Users' },
                                                { href: '/dashboard/doctors', label: 'Medics' },
                                                { href: '/dashboard/patients', label: 'Patients' },
                                                { href: '/dashboard/admin/doctors/pending', label: 'Approvals' }
                                            ]}
                                            pathname={pathname}
                                            badge={sidebarCounts.newUsers > 0 ? String(sidebarCounts.newUsers) : undefined}
                                        />
                                        <NavGroup
                                            label="Communication"
                                            icon={<FiMessageSquare />}
                                            active={pathname?.startsWith('/dashboard/admin/sms') || pathname?.startsWith('/dashboard/admin/support')}
                                            items={[
                                                { href: '/dashboard/admin/sms', label: 'Broadcast SMS' },
                                                { href: '/dashboard/admin/support', label: 'Support Inbox' }
                                            ]}
                                            pathname={pathname}
                                            badge={sidebarCounts.supportRequests > 0 ? String(sidebarCounts.supportRequests) : undefined}
                                        />
                                    </div>

                                    {/* Clinical Operations */}
                                    <div className="mt-4">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Operations</div>
                                        <NavItem href="/dashboard/appointments" icon={<FiCalendar />} label="All Appointments" active={pathname === '/dashboard/appointments'} />
                                        <NavItem href="/dashboard/map" icon={<FiMap />} label="Live Map" active={pathname === '/dashboard/map'} />
                                        <NavItem href="/dashboard/admin/ambulance-packages" icon={<FiTruck />} label="Ambulance Plans" active={pathname === '/dashboard/admin/ambulance-packages'} />
                                    </div>

                                    {/* Services */}
                                    <div className="mt-4">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Services</div>
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
                                        <NavItem href="/dashboard/services" icon={<FiList />} label="Service Catalog" active={pathname === '/dashboard/services'} />
                                    </div>

                                    {/* Finance */}
                                    <div className="mt-4">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Finance</div>
                                        <NavGroup
                                            label="Finance & Billing"
                                            icon={<FiBarChart2 />}
                                            active={pathname?.startsWith('/dashboard/finance') || pathname?.startsWith('/dashboard/invoices')}
                                            items={[
                                                { href: '/dashboard/finance/transactions', label: 'Overview & Wallet' },
                                                { href: '/dashboard/invoices', label: 'Invoices' },
                                                { href: '/dashboard/admin/settings/fees', label: 'Fees & Commissions' },
                                                { href: '/dashboard/admin/settings/payments', label: 'Payment Gateways' },
                                                { href: '/dashboard/admin/settings/mpesa', label: 'M-Pesa Config' }
                                            ]}
                                            pathname={pathname}
                                        />
                                    </div>

                                    {/* System */}
                                    <div className="mt-4">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">System</div>
                                        <NavItem href="/dashboard/admin/settings/notifications" icon={<FiMail />} label="Email & SMS Settings" active={pathname?.startsWith('/dashboard/admin/settings/notifications')} />
                                        <NavItem href="/dashboard/finance/settings" icon={<FiSettings />} label="General Settings" active={pathname === '/dashboard/finance/settings'} />
                                        <NavItem href="/dashboard/migration" icon={<FiDatabase />} label="Data Migration" active={pathname === '/dashboard/migration'} />
                                    </div>
                                </>
                            )}

                            {/* PROVIDER MENU (Doctor, Nurse, Clinician, Medic) */}
                            {(user.role === UserRole.DOCTOR || user.role === UserRole.NURSE || user.role === UserRole.CLINICIAN || user.role === UserRole.MEDIC) && (
                                <>
                                    <div className="mt-4">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Clinical Care</div>
                                        <NavItem href="/dashboard/services-hub" icon={<FiGrid />} label="Services Hub" active={pathname === '/dashboard/services-hub'} />
                                        <NavItem href="/dashboard/records" icon={<FiPlusCircle />} label="My Medical Records" active={pathname === '/dashboard/records'} />
                                        <NavItem href="/dashboard/map" icon={<FiMap />} label="Live Map" active={pathname === '/dashboard/map'} />
                                        <NavItem href="/dashboard/appointments" icon={<FiCalendar />} label="Practice Appointments" active={pathname === '/dashboard/appointments'} />
                                        <NavItem href="/dashboard/meetings" icon={<FiVideo />} label="Virtual Consultations" active={pathname?.startsWith('/dashboard/meetings')} />
                                        <NavItem href="/dashboard/patients" icon={<FiList />} label="My Patients" active={pathname === '/dashboard/patients'} />
                                        <NavItem href="/dashboard/ambulance" icon={<FiTruck />} label="Ambulance Service" active={pathname?.startsWith('/dashboard/ambulance')} />
                                    </div>
                                    <div className="mt-4">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">Personal</div>
                                        <NavItem href="/dashboard/finance/transactions" icon={<FiBarChart2 />} label="Wallet & Earnings" active={pathname === '/dashboard/finance/transactions'} />
                                        <NavItem href="/dashboard/profile" icon={<FiUser />} label="My Profile" active={pathname === '/dashboard/profile'} />
                                        <NavItem href="/dashboard/doctors/guide" icon={<FiBook />} label="Guide & Help" active={pathname === '/dashboard/doctors/guide'} />
                                    </div>
                                </>
                            )}

                            {/* PATIENT MENU */}
                            {user.role === UserRole.PATIENT && (
                                <>
                                    <div className="mt-4">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-2">My Care</div>
                                        <NavItem href="/dashboard/services-hub" icon={<FiGrid />} label="Services Hub" active={pathname === '/dashboard/services-hub'} />
                                        <NavItem href="/dashboard/map" icon={<FiMap />} label="Live Map" active={pathname === '/dashboard/map'} />
                                        <NavItem href="/dashboard/appointments" icon={<FiCalendar />} label="Appointments" active={pathname === '/dashboard/appointments'} />
                                        <NavItem href="/dashboard/meetings" icon={<FiVideo />} label="Virtual Consultations" active={pathname?.startsWith('/dashboard/meetings')} />
                                        <NavItem href="/dashboard/records" icon={<FiPlusCircle />} label="Medical Records" active={pathname === '/dashboard/records'} />
                                        <NavItem href="/dashboard/pharmacy" icon={<FiPackage />} label="My Pharmacy" active={pathname === '/dashboard/pharmacy'} badge={sidebarCounts.dispatchedOrders > 0 ? String(sidebarCounts.dispatchedOrders) : undefined} />
                                        <NavItem href="/dashboard/lab" icon={<FiActivity />} label="My Laboratory" active={pathname?.startsWith('/dashboard/lab')} />
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
                            <NavItem href="/verify" icon={<FiCheckCircle />} label="Verify Credentials" active={pathname === '/verify'} />
                            <NavItem href="/terms-and-conditions" icon={<FiFileText />} label="Terms & Conditions" active={pathname === '/terms-and-conditions'} />
                            <NavItem href="/privacy" icon={<FiShield />} label="Privacy Policy" active={pathname === '/privacy'} />
                            <NavItem href="/delete-my-data" icon={<FiTrash2 />} label="Delete My Data" active={pathname === '/delete-my-data'} />
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




            </aside >
            )}

            {/* Main Content */}
            < main className="flex-1 flex flex-col overflow-hidden relative w-full" >
                {/* Header */}
                {!isMiniApp && (
                < header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-8 bg-white/50 dark:bg-black/50 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 md:border-none shrink-0 z-30" >
                    {/* Search */}
                    <div className="flex items-center flex-1 gap-4">
                        {/* Mobile Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <FiMenu size={24} />
                        </button>

                        < div className="hidden md:flex items-center bg-white dark:bg-[#161616] rounded-full px-4 py-2.5 w-full max-w-md shadow-sm border border-gray-100 dark:border-gray-800" >
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
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 md:gap-6">
                        <ThemeToggle />
                        <div className="flex items-center gap-2 md:gap-4">
                            <button className="hidden md:flex w-10 h-10 bg-white dark:bg-[#161616] rounded-full items-center justify-center text-gray-500 hover:text-gray-900 transition-colors shadow-sm text-lg">
                                <FiMail />
                            </button>
                            <div className="relative">
                                <button 
                                    onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
                                    className="w-10 h-10 bg-white dark:bg-[#161616] rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors shadow-sm text-lg relative"
                                >
                                    <FiBell />
                                    {sidebarCounts.totalUnread > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse border-2 border-white dark:border-[#121212]">
                                            {sidebarCounts.totalUnread}
                                        </span>
                                    )}
                                </button>

                                {isNotificationDropdownOpen && (
                                    <>
                                        <div 
                                            className="fixed inset-0 z-40" 
                                            onClick={() => setIsNotificationDropdownOpen(false)}
                                        />
                                        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white dark:bg-[#121212] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-4 z-50 transform origin-top-right animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="flex items-center justify-between pb-3 border-b border-gray-50 dark:border-gray-800 mb-3">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-black text-sm">Notifications</h4>
                                                    {sidebarCounts.totalUnread > 0 && (
                                                        <span className="bg-red-100 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                                                            {sidebarCounts.totalUnread} new
                                                        </span>
                                                    )}
                                                </div>
                                                {sidebarCounts.totalUnread > 0 && (
                                                    <button 
                                                        onClick={handleMarkAllAsRead}
                                                        className="text-xs text-blue-600 hover:underline font-bold"
                                                    >
                                                        Mark all as read
                                                    </button>
                                                )}
                                            </div>

                                            <div className="max-h-[320px] overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                                                {notifications.length === 0 ? (
                                                    <div className="py-8 text-center text-gray-400 dark:text-gray-500 text-xs italic">
                                                        No notifications yet
                                                    </div>
                                                ) : (
                                                    notifications.map((notif) => (
                                                        <div 
                                                            key={notif.id}
                                                            onClick={() => {
                                                                if (!notif.isRead) handleMarkAsRead(notif.id);
                                                            }}
                                                            className={`p-3 rounded-2xl border transition-all text-left cursor-pointer ${
                                                                notif.isRead 
                                                                    ? 'bg-transparent border-transparent opacity-60' 
                                                                    : 'bg-blue-50/30 dark:bg-blue-950/5 border-blue-50/20 dark:border-blue-950/10 hover:bg-blue-50/50 dark:hover:bg-blue-950/10'
                                                            }`}
                                                        >
                                                            <div className="flex items-start justify-between gap-2">
                                                                <h5 className="font-bold text-xs text-gray-900 dark:text-white">
                                                                    {notif.title}
                                                                </h5>
                                                                {!notif.isRead && (
                                                                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full shrink-0 mt-1" />
                                                                )}
                                                            </div>
                                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                                                {notif.message}
                                                            </p>
                                                            <span className="text-[9px] text-gray-400 dark:text-gray-500 block mt-2 font-medium">
                                                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        
                        <div className="relative group">
                            <button 
                                className="flex items-center gap-3 pl-6 border-l border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-80 transition-opacity"
                            >
                                <div className="text-right hidden md:block">
                                    <div className="text-sm font-bold text-gray-900 dark:text-white capitalize">{user.fname} {user.lname || user.role}</div>
                                    <div className="text-xs text-gray-500">{user.email}</div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 p-0.5">
                                    <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 border-2 border-transparent overflow-hidden">
                                        <UserAvatar user={user} className="w-full h-full" />
                                    </div>
                                </div>
                            </button>

                            {/* Profile Dropdown */}
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#121212] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 transform origin-top-right">
                                <div className="px-4 py-2 border-b border-gray-50 dark:border-gray-800 md:hidden">
                                    <div className="text-sm font-bold dark:text-white truncate">{user.fname}</div>
                                    <div className="text-xs text-gray-500 truncate">{user.email}</div>
                                </div>
                                <Link href="/dashboard/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <FiUser size={16} /> My Profile
                                </Link>
                                <button 
                                    onClick={logout}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                >
                                    <FiLogOut size={16} /> Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </header >
                )}

                {/* Horizontal Quick Navigation */}
                {!isMiniApp && (
                <div className="bg-white dark:bg-[#0D0D0D] border-b border-gray-100 dark:border-gray-800 px-4 py-2">
                    <div className="flex items-center gap-2 overflow-x-auto">
                        <Link
                            href="/dashboard"
                            className={`px-4 py-2 font-medium text-sm whitespace-nowrap transition-all flex items-center gap-2 ${pathname === '/dashboard' ? 'bg-blue-600 text-white shadow-md rounded-[1px]' : 'rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                        >
                            <FiGrid /> Dashboard
                        </Link>
                        <Link
                            href="/dashboard/appointments"
                            className={`px-4 py-2 font-medium text-sm whitespace-nowrap transition-all flex items-center gap-2 ${pathname?.startsWith('/dashboard/appointments') ? 'bg-blue-600 text-white shadow-md rounded-[1px]' : 'rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                        >
                            <FiCalendar /> Appointments
                        </Link>
                        {user.role === UserRole.ADMIN && (
                            <>
                                <Link
                                    href="/dashboard/patients"
                                    className={`px-4 py-2 font-medium text-sm whitespace-nowrap transition-all flex items-center gap-2 ${pathname === '/dashboard/patients' ? 'bg-blue-600 text-white shadow-md rounded-[1px]' : 'rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                                >
                                    <FiUsers /> Patients
                                </Link>
                                <Link
                                    href="/dashboard/lab/orders"
                                    className={`px-4 py-2 font-medium text-sm whitespace-nowrap transition-all flex items-center gap-2 ${pathname?.startsWith('/dashboard/lab') ? 'bg-blue-600 text-white shadow-md rounded-[1px]' : 'rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                                >
                                    <FiActivity /> Laboratory
                                </Link>
                                <Link
                                    href="/dashboard/admin/pharmacy"
                                    className={`px-4 py-2 font-medium text-sm whitespace-nowrap transition-all flex items-center gap-2 ${pathname?.startsWith('/dashboard/admin/pharmacy') || pathname === '/dashboard/pharmacy' ? 'bg-blue-600 text-white shadow-md rounded-[1px]' : 'rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                                >
                                    <FiPackage /> Pharmacy
                                </Link>
                                <Link
                                    href="/dashboard/finance/transactions"
                                    className={`px-4 py-2 font-medium text-sm whitespace-nowrap transition-all flex items-center gap-2 ${pathname?.startsWith('/dashboard/finance') ? 'bg-blue-600 text-white shadow-md rounded-[1px]' : 'rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                                >
                                    <FiBarChart2 /> Finance
                                </Link>
                                <Link
                                    href="/dashboard/admin/settings/mpesa"
                                    className={`px-4 py-2 font-medium text-sm whitespace-nowrap transition-all flex items-center gap-2 ${pathname === '/dashboard/admin/settings/mpesa' ? 'bg-green-600 text-white shadow-md rounded-[1px]' : 'rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800'}`}
                                >
                                    <FiCheckCircle /> M-Pesa Config
                                </Link>
                            </>
                        )}
                        {(user.role === UserRole.PHARMACIST) && (
                            <Link
                                href="/dashboard/pharmacy"
                                className={`px-4 py-2 font-medium text-sm whitespace-nowrap transition-all flex items-center gap-2 ${pathname === '/dashboard/pharmacy' ? 'bg-blue-600 text-white shadow-md rounded-[1px]' : 'rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                            >
                                <FiPackage /> Pharmacy
                            </Link>
                        )}
                    </div>
                </div>
                )}


                {/* Dashboard Content */}
                < div className={isMiniApp ? "flex-1 overflow-y-auto p-3 pt-2 scroll-smooth" : "flex-1 overflow-y-auto p-4 md:p-8 pt-2 scroll-smooth"} >
                    {children}
                </ div >
            </ main >

            {/* FLOATING ADMIN EMERGENCY DISPATCH NOTIFICATION BADGE */}
            {activeEmergencies.length > 0 && (
                <div className="fixed bottom-8 right-8 z-[99999] flex flex-col items-end gap-3 animate-bounce">
                    <button
                        onClick={() => setShowEmergencyModal(true)}
                        className="flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white font-black px-6 py-4 rounded-full shadow-2xl shadow-red-600/40 border-4 border-red-300 transition-all duration-300 hover:scale-105 active:scale-95 group relative"
                    >
                        <span className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-75"></span>
                        <FiAlertTriangle className="text-xl animate-pulse relative z-10" />
                        <span className="text-xs uppercase tracking-widest relative z-10">{activeEmergencies.length} ACTIVE EMERGENCY</span>
                    </button>
                </div>
            )}

            {/* EMERGENCY DETAIL ALERTS MODAL POPUP */}
            {showEmergencyModal && activeEmergencies.length > 0 && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[999999] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#121212] rounded-[40px] p-8 max-w-2xl w-full border border-red-100 dark:border-red-950/40 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[85vh] flex flex-col">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-150 dark:border-gray-800">
                            <div className="flex items-center gap-3 text-red-600">
                                <FiAlertTriangle className="text-3xl animate-pulse" />
                                <div>
                                    <h3 className="text-2xl font-black">Active Emergencies</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">High-priority evacuation and medical dispatch requests</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowEmergencyModal(false)}
                                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-500 dark:text-gray-400 flex items-center justify-center transition"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
                            {activeEmergencies.map((alert) => (
                                <div
                                    key={alert.id}
                                    className="p-6 rounded-3xl bg-red-50/50 dark:bg-red-950/10 border border-red-100/50 dark:border-red-950/20 flex flex-col gap-4"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[10px] font-black uppercase tracking-wider">
                                                    ID: #{alert.id}
                                                </span>
                                                <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                                                    {new Date(alert.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-gray-900 dark:text-white text-base">
                                                {alert.notes || 'Emergency Evacuation Dispatch Alert'}
                                            </h4>
                                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    📍 Coordinates: <strong>{Number(alert.latitude).toFixed(5)}, {Number(alert.longitude).toFixed(5)}</strong>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 self-end md:self-auto">
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${alert.latitude},${alert.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 font-bold text-xs uppercase tracking-wider rounded-xl transition whitespace-nowrap"
                                            >
                                                View Map
                                            </a>
                                            <button
                                                onClick={() => handleResolveEmergency(alert.id)}
                                                disabled={isResolving === alert.id}
                                                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition whitespace-nowrap disabled:opacity-50"
                                            >
                                                {isResolving === alert.id ? 'Resolving...' : 'Resolve'}
                                            </button>
                                        </div>
                                    </div>

                                    {alert.patient && (
                                        <div className="mt-2 pt-4 border-t border-red-100/40 dark:border-red-950/20 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                            {/* Subscriber block */}
                                            <div className="bg-white/60 dark:bg-[#1A1A1A] p-4 rounded-2xl border border-red-100/20 dark:border-red-900/20 shadow-sm">
                                                <p className="font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-[9px] mb-2">Subscriber Details</p>
                                                <p className="font-extrabold text-sm text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
                                                    <FiUser className="text-red-500" /> {alert.patient.fname} {alert.patient.lname}
                                                </p>
                                                <div className="space-y-1 text-gray-600 dark:text-gray-400">
                                                    <p className="flex items-center gap-2">
                                                        <FiPhone className="text-gray-400 dark:text-gray-500" size={12} />
                                                        Phone: <span className="font-mono text-gray-900 dark:text-white font-bold">{alert.patient.mobile || 'N/A'}</span>
                                                    </p>
                                                    <p className="flex items-center gap-2">
                                                        <FiMail className="text-gray-400 dark:text-gray-500" size={12} />
                                                        Email: <span className="font-mono text-gray-900 dark:text-white font-bold">{alert.patient.email || 'N/A'}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Next of Kin block */}
                                            <div className="bg-white/60 dark:bg-[#1A1A1A] p-4 rounded-2xl border border-red-100/20 dark:border-red-900/20 shadow-sm">
                                                <p className="font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-[9px] mb-2">Emergency Contact</p>
                                                {alert.patient.emergency_contact_name ? (
                                                    <>
                                                        <p className="font-extrabold text-sm text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
                                                            <FiUsers className="text-red-500" /> {alert.patient.emergency_contact_name}
                                                        </p>
                                                        <div className="space-y-1 text-gray-600 dark:text-gray-400">
                                                            <p className="flex items-center gap-2">
                                                                <FiPhone className="text-gray-400 dark:text-gray-500" size={12} />
                                                                Phone: <span className="font-mono text-gray-900 dark:text-white font-bold">{alert.patient.emergency_contact_phone || 'N/A'}</span>
                                                            </p>
                                                            <p className="flex items-center gap-2">
                                                                <FiShield className="text-gray-400 dark:text-gray-500" size={12} />
                                                                Relationship: <span className="text-gray-900 dark:text-white font-bold">{alert.patient.emergency_contact_relation || 'N/A'}</span>
                                                            </p>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="h-full flex items-center justify-center py-4 text-gray-400 dark:text-gray-500 italic text-center">
                                                        No next of kin details configured
                                                    </div>
                                                )}
                                            </div>

                                            {/* Biodata block */}
                                            <div className="bg-white/60 dark:bg-[#1A1A1A] p-4 rounded-2xl border border-red-100/20 dark:border-red-900/20 shadow-sm">
                                                <p className="font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-[9px] mb-2">Medical Biodata</p>
                                                <div className="grid grid-cols-2 gap-2 text-gray-600 dark:text-gray-400 mb-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] uppercase tracking-wider text-gray-400">DOB</span>
                                                        <span className="font-bold text-gray-900 dark:text-white">{alert.patient.dob || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] uppercase tracking-wider text-gray-400">Sex</span>
                                                        <span className="font-bold text-gray-900 dark:text-white">{alert.patient.sex || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] uppercase tracking-wider text-gray-400">Blood</span>
                                                        <span className="font-bold text-red-500 dark:text-red-400">{alert.patient.blood_group || 'N/A'}</span>
                                                    </div>
                                                </div>
                                                <div className="mt-1 pt-1 border-t border-gray-100 dark:border-gray-800">
                                                    <span className="text-[9px] uppercase tracking-wider text-gray-400 block mb-0.5">Allergies</span>
                                                    <span className="font-bold text-gray-900 dark:text-white truncate block" title={alert.patient.allergies}>{alert.patient.allergies || 'None reported'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}

function NavItem({ href, icon, label, active, badge }: { href: string; icon: any; label: string; active?: boolean; badge?: string }) {
    return (
        <Link
            href={href}
            className={`flex items-center justify-between px-3 py-2.5 transition-all group ${active
                ? 'bg-blue-600/10 text-blue-600 font-bold relative rounded-[1px]'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-xl'
                }`}
        >
            <div className="flex items-center gap-3">
                <span className={`text-xl ${active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                    {icon}
                </span>
                <span className="text-sm">{label}</span>
            </div>
            {active && (
                <div className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full"></div>
            )}
            {badge && (
                <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                    {badge}
                </span>
            )}
        </Link>
    );
}

function NavGroup({ label, icon, active, items, pathname, badge }: { label: string; icon: any; active?: boolean; items: { href: string; label: string }[]; pathname: string | null; badge?: string }) {
    return (
        <details className="group/navgroup" open={active}>
            <summary className={`flex items-center justify-between px-3 py-2.5 cursor-pointer transition-all list-none ${active ? 'bg-blue-600/5 text-blue-600 font-bold rounded-[1px]' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-xl'}`}>
                <div className="flex items-center gap-3">
                    <span className="text-xl">{icon}</span>
                    <span className="text-sm">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                    {badge && (
                        <span className="bg-[#087c46ff] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                            {badge}
                        </span>
                    )}
                    <div className="transition-transform group-open/navgroup:rotate-180">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>
            </summary>
            <div className="pl-4 mt-1 space-y-1 border-l-2 border-gray-100 dark:border-gray-800 ml-5">
                {items.map((item) => (
                    <NavItem
                        key={item.href}
                        href={item.href}
                        icon={<div className={`w-1.5 h-1.5 rounded-full ${pathname === item.href ? 'bg-blue-600' : 'bg-gray-400'}`} />}
                        label={item.label}
                        active={pathname === item.href}
                    />
                ))}
            </div>
        </details>
    );
}
