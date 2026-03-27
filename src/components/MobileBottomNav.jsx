import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Calendar,
    CreditCard,
    Package,
    Settings,
    Stethoscope,
    MoreHorizontal,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../context/StoreContext';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { hasPageAccess } from '../lib/permissions';

const mainNavItems = [
    { icon: LayoutDashboard, label: 'Home', path: '/app', pageKey: 'dashboard' },
    { icon: Calendar, label: 'Appointments', path: '/app/appointments', pageKey: 'appointments' },
    { icon: Users, label: 'Patients', path: '/app/patients', pageKey: 'patients' },
    { icon: CreditCard, label: 'Billing', path: '/app/billing', pageKey: 'billing' },
];

const moreNavItems = [
    { icon: Stethoscope, label: 'Services', path: '/app/services', pageKey: 'services' },
    { icon: Package, label: 'Inventory', path: '/app/inventory', pageKey: 'inventory' },
    { icon: LayoutDashboard, label: 'Reports', path: '/app/reports', pageKey: 'reports' },
    { icon: Users, label: 'Supervision', path: '/app/staff', adminOnly: true },
    { icon: Settings, label: 'Settings', path: '/app/settings' },
];

export function MobileBottomNav() {
    const location = useLocation();
    const { theme } = useStore();
    const { session } = useAuth();
    const isDark = theme === 'dark';
    const [showMore, setShowMore] = useState(false);
    const visibleMainNavItems = mainNavItems.filter((item) => !item.pageKey || hasPageAccess(session, item.pageKey));
    const visibleMoreNavItems = moreNavItems.filter((item) => {
        if (item.adminOnly && session?.role !== 'admin') return false;
        return !item.pageKey || hasPageAccess(session, item.pageKey);
    });

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* More Menu Overlay */}
            {showMore && (
                <div
                    className="fixed inset-0 z-40 lg:hidden"
                    onClick={() => setShowMore(false)}
                >
                    <div className={cn(
                        "absolute bottom-20 left-4 right-4 rounded-2xl p-4 shadow-2xl border transition-colors",
                        isDark
                            ? "bg-[#1e1e1e] border-gray-800"
                            : "bg-white border-gray-200"
                    )}>
                        <div className="grid grid-cols-4 gap-4">
                            {visibleMoreNavItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setShowMore(false)}
                                    className={cn(
                                        "flex flex-col items-center gap-1 p-3 rounded-xl transition-colors",
                                        isActive(item.path)
                                            ? "bg-[#ff7a6b] text-white shadow-lg shadow-[#ff7a6b]/20"
                                            : isDark
                                                ? "text-gray-400 hover:bg-[#252525]"
                                                : "text-gray-600 hover:bg-gray-100"
                                    )}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="text-[10px] font-medium">{item.label}</span>
                                </NavLink>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Navigation Bar */}
            <nav className={cn(
                "fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t safe-area-pb transition-colors",
                isDark
                    ? "bg-[#0f0f0f]/95 backdrop-blur-md border-gray-800"
                    : "bg-white/95 backdrop-blur-md border-gray-200"
            )}>
                <div className="flex items-center justify-around px-2 py-2">
                    {visibleMainNavItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors min-w-[64px]",
                                isActive(item.path)
                                    ? "text-[#ff7a6b]"
                                    : isDark
                                        ? "text-gray-500 hover:text-gray-300"
                                        : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            <div className={cn(
                                "p-1.5 rounded-lg transition-colors",
                                isActive(item.path) && (isDark ? "bg-[#ff7a6b]/20" : "bg-[#ff7a6b]/10")
                            )}>
                                <item.icon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </NavLink>
                    ))}

                    {/* More Button */}
                    <button
                        onClick={() => setShowMore(!showMore)}
                        className={cn(
                            "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors min-w-[64px]",
                            showMore
                                ? "text-[#ff7a6b]"
                                : isDark
                                    ? "text-gray-500"
                                    : "text-gray-500"
                        )}
                    >
                        <div className={cn(
                            "p-1.5 rounded-lg transition-colors",
                            showMore && (isDark ? "bg-[#ff7a6b]/20" : "bg-[#ff7a6b]/10")
                        )}>
                            <MoreHorizontal className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-medium">More</span>
                    </button>
                </div>
            </nav>
        </>
    );
}
