import { useEffect } from 'react';
import { RevenueCard } from '../components/dashboard/RevenueCard';
import { AlertCard } from '../components/dashboard/AlertCard';
import { QuickActionsCard } from '../components/dashboard/QuickActionsCard';
import { AppointmentsCard } from '../components/dashboard/AppointmentsCard';
import { OperationsCard } from '../components/dashboard/OperationsCard';
import { InventorySellCard } from '../components/dashboard/InventorySellCard';
import { useStore } from '../context/StoreContext';

export function Dashboard() {
    const { refreshDashboard } = useStore();

    useEffect(() => {
        refreshDashboard();
        const intervalId = setInterval(() => {
            refreshDashboard();
        }, 15000);
        return () => clearInterval(intervalId);
    }, [refreshDashboard]);

    return (
        <div className="pb-4">
            {/* Main Grid Layout - Responsive */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
                {/* Row 1: Revenue Card - Full width on mobile, 7 cols on desktop */}
                <div className="col-span-1 lg:col-span-7 h-auto min-h-[320px] sm:min-h-[360px] lg:h-[440px]">
                    <RevenueCard />
                </div>

                {/* Right Column - Alert + Quick Actions */}
                <div className="col-span-1 lg:col-span-5 flex flex-col gap-4 lg:gap-5 h-auto lg:h-[440px]">
                    <div className="h-auto min-h-[80px] lg:h-[100px]">
                        <AlertCard />
                    </div>
                    <div className="flex-1 min-h-[220px] sm:min-h-[240px] lg:h-[320px]">
                        <QuickActionsCard />
                    </div>
                </div>

                {/* Row 2: Three cards - Stack on mobile, side by side on desktop */}
                <div className="col-span-1 md:col-span-1 lg:col-span-4 h-auto min-h-[280px] sm:min-h-[300px] lg:h-[280px]">
                    <AppointmentsCard />
                </div>

                <div className="col-span-1 md:col-span-1 lg:col-span-4 h-auto min-h-[280px] sm:min-h-[300px] lg:h-[280px]">
                    <OperationsCard />
                </div>

                <div className="col-span-1 md:col-span-1 lg:col-span-4 h-auto min-h-[280px] sm:min-h-[300px] lg:h-[280px]">
                    <InventorySellCard />
                </div>
            </div>
        </div>
    );
}
