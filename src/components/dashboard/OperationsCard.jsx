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
            "rounded-2xl sm:rounded-3xl p-4 sm:p-5 h-full flex flex-col transition-colors duration-300",
            isDark ? "bg-[#1e1e1e]" : "bg-white border border-gray-200 shadow-sm"
        )}>
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
                <div>
                    <h2 className={cn("text-sm sm:text-lg font-bold tracking-wide leading-tight", isDark ? "text-white" : "text-gray-900")}>OPERATIONAL</h2>
                    <h2 className={cn("text-sm sm:text-lg font-bold tracking-wide leading-tight", isDark ? "text-white" : "text-gray-900")}>TIMING</h2>
                </div>
                <button className={cn(
                    "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors",
                    isDark ? "bg-white/10 text-white hover:bg-white/20" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}>
                    <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
            </div>

            {/* Analog Clock */}
            <div className="flex-1 flex items-center justify-center py-2">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                    {/* Clock face */}
                    <div className={cn("absolute inset-0 rounded-full backdrop-blur-sm border transition-colors", isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200")} />

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
                                    isDark ? "bg-white/40" : "bg-gray-400",
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
                        className={cn("absolute w-1 sm:w-1.5 h-6 sm:h-8 rounded-full origin-bottom transition-colors", isDark ? "bg-white" : "bg-gray-900")}
                        style={{ bottom: '50%', left: '50%', transform: `translateX(-50%) rotate(${hourAngle}deg)` }}
                    />

                    {/* Minute hand */}
                    <div
                        className={cn("absolute w-0.5 sm:w-1 h-8 sm:h-10 rounded-full origin-bottom transition-colors", isDark ? "bg-white/60" : "bg-gray-600")}
                        style={{ bottom: '50%', left: '50%', transform: `translateX(-50%) rotate(${minuteAngle}deg)` }}
                    />

                    {/* Second hand */}
                    <div
                        className="absolute w-0.5 h-8 sm:h-10 bg-[#ff7a6b] rounded-full origin-bottom"
                        style={{ bottom: '50%', left: '50%', transform: `translateX(-50%) rotate(${secondAngle}deg)` }}
                    />

                    {/* Center dot */}
                    <div className={cn("absolute w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2", isDark ? "bg-white" : "bg-gray-900")} />
                </div>
            </div>

            {/* Bottom Stats */}
            <div className="mt-2 space-y-2">
                <div className={cn(
                    "flex items-center justify-between rounded-xl px-3 py-2 transition-colors",
                    isDark ? "bg-white/5" : "bg-gray-50 border border-gray-100"
                )}>
                    <div className="flex items-center gap-2">
                        <Clock className={cn("w-3.5 h-3.5", isDark ? "text-gray-500" : "text-gray-400")} />
                        <span className={cn("text-xs font-mono font-medium", isDark ? "text-white" : "text-gray-900")}>
                            {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                        </span>
                    </div>
                    <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", isDark ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-700")}>
                        {onDutyCount}/{totalStaff} Active
                    </span>
                </div>
            </div>
        </div>
    );
}
