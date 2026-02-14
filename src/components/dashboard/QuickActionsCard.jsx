import { useState } from 'react';
import { ChevronDown, Users, Calendar, FileText, Package, PlusCircle, ArrowUpRight } from 'lucide-react';

export function QuickActionsCard() {
    const [timeRange, setTimeRange] = useState('This Week');
    const [showDropdown, setShowDropdown] = useState(false);

    const actions = [
        {
            icon: Users,
            label: 'New Patient',
            subLabel: 'Register',
            color: 'text-[#5c6aff]',
        },
        {
            icon: Calendar,
            label: 'Schedule',
            subLabel: 'Appointment',
            color: 'text-[#5c6aff]',
        },
        {
            icon: FileText,
            label: 'Invoice',
            subLabel: 'Create New',
            color: 'text-[#5c6aff]',
        },
        {
            icon: Package,
            label: 'Inventory',
            subLabel: 'Add Stock',
            color: 'text-[#5c6aff]',
        },
    ];

    return (
        <div className="bg-[#5c6aff] rounded-3xl p-5 h-full flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div>
                    <h2 className="text-lg font-bold text-white tracking-wide uppercase">Quick Actions</h2>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="flex items-center gap-2 bg-white rounded-full px-3 py-1.5 text-xs font-bold text-[#5c6aff] hover:bg-gray-100 transition-colors"
                    >
                        {timeRange}
                        <ChevronDown className="w-3 h-3" />
                    </button>
                    {showDropdown && (
                        <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-xl shadow-xl z-50 overflow-hidden py-1">
                            {['This Week', 'Today', 'This Month'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => {
                                        setTimeRange(range);
                                        setShowDropdown(false);
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 font-medium transition-colors"
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Action Buttons List */}
            <div className="flex-1 grid grid-cols-3 gap-2 relative z-10 overflow-y-auto min-h-0 pr-1 custom-scrollbar">
                {actions.map((action) => (
                    <button
                        key={action.label}
                        className="flex flex-col justify-center items-center gap-0.5 p-1.5 rounded-lg bg-white hover:bg-gray-50 transition-all duration-300 group shadow-sm min-h-[60px]"
                    >
                        <div className="w-6 h-6 rounded-full bg-[#5c6aff]/10 flex items-center justify-center mb-0.5 group-hover:scale-110 transition-transform">
                            <action.icon className={`w-3 h-3 ${action.color}`} />
                        </div>
                        <span className="block text-[#1e1e1e] text-[10px] font-bold leading-tight text-center">{action.label}</span>
                        <span className="block text-gray-400 text-[8px] font-medium leading-tight text-center">{action.subLabel}</span>
                    </button>
                ))}
            </div>

            {/* Footer Summary */}
            <div className="mt-4 flex items-center justify-between text-xs text-white/80 relative z-10">
                <span className="font-medium">Total Actions</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-md text-white font-bold">12</span>
            </div>
        </div>
    );
}
