import { AlertTriangle, ArrowUpRight, Clock } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useEffect, useState } from 'react';

export function AlertCard() {
    const { inventoryAlerts } = useStore();
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
        <div className="bg-[#1e1e1e] rounded-3xl p-4 h-full flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    hasCriticalAlerts 
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                        : 'bg-gradient-to-br from-green-400 to-emerald-500'
                }`}>
                    <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-white font-bold text-base uppercase tracking-wide">
                        {hasCriticalAlerts ? 'Stabilizing Inventory' : 'All Systems Good'}
                    </h3>
                    <p className="text-gray-400 text-sm">
                        {hasCriticalAlerts 
                            ? `Approve critical alerts and check inventory risk.` 
                            : 'No critical alerts at this time.'}
                    </p>
                    {hasCriticalAlerts && (
                        <p className="text-gray-400 text-sm mt-0.5">
                            Shift ends in <span className="text-yellow-400 font-mono">
                                {String(timeLeft.hours).padStart(2, '0')}:
                                {String(timeLeft.minutes).padStart(2, '0')}:
                                {String(timeLeft.seconds).padStart(2, '0')}
                            </span> hours.
                        </p>
                    )}
                </div>
            </div>
            <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors flex-shrink-0">
                <ArrowUpRight className="w-5 h-5" />
            </button>
        </div>
    );
}
