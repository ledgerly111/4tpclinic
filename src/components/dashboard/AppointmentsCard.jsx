import { Clock, MoreHorizontal, Calendar, ArrowUpRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { cn } from '../../lib/utils';

export function AppointmentsCard() {
    const { theme } = useStore();
    const isDark = theme === 'dark';
    
    const appointments = [
        {
            id: 1,
            patient: "Emma Thompson",
            treatment: "Root Canal",
            time: "09:00 AM",
            doctor: "Dr. Sarah",
            status: "In Progress",
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"
        },
        {
            id: 2,
            patient: "James Wilson",
            treatment: "Check-up",
            time: "10:30 AM",
            doctor: "Dr. Mike",
            status: "Confirmed",
            image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"
        },
        {
            id: 3,
            patient: "Michael Brown",
            treatment: "Cleaning",
            time: "11:45 AM",
            doctor: "Dr. Sarah",
            status: "Pending",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
        }
    ];

    return (
        <div className="bg-gradient-to-br from-[#60a5fa] to-[#93c5fd] rounded-2xl sm:rounded-3xl p-4 sm:p-5 h-full flex flex-col relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-blue-400/20 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>

            {/* Header */}
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

            {/* Appointments List */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 sm:space-y-3 relative z-10 custom-scrollbar">
                {appointments.map((apt) => (
                    <div key={apt.id} className="bg-white/40 backdrop-blur-md rounded-xl sm:rounded-2xl p-2.5 sm:p-3 flex items-center gap-2 sm:gap-3 hover:bg-white/50 transition-colors cursor-pointer group">
                        {/* Time & Status Indicator */}
                        <div className="flex flex-col items-center justify-center min-w-[45px] sm:min-w-[50px] border-r border-[#0f172a]/10 pr-2 sm:pr-3">
                            <span className="text-[10px] sm:text-xs font-bold text-[#0f172a]">{apt.time.split(' ')[0]}</span>
                            <span className="text-[9px] sm:text-[10px] text-[#0f172a]/60 font-medium">{apt.time.split(' ')[1]}</span>
                        </div>

                        {/* Patient Info */}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-xs sm:text-sm font-bold text-[#0f172a] truncate group-hover:text-blue-900 transition-colors">
                                {apt.patient}
                            </h3>
                            <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
                                <span className="text-[10px] sm:text-xs text-[#0f172a]/70 truncate">{apt.treatment}</span>
                                <span className="w-1 h-1 rounded-full bg-[#0f172a]/30"></span>
                                <span className="text-[9px] sm:text-[10px] bg-white/30 px-1.5 py-0.5 rounded text-[#0f172a] font-medium">
                                    {apt.doctor}
                                </span>
                            </div>
                        </div>

                        {/* Avatar */}
                        <img
                            src={apt.image}
                            alt={apt.patient}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white/50 object-cover flex-shrink-0"
                        />
                    </div>
                ))}
            </div>

            {/* Footer / Action */}
            <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-[#0f172a]/10 flex items-center justify-between relative z-10">
                <span className="text-[10px] sm:text-xs font-semibold text-[#0f172a]">3 Remaining</span>
                <button className="text-[10px] sm:text-xs font-bold text-[#0f172a] hover:underline flex items-center gap-1">
                    View All <ArrowUpRight className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
}
