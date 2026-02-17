import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutGrid,
    Users,
    CalendarClock,
    Receipt,
    Package,
    Settings,
    UserCog,
    Stethoscope,
    BarChart3,
    HelpCircle,
    X,
    LogOut,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';

const navItems = [
    { icon: LayoutGrid, label: 'Dashboard', path: '/app' },
    { icon: CalendarClock, label: 'Appointments', path: '/app/appointments' },
    { icon: Users, label: 'Patients', path: '/app/patients' },
    { icon: Stethoscope, label: 'Services', path: '/app/services' },
    { icon: Receipt, label: 'Billing', path: '/app/billing' },
    { icon: Package, label: 'Inventory', path: '/app/inventory' },
    { icon: BarChart3, label: 'Reports', path: '/app/reports' },
    { icon: UserCog, label: 'Supervision', path: '/app/staff' },
];

const bottomNavItems = [
    { icon: Settings, label: 'Settings', path: '/app/settings' },
    { icon: HelpCircle, label: 'Help', path: '/app/help' },
];

export function Sidebar({ isOpen, onClose }) {
    const location = useLocation();
    const { theme } = useStore();
    const { logout } = useAuth();
    const isDark = theme === 'dark';

    return (
        <>
            {/* Desktop Sidebar - Always visible on lg+ screens */}
            <aside className={cn(
                "fixed left-0 top-0 z-40 hidden lg:flex h-screen w-20 flex-col items-center py-6 transition-all duration-300 sidebar-gradient",
                isDark
                    ? "bg-[#0a0a0a] border-r border-[#1f1f1f]"
                    : "bg-white border-r border-gray-200"
            )}>
                {/* Scrollable Container */}
                <div className="flex-1 w-full overflow-y-auto overflow-x-hidden scrollbar-thin flex flex-col items-center py-6">
                    {/* 4TP Logo */}
                    <div className="mb-8 relative flex-shrink-0">
                        <div className="w-14 h-14 shrink-0 transition-all duration-300 hover:scale-110">
                            <img src="/clinic.svg" alt="4TP Logo" className="w-full h-full object-contain" />
                        </div>
                        {/* Logo glow effect */}
                        <div className="absolute inset-0 rounded-full bg-[#e8919a]/30 blur-xl opacity-0 hover:opacity-100 transition-opacity duration-300 -z-10" />
                    </div>

                    {/* Main Navigation Icons */}
                    <nav className="flex flex-col items-center gap-3 w-full px-3 flex-shrink-0">
                        {navItems.map((item, index) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className="group relative w-full sidebar-icon-enter flex-shrink-0"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className={cn(
                                        "w-full aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 relative overflow-hidden",
                                        isActive
                                            ? "bg-gradient-to-br from-[#ff7a6b] to-[#ff6b5b] text-white shadow-lg shadow-[#ff7a6b]/30"
                                            : isDark
                                                ? "text-gray-500 hover:text-white hover:bg-[#1f1f1f]"
                                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                                    )}>
                                        {/* Hover glow effect */}
                                        {!isActive && (
                                            <div className="absolute inset-0 bg-gradient-to-br from-[#ff7a6b]/0 to-[#ff7a6b]/0 group-hover:from-[#ff7a6b]/10 group-hover:to-transparent transition-all duration-300 rounded-2xl" />
                                        )}
                                        <item.icon className={cn(
                                            "w-5 h-5 transition-all duration-300 relative z-10"
                                        )} />
                                    </div>

                                    {/* Tooltip with animation */}
                                    <div className={cn(
                                        "absolute left-full ml-4 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap z-50 pointer-events-none",
                                        "opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-out",
                                        "translate-x-2 group-hover:translate-x-0 scale-95 group-hover:scale-100",
                                        isDark
                                            ? "bg-[#1f1f1f] text-white border border-gray-800 shadow-2xl"
                                            : "bg-white text-gray-900 border border-gray-200 shadow-xl"
                                    )}>
                                        {item.label}
                                        {/* Arrow */}
                                        <div className={cn(
                                            "absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 rotate-45",
                                            isDark ? "bg-[#1f1f1f] border-l border-b border-gray-800" : "bg-white border-l border-b border-gray-200"
                                        )} />
                                    </div>

                                    {/* Active indicator dot */}
                                    {isActive && (
                                        <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#ff7a6b] shadow-lg shadow-[#ff7a6b]/50" />
                                    )}
                                </NavLink>
                            );
                        })}
                    </nav>

                    {/* Divider */}
                    <div className={cn(
                        "w-10 h-px my-4 flex-shrink-0",
                        isDark ? "bg-gray-800" : "bg-gray-200"
                    )} />

                    {/* Bottom Navigation Icons (Settings, Help, Logout) */}
                    <nav className="flex flex-col items-center gap-3 w-full px-3 flex-shrink-0 pb-4">
                        {bottomNavItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className="group relative w-full flex-shrink-0"
                                >
                                    <div className={cn(
                                        "w-full aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 relative overflow-hidden",
                                        isActive
                                            ? isDark
                                                ? "bg-[#1f1f1f] text-white shadow-lg"
                                                : "bg-gray-200 text-gray-900 shadow-lg"
                                            : isDark
                                                ? "text-gray-500 hover:text-white hover:bg-[#1f1f1f]"
                                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                                    )}>
                                        <item.icon className={cn(
                                            "w-5 h-5 transition-all duration-300",
                                            isActive ? "" : "group-hover:rotate-12"
                                        )} />
                                    </div>

                                    {/* Tooltip */}
                                    <div className={cn(
                                        "absolute left-full ml-4 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap z-50 pointer-events-none",
                                        "opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-out",
                                        "translate-x-2 group-hover:translate-x-0 scale-95 group-hover:scale-100",
                                        isDark
                                            ? "bg-[#1f1f1f] text-white border border-gray-800 shadow-2xl"
                                            : "bg-white text-gray-900 border border-gray-200 shadow-xl"
                                    )}>
                                        {item.label}
                                        <div className={cn(
                                            "absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 rotate-45",
                                            isDark ? "bg-[#1f1f1f] border-l border-b border-gray-800" : "bg-white border-l border-b border-gray-200"
                                        )} />
                                    </div>
                                </NavLink>
                            );
                        })}

                        {/* Logout Button */}
                        <button
                            onClick={logout}
                            className="group relative w-full mt-2 flex-shrink-0"
                        >
                            <div className={cn(
                                "w-full aspect-square rounded-2xl flex items-center justify-center transition-all duration-300",
                                isDark
                                    ? "text-red-400 hover:bg-red-500/10"
                                    : "text-red-500 hover:bg-red-50"
                            )}>
                                <LogOut className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
                            </div>

                            {/* Tooltip */}
                            <div className={cn(
                                "absolute left-full ml-4 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap z-50 pointer-events-none",
                                "opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-out",
                                "translate-x-2 group-hover:translate-x-0 scale-95 group-hover:scale-100",
                                isDark
                                    ? "bg-[#1f1f1f] text-red-400 border border-gray-800 shadow-2xl"
                                    : "bg-white text-red-500 border border-gray-200 shadow-xl"
                            )}>
                                Logout
                                <div className={cn(
                                    "absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 rotate-45",
                                    isDark ? "bg-[#1f1f1f] border-l border-b border-gray-800" : "bg-white border-l border-b border-gray-200"
                                )} />
                            </div>
                        </button>
                    </nav>
                </div>
            </aside>

            {/* Mobile/Tablet Sidebar Drawer */}
            <div className={cn(
                "fixed inset-0 z-50 lg:hidden transition-opacity duration-300",
                isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}>
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Drawer Panel */}
                <aside className={cn(
                    "absolute left-0 top-0 bottom-0 w-[280px] flex flex-col transition-transform duration-300 ease-out shadow-2xl",
                    isOpen ? "translate-x-0" : "-translate-x-full",
                    isDark
                        ? "bg-[#0f0f0f]"
                        : "bg-white"
                )}>
                    {/* Header with Logo and Close */}
                    <div className={cn(
                        "flex h-20 items-center justify-between px-6 border-b",
                        isDark ? "border-[#1f1f1f]" : "border-gray-200"
                    )}>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 shrink-0">
                                <img src="/clinic.svg" alt="4TP Logo" className="w-full h-full object-contain" />
                            </div>
                            <span className={cn(
                                "text-lg font-bold",
                                isDark ? "text-white" : "text-gray-900"
                            )}>
                                4 The People
                            </span>
                        </div>
                        <button
                            onClick={onClose}
                            className={cn(
                                "p-2 rounded-lg transition-colors",
                                isDark ? "hover:bg-[#1f1f1f] text-gray-400" : "hover:bg-gray-100 text-gray-500"
                            )}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Main Navigation */}
                    <nav className="flex-1 overflow-y-auto py-4 px-3">
                        <div className={cn("text-xs font-semibold uppercase tracking-wider mb-3 px-3", isDark ? "text-gray-500" : "text-gray-400")}>
                            Main Menu
                        </div>
                        <div className="space-y-1">
                            {navItems.map((item) => {
                                const active = location.pathname === item.path;
                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={onClose}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                                            active
                                                ? isDark
                                                    ? "bg-gradient-to-r from-[#ff7a6b] to-[#ff6b5b] text-white shadow-lg shadow-[#ff7a6b]/20"
                                                    : "bg-[#ff7a6b] text-white shadow-lg"
                                                : isDark
                                                    ? "text-gray-300 hover:bg-[#1f1f1f]"
                                                    : "text-gray-700 hover:bg-gray-100"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200",
                                            active ? "bg-white/20" : isDark ? "bg-[#1f1f1f]" : "bg-gray-100"
                                        )}>
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium">{item.label}</span>
                                        {active && (
                                            <div className="ml-auto w-2 h-2 rounded-full bg-white animate-pulse" />
                                        )}
                                    </NavLink>
                                );
                            })}
                        </div>

                        {/* System Section with Settings */}
                        <div className={cn("text-xs font-semibold uppercase tracking-wider mt-6 mb-3 px-3", isDark ? "text-gray-500" : "text-gray-400")}>
                            System
                        </div>
                        <div className="space-y-1">
                            {bottomNavItems.map((item) => {
                                const active = location.pathname === item.path;
                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={onClose}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                                            active
                                                ? isDark
                                                    ? "bg-[#1f1f1f] text-white"
                                                    : "bg-gray-200 text-gray-900"
                                                : isDark
                                                    ? "text-gray-300 hover:bg-[#1f1f1f]"
                                                    : "text-gray-700 hover:bg-gray-100"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center",
                                            active
                                                ? isDark ? "bg-[#0f0f0f]" : "bg-white"
                                                : isDark ? "bg-[#1f1f1f]" : "bg-gray-100"
                                        )}>
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium">{item.label}</span>
                                    </NavLink>
                                );
                            })}
                        </div>
                    </nav>

                    {/* Footer with Logout */}
                    <div className={cn(
                        "p-4 border-t",
                        isDark ? "border-[#1f1f1f]" : "border-gray-200"
                    )}>
                        <button
                            onClick={() => {
                                logout();
                                onClose();
                            }}
                            className={cn(
                                "flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-all duration-200",
                                isDark
                                    ? "text-red-400 hover:bg-red-500/10"
                                    : "text-red-500 hover:bg-red-50"
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center",
                                isDark ? "bg-red-500/10" : "bg-red-50"
                            )}>
                                <LogOut className="w-5 h-5" />
                            </div>
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </aside>
            </div>
        </>
    );
}
