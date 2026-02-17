import { useState } from 'react';
import { MapPin, ChevronDown, ArrowUpRight, TrendingUp } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { cn } from '../../lib/utils';

export function PointsCard() {
    const { theme } = useStore();
    const isDark = theme === 'dark';
    const [filter, setFilter] = useState('all points');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [rateFilter, setRateFilter] = useState('profitability rate');
    const [showRateDropdown, setShowRateDropdown] = useState(false);

    // Map points data
    const mapPoints = [
        { id: 1, x: 25, y: 65, label: 'Main Clinic', value: '+1.1%', active: true },
        { id: 2, x: 15, y: 80, label: 'Branch A', value: '+0.8%', active: false },
        { id: 3, x: 70, y: 75, label: 'Branch B', value: '+2.3%', active: false },
    ];

    return (
        <div className="bg-gradient-to-br from-[#60a5fa] to-[#93c5fd] rounded-3xl p-5 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-[#0f172a] tracking-wide">POINTS</h2>
                <div className="flex items-center gap-2">
                    {/* Filter Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                            className="flex items-center gap-2 bg-white/30 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm text-[#0f172a] hover:bg-white/40 transition-colors"
                        >
                            {filter}
                            <ChevronDown className="w-3 h-3" />
                        </button>
                        {showFilterDropdown && (
                            <div className={cn(
                                "absolute top-full right-0 mt-2 w-32 rounded-xl border shadow-xl z-50 overflow-hidden",
                                isDark ? "bg-[#1e1e1e] border-gray-800" : "bg-white border-gray-200"
                            )}>
                                {['all points', 'active only', 'top rated'].map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => {
                                            setFilter(f);
                                            setShowFilterDropdown(false);
                                        }}
                                        className={cn(
                                            "w-full text-left px-3 py-2 text-sm transition-colors",
                                            isDark ? "text-gray-300 hover:bg-[#2a2a2a] hover:text-white" : "text-gray-700 hover:bg-gray-100"
                                        )}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-[#0f172a] hover:bg-white/40 transition-colors">
                        <ArrowUpRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Rate Filter */}
            <div className="relative mb-3">
                <button
                    onClick={() => setShowRateDropdown(!showRateDropdown)}
                    className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm text-[#0f172a]/70 hover:bg-white/30 transition-colors"
                >
                    {rateFilter}
                    <ChevronDown className="w-3 h-3" />
                </button>
                {showRateDropdown && (
                    <div className={cn(
                        "absolute top-full left-0 mt-2 w-40 rounded-xl border shadow-xl z-50 overflow-hidden",
                        isDark ? "bg-[#1e1e1e] border-gray-800" : "bg-white border-gray-200"
                    )}>
                        {['profitability rate', 'patient count', 'revenue'].map((r) => (
                            <button
                                key={r}
                                onClick={() => {
                                    setRateFilter(r);
                                    setShowRateDropdown(false);
                                }}
                                className={cn(
                                    "w-full text-left px-3 py-2 text-sm transition-colors",
                                    isDark ? "text-gray-300 hover:bg-[#2a2a2a] hover:text-white" : "text-gray-700 hover:bg-gray-100"
                                )}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Map Visualization */}
            <div className="flex-1 relative overflow-hidden rounded-2xl bg-[#0f172a]/10">
                {/* Abstract Map Grid */}
                <svg className="absolute inset-0 w-full h-full opacity-30">
                    <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#0f172a" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                    {/* Curved map lines */}
                    <path
                        d="M 0,80 Q 50,60 100,70 T 200,50 T 300,60"
                        fill="none"
                        stroke="#0f172a"
                        strokeWidth="1"
                        opacity="0.3"
                    />
                    <path
                        d="M 0,50 Q 80,40 150,55 T 280,45"
                        fill="none"
                        stroke="#0f172a"
                        strokeWidth="1"
                        opacity="0.2"
                    />
                </svg>

                {/* Map Points */}
                {mapPoints.map((point) => (
                    <div
                        key={point.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${point.x}%`, top: `${point.y}%` }}
                    >
                        {/* Location Marker */}
                        <div className="relative">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${point.active
                                ? 'bg-[#0f172a]'
                                : 'bg-[#ff7a6b]'
                                }`}>
                                <MapPin className="w-4 h-4 text-white" />
                            </div>

                            {/* Value Badge */}
                            {point.active && (
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0f172a] text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap">
                                    <div className="flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" />
                                        {point.value}
                                    </div>
                                </div>
                            )}

                            {/* Tooltip */}
                            {point.active && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-[#0f172a] text-white text-xs px-3 py-2 rounded-xl whitespace-nowrap z-10">
                                    <p className="font-medium">{point.label}</p>
                                    <p className="text-gray-400 text-[10px]">Astoria, NY</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
