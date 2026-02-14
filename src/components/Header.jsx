import { Search, Building2, Bell, ChevronDown, Menu } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

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
    const [selectedLocation, setSelectedLocation] = useState('Main Clinic, NY');
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const [notifications] = useState(3);
    const locationRef = useRef(null);

    const locations = ['Main Clinic, NY', 'Downtown Branch', 'Westside Medical'];

    const { section, subtitle } = useMemo(() => {
        const page = pageNames[routerLocation.pathname] || 'Dashboard';
        if (routerLocation.pathname === '/') {
            return {
                section: 'Overview',
                subtitle: 'Live clinic operations and trends',
            };
        }

        return {
            section: page,
            subtitle: `Manage ${page.toLowerCase()} workflows`,
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
        <header className="sticky top-0 z-40 rounded-t-3xl border-b border-white/10 bg-black/88 px-3 py-3 backdrop-blur-xl sm:px-5 sm:py-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-center gap-3">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={onMenuClick}
                        className="flex lg:hidden items-center justify-center w-10 h-10 rounded-xl bg-[#1f1f1f] text-gray-300 hover:text-white"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                            <span>Dashboard</span>
                            <span className="text-slate-600">/</span>
                            <span className="text-slate-200">{section}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <h1 className="text-lg font-semibold text-slate-100 sm:text-xl">{subtitle}</h1>
                            <span className="surface-chip rounded-full px-2.5 py-1 text-xs font-medium text-slate-200">
                                {todayLabel}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <label className="surface-chip flex h-10 min-w-[11rem] items-center gap-2 rounded-full px-3 text-slate-300 sm:min-w-[14rem]">
                        <Search className="h-4 w-4 text-slate-400" />
                        <input
                            type="search"
                            placeholder={`Search ${section.toLowerCase()}...`}
                            className="w-full bg-transparent text-sm placeholder:text-slate-500 focus:outline-none"
                        />
                    </label>

                    <div className="relative" ref={locationRef}>
                        <button
                            onClick={() => setShowLocationDropdown((prev) => !prev)}
                            className="surface-chip flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium text-slate-100 transition hover:border-slate-500/45 hover:bg-slate-700/25"
                        >
                            <Building2 className="h-4 w-4 text-slate-300" />
                            <span className="hidden sm:inline">{selectedLocation}</span>
                            <ChevronDown className="h-4 w-4 text-slate-400" />
                        </button>

                        {showLocationDropdown && (
                            <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b] p-1 shadow-2xl shadow-black/55">
                                {locations.map((locationOption) => (
                                    <button
                                        key={locationOption}
                                        onClick={() => {
                                            setSelectedLocation(locationOption);
                                            setShowLocationDropdown(false);
                                        }}
                                        className="w-full rounded-xl px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-slate-700/35 hover:text-white"
                                    >
                                        {locationOption}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-700/60 bg-slate-900/45 text-slate-300 transition hover:border-slate-500 hover:text-white">
                        <Bell className="h-4 w-4" />
                        {notifications > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#ff7d66] to-[#ffab61] px-1.5 text-[10px] font-semibold text-white">
                                {notifications}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}
