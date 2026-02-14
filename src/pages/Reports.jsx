import { useState } from 'react';
import { Download, Calendar, TrendingUp, Users, DollarSign, FileText, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useStore } from '../context/StoreContext';
import { cn } from '../lib/utils';

const monthlyData = [
    { month: 'Jan', revenue: 42000, patients: 120 },
    { month: 'Feb', revenue: 38000, patients: 105 },
    { month: 'Mar', revenue: 45000, patients: 135 },
    { month: 'Apr', revenue: 52000, patients: 150 },
    { month: 'May', revenue: 48000, patients: 140 },
    { month: 'Jun', revenue: 58000, patients: 165 },
];

const serviceDistribution = [
    { name: 'General Consultation', value: 35, color: '#ff7a6b' },
    { name: 'Dental', value: 25, color: '#8b5cf6' },
    { name: 'Laboratory', value: 20, color: '#60a5fa' },
    { name: 'X-Ray', value: 15, color: '#fbbf24' },
    { name: 'Other', value: 5, color: '#9ca3af' },
];

export function Reports() {
    const { theme } = useStore();
    const isDark = theme === 'dark';
    const [dateRange, setDateRange] = useState('last-30-days');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className={cn("text-2xl font-bold", isDark ? 'text-white' : 'text-gray-900')}>Reports</h1>
                    <p className={cn(isDark ? 'text-gray-400' : 'text-gray-600')}>Analytics and insights for your clinic</p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className={cn("px-4 py-2 rounded-xl outline-none border", isDark ? 'bg-[#1e1e1e] text-white border-gray-800' : 'bg-white text-gray-900 border-gray-200')}
                    >
                        <option value="last-7-days">Last 7 Days</option>
                        <option value="last-30-days">Last 30 Days</option>
                        <option value="last-90-days">Last 90 Days</option>
                        <option value="this-year">This Year</option>
                    </select>
                    <button className="bg-[#ff7a6b] text-white px-4 py-2 rounded-xl hover:bg-[#ff6b5b] flex items-center gap-2 transition-colors">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-4 gap-4">
                <div className={cn("rounded-2xl p-5", isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-green-400" />
                        </div>
                        <span className={cn("text-sm", isDark ? 'text-gray-400' : 'text-gray-600')}>Total Revenue</span>
                    </div>
                    <p className={cn("text-2xl font-bold", isDark ? 'text-white' : 'text-gray-900')}>$283,000</p>
                    <p className="text-green-400 text-xs mt-1">+12.5% vs last month</p>
                </div>
                <div className={cn("rounded-2xl p-5", isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className={cn("text-sm", isDark ? 'text-gray-400' : 'text-gray-600')}>Total Patients</span>
                    </div>
                    <p className={cn("text-2xl font-bold", isDark ? 'text-white' : 'text-gray-900')}>815</p>
                    <p className="text-green-400 text-xs mt-1">+8.2% vs last month</p>
                </div>
                <div className={cn("rounded-2xl p-5", isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-purple-400" />
                        </div>
                        <span className={cn("text-sm", isDark ? 'text-gray-400' : 'text-gray-600')}>Appointments</span>
                    </div>
                    <p className={cn("text-2xl font-bold", isDark ? 'text-white' : 'text-gray-900')}>1,245</p>
                    <p className="text-green-400 text-xs mt-1">+15.3% vs last month</p>
                </div>
                <div className={cn("rounded-2xl p-5", isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-yellow-400" />
                        </div>
                        <span className={cn("text-sm", isDark ? 'text-gray-400' : 'text-gray-600')}>Avg. Revenue/Patient</span>
                    </div>
                    <p className={cn("text-2xl font-bold", isDark ? 'text-white' : 'text-gray-900')}>$347</p>
                    <p className="text-red-400 text-xs mt-1">-2.1% vs last month</p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className={cn("rounded-2xl p-6", isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                    <h3 className={cn("font-semibold mb-4 flex items-center gap-2", isDark ? 'text-white' : 'text-gray-900')}>
                        <DollarSign className="w-5 h-5 text-[#ff7a6b]" />
                        Revenue Trend
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#333" : "#e5e7eb"} />
                                <XAxis dataKey="month" stroke={isDark ? "#666" : "#9ca3af"} />
                                <YAxis stroke={isDark ? "#666" : "#9ca3af"} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff', border: `1px solid ${isDark ? '#333' : '#e5e7eb'}`, borderRadius: '8px' }}
                                    labelStyle={{ color: isDark ? '#fff' : '#111827' }}
                                />
                                <Bar dataKey="revenue" fill="#ff7a6b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Patient Chart */}
                <div className={cn("rounded-2xl p-6", isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                    <h3 className={cn("font-semibold mb-4 flex items-center gap-2", isDark ? 'text-white' : 'text-gray-900')}>
                        <Users className="w-5 h-5 text-[#8b5cf6]" />
                        Patient Visits
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#333" : "#e5e7eb"} />
                                <XAxis dataKey="month" stroke={isDark ? "#666" : "#9ca3af"} />
                                <YAxis stroke={isDark ? "#666" : "#9ca3af"} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff', border: `1px solid ${isDark ? '#333' : '#e5e7eb'}`, borderRadius: '8px' }}
                                    labelStyle={{ color: isDark ? '#fff' : '#111827' }}
                                />
                                <Line type="monotone" dataKey="patients" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Service Distribution */}
            <div className={cn("rounded-2xl p-6", isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                <h3 className={cn("font-semibold mb-4", isDark ? 'text-white' : 'text-gray-900')}>Service Distribution</h3>
                <div className="flex items-center gap-8">
                    <div className="w-64 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={serviceDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {serviceDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: isDark ? '#1e1e1e' : '#ffffff', border: `1px solid ${isDark ? '#333' : '#e5e7eb'}`, borderRadius: '8px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-4">
                        {serviceDistribution.map((service) => (
                            <div key={service.name} className="flex items-center gap-3">
                                <div 
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: service.color }}
                                />
                                <div>
                                    <p className={cn("text-sm", isDark ? 'text-white' : 'text-gray-900')}>{service.name}</p>
                                    <p className={cn("text-xs", isDark ? 'text-gray-400' : 'text-gray-600')}>{service.value}% of total</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
