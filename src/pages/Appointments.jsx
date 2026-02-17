import { useEffect, useMemo, useState } from 'react';
import { Plus, Calendar, Clock, User, Stethoscope, CheckCircle, Circle, XCircle, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { cn } from '../lib/utils';
import { createAppointment, fetchAppointments, updateAppointmentStatus } from '../lib/clinicApi';

export function Appointments() {
    const { theme } = useStore();
    const isDark = theme === 'dark';
    const [appointments, setAppointments] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ patientName: '', type: '', doctor: '', time: '', notes: '' });

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentWeek = [...Array(7)].map((_, i) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() - d.getDay() + i);
        return d;
    });

    const dateKey = useMemo(() => selectedDate.toISOString().split('T')[0], [selectedDate]);

    const loadAppointments = async () => {
        try {
            const result = await fetchAppointments({ date: dateKey });
            setAppointments(result.appointments || []);
        } catch (err) {
            setError(err.message || 'Failed to load appointments.');
        }
    };

    useEffect(() => {
        loadAppointments();
    }, [dateKey]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-400" />;
            case 'in-progress':
                return <Circle className="w-5 h-5 text-yellow-400 animate-pulse" />;
            case 'cancelled':
                return <XCircle className="w-5 h-5 text-red-400" />;
            default:
                return <Circle className="w-5 h-5 text-gray-500" />;
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await createAppointment({ ...form, date: dateKey, status: 'scheduled' });
            setShowModal(false);
            setForm({ patientName: '', type: '', doctor: '', time: '', notes: '' });
            await loadAppointments();
        } catch (err) {
            setError(err.message || 'Failed to create appointment.');
        }
    };

    const handleStatusChange = async (id, status) => {
        setError('');
        try {
            await updateAppointmentStatus(id, status);
            setAppointments((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
        } catch (err) {
            setError(err.message || 'Failed to update appointment.');
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                <div>
                    <h1 className={cn('text-xl sm:text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>Appointments</h1>
                    <p className={cn('text-sm sm:text-base', isDark ? 'text-gray-400' : 'text-gray-600')}>Schedule and manage patient appointments</p>
                </div>
                <button onClick={() => setShowModal(true)} className="w-full sm:w-auto bg-[#ff7a6b] text-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl hover:bg-[#ff6b5b] flex items-center justify-center gap-2 transition-colors">
                    <Plus className="w-4 h-4" /><span className="text-sm sm:text-base">New Appointment</span>
                </button>
            </div>

            {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

            <div className={cn('rounded-xl sm:rounded-2xl p-3 sm:p-4', isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h2 className={cn('font-semibold flex items-center gap-2 text-sm sm:text-base', isDark ? 'text-white' : 'text-gray-900')}>
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#ff7a6b]" />
                        {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h2>
                </div>
                <div className="flex justify-between gap-1 sm:gap-2 overflow-x-auto pb-2">
                    {currentWeek.map((date, idx) => {
                        const isToday = date.toDateString() === new Date().toDateString();
                        const isSelected = date.toDateString() === selectedDate.toDateString();
                        return (
                            <button key={idx} onClick={() => setSelectedDate(date)} className={cn(
                                "flex flex-col items-center p-2 sm:p-3 rounded-xl transition-all min-w-[40px] sm:min-w-[60px]",
                                isSelected
                                    ? 'bg-[#ff7a6b] text-white shadow-lg shadow-[#ff7a6b]/20'
                                    : isToday
                                        ? 'bg-[#ff7a6b]/20 text-[#ff7a6b]'
                                        : isDark
                                            ? 'bg-[#0f0f0f] text-gray-400 hover:bg-[#252525]'
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'
                            )}>
                                <span className="text-[10px] sm:text-xs font-medium">{weekDays[date.getDay()]}</span>
                                <span className="text-base sm:text-xl font-bold mt-1">{date.getDate()}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className={cn('rounded-xl sm:rounded-2xl p-4 sm:p-6', isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200')}>
                <h3 className={cn('font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base', isDark ? 'text-white' : 'text-gray-900')}>
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#8b5cf6]" />
                    Selected Day Schedule
                </h3>
                {appointments.length === 0 && <p className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>No appointments for this date.</p>}
                <div className="space-y-3">
                    {appointments.map((apt) => (
                        <div key={apt.id} className={cn(
                            'flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl transition-colors group',
                            isDark ? 'bg-[#0f0f0f] hover:bg-[#151515]' : 'bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200'
                        )}>
                            <div className="flex items-center justify-between sm:justify-start gap-3 sm:min-w-[100px]">
                                <div className="flex items-center gap-2 sm:gap-3">{getStatusIcon(apt.status)}<span className={cn('font-medium text-sm sm:text-base', isDark ? 'text-white' : 'text-gray-900')}>{apt.time}</span></div>
                                <div className="flex sm:hidden gap-2">
                                    {apt.status !== 'completed' && <button onClick={() => handleStatusChange(apt.id, 'completed')} className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"><CheckCircle className="w-4 h-4" /></button>}
                                    <button onClick={() => handleStatusChange(apt.id, 'cancelled')} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"><XCircle className="w-4 h-4" /></button>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 sm:gap-4 flex-1">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#60a5fa] to-[#8b5cf6] flex items-center justify-center flex-shrink-0"><User className="w-4 h-4 sm:w-5 sm:h-5 text-white" /></div>
                                <div className="flex-1 min-w-0">
                                    <p className={cn('font-medium text-sm sm:text-base truncate', isDark ? 'text-white' : 'text-gray-900')}>{apt.patient}</p>
                                    <p className={cn('text-xs sm:text-sm flex items-center gap-1', isDark ? 'text-gray-400' : 'text-gray-600')}><Stethoscope className="w-3 h-3" />{apt.type}</p>
                                </div>
                            </div>

                            <div className="hidden sm:flex items-center gap-3">
                                <span className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>{apt.doctor}</span>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {apt.status !== 'completed' && <button onClick={() => handleStatusChange(apt.id, 'completed')} className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"><CheckCircle className="w-4 h-4" /></button>}
                                    <button onClick={() => handleStatusChange(apt.id, 'cancelled')} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"><XCircle className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className={cn(
                        "rounded-2xl p-6 w-full max-w-md border shadow-2xl transition-colors",
                        isDark ? "bg-[#1e1e1e] border-gray-800" : "bg-white border-gray-200"
                    )}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-gray-900")}>Create Appointment</h2>
                            <button onClick={() => setShowModal(false)} className={cn("transition-colors", isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900")}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className={cn("block text-sm font-medium mb-1.5", isDark ? "text-gray-400" : "text-gray-600")}>Patient Name</label>
                                <input required value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} className={cn("w-full rounded-xl border p-3 text-sm outline-none transition-colors", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-[#ff7a6b]" : "bg-white border-gray-200 text-gray-900 focus:border-[#ff7a6b]")} placeholder="Enter name" />
                            </div>
                            <div>
                                <label className={cn("block text-sm font-medium mb-1.5", isDark ? "text-gray-400" : "text-gray-600")}>Visit Type</label>
                                <input required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={cn("w-full rounded-xl border p-3 text-sm outline-none transition-colors", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-[#ff7a6b]" : "bg-white border-gray-200 text-gray-900 focus:border-[#ff7a6b]")} placeholder="e.g. Consultation" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={cn("block text-sm font-medium mb-1.5", isDark ? "text-gray-400" : "text-gray-600")}>Doctor</label>
                                    <input value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })} className={cn("w-full rounded-xl border p-3 text-sm outline-none transition-colors", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-[#ff7a6b]" : "bg-white border-gray-200 text-gray-900 focus:border-[#ff7a6b]")} placeholder="Name" />
                                </div>
                                <div>
                                    <label className={cn("block text-sm font-medium mb-1.5", isDark ? "text-gray-400" : "text-gray-600")}>Time</label>
                                    <input required type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className={cn("w-full rounded-xl border p-3 text-sm outline-none transition-colors", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-[#ff7a6b]" : "bg-white border-gray-200 text-gray-900 focus:border-[#ff7a6b]")} />
                                </div>
                            </div>
                            <div>
                                <label className={cn("block text-sm font-medium mb-1.5", isDark ? "text-gray-400" : "text-gray-600")}>Notes</label>
                                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={cn("w-full rounded-xl border p-3 text-sm outline-none transition-colors", isDark ? "bg-[#0f0f0f] border-gray-800 text-white focus:border-[#ff7a6b]" : "bg-white border-gray-200 text-gray-900 focus:border-[#ff7a6b]")} rows="2" placeholder="Any special notes..." />
                            </div>
                            <button className="w-full rounded-xl bg-[#ff7a6b] py-3 text-white font-semibold hover:bg-[#ff6b5b] transition-all active:scale-[0.98] mt-2 shadow-lg shadow-[#ff7a6b]/20">
                                Create Appointment
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
