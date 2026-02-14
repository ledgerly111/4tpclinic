import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, Calendar, Clock, User, Stethoscope, CheckCircle, Circle, XCircle } from 'lucide-react';

export function Appointments() {
    const { appointments, updateAppointmentStatus } = useStore();
    const [selectedDate, setSelectedDate] = useState(new Date());

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentWeek = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - d.getDay() + i);
        return d;
    });

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-400" />;
            case 'in-progress':
                return <Circle className="w-5 h-5 text-yellow-400 animate-pulse" />;
            default:
                return <Circle className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Appointments</h1>
                    <p className="text-gray-400">Schedule and manage patient appointments</p>
                </div>
                <button className="bg-[#ff7a6b] text-white px-4 py-2 rounded-xl hover:bg-[#ff6b5b] flex items-center gap-2 transition-colors">
                    <Plus className="w-4 h-4" />
                    New Appointment
                </button>
            </div>

            {/* Calendar Strip */}
            <div className="bg-[#1e1e1e] rounded-2xl p-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white font-semibold flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#ff7a6b]" />
                        {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h2>
                </div>
                <div className="flex justify-between gap-2">
                    {currentWeek.map((date, idx) => {
                        const isToday = date.toDateString() === new Date().toDateString();
                        const isSelected = date.toDateString() === selectedDate.toDateString();
                        return (
                            <button
                                key={idx}
                                onClick={() => setSelectedDate(date)}
                                className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                                    isSelected
                                        ? 'bg-[#ff7a6b] text-white'
                                        : isToday
                                        ? 'bg-[#ff7a6b]/20 text-[#ff7a6b]'
                                        : 'bg-[#0f0f0f] text-gray-400 hover:bg-[#252525]'
                                }`}
                            >
                                <span className="text-xs font-medium">{weekDays[date.getDay()]}</span>
                                <span className="text-xl font-bold mt-1">{date.getDate()}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Appointments List */}
            <div className="bg-[#1e1e1e] rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#8b5cf6]" />
                    Today's Schedule
                </h3>
                <div className="space-y-3">
                    {appointments.map((apt) => (
                        <div
                            key={apt.id}
                            className="flex items-center gap-4 p-4 bg-[#0f0f0f] rounded-xl hover:bg-[#151515] transition-colors group"
                        >
                            <div className="flex items-center gap-3 min-w-[100px]">
                                {getStatusIcon(apt.status)}
                                <span className="text-white font-medium">{apt.time}</span>
                            </div>
                            
                            <div className="flex-1 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#60a5fa] to-[#8b5cf6] flex items-center justify-center">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-white font-medium">{apt.patient}</p>
                                    <p className="text-gray-400 text-sm flex items-center gap-1">
                                        <Stethoscope className="w-3 h-3" />
                                        {apt.type}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-gray-400 text-sm">{apt.doctor}</span>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {apt.status !== 'completed' && (
                                        <button
                                            onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                                            className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
                                        <XCircle className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
