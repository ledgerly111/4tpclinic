import { Calendar, ArrowUpRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export function AppointmentsCard() {
    const { appointments } = useStore();
    const visibleAppointments = appointments.slice(0, 3);

    return (
        <div className="bg-gradient-to-br from-[#60a5fa] to-[#93c5fd] rounded-2xl sm:rounded-3xl p-4 sm:p-5 h-full flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-blue-400/20 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>

            <div className="flex items-center justify-between mb-3 sm:mb-4 relative z-10">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-bold text-[#0f172a] leading-none">Appointments</h2>
                        <p className="text-[#0f172a]/70 text-[10px] sm:text-xs mt-0.5 font-medium">Today's Schedule</p>
                    </div>
                </div>
                <button className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/30 hover:bg-white/40 backdrop-blur-md flex items-center justify-center text-[#0f172a] transition-all">
                    <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-2 sm:space-y-3 relative z-10 custom-scrollbar">
                {visibleAppointments.length === 0 && (
                    <div className="h-full flex items-center justify-center text-[#0f172a]/80 text-xs sm:text-sm font-medium">
                        No appointments yet
                    </div>
                )}
                {visibleAppointments.map((apt) => (
                    <div key={apt.id} className="bg-white/40 backdrop-blur-md rounded-xl sm:rounded-2xl p-2.5 sm:p-3 flex items-center gap-2 sm:gap-3">
                        <div className="flex flex-col items-center justify-center min-w-[50px] border-r border-[#0f172a]/10 pr-2 sm:pr-3">
                            <span className="text-[10px] sm:text-xs font-bold text-[#0f172a]">{apt.time || '--:--'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-xs sm:text-sm font-bold text-[#0f172a] truncate">
                                {apt.patient || 'Unnamed Patient'}
                            </h3>
                            <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
                                <span className="text-[10px] sm:text-xs text-[#0f172a]/70 truncate">{apt.type || 'Consultation'}</span>
                                <span className="w-1 h-1 rounded-full bg-[#0f172a]/30"></span>
                                <span className="text-[9px] sm:text-[10px] bg-white/30 px-1.5 py-0.5 rounded text-[#0f172a] font-medium">
                                    {apt.doctor || 'Doctor'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-[#0f172a]/10 flex items-center justify-between relative z-10">
                <span className="text-[10px] sm:text-xs font-semibold text-[#0f172a]">{appointments.length} Total</span>
                <button className="text-[10px] sm:text-xs font-bold text-[#0f172a] hover:underline flex items-center gap-1">
                    View All <ArrowUpRight className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
}
