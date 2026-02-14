import { Search, Building2, Bell, ChevronDown, Menu, X, LogOut, Shield, User } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';
import { cn } from '../lib/utils';

const pageNames = {
  '/': 'Overview',
  '/appointments': 'Appointments',
  '/patients': 'Patients',
  '/services': 'Services',
  '/billing': 'Billing',
  '/inventory': 'Inventory',
  '/reports': 'Reports',
  '/staff': 'Supervision',
  '/settings': 'Settings',
  '/help': 'Help',
  '/super-admin': 'Super Admin',
  '/admin': 'Admin Panel',
};

const roleConfig = {
  super_admin: { color: 'text-purple-400', bgColor: 'bg-purple-500/20', label: 'Super Admin' },
  admin: { color: 'text-blue-400', bgColor: 'bg-blue-500/20', label: 'Admin' },
  staff: { color: 'text-emerald-400', bgColor: 'bg-emerald-500/20', label: 'Staff' },
};

export function Header({ onMenuClick }) {
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const { session, logout } = useAuth();
  const {
    selectedOrganization,
    selectedClinic,
    selectClinic,
    getClinicsBySelectedOrg,
    organizations
  } = useTenant();

  const isDark = true;
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications] = useState(3);
  const locationRef = useRef(null);
  const userMenuRef = useRef(null);

  const roleStyle = session ? roleConfig[session.role] : null;
  const accessibleClinics = getClinicsBySelectedOrg();

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
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleClinicSelect = (clinicId) => {
    selectClinic(clinicId);
    setShowLocationDropdown(false);
  };

  return (
    <>
      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div className="fixed inset-x-0 top-0 z-50 p-4 lg:hidden border-b bg-[#0f0f0f] border-gray-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileSearch(false)}
              className="p-2 rounded-lg text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
            <input
              type="search"
              placeholder="Search..."
              autoFocus
              className="flex-1 bg-transparent outline-none text-base text-white placeholder-gray-500"
            />
          </div>
        </div>
      )}

      {/* Main Header */}
      <header className="sticky top-0 z-40 border-b px-4 py-3 backdrop-blur-xl transition-colors duration-300 lg:rounded-t-3xl lg:px-5 lg:py-4 bg-black/88 border-white/10">
        {/* Desktop Header */}
        <div className="hidden xl:flex xl:items-center xl:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#1f1f1f] text-gray-300 hover:text-white transition-colors border border-white/5"
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
                <h1 className="text-lg font-semibold sm:text-xl text-slate-100">{subtitle}</h1>
                <span className="rounded-full px-2.5 py-1 text-xs font-medium bg-slate-800/70 text-slate-200 border border-slate-700/50">
                  {todayLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Role Badge */}
            {roleStyle && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${roleStyle.bgColor}`}>
                <Shield className={`w-4 h-4 ${roleStyle.color}`} />
                <span className={`text-sm font-medium ${roleStyle.color}`}>{roleStyle.label}</span>
              </div>
            )}

            {/* Clinic Switcher */}
            {session?.role !== 'super_admin' && accessibleClinics.length > 0 && (
              <div className="relative" ref={locationRef}>
                <button
                  onClick={() => setShowLocationDropdown((prev) => !prev)}
                  className="flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium transition bg-slate-800/70 text-slate-100 border border-slate-700/50 hover:border-slate-500/45 hover:bg-slate-700/25"
                >
                  <Building2 className="w-4 h-4 text-slate-300" />
                  <span>{selectedClinic?.name || 'Select Clinic'}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {showLocationDropdown && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b] p-1 shadow-2xl shadow-black/55">
                    {accessibleClinics.map((clinic) => (
                      <button
                        key={clinic.id}
                        onClick={() => handleClinicSelect(clinic.id)}
                        className={cn(
                          "w-full rounded-xl px-3 py-2.5 text-left text-sm transition flex items-center justify-between",
                          selectedClinic?.id === clinic.id
                            ? "bg-slate-700/50 text-white"
                            : "text-slate-300 hover:bg-slate-700/35 hover:text-white"
                        )}
                      >
                        <span>{clinic.name}</span>
                        {selectedClinic?.id === clinic.id && (
                          <span className="w-2 h-2 rounded-full bg-[#ff7a6b]"></span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Super Admin Org Switcher */}
            {session?.role === 'super_admin' && organizations.length > 0 && (
              <div className="relative" ref={locationRef}>
                <button
                  onClick={() => setShowLocationDropdown((prev) => !prev)}
                  className="flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium transition bg-slate-800/70 text-slate-100 border border-slate-700/50 hover:border-slate-500/45 hover:bg-slate-700/25"
                >
                  <Building2 className="w-4 h-4 text-slate-300" />
                  <span>{selectedOrganization?.name || 'Select Organization'}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {showLocationDropdown && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b] p-1 shadow-2xl shadow-black/55">
                    <div className="px-3 py-2 text-xs text-gray-500 uppercase font-semibold">Organizations</div>
                    {organizations.map((org) => (
                      <button
                        key={org.id}
                        onClick={() => handleClinicSelect(accessibleClinics.find(c => c.organizationId === org.id)?.id)}
                        className={cn(
                          "w-full rounded-xl px-3 py-2.5 text-left text-sm transition",
                          selectedOrganization?.id === org.id
                            ? "bg-slate-700/50 text-white"
                            : "text-slate-300 hover:bg-slate-700/35 hover:text-white"
                        )}
                      >
                        {org.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Organization Display (for non-switchable) */}
            {selectedOrganization && session?.role !== 'super_admin' && (
              <div className="flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium bg-slate-800/50 text-slate-300 border border-slate-700/30">
                <Building2 className="w-4 h-4" />
                <span className="max-w-[150px] truncate">{selectedOrganization.name}</span>
              </div>
            )}

            {/* Notifications */}
            <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-700/60 bg-slate-900/45 text-slate-300 transition hover:border-slate-500 hover:text-white">
              <Bell className="h-4 w-4" />
              {notifications > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#ff7d66] to-[#ffab61] px-1.5 text-[10px] font-semibold text-white">
                  {notifications}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 h-10 px-2 rounded-full hover:bg-slate-800/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff7a6b] to-[#8b5cf6] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {session?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b] shadow-2xl shadow-black/55">
                  <div className="p-3 border-b border-gray-800">
                    <p className="text-white font-medium truncate">{session?.fullName}</p>
                    <p className="text-gray-500 text-sm truncate">{session?.email}</p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => navigate('/settings')}
                      className="w-full rounded-xl px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700/35 hover:text-white transition flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Profile Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full rounded-xl px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Header */}
        <div className="flex xl:hidden items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuClick}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#1f1f1f] text-gray-300 hover:text-white transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white">{section}</h1>
                {roleStyle && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${roleStyle.bgColor} ${roleStyle.color}`}>
                    {roleStyle.label}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">{todayLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile Clinic Indicator */}
            {selectedClinic && (
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800/50 text-slate-300 text-xs">
                <Building2 className="w-3.5 h-3.5" />
                <span className="max-w-[100px] truncate">{selectedClinic.name}</span>
              </div>
            )}

            <button
              onClick={() => setShowMobileSearch(true)}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#1f1f1f] text-gray-400 hover:text-white transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            <button className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#1f1f1f] text-gray-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-br from-[#ff7d66] to-[#ffab61] px-1 text-[10px] font-semibold text-white">
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
