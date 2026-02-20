import { useState } from 'react';
import { CreditCard, ChevronDown, ArrowUpRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { cn } from '../../lib/utils';

const CURRENCIES = ['INR, Rs', 'USD, $', 'EUR, EUR'];

export function RevenueCard() {
    const { weeklyRevenue = [], stats = {}, theme } = useStore();
    const isDark = theme === 'dark';
    const [timeRange, setTimeRange] = useState('this week');
    const [currency, setCurrency] = useState('INR, Rs');
    const [showTimeDropdown, setShowTimeDropdown] = useState(false);
    const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

    const totalRevenue = Number(stats.totalRevenue || 0);
    const avgRevenue = Number(stats.avgRevenue || 0);

    const maxRevenue = weeklyRevenue.length > 0
        ? Math.max(...weeklyRevenue.map((d) => Number(d.amount || 0)))
        : 0;

    return (
        <div className="bg-[#512c31] rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-7 h-full flex flex-col relative overflow-hidden group shadow-2xl shadow-[#512c31]/20 border border-white/5">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#e8919a] rounded-full blur-3xl opacity-20 group-hover:scale-150 transition-transform duration-1000" />
            <div className="relative z-10 flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-[#e8919a] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-6">
                        <CreditCard className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">Revenue</h2>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                    <div className="relative">
                        <button
                            onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                            className="flex items-center gap-1 sm:gap-2 bg-white/20 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-white hover:bg-white/30 transition-colors"
                        >
                            <span className="hidden sm:inline">{timeRange}</span>
                            <span className="sm:hidden">{timeRange.split(' ')[0]}</span>
                            <ChevronDown className="w-3 h-3" />
                        </button>
                        {showTimeDropdown && (
                            <div className={cn(
                                'absolute top-full right-0 mt-2 w-28 sm:w-32 rounded-xl border shadow-xl z-50 overflow-hidden',
                                isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'
                            )}>
                                {['this week', 'last week', 'this month'].map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => {
                                            setTimeRange(range);
                                            setShowTimeDropdown(false);
                                        }}
                                        className={cn(
                                            'w-full text-left px-3 py-2 text-xs sm:text-sm transition-colors',
                                            isDark ? 'text-gray-300 hover:bg-[#2a2a2a] hover:text-white' : 'text-gray-700 hover:bg-gray-100'
                                        )}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="relative hidden sm:block">
                        <button
                            onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                            className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm text-white hover:bg-white/30 transition-colors"
                        >
                            {currency}
                            <ChevronDown className="w-3 h-3" />
                        </button>
                        {showCurrencyDropdown && (
                            <div className={cn(
                                'absolute top-full right-0 mt-2 w-32 rounded-xl border shadow-xl z-50 overflow-hidden',
                                isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-200'
                            )}>
                                {CURRENCIES.map((curr) => (
                                    <button
                                        key={curr}
                                        onClick={() => {
                                            setCurrency(curr);
                                            setShowCurrencyDropdown(false);
                                        }}
                                        className={cn(
                                            'w-full text-left px-3 py-2 text-sm transition-colors',
                                            isDark ? 'text-gray-300 hover:bg-[#2a2a2a] hover:text-white' : 'text-gray-700 hover:bg-gray-100'
                                        )}
                                    >
                                        {curr}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="relative z-10 flex-1 flex flex-col lg:flex-row gap-4 sm:gap-6 min-h-0">
                <div className="flex-1 flex items-end justify-between gap-1 sm:gap-2 h-28 sm:h-32 lg:h-auto order-2 lg:order-1">
                    {weeklyRevenue.length === 0 && (
                        <div className="w-full h-full flex items-center justify-center text-white/80 text-xs sm:text-sm">
                            No revenue data yet
                        </div>
                    )}
                    {weeklyRevenue.map((day, index) => {
                        const dayAmount = Number(day.amount || 0);
                        const height = maxRevenue > 0 ? (dayAmount / maxRevenue) * 100 : 0;
                        const isHighest = dayAmount === maxRevenue;
                        return (
                            <div key={day.day} className="flex flex-col items-center justify-end gap-1 flex-1 group cursor-pointer h-full">
                                <div className={cn(
                                    'bg-[#e8919a] text-white text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-lg whitespace-nowrap mb-1 transition-opacity font-bold shadow-lg',
                                    isHighest ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                )}>
                                    Rs{dayAmount.toLocaleString()}
                                </div>
                                <div className="w-full h-full flex items-end relative">
                                    <div
                                        className="w-full rounded-t-xl transition-all duration-1000 ease-out bg-white/10 overflow-hidden relative"
                                        style={{
                                            height: `${Math.max(height, 15)}%`,
                                            animation: `growUp 1s ease-out ${index * 0.1}s backwards`,
                                        }}
                                    >
                                        <div className={cn("absolute inset-0 transition-opacity duration-300", isHighest ? "bg-[#e8919a]" : "bg-white/20 group-hover:bg-[#e8919a]")}></div>
                                    </div>
                                </div>
                                <span className="text-[9px] sm:text-xs font-bold text-white/40 group-hover:text-white transition-colors mt-1">
                                    {day.day}
                                </span>
                            </div>
                        );
                    })}
                    <style>{`@keyframes growUp { from { height: 0%; opacity: 0; } to { opacity: 1; } }`}</style>
                </div>

                <div className="flex flex-row lg:flex-col gap-2 sm:gap-3 w-full lg:w-44 flex-shrink-0 order-1 lg:order-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2.5 sm:p-3 flex-1 min-w-[120px] sm:min-w-[140px]">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-white/40 text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Gross Revenue</span>
                            <span className="bg-[#e8919a] text-white text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full flex items-center font-bold gap-0.5"><ArrowUpRight className="w-2 h-2" />+7.5%</span>
                        </div>
                        <p className="text-xl sm:text-3xl font-black text-white tracking-tight">Rs{totalRevenue.toLocaleString()}</p>
                    </div>

                    <div className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2.5 sm:p-3 flex-1 min-w-[120px] sm:min-w-[140px]">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-white/40 text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Avg. per Day</span>
                            <span className="bg-[#e8919a] text-white text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full flex items-center font-bold gap-0.5"><ArrowUpRight className="w-2 h-2" />+2.4%</span>
                        </div>
                        <p className="text-xl sm:text-3xl font-black text-white tracking-tight">Rs{avgRevenue.toLocaleString()}</p>
                        <p className="text-white/40 text-[9px] sm:text-[10px] mt-1 font-medium">Growth vs. Last week</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
