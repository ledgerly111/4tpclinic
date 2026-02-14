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
    X,
    LogOut,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../context/StoreContext';

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
    const { theme } = useStore();
    const isDark = theme === 'dark';

    return (
        <>
            {/* Desktop Sidebar - Always visible on lg+ */}
            <aside className={cn(
                "fixed left-0 top-0 z-50 hidden lg:flex h-screen w-20 flex-col border-r transition-colors duration-300",
                isDark
                    ? "border-[#1f1f1f] bg-[#0f0f0f]"
                    : "border-gray-200 bg-white"
            )}>
                {/* Logo Section */}
                <div className="flex h-20 items-center justify-center">
                    <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl text-emerald-400 shadow-sm transition-transform hover:scale-105",
                        isDark ? 'bg-[#1f1f1f]' : 'bg-gray-100'
                    )}>
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
                                        : isDark
                                            ? 'text-gray-500 hover:bg-[#1f1f1f] hover:text-gray-200'
                                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                )}
                            >
                                <item.icon className={cn('h-5 w-5 transition-transform duration-300', isActive ? 'scale-100' : 'group-hover:scale-110')} />

                                {/* Tooltip */}
                                <div className={cn(
                                    "absolute left-14 z-50 ml-2 hidden rounded-md px-3 py-1.5 text-xs font-medium shadow-xl opacity-0 transition-opacity duration-200 group-hover:block group-hover:opacity-100 border whitespace-nowrap",
                                    isDark 
                                        ? "bg-[#1f1f1f] text-white border-gray-800" 
                                        : "bg-white text-gray-900 border-gray-200"
                                )}>
                                    {item.label}
                                </div>
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className={cn(
                    "flex flex-col gap-3 p-4 border-t transition-colors duration-300",
                    isDark ? 'border-[#1f1f1f]' : 'border-gray-200'
                )}>
                    {bottomNavItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => cn(
                                'group relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300',
                                isActive
                                    ? isDark ? 'bg-[#1f1f1f] text-white' : 'bg-gray-100 text-gray-900'
                                    : isDark
                                        ? 'text-gray-500 hover:bg-[#1f1f1f] hover:text-gray-200'
                                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                            )}
                        >
                            <item.icon className="h-5 w-5 transition-transform group-hover:rotate-12" />
                            {/* Tooltip - duplicated for bottom items for consistency */}
                            <div className={cn(
                                "absolute left-14 z-50 ml-2 hidden rounded-md px-3 py-1.5 text-xs font-medium shadow-xl opacity-0 transition-opacity duration-200 group-hover:block group-hover:opacity-100 border whitespace-nowrap",
                                isDark 
                                    ? "bg-[#1f1f1f] text-white border-gray-800" 
                                    : "bg-white text-gray-900 border-gray-200"
                            )}>
                                {item.label}
                            </div>
                        </NavLink>
                    ))}

                    {/* User Profile */}
                    <div className={cn(
                        "mt-2 flex h-12 w-12 items-center justify-center rounded-full ring-2 cursor-pointer hover:ring-[#3b82f6] transition-all",
                        isDark ? 'bg-[#1f1f1f] ring-black' : 'bg-gray-100 ring-gray-200'
                    )}>
                        <span className={cn("text-xs font-bold", isDark ? 'text-gray-300' : 'text-gray-600')}>DR</span>
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar Drawer */}
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
                    "absolute left-0 top-0 bottom-0 w-[280px] flex flex-col transition-transform duration-300 ease-out",
                    isOpen ? "translate-x-0" : "-translate-x-full",
                    isDark
                        ? "bg-[#0f0f0f]"
                        : "bg-white"
                )}>
                    {/* Mobile Header with Close */}
                    <div className={cn(
                        "flex items-center justify-between p-4 border-b",
                        isDark ? "border-gray-800" : "border-gray-200"
                    )}>
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "flex h-10 w-10 items-center justify-center rounded-xl text-emerald-400",
                                isDark ? 'bg-[#1f1f1f]' : 'bg-gray-100'
                            )}>
                                <Stethoscope className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className={cn("font-bold", isDark ? "text-white" : "text-gray-900")}>Clinic Pro</h2>
                                <p className={cn("text-xs", isDark ? "text-gray-500" : "text-gray-500")}>Dr. Smith</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className={cn(
                                "p-2 rounded-lg transition-colors",
                                isDark 
                                    ? "text-gray-400 hover:text-white hover:bg-[#1f1f1f]" 
                                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                            )}
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Mobile Navigation */}
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
                                            "flex items-center gap-3 px-3 py-3 rounded-xl transition-colors",
                                            active
                                                ? isDark 
                                                    ? "bg-[#3b82f6] text-white" 
                                                    : "bg-blue-500 text-white"
                                                : isDark
                                                    ? "text-gray-300 hover:bg-[#1f1f1f]"
                                                    : "text-gray-700 hover:bg-gray-100"
                                        )}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span className="font-medium">{item.label}</span>
                                        {active && (
                                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                                        )}
                                    </NavLink>
                                );
                            })}
                        </div>

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
                                            "flex items-center gap-3 px-3 py-3 rounded-xl transition-colors",
                                            active
                                                ? isDark 
                                                    ? "bg-[#1f1f1f] text-white" 
                                                    : "bg-gray-200 text-gray-900"
                                                : isDark
                                                    ? "text-gray-300 hover:bg-[#1f1f1f]"
                                                    : "text-gray-700 hover:bg-gray-100"
                                        )}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span className="font-medium">{item.label}</span>
                                    </NavLink>
                                );
                            })}
                        </div>
                    </nav>

                    {/* Mobile Footer */}
                    <div className={cn(
                        "p-4 border-t",
                        isDark ? "border-gray-800" : "border-gray-200"
                    )}>
                        <button className={cn(
                            "flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-colors",
                            isDark 
                                ? "text-red-400 hover:bg-red-500/10" 
                                : "text-red-500 hover:bg-red-50"
                        )}>
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Sign Out</span>
                        </button>
                    </div>
                </aside>
            </div>
        </>
    );
}
