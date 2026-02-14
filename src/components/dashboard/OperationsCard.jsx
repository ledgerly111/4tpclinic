import { useEffect, useState } from 'react';
import { ArrowUpRight, Clock } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { cn } from '../../lib/utils';

export function OperationsCard() {
    const { staffMembers } = useStore();
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
        <div className="bg-gradient-to-br from-[#9ca3af] to-[#d1d5db] rounded-2xl sm:rounded-3xl p-4 sm:p-5 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
                <div>
                    <h2 className="text-sm sm:text-lg font-bold text-[#1f2937] tracking-wide leading-tight">OPERATIONAL</h2>
                    <h2 className="text-sm sm:text-lg font-bold text-[#1f2937] tracking-wide leading-tight">TIMING</h2>
                </div>
                <button className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/30 flex items-center justify-center text-[#1f2937] hover:bg-white/40 transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
            </div>

            {/* Analog Clock */}
            <div className="flex-1 flex items-center justify-center py-2">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                    {/* Clock face */}
                    <div className="absolute inset-0 rounded-full bg-white/50 backdrop-blur-sm" />
                    
                    {/* Hour markers */}
                    {[...Array(12)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-0.5 h-1.5 sm:h-2 bg-[#1f2937]/40 rounded-full"
                            style={{
                                top: '8%',
                                left: '50%',
                                transformOrigin: '50% 2100%',
                                transform: `translateX(-50%) rotate(${i * 30}deg)`,
                            }}
                        />
                    ))}

                    {/* Numbers - Hidden on smallest screens */}
                    {[12, 3, 6, 9].map((num, i) => {
                        const angles = [0, 90, 180, 270];
                        const radius = 42;
                        const rad = (angles[i] - 90) * (Math.PI / 180);
                        const x = 50 + radius * Math.cos(rad);
                        const y = 50 + radius * Math.sin(rad);
                        return (
                            <span
                                key={num}
                                className="hidden sm:block absolute text-[10px] font-medium text-[#1f2937]/60 transform -translate-x-1/2 -translate-y-1/2"
                                style={{ left: `${x}%`, top: `${y}%` }}
                            >
                                {num}
                            </span>
                        );
                    })}

                    {/* Hour hand */}
                    <div
                        className="absolute w-1 sm:w-1.5 h-6 sm:h-8 bg-[#1f2937] rounded-full origin-bottom"
                        style={{
                            bottom: '50%',
                            left: '50%',
                            transform: `translateX(-50%) rotate(${hourAngle}deg)`,
                        }}
                    />

                    {/* Minute hand */}
                    <div
                        className="absolute w-0.5 sm:w-1 h-8 sm:h-10 bg-[#1f2937]/70 rounded-full origin-bottom"
                        style={{
                            bottom: '50%',
                            left: '50%',
                            transform: `translateX(-50%) rotate(${minuteAngle}deg)`,
                        }}
                    />

                    {/* Second hand */}
                    <div
                        className="absolute w-0.5 h-8 sm:h-10 bg-[#ff7a6b] rounded-full origin-bottom"
                        style={{
                            bottom: '50%',
                            left: '50%',
                            transform: `translateX(-50%) rotate(${secondAngle}deg)`,
                        }}
                    />

                    {/* Center dot */}
                    <div className="absolute w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#1f2937] rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />

                    {/* Peak indicator arc */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 128 128">
                        <circle
                            cx="64"
                            cy="64"
                            r="52"
                            fill="none"
                            stroke="#ff7a6b"
                            strokeWidth="3"
                            strokeDasharray="35 327"
                            strokeDashoffset="-82"
                            strokeLinecap="round"
                            className="opacity-60"
                        />
                    </svg>
                </div>
            </div>

            {/* Bottom Stats */}
            <div className="mt-2 space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ff7a6b]" />
                        <span className="text-[#1f2937]/70 text-[10px] sm:text-xs font-medium">Peak</span>
                    </div>
                    <span className="text-[#1f2937]/70 text-[10px] sm:text-xs">UTC-5</span>
                </div>
                <div className="flex items-center justify-between bg-white/30 backdrop-blur-sm rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white/50" />
                        <span className="text-[#1f2937]/70 text-[10px] sm:text-xs font-medium">Time</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#1f2937]/60" />
                        <span className="text-[#1f2937] text-xs sm:text-sm font-mono font-medium">
                            {String(hours).padStart(2, '0')}:
                            {String(minutes).padStart(2, '0')}:
                            {String(seconds).padStart(2, '0')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
