import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { useTenant } from './TenantContext';
import { fetchInvoices, fetchAccountingSummary } from '../lib/accountingApi';
import { fetchAppointments, fetchInventory } from '../lib/clinicApi';

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

const THEME_KEY = 'clinic-theme';

function toDateKey(dateInput) {
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

function buildWeeklyRevenue(invoices) {
  const today = new Date();
  const days = [];
  const amountByDate = new Map();

  invoices.forEach((invoice) => {
    if (String(invoice.status || '').toLowerCase() === 'void') return;
    const dateKey = toDateKey(invoice.date);
    if (!dateKey) return;
    amountByDate.set(dateKey, (amountByDate.get(dateKey) || 0) + Number(invoice.amount || 0));
  });

  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    days.push({
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      amount: Number((amountByDate.get(dateKey) || 0).toFixed(2)),
    });
  }

  return days;
}

export function StoreProvider({ children }) {
  const { session, isAuthenticated } = useAuth();
  const { selectedClinicId } = useTenant();

  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'dark');
  const [appointments, setAppointments] = useState([]);
  const [weeklyRevenue, setWeeklyRevenue] = useState([]);
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    avgRevenue: 0,
    totalPatients: 0,
    todayPatientCount: 0,
    occupancyRate: 0,
  });

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light-mode');
      document.documentElement.classList.remove('dark-mode');
    } else {
      document.documentElement.classList.add('dark-mode');
      document.documentElement.classList.remove('light-mode');
    }
  }, [theme]);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.add('dark-mode');
    }
  }, []);

  const resetDashboardState = useCallback(() => {
    setAppointments([]);
    setWeeklyRevenue([]);
    setInventoryAlerts([]);
    setStats({
      totalRevenue: 0,
      avgRevenue: 0,
      totalPatients: 0,
      todayPatientCount: 0,
      occupancyRate: 0,
    });
  }, []);

  const refreshDashboard = useCallback(async () => {
    if (!isAuthenticated || !session || (session.role !== 'super_admin' && !selectedClinicId)) {
      resetDashboardState();
      return;
    }

    setDashboardLoading(true);
    try {
      const [invoiceResult, summaryResult, appointmentsResult, inventoryResult] = await Promise.all([
        fetchInvoices(),
        fetchAccountingSummary(),
        fetchAppointments(),
        fetchInventory(),
      ]);

      const invoiceRows = Array.isArray(invoiceResult?.invoices) ? invoiceResult.invoices : [];
      const appointmentRows = Array.isArray(appointmentsResult?.appointments) ? appointmentsResult.appointments : [];
      const inventoryRows = Array.isArray(inventoryResult?.items) ? inventoryResult.items : [];

      const weekly = buildWeeklyRevenue(invoiceRows);
      const totalRevenue = Number(summaryResult?.cashReceived || 0);
      const avgRevenue = weekly.length > 0
        ? Number((weekly.reduce((sum, row) => sum + Number(row.amount || 0), 0) / weekly.length).toFixed(2))
        : 0;

      setWeeklyRevenue(weekly);
      setAppointments(appointmentRows);
      setInventoryAlerts(
        inventoryRows.filter(
          (item) =>
            item.status === 'low' ||
            item.status === 'critical' ||
            item.status === 'expired' ||
            item.status === 'expiring_soon'
        )
      );
      setStats((prev) => ({
        ...prev,
        totalRevenue,
        avgRevenue,
      }));
    } catch {
      // Keep current UI state when refresh fails.
    } finally {
      setDashboardLoading(false);
    }
  }, [isAuthenticated, selectedClinicId, session, resetDashboardState]);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const value = useMemo(() => ({
    theme,
    setTheme,
    toggleTheme,
    appointments,
    weeklyRevenue,
    roomCapacity: [],
    staffMembers: [],
    inventoryAlerts,
    aiInsights: [],
    stats,
    dashboardLoading,
    refreshDashboard,
  }), [
    theme,
    appointments,
    weeklyRevenue,
    inventoryAlerts,
    stats,
    dashboardLoading,
    refreshDashboard,
  ]);

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}
