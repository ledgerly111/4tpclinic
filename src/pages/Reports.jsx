import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Calendar,
  DollarSign,
  TriangleAlert,
  ReceiptText,
  Users,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Stethoscope,
  ArrowUpRight,
  ArrowDownRight,
  Banknote,
  Clock3,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Line,
} from 'recharts';
import { useStore } from '../context/StoreContext';
import { cn } from '../lib/utils';
import { fetchReportsOverview, fetchServices } from '../lib/clinicApi';
import { fetchInvoices, fetchAccountingSummary } from '../lib/accountingApi';

/* ── colour palette ─────────────────────────────────────────── */
const STATUS_COLORS = {
  paid: '#10b981',
  pending: '#f59e0b',
  overdue: '#ef4444',
  void: '#6b7280',
};
const SERVICE_COLORS = ['#ff7a6b', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#14b8a6', '#f97316'];

/* ── helpers ─────────────────────────────────────────────────── */
const fmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
function formatCurrency(v) { return fmt.format(Number(v || 0)); }
function shortCurrency(v) {
  const n = Number(v || 0);
  if (n >= 100000) return `Rs ${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `Rs ${(n / 1000).toFixed(1)}k`;
  return `Rs ${n}`;
}

function monthLabel(iso) {
  if (!iso) return '-';
  const [y, m] = String(iso).split('-');
  if (!y || !m) return iso;
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function fmtDate(d) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d || '-';
  return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function pctChange(cur, prev) {
  if (!prev) return cur > 0 ? 100 : 0;
  return ((cur - prev) / prev) * 100;
}

/* ── custom recharts tooltip ─────────────────────────────────── */
function ChartTooltip({ isDark }) {
  return {
    contentStyle: {
      backgroundColor: isDark ? '#1a1a2e' : '#ffffff',
      border: `1px solid ${isDark ? '#2d2d44' : '#e5e7eb'}`,
      borderRadius: 14,
      boxShadow: isDark
        ? '0 8px 32px rgba(0,0,0,0.5)'
        : '0 8px 32px rgba(0,0,0,0.08)',
      padding: '10px 14px',
    },
    labelStyle: { color: isDark ? '#e2e8f0' : '#111827', fontWeight: 600, marginBottom: 4 },
    itemStyle: { color: isDark ? '#94a3b8' : '#6b7280', fontSize: 13 },
    cursor: { fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' },
  };
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export function Reports() {
  const { theme } = useStore();
  const isDark = theme === 'dark';
  const tip = ChartTooltip({ isDark });

  /* ── state ──────────────────────────────────────────────────── */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [overview, setOverview] = useState({ monthlyRevenue: [], patientCount: 0, lowStockCount: 0, appointmentCount: 0 });
  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState({ cashReceived: 0, pendingAmount: 0, overdueAmount: 0 });
  const [services, setServices] = useState([]);

  /* ── data loading ───────────────────────────────────────────── */
  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [ov, inv, summ, svc] = await Promise.all([
        fetchReportsOverview(),
        fetchInvoices(),
        fetchAccountingSummary(),
        fetchServices(),
      ]);
      setOverview({
        monthlyRevenue: ov.monthlyRevenue || [],
        patientCount: Number(ov.patientCount || 0),
        lowStockCount: Number(ov.lowStockCount || 0),
        appointmentCount: Number(ov.appointmentCount || 0),
      });
      setInvoices(inv.invoices || []);
      setSummary({
        cashReceived: Number(summ.cashReceived || 0),
        pendingAmount: Number(summ.pendingAmount || 0),
        overdueAmount: Number(summ.overdueAmount || 0),
      });
      setServices((svc.services || []).slice());
    } catch (err) {
      setError(err.message || 'Failed to load reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  /* ── computed ────────────────────────────────────────────────── */
  const totalRevenue = useMemo(
    () => overview.monthlyRevenue.reduce((s, r) => s + Number(r.revenue || 0), 0),
    [overview.monthlyRevenue]
  );

  const totalInvoiceValue = useMemo(
    () => invoices.reduce((s, i) => s + Number(i.amount || 0), 0),
    [invoices]
  );

  // Revenue change (compare last two months)
  const revenueChange = useMemo(() => {
    const rev = overview.monthlyRevenue;
    if (rev.length < 2) return 0;
    return pctChange(Number(rev[rev.length - 1]?.revenue || 0), Number(rev[rev.length - 2]?.revenue || 0));
  }, [overview.monthlyRevenue]);

  // Monthly chart data (revenue + invoice count)
  const monthlyChartData = useMemo(() => {
    const revMap = new Map();
    overview.monthlyRevenue.forEach((r) => revMap.set(String(r.month || ''), Number(r.revenue || 0)));
    const invMap = new Map();
    invoices.forEach((i) => {
      const m = String(i.date || '').slice(0, 7);
      if (m) invMap.set(m, (invMap.get(m) || 0) + 1);
    });
    const keys = [...new Set([...revMap.keys(), ...invMap.keys()])].filter(Boolean).sort();
    return keys.map((k) => ({ month: k, label: monthLabel(k), revenue: revMap.get(k) || 0, invoices: invMap.get(k) || 0 }));
  }, [overview.monthlyRevenue, invoices]);

  // Invoice status donut
  const statusDonut = useMemo(() => {
    const c = { paid: 0, pending: 0, overdue: 0, void: 0 };
    invoices.forEach((i) => {
      const s = String(i.status || '').toLowerCase();
      if (s in c) c[s]++;
    });
    return Object.entries(c).filter(([, v]) => v > 0).map(([k, v]) => ({
      name: k[0].toUpperCase() + k.slice(1), value: v, color: STATUS_COLORS[k],
    }));
  }, [invoices]);

  // Top services by revenue from invoices
  const topServices = useMemo(() => {
    const svcMap = new Map();
    invoices.forEach((inv) => {
      (inv.items || []).forEach((item) => {
        const name = item.name || 'Unknown';
        const val = Number(item.price || 0) * Number(item.quantity || 1);
        svcMap.set(name, (svcMap.get(name) || 0) + val);
      });
    });
    return [...svcMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value], i) => ({ name, value, color: SERVICE_COLORS[i % SERVICE_COLORS.length] }));
  }, [invoices]);

  const topServicesTotal = useMemo(() => topServices.reduce((s, t) => s + t.value, 0), [topServices]);

  // Recent invoices
  const recentInvoices = useMemo(() => {
    return [...invoices]
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .slice(0, 10);
  }, [invoices]);

  /* ── KPI cards config ───────────────────────────────────────── */
  const kpis = [
    {
      title: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      gradient: 'from-emerald-500/20 to-emerald-500/5',
      accent: 'text-emerald-500',
      iconBg: isDark ? 'bg-emerald-500/15' : 'bg-emerald-100',
      change: revenueChange,
      sub: 'vs previous month',
    },
    {
      title: 'Cash Received',
      value: formatCurrency(summary.cashReceived),
      icon: Banknote,
      gradient: 'from-sky-500/20 to-sky-500/5',
      accent: 'text-sky-500',
      iconBg: isDark ? 'bg-sky-500/15' : 'bg-sky-100',
      sub: `${invoices.filter((i) => i.status === 'paid').length} paid invoices`,
    },
    {
      title: 'Pending Amount',
      value: formatCurrency(summary.pendingAmount),
      icon: Clock3,
      gradient: 'from-amber-500/20 to-amber-500/5',
      accent: 'text-amber-500',
      iconBg: isDark ? 'bg-amber-500/15' : 'bg-amber-100',
      sub: `${invoices.filter((i) => i.status === 'pending').length} pending invoices`,
    },
    {
      title: 'Overdue',
      value: formatCurrency(summary.overdueAmount),
      icon: TriangleAlert,
      gradient: 'from-red-500/20 to-red-500/5',
      accent: 'text-red-500',
      iconBg: isDark ? 'bg-red-500/15' : 'bg-red-100',
      sub: `${invoices.filter((i) => i.status === 'overdue').length} overdue invoices`,
    },
  ];

  const quickStats = [
    { label: 'Patients', value: overview.patientCount, icon: Users, color: 'text-sky-400' },
    { label: 'Appointments', value: overview.appointmentCount, icon: Calendar, color: 'text-indigo-400' },
    { label: 'Services', value: services.length, icon: Stethoscope, color: 'text-violet-400' },
    { label: 'Total Invoices', value: invoices.length, icon: ReceiptText, color: 'text-pink-400' },
    { label: 'Low Stock Items', value: overview.lowStockCount, icon: TriangleAlert, color: 'text-amber-400' },
  ];

  /* ── skeleton loader ────────────────────────────────────────── */
  const Skeleton = ({ className }) => (
    <div className={cn('animate-pulse rounded-xl', isDark ? 'bg-gray-800' : 'bg-gray-200', className)} />
  );

  /* ═══════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>Reports & Analytics</h1>
          <p className={cn('text-sm mt-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
            Real-time financial and operational insights
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
            loading && 'opacity-50 cursor-not-allowed',
            isDark
              ? 'bg-[#1e1e1e] text-white hover:bg-[#252525] border border-gray-800'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
          )}
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex items-center gap-2">
          <Activity className="w-4 h-4" /> {error}
        </div>
      )}

      {/* ── KPI Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div
            key={kpi.title}
            className={cn(
              'relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 hover:scale-[1.02] group dashboard-reveal',
              isDark ? 'bg-[#1e1e1e] border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200 hover:shadow-lg'
            )}
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            {/* subtle gradient overlay */}
            <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500', kpi.gradient)} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110', kpi.iconBg)}>
                  <kpi.icon className={cn('w-5 h-5', kpi.accent)} />
                </div>
                {kpi.change !== undefined && (
                  <div className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold',
                    kpi.change >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                  )}>
                    {kpi.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(kpi.change).toFixed(1)}%
                  </div>
                )}
              </div>
              <p className={cn('text-sm mb-1', isDark ? 'text-gray-400' : 'text-gray-500')}>{kpi.title}</p>
              {loading ? <Skeleton className="h-8 w-32 mt-1" /> : (
                <p className={cn('text-2xl font-bold tracking-tight', isDark ? 'text-white' : 'text-gray-900')}>{kpi.value}</p>
              )}
              <p className={cn('text-xs mt-2', isDark ? 'text-gray-600' : 'text-gray-400')}>{kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick Stats Strip ──────────────────────────────────── */}
      <div className={cn(
        'rounded-2xl border p-4 flex flex-wrap gap-x-8 gap-y-3',
        isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'
      )}>
        {quickStats.map((s) => (
          <div key={s.label} className="flex items-center gap-2.5 min-w-[140px]">
            <s.icon className={cn('w-4 h-4', s.color)} />
            <div>
              <p className={cn('text-xs', isDark ? 'text-gray-500' : 'text-gray-500')}>{s.label}</p>
              {loading ? <Skeleton className="h-5 w-12 mt-0.5" /> : (
                <p className={cn('text-sm font-bold', isDark ? 'text-white' : 'text-gray-900')}>{s.value.toLocaleString()}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts Row 1: Revenue + Status Donut ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <div className={cn(
          'rounded-2xl p-5 sm:p-6 lg:col-span-2 border dashboard-reveal reveal-delay-4',
          isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'
        )}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className={cn('font-semibold flex items-center gap-2', isDark ? 'text-white' : 'text-gray-900')}>
                <TrendingUp className="w-5 h-5 text-[#ff7a6b]" />
                Revenue Trend
              </h3>
              <p className={cn('text-xs mt-1', isDark ? 'text-gray-500' : 'text-gray-500')}>
                Monthly revenue from invoices
              </p>
            </div>
            {!loading && (
              <div className={cn(
                'text-right px-3 py-1.5 rounded-lg',
                isDark ? 'bg-[#252525]' : 'bg-gray-50'
              )}>
                <p className={cn('text-[10px] uppercase tracking-wider', isDark ? 'text-gray-500' : 'text-gray-400')}>Total</p>
                <p className={cn('text-sm font-bold', isDark ? 'text-white' : 'text-gray-900')}>{formatCurrency(totalRevenue)}</p>
              </div>
            )}
          </div>
          <div className="h-72">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin w-7 h-7 border-2 border-[#ff7a6b] border-t-transparent rounded-full" />
              </div>
            ) : monthlyChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-500">No revenue data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyChartData} margin={{ top: 5, right: 8, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff7a6b" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#ff7a6b" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={isDark ? '#2a2a2a' : '#f1f5f9'} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} stroke={isDark ? '#555' : '#94a3b8'} fontSize={11} dy={8} />
                  <YAxis tickLine={false} axisLine={false} stroke={isDark ? '#555' : '#94a3b8'} fontSize={11} tickFormatter={shortCurrency} width={60} />
                  <Tooltip
                    {...tip}
                    formatter={(v) => [formatCurrency(v), 'Revenue']}
                    labelFormatter={(_, p) => p?.[0]?.payload?.month || '-'}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#ff7a6b"
                    strokeWidth={2.5}
                    fill="url(#revGrad)"
                    dot={{ r: 3, fill: '#ff7a6b', strokeWidth: 0 }}
                    activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Invoice Status Donut */}
        <div className={cn(
          'rounded-2xl p-5 sm:p-6 border flex flex-col dashboard-reveal reveal-delay-5',
          isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'
        )}>
          <div className="mb-4">
            <h3 className={cn('font-semibold flex items-center gap-2', isDark ? 'text-white' : 'text-gray-900')}>
              <PieChartIcon className="w-5 h-5 text-violet-500" />
              Invoice Status
            </h3>
            <p className={cn('text-xs mt-1', isDark ? 'text-gray-500' : 'text-gray-500')}>
              {invoices.length} total invoices
            </p>
          </div>
          <div className="flex-1 min-h-0">
            <div className="h-52">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin w-7 h-7 border-2 border-violet-500 border-t-transparent rounded-full" />
                </div>
              ) : statusDonut.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-gray-500">No invoices</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDonut}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={80}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {statusDonut.map((e) => <Cell key={e.name} fill={e.color} />)}
                    </Pie>
                    <Tooltip {...tip} formatter={(v, n) => [v, n]} />
                    {/* center label */}
                    <text x="50%" y="48%" textAnchor="middle" fill={isDark ? '#fff' : '#111'} fontSize={20} fontWeight="bold">{invoices.length}</text>
                    <text x="50%" y="58%" textAnchor="middle" fill={isDark ? '#666' : '#9ca3af'} fontSize={11}>invoices</text>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          {/* Donut legend */}
          <div className="space-y-2 mt-3 pt-3 border-t border-dashed" style={{ borderColor: isDark ? '#333' : '#e5e7eb' }}>
            {statusDonut.map((e) => (
              <div key={e.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: e.color }} />
                  <span className={cn('text-sm', isDark ? 'text-gray-300' : 'text-gray-700')}>{e.name}</span>
                </div>
                <span className={cn('text-sm font-semibold', isDark ? 'text-white' : 'text-gray-900')}>{e.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Charts Row 2: Invoice Volume + Top Services ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Invoices Composite */}
        <div className={cn(
          'rounded-2xl p-5 sm:p-6 border',
          isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'
        )}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className={cn('font-semibold flex items-center gap-2', isDark ? 'text-white' : 'text-gray-900')}>
                <BarChart3 className="w-5 h-5 text-sky-500" />
                Revenue vs Invoice Volume
              </h3>
              <p className={cn('text-xs mt-1', isDark ? 'text-gray-500' : 'text-gray-500')}>
                Monthly comparison
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#ff7a6b]" /><span className={cn('text-[11px]', isDark ? 'text-gray-500' : 'text-gray-400')}>Revenue</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-500" /><span className={cn('text-[11px]', isDark ? 'text-gray-500' : 'text-gray-400')}>Invoices</span></div>
            </div>
          </div>
          <div className="h-64">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin w-7 h-7 border-2 border-sky-500 border-t-transparent rounded-full" />
              </div>
            ) : monthlyChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-500">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyChartData} margin={{ top: 5, right: 8, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={isDark ? '#2a2a2a' : '#f1f5f9'} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} stroke={isDark ? '#555' : '#94a3b8'} fontSize={11} dy={8} />
                  <YAxis yAxisId="rev" tickLine={false} axisLine={false} stroke={isDark ? '#555' : '#94a3b8'} fontSize={11} tickFormatter={shortCurrency} width={60} />
                  <YAxis yAxisId="inv" orientation="right" tickLine={false} axisLine={false} stroke={isDark ? '#555' : '#94a3b8'} fontSize={11} allowDecimals={false} width={30} />
                  <Tooltip
                    {...tip}
                    formatter={(v, n) => [n === 'revenue' ? formatCurrency(v) : v, n === 'revenue' ? 'Revenue' : 'Invoices']}
                  />
                  <Bar yAxisId="rev" dataKey="revenue" fill="#ff7a6b" radius={[6, 6, 0, 0]} maxBarSize={32} opacity={0.85} />
                  <Line yAxisId="inv" type="monotone" dataKey="invoices" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3, fill: '#3b82f6' }} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Services by Revenue */}
        <div className={cn(
          'rounded-2xl p-5 sm:p-6 border',
          isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'
        )}>
          <div className="mb-5">
            <h3 className={cn('font-semibold flex items-center gap-2', isDark ? 'text-white' : 'text-gray-900')}>
              <Stethoscope className="w-5 h-5 text-emerald-500" />
              Top Services by Revenue
            </h3>
            <p className={cn('text-xs mt-1', isDark ? 'text-gray-500' : 'text-gray-500')}>
              Breakdown from invoice line items
            </p>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : topServices.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-gray-500">No service data from invoices</div>
          ) : (
            <div className="space-y-3.5">
              {topServices.map((svc, idx) => {
                const pct = topServicesTotal > 0 ? (svc.value / topServicesTotal) * 100 : 0;
                return (
                  <div key={svc.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: svc.color }} />
                        <span className={cn('text-sm font-medium truncate max-w-[180px]', isDark ? 'text-gray-200' : 'text-gray-800')}>{svc.name}</span>
                      </div>
                      <span className={cn('text-sm font-bold', isDark ? 'text-white' : 'text-gray-900')}>{formatCurrency(svc.value)}</span>
                    </div>
                    <div className={cn('w-full h-2 rounded-full overflow-hidden', isDark ? 'bg-gray-800' : 'bg-gray-100')}>
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: svc.color,
                          boxShadow: `0 0 8px ${svc.color}40`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Invoices Table ──────────────────────────────── */}
      <div className={cn(
        'rounded-2xl overflow-hidden border',
        isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'
      )}>
        <div className={cn('px-5 sm:px-6 py-4 border-b flex items-center justify-between', isDark ? 'border-gray-800' : 'border-gray-200')}>
          <h3 className={cn('font-semibold flex items-center gap-2', isDark ? 'text-white' : 'text-gray-900')}>
            <ReceiptText className="w-5 h-5 text-[#ff7a6b]" />
            Recent Invoices
          </h3>
          <span className={cn(
            'text-xs px-2.5 py-1 rounded-full font-medium',
            isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'
          )}>
            {invoices.length} total
          </span>
        </div>

        {loading ? (
          <div className="px-6 py-10 flex items-center justify-center">
            <div className="animate-spin w-7 h-7 border-2 border-[#ff7a6b] border-t-transparent rounded-full" />
          </div>
        ) : recentInvoices.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <ReceiptText className={cn('w-10 h-10 mx-auto mb-3', isDark ? 'text-gray-700' : 'text-gray-300')} />
            <p className={cn('text-sm', isDark ? 'text-gray-500' : 'text-gray-400')}>No invoices created yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={cn(isDark ? 'bg-[#151515]' : 'bg-gray-50/80')}>
                <tr>
                  <th className={cn('text-left px-5 sm:px-6 py-3 text-xs font-semibold uppercase tracking-wider', isDark ? 'text-gray-500' : 'text-gray-500')}>Invoice</th>
                  <th className={cn('text-left px-5 sm:px-6 py-3 text-xs font-semibold uppercase tracking-wider', isDark ? 'text-gray-500' : 'text-gray-500')}>Patient</th>
                  <th className={cn('text-left px-5 sm:px-6 py-3 text-xs font-semibold uppercase tracking-wider', isDark ? 'text-gray-500' : 'text-gray-500')}>Date</th>
                  <th className={cn('text-right px-5 sm:px-6 py-3 text-xs font-semibold uppercase tracking-wider', isDark ? 'text-gray-500' : 'text-gray-500')}>Amount</th>
                  <th className={cn('text-center px-5 sm:px-6 py-3 text-xs font-semibold uppercase tracking-wider', isDark ? 'text-gray-500' : 'text-gray-500')}>Status</th>
                </tr>
              </thead>
              <tbody className={cn('divide-y', isDark ? 'divide-gray-800/70' : 'divide-gray-100')}>
                {recentInvoices.map((inv) => (
                  <tr key={inv.id} className={cn('transition-colors', isDark ? 'hover:bg-[#222]' : 'hover:bg-gray-50/50')}>
                    <td className={cn('px-5 sm:px-6 py-4 font-mono text-xs font-semibold', isDark ? 'text-gray-300' : 'text-gray-700')}>
                      #{inv.invoiceNumber}
                    </td>
                    <td className="px-5 sm:px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#ff7a6b] to-[#8b5cf6] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                          {(inv.patient || '-')[0]?.toUpperCase()}
                        </div>
                        <span className={cn('text-sm', isDark ? 'text-white' : 'text-gray-900')}>{inv.patient || '-'}</span>
                      </div>
                    </td>
                    <td className={cn('px-5 sm:px-6 py-4 text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>{fmtDate(inv.date)}</td>
                    <td className={cn('px-5 sm:px-6 py-4 text-right text-sm font-semibold', isDark ? 'text-white' : 'text-gray-900')}>
                      {formatCurrency(inv.amount)}
                    </td>
                    <td className="px-5 sm:px-6 py-4 text-center">
                      <span className={cn(
                        'inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase',
                        inv.status === 'paid' && 'bg-emerald-500/15 text-emerald-400',
                        inv.status === 'pending' && 'bg-amber-500/15 text-amber-400',
                        inv.status === 'overdue' && 'bg-red-500/15 text-red-400',
                        (!inv.status || inv.status === 'void') && 'bg-gray-500/15 text-gray-400'
                      )}>
                        {inv.status || 'void'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
