import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Calendar,
    CreditCard,
    Package,
    Settings,
    FileText,
    Stethoscope,
    TrendingUp,
    HelpCircle,
} from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Calendar, label: 'Appointments', path: '/appointments' },
    { icon: Users, label: 'Patients', path: '/patients' },
    { icon: Stethoscope, label: 'Services', path: '/services' },
    { icon: CreditCard, label: 'Billing', path: '/billing' },
    { icon: Package, label: 'Inventory', path: '/inventory' },
    { icon: TrendingUp, label: 'Reports', path: '/reports' },
    { icon: FileText, label: 'Staff', path: '/staff' },
];

const bottomNavItems = [
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: HelpCircle, label: 'Help', path: '/help' },
];

export function Sidebar({ isOpen, onClose }) {
    const location = useLocation();

    return (
        <aside className={cn(
            "fixed left-0 top-0 z-50 flex h-screen w-20 flex-col border-r border-[#1f1f1f] bg-[#0f0f0f] transition-transform duration-300 ease-in-out lg:translate-x-0",
            isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
            {/* Logo Section */}
            <div className="flex h-20 items-center justify-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1f1f1f] text-emerald-400 shadow-sm transition-transform hover:scale-105">
                    <Stethoscope className="h-6 w-6" />
                </div>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 space-y-3 overflow-y-auto px-4 py-6 scrollbar-none">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => cn(
                                'group relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ease-out',
                                isActive
                                    ? 'bg-[#3b82f6] text-white shadow-md shadow-blue-900/20'
                                    : 'text-gray-500 hover:bg-[#1f1f1f] hover:text-gray-200'
                            )}
                        >
                            <item.icon className={cn('h-5 w-5 transition-transform duration-300', isActive ? 'scale-100' : 'group-hover:scale-110')} />

                            {/* Tooltip */}
                            <div className="absolute left-14 z-50 ml-2 hidden rounded-md bg-[#1f1f1f] px-3 py-1.5 text-xs font-medium text-white shadow-xl opacity-0 transition-opacity duration-200 group-hover:block group-hover:opacity-100 border border-gray-800 whitespace-nowrap">
                                {item.label}
                            </div>
                        </NavLink>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="flex flex-col gap-3 border-t border-[#1f1f1f] p-4">
                {bottomNavItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => cn(
                            'group relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300',
                            isActive
                                ? 'bg-[#1f1f1f] text-white'
                                : 'text-gray-500 hover:bg-[#1f1f1f] hover:text-gray-200'
                        )}
                    >
                        <item.icon className="h-5 w-5 transition-transform group-hover:rotate-12" />
                        {/* Tooltip - duplicated for bottom items for consistency */}
                        <div className="absolute left-14 z-50 ml-2 hidden rounded-md bg-[#1f1f1f] px-3 py-1.5 text-xs font-medium text-white shadow-xl opacity-0 transition-opacity duration-200 group-hover:block group-hover:opacity-100 border border-gray-800 whitespace-nowrap">
                            {item.label}
                        </div>
                    </NavLink>
                ))}

                {/* User Profile */}
                <div className="mt-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#1f1f1f] ring-2 ring-black cursor-pointer hover:ring-[#3b82f6] transition-all">
                    <span className="text-xs font-bold text-gray-300">DR</span>
                </div>
            </div>
        </aside>
    );
}
