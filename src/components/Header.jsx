import { Search, Building2, Bell, ChevronDown, Menu, X, LogOut, Shield, User } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';
import { useStore } from '../context/StoreContext';
import { cn } from '../lib/utils';

const pageNames = {
  '/app': 'Overview',
  '/app/dashboard': 'Dashboard',
  '/app/appointments': 'Appointments',
  '/app/patients': 'Patients',
  '/app/services': 'Services',
  '/app/billing': 'Billing',
  '/app/inventory': 'Inventory',
  '/app/reports': 'Reports',
  '/app/staff': 'Supervision',
  '/app/settings': 'Settings',
  '/app/help': 'Help',
  '/super-admin': 'Admin Panel',
};

const roleConfig = {
  admin: { label: 'Admin', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  staff: { label: 'Staff', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  super_admin: { label: 'System Admin', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' }
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
  const { theme } = useStore();

  const isDark = theme === 'dark';
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
        <div className={cn(
          "fixed inset-x-0 top-0 z-50 p-4 lg:hidden border-b",
          isDark ? "bg-[#0f0f0f] border-gray-800" : "bg-white border-gray-200"
        )}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileSearch(false)}
              className={cn("p-2 rounded-lg", isDark ? "text-gray-400" : "text-gray-600")}
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
        "sticky top-0 z-40 border-b px-4 py-3 backdrop-blur-2xl transition-colors duration-300 lg:rounded-t-3xl lg:px-5 lg:py-4",
        isDark ? "bg-black/88 border-white/10" : "bg-white/80 border-gray-100 shadow-sm"
      )}>
        {/* Desktop Header */}
        <div className="hidden xl:flex xl:items-center xl:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-xl transition-colors border shadow-sm",
                isDark
                  ? "bg-[#1f1f1f] text-gray-300 hover:text-white border-white/5"
                  : "bg-white text-[#512c31] hover:text-[#e8919a] border-gray-100 hover:bg-[#fef9f3]"
              )}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                <span>Dashboard</span>
                <span className="text-slate-600">/</span>
                <span className={isDark ? "text-slate-200" : "text-slate-700"}>{section}</span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <h1 className={cn("text-lg font-semibold sm:text-xl", isDark ? "text-slate-100" : "text-gray-900")}>{subtitle}</h1>
                <span className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-bold border uppercase tracking-wider",
                  isDark
                    ? "bg-slate-800/70 text-slate-200 border-slate-700/50"
                    : "bg-[#fef9f3] text-[#512c31] border-gray-100"
                )}>
                  {todayLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">


            {/* Clinic Switcher */}
            {session?.role !== 'super_admin' && accessibleClinics.length > 0 && (
              <div className="relative" ref={locationRef}>
                <button
                  onClick={() => setShowLocationDropdown((prev) => !prev)}
                  className={cn(
                    "flex h-10 items-center gap-2 rounded-full px-3 text-sm font-bold transition border",
                    isDark
                      ? "bg-slate-800/70 text-slate-100 border-slate-700/50 hover:border-slate-500/45 hover:bg-slate-700/25"
                      : "bg-white text-[#512c31] border-gray-100 hover:bg-[#fef9f3]"
                  )}
                >
                  <Building2 className={cn("w-4 h-4", isDark ? "text-slate-300" : "text-gray-500")} />
                  <span>{selectedClinic?.name || 'Select Clinic'}</span>
                  <ChevronDown className={cn("w-4 h-4", isDark ? "text-slate-400" : "text-gray-400")} />
                </button>

                {showLocationDropdown && (
                  <div className={cn(
                    "absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border p-1 shadow-2xl",
                    isDark
                      ? "border-white/10 bg-[#0b0b0b] shadow-black/55"
                      : "border-gray-200 bg-white shadow-xl"
                  )}>
                    {accessibleClinics.map((clinic) => (
                      <button
                        key={clinic.id}
                        onClick={() => handleClinicSelect(clinic.id)}
                        className={cn(
                          "w-full rounded-xl px-3 py-2.5 text-left text-sm transition flex items-center justify-between",
                          selectedClinic?.id === clinic.id
                            ? isDark ? "bg-slate-700/50 text-white" : "bg-gray-100 text-gray-900"
                            : isDark ? "text-slate-300 hover:bg-slate-700/35 hover:text-white" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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
                  className={cn(
                    "flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium transition border",
                    isDark
                      ? "bg-slate-800/70 text-slate-100 border-slate-700/50 hover:border-slate-500/45 hover:bg-slate-700/25"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                  )}
                >
                  <Building2 className={cn("w-4 h-4", isDark ? "text-slate-300" : "text-gray-500")} />
                  <span>{selectedOrganization?.name || 'Select Organization'}</span>
                  <ChevronDown className={cn("w-4 h-4", isDark ? "text-slate-400" : "text-gray-400")} />
                </button>

                {showLocationDropdown && (
                  <div className={cn(
                    "absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border p-1 shadow-2xl",
                    isDark
                      ? "border-white/10 bg-[#0b0b0b] shadow-black/55"
                      : "border-gray-200 bg-white shadow-xl"
                  )}>
                    <div className="px-3 py-2 text-xs text-gray-500 uppercase font-semibold">Organizations</div>
                    {organizations.map((org) => (
                      <button
                        key={org.id}
                        onClick={() => handleClinicSelect(accessibleClinics.find(c => c.organizationId === org.id)?.id)}
                        className={cn(
                          "w-full rounded-xl px-3 py-2.5 text-left text-sm transition",
                          selectedOrganization?.id === org.id
                            ? isDark ? "bg-slate-700/50 text-white" : "bg-gray-100 text-gray-900"
                            : isDark ? "text-slate-300 hover:bg-slate-700/35 hover:text-white" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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
              <div className={cn(
                "flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium border",
                isDark
                  ? "bg-slate-800/50 text-slate-300 border-slate-700/30"
                  : "bg-gray-100 text-gray-700 border-gray-200"
              )}>
                <Building2 className="w-4 h-4" />
                <span className="max-w-[150px] truncate">{selectedOrganization.name}</span>
              </div>
            )}

            {/* Notifications */}
            <button className={cn(
              "relative flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-200",
              isDark
                ? "border-slate-700/60 bg-slate-900/45 text-slate-300 hover:border-slate-500 hover:text-white"
                : "border-gray-100 bg-white text-[#512c31] hover:bg-[#fef9f3] hover:text-[#e8919a] hover:scale-105"
            )}>
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
                className={cn(
                  "flex items-center gap-2 h-10 px-2 rounded-full transition-all duration-200",
                  isDark ? "hover:bg-slate-800/50" : "hover:bg-[#fef9f3] hover:scale-105"
                )}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff7a6b] to-[#8b5cf6] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {session?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {showUserMenu && (
                <div className={cn(
                  "absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border shadow-2xl",
                  isDark
                    ? "border-white/10 bg-[#0b0b0b] shadow-black/55"
                    : "border-gray-200 bg-white shadow-xl"
                )}>
                  <div className={cn("p-3 border-b", isDark ? "border-gray-800" : "border-gray-100")}>
                    <p className={cn("font-medium truncate", isDark ? "text-white" : "text-gray-900")}>{session?.fullName}</p>
                    <p className="text-gray-500 text-sm truncate">{session?.email}</p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => navigate('/app/settings')}
                      className={cn(
                        "w-full rounded-xl px-3 py-2 text-left text-sm transition flex items-center gap-2",
                        isDark ? "text-slate-300 hover:bg-slate-700/35 hover:text-white" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      )}
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
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-xl transition-colors",
                isDark ? "bg-[#1f1f1f] text-gray-300 hover:text-white" : "bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
              )}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className={cn("text-lg font-bold", isDark ? "text-white" : "text-gray-900")}>{section}</h1>

              </div>
              <p className="text-xs text-gray-500">{todayLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile Clinic Indicator */}
            {selectedClinic && (
              <div className={cn(
                "hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs",
                isDark ? "bg-slate-800/50 text-slate-300" : "bg-gray-100 text-gray-600"
              )}>
                <Building2 className="w-3.5 h-3.5" />
                <span className="max-w-[100px] truncate">{selectedClinic.name}</span>
              </div>
            )}

            <button
              onClick={() => setShowMobileSearch(true)}
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-xl transition-colors",
                isDark ? "bg-[#1f1f1f] text-gray-400 hover:text-white" : "bg-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-200"
              )}
            >
              <Search className="w-5 h-5" />
            </button>

            <button className={cn(
              "relative flex items-center justify-center w-10 h-10 rounded-xl transition-colors",
              isDark ? "bg-[#1f1f1f] text-gray-400 hover:text-white" : "bg-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-200"
            )}>
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
