import { AlertTriangle, ArrowUpRight, Clock } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';

export function AlertCard() {
    const { inventoryAlerts, theme } = useStore();
    const isDark = theme === 'dark';
    const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 59, seconds: 12 });

    // Countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) {
                    return { ...prev, seconds: prev.seconds - 1 };
                } else if (prev.minutes > 0) {
                    return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                } else if (prev.hours > 0) {
                    return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
                }
                return prev;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const criticalAlerts = inventoryAlerts.filter(a => a.status === 'critical');
    const hasCriticalAlerts = criticalAlerts.length > 0;

    return (
        <div className={cn(
            "rounded-2xl sm:rounded-3xl p-3 sm:p-4 h-full flex items-center justify-between transition-colors duration-300",
            isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200'
        )}>
            <div className="flex items-center gap-3 sm:gap-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    hasCriticalAlerts 
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                        : 'bg-gradient-to-br from-green-400 to-emerald-500'
                }`}>
                    <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                    <h3 className={cn(
                        "font-bold text-sm sm:text-base uppercase tracking-wide truncate",
                        isDark ? 'text-white' : 'text-gray-900'
                    )}>
                        {hasCriticalAlerts ? 'Stabilizing Inventory' : 'All Systems Good'}
                    </h3>
                    <p className={cn(
                        "text-xs sm:text-sm truncate",
                        isDark ? 'text-gray-400' : 'text-gray-600'
                    )}>
                        {hasCriticalAlerts 
                            ? `Approve critical alerts and check inventory risk.` 
                            : 'No critical alerts at this time.'}
                    </p>
                    {hasCriticalAlerts && (
                        <p className={cn(
                            "text-xs sm:text-sm mt-0.5",
                            isDark ? 'text-gray-400' : 'text-gray-600'
                        )}>
                            Shift ends in <span className="text-yellow-500 font-mono">
                                {String(timeLeft.hours).padStart(2, '0')}:
                                {String(timeLeft.minutes).padStart(2, '0')}:
                                {String(timeLeft.seconds).padStart(2, '0')}
                            </span>
                        </p>
                    )}
                </div>
            </div>
            <button className={cn(
                "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ml-2",
                isDark 
                    ? 'bg-white/10 text-white hover:bg-white/20' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}>
                <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
        </div>
    );
}
