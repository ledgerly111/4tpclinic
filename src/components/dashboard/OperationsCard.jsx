import { useEffect, useState } from 'react';
import { ArrowUpRight, Clock } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { cn } from '../../lib/utils';

export function OperationsCard() {
    const { staffMembers, theme } = useStore();
    const isDark = theme === 'dark';
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const seconds = currentTime.getSeconds();

    // Calculate clock hand angles
    const hourAngle = (hours % 12) * 30 + minutes * 0.5;
    const minuteAngle = minutes * 6;
    const secondAngle = seconds * 6;

    const onDutyCount = staffMembers.filter(s => s.status === 'on-duty').length;
    const totalStaff = staffMembers.length;

    return (
        <div className={cn(
            "rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 h-full flex flex-col transition-all duration-300 shadow-xl border-4 group",
            isDark ? "bg-[#1e1e1e] border-white/5" : "bg-white border-gray-50 hover:shadow-2xl hover:-translate-y-1"
        )}>
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
                <div>
                    <h2 className={cn("text-xl sm:text-2xl font-black tracking-tight leading-none mb-1", isDark ? "text-white" : "text-[#512c31]")}>Operational</h2>
                    <h2 className={cn("text-[10px] sm:text-xs font-bold uppercase tracking-widest", isDark ? "text-white/40" : "text-[#512c31]/60")}>Timing</h2>
                </div>
                <button className={cn(
                    "w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all bg-[#fef9f3] group-hover:bg-[#e8919a] group-hover:text-white group-hover:rotate-12",
                    isDark ? "bg-white/10 text-white" : "text-[#512c31]"
                )}>
                    <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
            </div>

            {/* Analog Clock */}
            <div className="flex-1 flex items-center justify-center py-2">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                    {/* Clock face */}
                    <div className={cn("absolute inset-0 rounded-full backdrop-blur-sm border-4 transition-colors", isDark ? "bg-white/5 border-white/10" : "bg-white shadow-inner border-[#fef9f3]")} />

                    {/* Hour markers */}
                    {[...Array(12)].map((_, i) => {
                        const angle = i * 30 - 90;
                        const rad = (angle * Math.PI) / 180;
                        const radius = 38;
                        const x = 50 + radius * Math.cos(rad);
                        const y = 50 + radius * Math.sin(rad);
                        const isQuarter = i % 3 === 0;

                        return (
                            <div
                                key={i}
                                className={cn(
                                    "absolute rounded-full transition-colors",
                                    isDark ? "bg-white/40" : "bg-[#512c31]/20",
                                    isQuarter ? "w-1 h-2.5" : "w-0.5 h-1.5"
                                )}
                                style={{
                                    left: `${x}%`,
                                    top: `${y}%`,
                                    transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
                                }}
                            />
                        );
                    })}

                    {/* Hour hand */}
                    <div
                        className={cn("absolute w-1 sm:w-1.5 h-6 sm:h-8 rounded-full origin-bottom transition-colors", isDark ? "bg-white" : "bg-[#512c31]")}
                        style={{ bottom: '50%', left: '50%', transform: `translateX(-50%) rotate(${hourAngle}deg)` }}
                    />

                    {/* Minute hand */}
                    <div
                        className={cn("absolute w-0.5 sm:w-1 h-8 sm:h-10 rounded-full origin-bottom transition-colors", isDark ? "bg-white/60" : "bg-[#512c31]/60")}
                        style={{ bottom: '50%', left: '50%', transform: `translateX(-50%) rotate(${minuteAngle}deg)` }}
                    />

                    {/* Second hand */}
                    <div
                        className="absolute w-0.5 h-8 sm:h-10 bg-[#e8919a] rounded-full origin-bottom shadow-md"
                        style={{ bottom: '50%', left: '50%', transform: `translateX(-50%) rotate(${secondAngle}deg)` }}
                    />

                    {/* Center dot */}
                    <div className={cn("absolute w-2 h-2 sm:w-3 sm:h-3 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2", isDark ? "bg-white border-[#1e1e1e]" : "bg-[#512c31] border-white shadow-sm")} />
                </div>
            </div>

            {/* Bottom Stats */}
            <div className="mt-2 space-y-2">
                <div className={cn(
                    "flex items-center justify-between rounded-2xl px-3 py-2 sm:py-3 transition-colors",
                    isDark ? "bg-white/5" : "bg-[#fef9f3]"
                )}>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <Clock className={cn("w-4 h-4 sm:w-5 sm:h-5", isDark ? "text-gray-500" : "text-[#512c31]/40")} />
                        <span className={cn("text-xs sm:text-sm font-black tracking-widest", isDark ? "text-white" : "text-[#512c31]")}>
                            {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                        </span>
                    </div>
                    <span className={cn("text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full", isDark ? "bg-green-500/20 text-green-400" : "bg-[#512c31]/5 text-[#512c31]")}>
                        {onDutyCount}/{totalStaff} Active
                    </span>
                </div>
            </div>
        </div>
    );
}
