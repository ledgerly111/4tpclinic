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

const mainNavItems = [
    { icon: LayoutDashboard, label: 'Home', path: '/' },
    { icon: Calendar, label: 'Appointments', path: '/appointments' },
    { icon: Users, label: 'Patients', path: '/patients' },
    { icon: CreditCard, label: 'Billing', path: '/billing' },
];

const moreNavItems = [
    { icon: Stethoscope, label: 'Services', path: '/services' },
    { icon: Package, label: 'Inventory', path: '/inventory' },
    { icon: LayoutDashboard, label: 'Reports', path: '/reports' },
    { icon: Users, label: 'Staff', path: '/staff' },
    { icon: Settings, label: 'Settings', path: '/settings' },
];

export function MobileBottomNav() {
    const location = useLocation();
    const { theme } = useStore();
    const isDark = theme === 'dark';
    const [showMore, setShowMore] = useState(false);

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
                        "absolute bottom-20 left-4 right-4 rounded-2xl p-4 shadow-2xl border",
                        isDark 
                            ? "bg-[#1e1e1e] border-gray-800" 
                            : "bg-white border-gray-200"
                    )}>
                        <div className="grid grid-cols-4 gap-4">
                            {moreNavItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setShowMore(false)}
                                    className={cn(
                                        "flex flex-col items-center gap-1 p-3 rounded-xl transition-colors",
                                        isActive(item.path)
                                            ? isDark 
                                                ? "bg-[#3b82f6] text-white" 
                                                : "bg-blue-500 text-white"
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
                "fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t safe-area-pb",
                isDark 
                    ? "bg-[#0f0f0f] border-gray-800" 
                    : "bg-white border-gray-200"
            )}>
                <div className="flex items-center justify-around px-2 py-2">
                    {mainNavItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors min-w-[64px]",
                                isActive(item.path)
                                    ? isDark 
                                        ? "text-[#3b82f6]" 
                                        : "text-blue-600"
                                    : isDark
                                        ? "text-gray-500"
                                        : "text-gray-500"
                            )}
                        >
                            <div className={cn(
                                "p-1.5 rounded-lg transition-colors",
                                isActive(item.path) && (isDark ? "bg-[#3b82f6]/20" : "bg-blue-100")
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
                                ? isDark 
                                    ? "text-[#3b82f6]" 
                                    : "text-blue-600"
                                : isDark
                                    ? "text-gray-500"
                                    : "text-gray-500"
                        )}
                    >
                        <div className={cn(
                            "p-1.5 rounded-lg transition-colors",
                            showMore && (isDark ? "bg-[#3b82f6]/20" : "bg-blue-100")
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
