import { RevenueCard } from '../components/dashboard/RevenueCard';
import { AlertCard } from '../components/dashboard/AlertCard';
import { QuickActionsCard } from '../components/dashboard/QuickActionsCard';
import { AppointmentsCard } from '../components/dashboard/AppointmentsCard';
import { OperationsCard } from '../components/dashboard/OperationsCard';
import { AIAssistantCard } from '../components/dashboard/AIAssistantCard';

export function Dashboard() {
    return (
        <div className="pb-4">
            {/* Main Grid Layout - 2 rows */}
            <div className="grid grid-cols-12 gap-5">
                {/* Row 1: Revenue (left, large) + Alert + Quick Actions (right, stacked) */}

                {/* Revenue Card - spans 7 columns */}
                <div className="col-span-12 lg:col-span-7 h-auto min-h-[380px] lg:h-[380px]">
                    <RevenueCard />
                </div>

                {/* Right Column - Alert + Quick Actions stacked */}
                <div className="col-span-12 lg:col-span-5 flex flex-col gap-5 h-auto lg:h-[380px]">
                    <div className="h-[100px]">
                        <AlertCard />
                    </div>
                    <div className="flex-1 min-h-[250px] lg:min-h-0">
                        <QuickActionsCard />
                    </div>
                </div>

                {/* Row 2: Three cards - Appointments, Operations, AI */}

                {/* Appointments Card (Replaces Points) */}
                <div className="col-span-12 md:col-span-6 lg:col-span-4 h-[280px]">
                    <AppointmentsCard />
                </div>

                {/* Operations Card (Clock) */}
                <div className="col-span-12 md:col-span-6 lg:col-span-4 h-[280px]">
                    <OperationsCard />
                </div>

                {/* AI Assistant Card */}
                <div className="col-span-12 lg:col-span-4 h-[280px]">
                    <AIAssistantCard />
                </div>
            </div>
        </div>
    );
}
