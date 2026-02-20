import { Calendar, ArrowUpRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export function AppointmentsCard() {
    const { appointments } = useStore();
    const visibleAppointments = appointments.slice(0, 3);

    return (
        <div className="bg-[#fef9f3] border-4 border-white/50 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 h-full flex flex-col relative overflow-hidden group shadow-xl">
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-[#e8919a]/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-[#512c31]/5 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>

            <div className="flex items-center justify-between mb-3 sm:mb-4 relative z-10">
                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#512c31]/5 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-[#512c31]" />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-[#512c31] leading-none mb-1">Appointments</h2>
                        <p className="text-[#512c31]/60 text-[10px] sm:text-xs font-bold uppercase tracking-widest">Today's Schedule</p>
                    </div>
                </div>
                <button className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white hover:bg-[#512c31] border border-gray-100 flex items-center justify-center text-[#512c31] hover:text-white transition-all shadow-sm group-hover:rotate-12">
                    <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-2 sm:space-y-3 relative z-10 custom-scrollbar">
                {visibleAppointments.length === 0 && (
                    <div className="h-full flex items-center justify-center text-[#512c31]/60 text-xs sm:text-sm font-bold uppercase tracking-widest">
                        No appointments yet
                    </div>
                )}
                {visibleAppointments.map((apt) => (
                    <div key={apt.id} className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
                        <div className="flex flex-col items-center justify-center min-w-[50px] border-r border-[#512c31]/10 pr-3 sm:pr-4">
                            <span className="text-[10px] sm:text-xs font-black text-[#512c31]">{apt.time || '--:--'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-bold text-[#512c31] truncate mb-1">
                                {apt.patient || 'Unnamed Patient'}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] sm:text-xs font-medium text-[#512c31]/60 truncate">{apt.type || 'Consultation'}</span>
                                <span className="w-1 h-1 rounded-full bg-[#e8919a]"></span>
                                <span className="text-[9px] sm:text-[10px] bg-[#fef9f3] border border-[#512c31]/5 px-2 py-0.5 rounded-full text-[#512c31] font-bold">
                                    {apt.doctor || 'Doctor'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#512c31]/10 flex items-center justify-between relative z-10">
                <span className="text-[10px] sm:text-xs font-bold text-[#512c31]/60 uppercase tracking-widest">{appointments.length} Total</span>
                <button className="text-[10px] sm:text-xs font-black text-[#512c31] hover:text-[#e8919a] flex items-center gap-1 transition-colors">
                    View All <ArrowUpRight className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
}
