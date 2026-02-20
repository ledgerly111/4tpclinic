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
            color: 'text-[#e8919a]',
            path: '/app/patients?action=new'
        },
        {
            icon: Calendar,
            label: 'Schedule',
            subLabel: 'Appointment',
            color: 'text-[#e8919a]',
            path: '/app/appointments'
        },
        {
            icon: FileText,
            label: 'Invoice',
            subLabel: 'Create New',
            color: 'text-[#e8919a]',
            path: '/app/invoices/new'
        },
        {
            icon: Package,
            label: 'Inventory',
            subLabel: 'Add Stock',
            color: 'text-[#e8919a]',
            path: '/app/inventory'
        },
    ];

    return (
        <div className="bg-[#e8919a] rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 h-full flex flex-col relative overflow-hidden shadow-2xl shadow-[#e8919a]/20 group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-700" />
            {/* Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6 relative z-10">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none mb-1 shadow-sm">Quick Actions</h2>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="flex items-center gap-1.5 sm:gap-2 bg-white rounded-full px-3 py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#512c31] hover:bg-[#fef9f3] hover:text-[#e8919a] transition-all shadow-md group-hover:scale-105"
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
            <div className="flex-1 grid grid-cols-2 gap-2 sm:gap-3 relative z-10 overflow-hidden place-content-center mt-2">
                {actions.map((action) => (
                    <button
                        key={action.label}
                        onClick={() => navigate(action.path)}
                        className="flex flex-col justify-center items-center gap-1 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-[#fef9f3] hover:bg-white transition-all duration-300 group/btn shadow-md hover:shadow-xl border border-white/20 hover:-translate-y-1"
                    >
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover/btn:rotate-6 transition-transform">
                            <action.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${action.color}`} />
                        </div>
                        <span className="block text-[#512c31] text-[10px] sm:text-xs font-black leading-tight text-center mt-1">{action.label}</span>
                        <span className="hidden sm:block text-[#512c31]/50 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest leading-tight text-center">{action.subLabel}</span>
                    </button>
                ))}
            </div>

            <div className="mt-3 sm:mt-4 flex items-center justify-between text-[10px] sm:text-xs text-white/80 relative z-10">
                <span className="font-bold uppercase tracking-widest">Total Actions</span>
                <span className="bg-white text-[#e8919a] px-2 py-0.5 rounded-md font-black shadow-sm">12</span>
            </div>
        </div>
    );
}
