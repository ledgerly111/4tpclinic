import { Search, Building2, Bell, ChevronDown, Menu, X, Plus } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { cn } from '../lib/utils';

const pageNames = {
    '/': 'Overview',
    '/appointments': 'Appointments',
    '/patients': 'Patients',
    '/services': 'Services',
    '/billing': 'Billing',
    '/inventory': 'Inventory',
    '/reports': 'Reports',
    '/staff': 'Staff',
    '/settings': 'Settings',
    '/help': 'Help',
};

export function Header({ onMenuClick }) {
    const routerLocation = useLocation();
    const { theme } = useStore();
    const isDark = theme === 'dark';
    const [selectedLocation, setSelectedLocation] = useState('Main Clinic, NY');
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [notifications] = useState(3);
    const locationRef = useRef(null);

    const locations = ['Main Clinic, NY', 'Downtown Branch', 'Westside Medical'];

    const { section, subtitle } = useMemo(() => {
        const page = pageNames[routerLocation.pathname] || 'Dashboard';
        if (routerLocation.pathname === '/') {
            return {
                section: 'Overview',
                subtitle: 'Live clinic operations',
            };
        }

        return {
            section: page,
            subtitle: `Manage ${page.toLowerCase()}`,
        };
    }, [routerLocation.pathname]);

    const todayLabel = useMemo(
        () =>
            new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
            }),
        []
    );

    useEffect(() => {
        const onPointerDown = (event) => {
            if (locationRef.current && !locationRef.current.contains(event.target)) {
                setShowLocationDropdown(false);
            }
        };

        document.addEventListener('pointerdown', onPointerDown);
        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, []);

    return (
        <>
            {/* Mobile Search Overlay */}
            {showMobileSearch && (
                <div className={cn(
                    "fixed inset-x-0 top-0 z-50 p-4 lg:hidden border-b",
                    isDark
                        ? "bg-[#0f0f0f] border-gray-800"
                        : "bg-white border-gray-200"
                )}>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowMobileSearch(false)}
                            className={cn(
                                "p-2 rounded-lg",
                                isDark ? "text-gray-400" : "text-gray-500"
                            )}
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <input
                            type="search"
                            placeholder="Search..."
                            autoFocus
                            className={cn(
                                "flex-1 bg-transparent outline-none text-base",
                                isDark ? "text-white placeholder-gray-500" : "text-gray-900 placeholder-gray-400"
                            )}
                        />
                    </div>
                </div>
            )}

            {/* Main Header */}
            <header className={cn(
                "sticky top-0 z-40 border-b px-4 py-3 backdrop-blur-xl transition-colors duration-300",
                "lg:rounded-t-3xl lg:px-5 lg:py-4",
                isDark
                    ? "border-white/10 bg-black/88"
                    : "border-gray-200 bg-white/95"
            )}>
                {/* Desktop Header */}
                <div className="hidden xl:flex xl:items-center xl:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="min-w-0">
                            <div className={cn(
                                "flex items-center gap-2 text-xs uppercase tracking-[0.18em]",
                                isDark ? "text-slate-400" : "text-gray-500"
                            )}>
                                <span>Dashboard</span>
                                <span className={isDark ? "text-slate-600" : "text-gray-300"}>/</span>
                                <span className={isDark ? "text-slate-200" : "text-gray-900"}>{section}</span>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                                <h1 className={cn(
                                    "text-lg font-semibold sm:text-xl",
                                    isDark ? "text-slate-100" : "text-gray-900"
                                )}>{subtitle}</h1>
                                <span className={cn(
                                    "rounded-full px-2.5 py-1 text-xs font-medium",
                                    isDark
                                        ? "bg-slate-800/70 text-slate-200 border border-slate-700/50"
                                        : "bg-gray-100 text-gray-700 border border-gray-200"
                                )}>
                                    {todayLabel}
                                </span>
                                <button
                                    onClick={() => window.location.href = '/invoices/new'}
                                    className="ml-2 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg shadow-[#ff9a8b]/30 hover:shadow-[#ff9a8b]/50 transition-all hover:scale-105 active:scale-95"
                                    style={{ backgroundColor: '#ff9a8b' }}
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <label className={cn(
                            "flex h-10 min-w-[11rem] items-center gap-2 rounded-full px-3 sm:min-w-[14rem] transition-colors",
                            isDark
                                ? "bg-slate-800/70 text-slate-300 border border-slate-700/50"
                                : "bg-gray-100 text-gray-600 border border-gray-200"
                        )}>
                            <Search className={cn("h-4 w-4", isDark ? "text-slate-400" : "text-gray-500")} />
                            <input
                                type="search"
                                placeholder={`Search ${section.toLowerCase()}...`}
                                className={cn(
                                    "w-full bg-transparent text-sm focus:outline-none",
                                    isDark ? "placeholder:text-slate-500" : "placeholder:text-gray-400"
                                )}
                            />
                        </label>

                        <div className="relative" ref={locationRef}>
                            <button
                                onClick={() => setShowLocationDropdown((prev) => !prev)}
                                className={cn(
                                    "flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium transition",
                                    isDark
                                        ? "bg-slate-800/70 text-slate-100 border border-slate-700/50 hover:border-slate-500/45 hover:bg-slate-700/25"
                                        : "bg-gray-100 text-gray-700 border border-gray-200 hover:border-gray-400 hover:bg-gray-200/50"
                                )}
                            >
                                <Building2 className={cn("h-4 w-4", isDark ? "text-slate-300" : "text-gray-500")} />
                                <span className="hidden sm:inline">{selectedLocation}</span>
                                <ChevronDown className={cn("h-4 w-4", isDark ? "text-slate-400" : "text-gray-500")} />
                            </button>

                            {showLocationDropdown && (
                                <div className={cn(
                                    "absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border p-1 shadow-2xl",
                                    isDark
                                        ? "border-white/10 bg-[#0b0b0b] shadow-black/55"
                                        : "border-gray-200 bg-white shadow-gray-200/50"
                                )}>
                                    {locations.map((locationOption) => (
                                        <button
                                            key={locationOption}
                                            onClick={() => {
                                                setSelectedLocation(locationOption);
                                                setShowLocationDropdown(false);
                                            }}
                                            className={cn(
                                                "w-full rounded-xl px-3 py-2 text-left text-sm transition",
                                                isDark
                                                    ? "text-slate-300 hover:bg-slate-700/35 hover:text-white"
                                                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                            )}
                                        >
                                            {locationOption}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button className={cn(
                            "relative flex h-10 w-10 items-center justify-center rounded-full transition",
                            isDark
                                ? "border border-slate-700/60 bg-slate-900/45 text-slate-300 hover:border-slate-500 hover:text-white"
                                : "border border-gray-300 bg-white text-gray-600 hover:border-gray-400 hover:text-gray-900"
                        )}>
                            <Bell className="h-4 w-4" />
                            {notifications > 0 && (
                                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#ff7d66] to-[#ffab61] px-1.5 text-[10px] font-semibold text-white">
                                    {notifications}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile/Tablet Header */}
                <div className="flex xl:hidden items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={onMenuClick}
                            className={cn(
                                "flex items-center justify-center w-10 h-10 rounded-xl transition-colors",
                                isDark
                                    ? "bg-[#1f1f1f] text-gray-300 hover:text-white"
                                    : "bg-gray-100 text-gray-600 hover:text-gray-900"
                            )}
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div>
                            <h1 className={cn(
                                "text-lg font-bold",
                                isDark ? "text-white" : "text-gray-900"
                            )}>{section}</h1>
                            <p className={cn(
                                "text-xs",
                                isDark ? "text-gray-500" : "text-gray-500"
                            )}>{todayLabel}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Mobile Search Button */}
                        <button
                            onClick={() => setShowMobileSearch(true)}
                            className={cn(
                                "flex items-center justify-center w-10 h-10 rounded-xl transition-colors",
                                isDark
                                    ? "bg-[#1f1f1f] text-gray-400 hover:text-white"
                                    : "bg-gray-100 text-gray-600 hover:text-gray-900"
                            )}
                        >
                            <Search className="w-5 h-5" />
                        </button>

                        {/* Mobile New Invoice Button */}
                        <button
                            onClick={() => window.location.href = '/invoices/new'}
                            className="flex items-center justify-center w-10 h-10 rounded-xl text-white shadow-lg shadow-[#ff9a8b]/30 active:scale-95 transition-all"
                            style={{ backgroundColor: '#ff9a8b' }}
                        >
                            <Plus className="w-5 h-5" />
                        </button>

                        {/* Mobile Notifications */}
                        <button className={cn(
                            "relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                            isDark
                                ? "bg-[#1f1f1f] text-gray-400 hover:text-white"
                                : "bg-gray-100 text-gray-600 hover:text-gray-900"
                        )}>
                            <Bell className="w-5 h-5" />
                            {notifications > 0 && (
                                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-br from-[#ff7d66] to-[#ffab61] px-1 text-[10px] font-semibold text-white">
                                    {notifications}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </header>
        </>
    );
}
