import { useState } from 'react';
import { ChevronDown, Users, Calendar, FileText, Package, PlusCircle, ArrowUpRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { cn } from '../../lib/utils';

import { useNavigate } from 'react-router-dom';

export function QuickActionsCard() {
    const { theme } = useStore();
    const navigate = useNavigate();
    const isDark = theme === 'dark';
    const [timeRange, setTimeRange] = useState('This Week');
    const [showDropdown, setShowDropdown] = useState(false);

    const actions = [
        {
            icon: Users,
            label: 'New Patient',
            subLabel: 'Register',
            color: 'text-[#5c6aff]',
            path: '/patients?action=new'
        },
        {
            icon: Calendar,
            label: 'Schedule',
            subLabel: 'Appointment',
            color: 'text-[#5c6aff]',
            path: '/appointments'
        },
        {
            icon: FileText,
            label: 'Invoice',
            subLabel: 'Create New',
            color: 'text-[#5c6aff]',
            path: '/invoices/new'
        },
        {
            icon: Package,
            label: 'Inventory',
            subLabel: 'Add Stock',
            color: 'text-[#5c6aff]',
            path: '/inventory'
        },
    ];

    return (
        <div className="bg-[#5c6aff] rounded-2xl sm:rounded-3xl p-4 h-full flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 sm:mb-4 relative z-10">
                <div>
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-wide uppercase">Quick Actions</h2>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="flex items-center gap-1.5 sm:gap-2 bg-white rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold text-[#5c6aff] hover:bg-gray-100 transition-colors"
                    >
                        {timeRange}
                        <ChevronDown className="w-3 h-3" />
                    </button>
                    {showDropdown && (
                        <div className={cn(
                            "absolute top-full right-0 mt-2 w-28 sm:w-32 rounded-xl shadow-xl z-50 overflow-hidden py-1 border",
                            isDark
                                ? "bg-[#1e1e1e] border-gray-800"
                                : "bg-white border-gray-200"
                        )}>
                            {['This Week', 'Today', 'This Month'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => {
                                        setTimeRange(range);
                                        setShowDropdown(false);
                                    }}
                                    className={cn(
                                        "w-full text-left px-3 py-2 text-[10px] sm:text-xs font-medium transition-colors",
                                        isDark
                                            ? "text-gray-300 hover:bg-[#2a2a2a] hover:text-white"
                                            : "text-gray-700 hover:bg-gray-100"
                                    )}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons Grid */}
            <div className="flex-1 grid grid-cols-2 lg:grid-cols-2 gap-2 relative z-10 overflow-hidden">
                {actions.map((action) => (
                    <button
                        key={action.label}
                        onClick={() => navigate(action.path)}
                        className="flex flex-col justify-center items-center gap-1 p-2 rounded-xl bg-white hover:bg-gray-50 transition-all duration-300 group shadow-sm h-full"
                    >
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#5c6aff]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <action.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${action.color}`} />
                        </div>
                        <span className="block text-[#1e1e1e] text-[10px] sm:text-xs font-bold leading-tight text-center">{action.label}</span>
                        <span className="hidden sm:block text-gray-400 text-[9px] sm:text-[10px] font-medium leading-tight text-center">{action.subLabel}</span>
                    </button>
                ))}
            </div>

            {/* Footer Summary */}
            <div className="mt-2 sm:mt-3 flex items-center justify-between text-[10px] sm:text-xs text-white/80 relative z-10">
                <span className="font-medium">Total Actions</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-md text-white font-bold">12</span>
            </div>
        </div>
    );
}
