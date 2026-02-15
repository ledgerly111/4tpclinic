import { useEffect, useMemo, useState } from 'react';
import { Download, TrendingUp, Users, DollarSign, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useStore } from '../context/StoreContext';
import { cn } from '../lib/utils';
import { fetchReportsOverview } from '../lib/clinicApi';

export function Reports() {
    const { theme } = useStore();
    const isDark = theme === 'dark';
    const [overview, setOverview] = useState({ monthlyRevenue: [], patientCount: 0, lowStockCount: 0, appointmentCount: 0 });
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const result = await fetchReportsOverview();
                setOverview({
                    monthlyRevenue: result.monthlyRevenue || [],
                    patientCount: result.patientCount || 0,
                    lowStockCount: result.lowStockCount || 0,
                    appointmentCount: result.appointmentCount || 0,
                });
            } catch (err) {
                setError(err.message || 'Failed to load reports.');
            }
        };
        load();
    }, []);

    const totalRevenue = useMemo(
        () => overview.monthlyRevenue.reduce((sum, row) => sum + Number(row.revenue || 0), 0),
        [overview.monthlyRevenue]
    );

    const monthlyData = useMemo(
        () => overview.monthlyRevenue.map((row) => ({
            month: String(row.month || '').slice(5),
            revenue: Number(row.revenue || 0),
            patients: Math.round(Number(row.revenue || 0) / 200),
        })),
        [overview.monthlyRevenue]
    );

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                <div>
                    <h1 className={cn('text-xl sm:text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>Reports</h1>
                    <p className={cn('text-sm sm:text-base', isDark ? 'text-gray-400' : 'text-gray-600')}>Analytics and insights for your clinic</p>
                </div>
                <button className="w-full sm:w-auto bg-[#ff7a6b] text-white px-4 py-2 rounded-xl hover:bg-[#ff6b5b] flex items-center justify-center gap-2 transition-colors">
                    <Download className="w-4 h-4" />
                    <span className="text-sm sm:text-base">Export</span>
                </button>
            </div>

            {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className={cn('rounded-xl sm:rounded-2xl p-4 sm:p-5', isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}><div className="flex items-center gap-2 sm:gap-3 mb-2"><div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-green-500/20 flex items-center justify-center"><DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" /></div><span className={cn('text-xs sm:text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>Total Revenue</span></div><p className={cn('text-lg sm:text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>${Math.round(totalRevenue).toLocaleString()}</p></div>
                <div className={cn('rounded-xl sm:rounded-2xl p-4 sm:p-5', isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}><div className="flex items-center gap-2 sm:gap-3 mb-2"><div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-500/20 flex items-center justify-center"><Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" /></div><span className={cn('text-xs sm:text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>Total Patients</span></div><p className={cn('text-lg sm:text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>{overview.patientCount}</p></div>
                <div className={cn('rounded-xl sm:rounded-2xl p-4 sm:p-5', isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}><div className="flex items-center gap-2 sm:gap-3 mb-2"><div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-500/20 flex items-center justify-center"><FileText className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" /></div><span className={cn('text-xs sm:text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>Appointments</span></div><p className={cn('text-lg sm:text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>{overview.appointmentCount}</p></div>
                <div className={cn('rounded-xl sm:rounded-2xl p-4 sm:p-5', isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}><div className="flex items-center gap-2 sm:gap-3 mb-2"><div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center"><TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" /></div><span className={cn('text-xs sm:text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>Low Stock Items</span></div><p className={cn('text-lg sm:text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>{overview.lowStockCount}</p></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className={cn('rounded-xl sm:rounded-2xl p-4 sm:p-6', isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                    <h3 className={cn('font-semibold mb-4 flex items-center gap-2 text-sm sm:text-base', isDark ? 'text-white' : 'text-gray-900')}><DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff7a6b]" />Revenue Trend</h3>
                    <div className="h-48 sm:h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#333' : '#e5e7eb'} />
                                <XAxis dataKey="month" stroke={isDark ? '#666' : '#9ca3af'} fontSize={12} />
                                <YAxis stroke={isDark ? '#666' : '#9ca3af'} fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff', border: `1px solid ${isDark ? '#333' : '#e5e7eb'}`, borderRadius: '8px' }} labelStyle={{ color: isDark ? '#fff' : '#111827' }} />
                                <Bar dataKey="revenue" fill="#ff7a6b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className={cn('rounded-xl sm:rounded-2xl p-4 sm:p-6', isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                    <h3 className={cn('font-semibold mb-4 flex items-center gap-2 text-sm sm:text-base', isDark ? 'text-white' : 'text-gray-900')}><Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#8b5cf6]" />Patient Visits (Estimated)</h3>
                    <div className="h-48 sm:h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#333' : '#e5e7eb'} />
                                <XAxis dataKey="month" stroke={isDark ? '#666' : '#9ca3af'} fontSize={12} />
                                <YAxis stroke={isDark ? '#666' : '#9ca3af'} fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff', border: `1px solid ${isDark ? '#333' : '#e5e7eb'}`, borderRadius: '8px' }} labelStyle={{ color: isDark ? '#fff' : '#111827' }} />
                                <Line type="monotone" dataKey="patients" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
