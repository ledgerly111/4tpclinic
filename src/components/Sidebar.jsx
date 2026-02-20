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
                "fixed left-0 top-0 z-40 hidden lg:flex h-screen w-[76px] flex-col transition-colors duration-300",
                isDark
                    ? "bg-[#0a0a0a] border-r border-white/[0.06]"
                    : "bg-white border-r border-gray-100 shadow-sm"
            )}>
                {/* Top: Logo */}
                <div className="flex items-center justify-center pt-5 pb-4 flex-shrink-0">
                    <div className="relative group">
                        <div className={cn(
                            "w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105",
                            isDark ? "bg-white/5" : "bg-gray-50"
                        )}>
                            <img src="/clinic.svg" alt="4TP Logo" className="w-7 h-7 object-contain" />
                        </div>
                        {/* Glow */}
                        <div className="absolute inset-0 rounded-2xl bg-[#512c31]/10 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                    </div>
                </div>

                {/* Thin accent line below logo */}
                <div className={cn("mx-4 h-px flex-shrink-0", isDark ? "bg-white/[0.06]" : "bg-gray-100")} />

                {/* Scrollable nav area */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin flex flex-col items-center py-3 gap-1 px-3">
                    {navItems.map((item, index) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className="group relative w-full flex-shrink-0 sidebar-icon-enter"
                                style={{ animationDelay: `${index * 40}ms` }}
                            >
                                {/* Active left bar */}
                                {isActive && (
                                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-[#e8919a] shadow-[0_0_8px_rgba(232,145,154,0.7)]" />
                                )}

                                <div className={cn(
                                    "w-full py-3 rounded-2xl flex items-center justify-center transition-all duration-200 relative overflow-hidden",
                                    isActive
                                        ? isDark
                                            ? "bg-[#e8919a]/15 text-[#e8919a]"
                                            : "bg-[#512c31] text-white shadow-lg shadow-[#512c31]/20 scale-105"
                                        : isDark
                                            ? "text-gray-500 hover:text-gray-200 hover:bg-white/[0.06]"
                                            : "text-[#512c31]/60 hover:text-[#512c31] hover:bg-[#fef9f3]"
                                )}>
                                    <item.icon className={cn(
                                        "w-[18px] h-[18px] transition-all duration-200 relative z-10 flex-shrink-0",
                                        isActive ? "drop-shadow-sm" : "group-hover:scale-110"
                                    )} />
                                </div>

                                {/* Tooltip */}
                                <div className={cn(
                                    "absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap z-50 pointer-events-none",
                                    "opacity-0 invisible group-hover:opacity-100 group-hover:visible",
                                    "translate-x-1 group-hover:translate-x-0 transition-all duration-150 ease-out",
                                    isDark
                                        ? "bg-[#1a1a1a] text-white border border-white/10 shadow-xl shadow-black/40"
                                        : "bg-gray-900 text-white shadow-xl"
                                )}>
                                    {item.label}
                                    {/* Arrow */}
                                    <div className={cn(
                                        "absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent",
                                        isDark ? "border-r-[#1a1a1a]" : "border-r-gray-900"
                                    )} />
                                </div>
                            </NavLink>
                        );
                    })}
                </div>

                {/* Bottom: Settings, Help, Logout — pinned, never scrolls */}
                <div className={cn("flex flex-col items-center gap-1 px-3 pb-4 pt-3 flex-shrink-0 border-t", isDark ? "border-white/[0.06]" : "border-gray-100")}>
                    {bottomNavItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className="group relative w-full flex-shrink-0"
                            >
                                <div className={cn(
                                    "w-full py-3 rounded-2xl flex items-center justify-center transition-all duration-200",
                                    isActive
                                        ? isDark
                                            ? "bg-white/10 text-white"
                                            : "bg-[#512c31] text-white shadow-lg shadow-[#512c31]/20 scale-105"
                                        : isDark
                                            ? "text-gray-500 hover:text-gray-200 hover:bg-white/[0.06]"
                                            : "text-[#512c31]/60 hover:text-[#512c31] hover:bg-[#fef9f3]"
                                )}>
                                    <item.icon className="w-[18px] h-[18px] transition-all duration-200 group-hover:scale-110" />
                                </div>
                                {/* Tooltip */}
                                <div className={cn(
                                    "absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap z-50 pointer-events-none",
                                    "opacity-0 invisible group-hover:opacity-100 group-hover:visible",
                                    "translate-x-1 group-hover:translate-x-0 transition-all duration-150 ease-out",
                                    isDark
                                        ? "bg-[#1a1a1a] text-white border border-white/10 shadow-xl shadow-black/40"
                                        : "bg-gray-900 text-white shadow-xl"
                                )}>
                                    {item.label}
                                    <div className={cn(
                                        "absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent",
                                        isDark ? "border-r-[#1a1a1a]" : "border-r-gray-900"
                                    )} />
                                </div>
                            </NavLink>
                        );
                    })}

                    {/* Logout */}
                    <button onClick={logout} className="group relative w-full flex-shrink-0">
                        <div className={cn(
                            "w-full py-3 rounded-2xl flex items-center justify-center transition-all duration-200",
                            isDark
                                ? "text-gray-500 hover:text-red-400 hover:bg-red-500/10"
                                : "text-[#512c31]/60 hover:text-red-500 hover:bg-red-50"
                        )}>
                            <LogOut className="w-[18px] h-[18px] transition-all duration-200 group-hover:scale-110" />
                        </div>
                        {/* Tooltip */}
                        <div className={cn(
                            "absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap z-50 pointer-events-none",
                            "opacity-0 invisible group-hover:opacity-100 group-hover:visible",
                            "translate-x-1 group-hover:translate-x-0 transition-all duration-150 ease-out",
                            "bg-gray-900 text-red-400 shadow-xl"
                        )}>
                            Logout
                            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                        </div>
                    </button>
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
