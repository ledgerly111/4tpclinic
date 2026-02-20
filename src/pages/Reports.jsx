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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 dashboard-reveal">
        <div>
          <h1 className={cn("text-2xl sm:text-4xl font-black tracking-tight", isDark ? 'text-white' : 'text-[#512c31]')}>Reports & Analytics</h1>
          <p className={cn("text-sm sm:text-base font-bold uppercase tracking-widest mt-1", isDark ? 'text-white/40' : 'text-[#512c31]/60')}>
            Real-time financial and operational insights
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className={cn(
            'w-full sm:w-auto px-4 py-3 sm:px-6 sm:py-3 rounded-2xl sm:rounded-[1.5rem] font-bold tracking-wide shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 transition-all',
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105',
            isDark
              ? 'bg-[#512c31] text-white hover:bg-[#e8919a]'
              : 'bg-[#512c31] text-white hover:bg-[#e8919a]'
          )}
        >
          <RefreshCw className={cn('w-4 h-4 sm:w-5 sm:h-5', loading && 'animate-spin')} />
          <span className="text-sm sm:text-base">Refresh</span>
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex items-center gap-2">
          <Activity className="w-4 h-4" /> {error}
        </div>
      )}

      {/* ── KPI Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {kpis.map((kpi, idx) => (
          <div
            key={kpi.title}
            className={cn(
              'relative rounded-[2rem] p-6 transition-all border-4 shadow-xl hover:-translate-y-1 hover:shadow-2xl group dashboard-reveal',
              isDark ? 'bg-[#1e1e1e] border-white/5' : 'bg-white border-gray-50'
            )}
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner pt-0.5 transition-transform group-hover:scale-110', kpi.iconBg)}>
                  <kpi.icon className={cn('w-6 h-6', kpi.accent)} />
                </div>
                {kpi.change !== undefined && (
                  <div className={cn(
                    'flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-sm border border-transparent',
                    kpi.change >= 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                  )}>
                    {kpi.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {Math.abs(kpi.change).toFixed(1)}%
                  </div>
                )}
              </div>
              <p className={cn('text-[10px] sm:text-[11px] font-bold uppercase tracking-widest mb-1', isDark ? 'text-gray-400' : 'text-[#512c31]/60')}>{kpi.title}</p>
              {loading ? <Skeleton className="h-8 w-32 mt-1" /> : (
                <p className={cn('text-3xl sm:text-4xl font-black tracking-tight', isDark ? 'text-white' : 'text-[#512c31]')}>{kpi.value}</p>
              )}
              <p className={cn('text-xs font-bold mt-2', isDark ? 'text-gray-500' : 'text-[#512c31]/80')}>{kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick Stats Strip ──────────────────────────────────── */}
      <div className={cn(
        'rounded-3xl border-4 p-5 sm:p-6 flex flex-wrap gap-x-10 gap-y-6 shadow-lg dashboard-reveal reveal-delay-2',
        isDark ? 'bg-[#1e1e1e] border-white/5' : 'bg-white border-gray-50'
      )}>
        {quickStats.map((s) => (
          <div key={s.label} className="flex items-center gap-4 min-w-[140px] group">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110", isDark ? 'bg-[#0f0f0f]' : 'bg-[#fef9f3]')}>
              <s.icon className={cn('w-6 h-6', s.color)} />
            </div>
            <div>
              <p className={cn('text-[10px] sm:text-[11px] font-bold uppercase tracking-widest', isDark ? 'text-gray-400' : 'text-[#512c31]/60')}>{s.label}</p>
              {loading ? <Skeleton className="h-6 w-12 mt-0.5" /> : (
                <p className={cn('text-xl font-black', isDark ? 'text-white' : 'text-[#512c31]')}>{s.value.toLocaleString()}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts Row 1: Revenue + Status Donut ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <div className={cn(
          'rounded-[2rem] p-6 lg:col-span-2 border-4 shadow-xl dashboard-reveal reveal-delay-4',
          isDark ? 'bg-[#1e1e1e] border-white/5' : 'bg-white border-gray-50'
        )}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={cn('font-black text-xl flex items-center gap-3', isDark ? 'text-white' : 'text-[#512c31]')}>
                <div className="p-2 bg-[#ff7a6b]/10 rounded-xl"><TrendingUp className="w-6 h-6 text-[#ff7a6b]" /></div>
                Revenue Trend
              </h3>
              <p className={cn('text-[10px] font-bold uppercase tracking-widest mt-2', isDark ? 'text-gray-400' : 'text-[#512c31]/60')}>
                Monthly revenue from invoices
              </p>
            </div>
            {!loading && (
              <div className={cn(
                'text-right px-4 py-2 rounded-2xl shadow-inner border',
                isDark ? 'bg-[#0f0f0f] border-white/5' : 'bg-[#fef9f3] border-[#512c31]/5'
              )}>
                <p className={cn('text-[10px] font-bold uppercase tracking-widest', isDark ? 'text-gray-500' : 'text-[#512c31]/60')}>Total</p>
                <p className={cn('text-lg font-black', isDark ? 'text-white' : 'text-[#512c31]')}>{formatCurrency(totalRevenue)}</p>
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
          'rounded-[2rem] p-6 border-4 shadow-xl flex flex-col dashboard-reveal reveal-delay-5',
          isDark ? 'bg-[#1e1e1e] border-white/5' : 'bg-white border-gray-50'
        )}>
          <div className="mb-6">
            <h3 className={cn('font-black text-xl flex items-center gap-3', isDark ? 'text-white' : 'text-[#512c31]')}>
              <div className="p-2 bg-violet-500/10 rounded-xl"><PieChartIcon className="w-6 h-6 text-violet-500" /></div>
              Invoice Status
            </h3>
            <p className={cn('text-[10px] font-bold uppercase tracking-widest mt-2', isDark ? 'text-gray-400' : 'text-[#512c31]/60')}>
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
          <div className="space-y-3 mt-4 pt-4 border-t-2 border-dashed" style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(81, 44, 49, 0.1)' }}>
            {statusDonut.map((e) => (
              <div key={e.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: e.color }} />
                  <span className={cn('text-xs font-bold uppercase tracking-wider', isDark ? 'text-gray-300' : 'text-[#512c31]')}>{e.name}</span>
                </div>
                <span className={cn('text-sm font-black', isDark ? 'text-white' : 'text-[#512c31]')}>{e.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Charts Row 2: Invoice Volume + Top Services ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Invoices Composite */}
        <div className={cn(
          'rounded-[2rem] p-6 border-4 shadow-xl',
          isDark ? 'bg-[#1e1e1e] border-white/5' : 'bg-white border-gray-50'
        )}>
          <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4 mb-6">
            <div>
              <h3 className={cn('font-black text-xl flex items-center gap-3', isDark ? 'text-white' : 'text-[#512c31]')}>
                <div className="p-2 bg-sky-500/10 rounded-xl"><BarChart3 className="w-6 h-6 text-sky-500" /></div>
                Revenue vs Invoices
              </h3>
              <p className={cn('text-[10px] font-bold uppercase tracking-widest mt-2', isDark ? 'text-gray-400' : 'text-[#512c31]/60')}>
                Monthly comparison
              </p>
            </div>
            <div className="flex items-center gap-4 bg-gray-50 dark:bg-[#0f0f0f] px-3 py-2 rounded-xl border dark:border-white/5">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#ff7a6b] shadow-sm" /><span className={cn('text-[10px] font-bold uppercase tracking-widest', isDark ? 'text-gray-400' : 'text-[#512c31]')}>Revenue</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-sky-500 shadow-sm" /><span className={cn('text-[10px] font-bold uppercase tracking-widest', isDark ? 'text-gray-400' : 'text-[#512c31]')}>Invoices</span></div>
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
          'rounded-[2rem] p-6 border-4 shadow-xl',
          isDark ? 'bg-[#1e1e1e] border-white/5' : 'bg-white border-gray-50'
        )}>
          <div className="mb-6">
            <h3 className={cn('font-black text-xl flex items-center gap-3', isDark ? 'text-white' : 'text-[#512c31]')}>
              <div className="p-2 bg-emerald-500/10 rounded-xl"><Stethoscope className="w-6 h-6 text-emerald-500" /></div>
              Top Services
            </h3>
            <p className={cn('text-[10px] font-bold uppercase tracking-widest mt-2', isDark ? 'text-gray-400' : 'text-[#512c31]/60')}>
              Breakdown from invoice line items
            </p>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full rounded-2xl" />)}
            </div>
          ) : topServices.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm font-bold text-gray-400">No service data from invoices</div>
          ) : (
            <div className="space-y-5">
              {topServices.map((svc, idx) => {
                const pct = topServicesTotal > 0 ? (svc.value / topServicesTotal) * 100 : 0;
                return (
                  <div key={svc.name} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: svc.color }} />
                        <span className={cn('text-sm font-bold truncate max-w-[180px]', isDark ? 'text-gray-200' : 'text-[#512c31]')}>{svc.name}</span>
                      </div>
                      <span className={cn('text-sm font-black', isDark ? 'text-white' : 'text-[#512c31]')}>{formatCurrency(svc.value)}</span>
                    </div>
                    <div className={cn('w-full h-3 rounded-full overflow-hidden shadow-inner', isDark ? 'bg-[#0f0f0f]' : 'bg-[#fef9f3]')}>
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: svc.color,
                          boxShadow: `0 0 10px ${svc.color}60`,
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
        'rounded-[2.5rem] overflow-hidden border-4 shadow-2xl',
        isDark ? 'bg-[#1e1e1e] border-white/5 shadow-black/50' : 'bg-white border-white/50 shadow-[#512c31]/5'
      )}>
        <div className={cn('px-6 sm:px-8 py-6 border-b-2 flex items-center justify-between', isDark ? 'border-gray-800' : 'border-gray-50')}>
          <h3 className={cn('font-black text-xl flex items-center gap-3', isDark ? 'text-white' : 'text-[#512c31]')}>
            <div className="p-2 bg-[#e8919a]/10 rounded-xl"><ReceiptText className="w-6 h-6 text-[#e8919a]" /></div>
            Recent Invoices
          </h3>
          <span className={cn(
            'text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-widest shadow-inner',
            isDark ? 'bg-[#0f0f0f] text-gray-400' : 'bg-[#fef9f3] text-[#512c31]/60'
          )}>
            {invoices.length} total
          </span>
        </div>

        {loading ? (
          <div className="px-6 py-10 flex items-center justify-center">
            <div className="animate-spin w-7 h-7 border-4 border-[#e8919a] border-t-transparent rounded-full" />
          </div>
        ) : recentInvoices.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <ReceiptText className={cn('w-12 h-12 mx-auto mb-4', isDark ? 'text-gray-700' : 'text-[#512c31]/20')} />
            <p className={cn('text-sm font-bold uppercase tracking-widest', isDark ? 'text-gray-500' : 'text-[#512c31]/60')}>No invoices created yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className={cn("font-black uppercase tracking-widest text-[10px] sm:text-xs", isDark ? 'bg-[#0f0f0f] text-gray-400' : 'bg-[#fef9f3] text-[#512c31]/60')}>
                <tr>
                  <th className="text-left px-5 sm:px-6 py-5">Invoice</th>
                  <th className="text-left px-5 sm:px-6 py-5">Patient</th>
                  <th className="text-left px-5 sm:px-6 py-5">Date</th>
                  <th className="text-right px-5 sm:px-6 py-5">Amount</th>
                  <th className="text-center px-5 sm:px-6 py-5">Status</th>
                </tr>
              </thead>
              <tbody className={cn('divide-y', isDark ? 'divide-gray-800' : 'divide-gray-50')}>
                {recentInvoices.map((inv) => (
                  <tr key={inv.id} className={cn('transition-all duration-300 group', isDark ? 'hover:bg-[#252525]' : 'hover:bg-[#fef9f3]')}>
                    <td className={cn('px-5 sm:px-6 py-5 font-black text-sm', isDark ? 'text-gray-300' : 'text-[#512c31]')}>
                      #{inv.invoiceNumber}
                    </td>
                    <td className="px-5 sm:px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#512c31] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-md">
                          {(inv.patient || '-')[0]?.toUpperCase()}
                        </div>
                        <span className={cn('font-bold', isDark ? 'text-white' : 'text-[#512c31]')}>{inv.patient || '-'}</span>
                      </div>
                    </td>
                    <td className={cn('px-5 sm:px-6 py-5 text-xs font-bold uppercase tracking-widest', isDark ? 'text-gray-400' : 'text-[#512c31]/60')}>
                      {fmtDate(inv.date)}
                    </td>
                    <td className={cn('px-5 sm:px-6 py-5 text-right font-black text-sm', isDark ? 'text-white' : 'text-[#512c31]')}>
                      {formatCurrency(inv.amount)}
                    </td>
                    <td className="px-5 sm:px-6 py-5 text-center">
                      <span className={cn(
                        'inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-sm border',
                        inv.status === 'paid' && 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
                        inv.status === 'pending' && 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
                        inv.status === 'overdue' && 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
                        (!inv.status || inv.status === 'void') && 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20'
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
