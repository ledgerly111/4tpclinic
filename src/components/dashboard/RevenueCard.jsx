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
        <div className="bg-gradient-to-br from-[#ff7a6b] to-[#ff9a8b] rounded-2xl sm:rounded-3xl p-4 sm:p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">REVENUE</h2>
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

            <div className="flex-1 flex flex-col lg:flex-row gap-3 sm:gap-4 min-h-0">
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
                                    'bg-[#1a1a1a] text-white text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-lg whitespace-nowrap mb-1 transition-opacity',
                                    isHighest ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                )}>
                                    Rs{dayAmount.toLocaleString()}
                                </div>
                                <div className="w-full h-full flex items-end relative">
                                    <div
                                        className="w-full rounded-t-lg transition-all duration-1000 ease-out bg-[#1a1a1a] group-hover:bg-black relative overflow-hidden"
                                        style={{
                                            height: `${Math.max(height, 15)}%`,
                                            animation: `growUp 1s ease-out ${index * 0.1}s backwards`,
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 opacity-50"></div>
                                    </div>
                                </div>
                                <span className="text-[9px] sm:text-[10px] font-medium text-[#1a1a1a] group-hover:font-bold transition-all">
                                    {day.day}
                                </span>
                            </div>
                        );
                    })}
                    <style>{`@keyframes growUp { from { height: 0%; opacity: 0; } to { opacity: 1; } }`}</style>
                </div>

                <div className="flex flex-row lg:flex-col gap-2 sm:gap-3 w-full lg:w-44 flex-shrink-0 order-1 lg:order-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2.5 sm:p-3 flex-1 min-w-[120px] sm:min-w-[140px]">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-white/80 text-[9px] sm:text-[10px] font-medium uppercase tracking-wider">Gross Revenue</span>
                            <span className="bg-[#1a1a1a] text-white text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><ArrowUpRight className="w-2 h-2" />+7.5%</span>
                        </div>
                        <p className="text-lg sm:text-xl font-bold text-white">Rs{totalRevenue.toLocaleString()}</p>
                    </div>

                    <div className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2.5 sm:p-3 flex-1 min-w-[120px] sm:min-w-[140px]">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-white/80 text-[9px] sm:text-[10px] font-medium uppercase tracking-wider">Avg. per Day</span>
                            <span className="bg-[#1a1a1a] text-white text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><ArrowUpRight className="w-2 h-2" />+2.4%</span>
                        </div>
                        <p className="text-lg sm:text-xl font-bold text-white">Rs{avgRevenue.toLocaleString()}</p>
                        <p className="text-white/60 text-[9px] sm:text-[10px] mt-0.5">Growth vs. Last week</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
