import { Bell, Building2, CalendarClock, ChevronDown, Menu, LogOut, User } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';
import { useStore } from '../context/StoreContext';
import { cn } from '../lib/utils';
import { fetchAppointments } from '../lib/clinicApi';
import { hasPageAccess } from '../lib/permissions';

const pageNames = {
  '/app': 'Overview',
  '/app/dashboard': 'Dashboard',
  '/app/appointments': 'Appointments',
  '/app/attendance': 'Attendance',
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

export function Header({ onMenuClick }) {
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const { session, logout } = useAuth();
  const {
    selectedOrganization,
    selectedClinic,
    selectedClinicId,
    selectClinic,
    getClinicsBySelectedOrg,
    organizations
  } = useTenant();
  const { theme } = useStore();

  const isDark = theme === 'dark';
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const locationRef = useRef(null);
  const userMenuRef = useRef(null);
  const reminderRef = useRef(null);

  const accessibleClinics = getClinicsBySelectedOrg();
  const canSeeAppointments = session ? hasPageAccess(session, 'appointments') : false;

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
      if (reminderRef.current && !reminderRef.current.contains(event.target)) {
        setShowReminders(false);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  useEffect(() => {
    if (!session || session.role === 'super_admin' || !selectedClinicId || !canSeeAppointments) {
      let cancelled = false;
      Promise.resolve().then(() => {
        if (!cancelled) setUpcomingAppointments([]);
      });
      return () => { cancelled = true; };
    }
    let cancelled = false;
    const loadReminders = async () => {
      const today = new Date();
      const end = new Date(today);
      end.setDate(end.getDate() + 4);
      const toDate = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      };
      try {
        const result = await fetchAppointments({ start: toDate(today), end: toDate(end) });
        if (!cancelled) {
          setUpcomingAppointments((result.appointments || []).filter((appointment) => appointment.status !== 'cancelled').slice(0, 8));
        }
      } catch {
        if (!cancelled) setUpcomingAppointments([]);
      }
    };
    loadReminders();
    return () => { cancelled = true; };
  }, [session, selectedClinicId, canSeeAppointments]);

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


            {session?.role !== 'super_admin' && canSeeAppointments && (
              <div className="relative" ref={reminderRef}>
                <button
                  onClick={() => setShowReminders((prev) => !prev)}
                  className={cn(
                    "relative flex h-10 items-center gap-2 rounded-full px-3 text-sm font-bold transition border",
                    isDark
                      ? "bg-slate-800/70 text-slate-100 border-slate-700/50 hover:border-slate-500/45 hover:bg-slate-700/25"
                      : "bg-white text-[#512c31] border-gray-100 hover:bg-[#fef9f3]"
                  )}
                >
                  <Bell className="w-4 h-4" />
                  <span>Reminders</span>
                  {upcomingAppointments.length > 0 && (
                    <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-[#e8919a] px-1.5 py-0.5 text-[10px] font-black text-white">
                      {upcomingAppointments.length}
                    </span>
                  )}
                </button>

                {showReminders && (
                  <div className={cn(
                    "absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border shadow-2xl",
                    isDark ? "border-white/10 bg-[#0b0b0b] shadow-black/55" : "border-gray-200 bg-white shadow-xl"
                  )}>
                    <div className={cn("px-4 py-3 border-b", isDark ? "border-gray-800" : "border-gray-100")}>
                      <p className={cn("text-sm font-black", isDark ? "text-white" : "text-[#512c31]")}>Upcoming appointments</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Next 4 days</p>
                    </div>
                    <div className="max-h-80 overflow-y-auto p-2">
                      {upcomingAppointments.length === 0 ? (
                        <div className="px-3 py-6 text-center text-sm font-bold text-gray-500">No upcoming appointments</div>
                      ) : upcomingAppointments.map((appointment) => (
                        <button
                          key={appointment.id}
                          onClick={() => {
                            setShowReminders(false);
                            navigate('/app/appointments');
                          }}
                          className={cn(
                            "w-full rounded-xl px-3 py-3 text-left transition flex gap-3",
                            isDark ? "text-slate-300 hover:bg-slate-700/35 hover:text-white" : "text-[#512c31] hover:bg-[#fef9f3]"
                          )}
                        >
                          <CalendarClock className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#e8919a]" />
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-black">{appointment.patient}</span>
                            <span className="block truncate text-xs font-bold text-gray-500">
                              {appointment.date} / {appointment.time} / {appointment.type}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

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
            {session?.role !== 'super_admin' && canSeeAppointments && (
              <button
                onClick={() => navigate('/app/appointments')}
                className={cn(
                  "relative flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                  isDark ? "bg-[#1f1f1f] text-gray-300 hover:text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
                title="Appointment reminders"
              >
                <Bell className="h-4 w-4" />
                {upcomingAppointments.length > 0 && (
                  <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-[#e8919a] px-1.5 py-0.5 text-[10px] font-black text-white">
                    {upcomingAppointments.length}
                  </span>
                )}
              </button>
            )}
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
          </div>
        </div>
      </header>
    </>
  );
}
