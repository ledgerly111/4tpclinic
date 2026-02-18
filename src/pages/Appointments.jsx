import { useEffect, useMemo, useState } from 'react';
import {
    Plus, Calendar, Clock, User, Stethoscope, CheckCircle,
    Circle, XCircle, X, ChevronLeft, ChevronRight, CalendarDays,
    UserPlus, Search, Phone, AlertCircle, Pencil
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';
import { cn } from '../lib/utils';
import { createAppointment, createPatient, fetchAppointments, updateAppointment, updateAppointmentStatus } from '../lib/clinicApi';

const VISIT_TYPES = ['Consultation', 'Follow-up', 'Check-up', 'Emergency', 'Procedure', 'Lab Test', 'Vaccination'];
const STATUS_CONFIG = {
    scheduled: { label: 'Scheduled', color: 'text-blue-400', bg: 'bg-blue-400/10', icon: Circle },
    'in-progress': { label: 'In Progress', color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: Circle },
    completed: { label: 'Completed', color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-400/10', icon: XCircle },
};

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.scheduled;
    const Icon = cfg.icon;
    return (
        <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', cfg.color, cfg.bg)}>
            <Icon className={cn('w-3 h-3', status === 'in-progress' && 'animate-pulse')} />
            {cfg.label}
        </span>
    );
}

export function Appointments() {
    const { theme } = useStore();
    const { session } = useAuth();
    const { selectedOrganizationId, selectedClinicId } = useTenant();
    const isDark = theme === 'dark';

    // Calendar state
    const [viewMonth, setViewMonth] = useState(() => {
        const d = new Date(); d.setDate(1); return d;
    });
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Appointments
    const [appointments, setAppointments] = useState([]);
    const [monthDots, setMonthDots] = useState({}); // { 'YYYY-MM-DD': count }
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [modalTab, setModalTab] = useState('existing'); // 'existing' | 'new'
    const [submitting, setSubmitting] = useState(false);
    const [modalError, setModalError] = useState('');

    // Edit appointment
    const [editApt, setEditApt] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editSubmitting, setEditSubmitting] = useState(false);
    const [editError, setEditError] = useState('');

    // Form — shared fields
    const [sharedForm, setSharedForm] = useState({ type: '', doctor: '', time: '', notes: '' });
    // Existing patient tab
    const [existingForm, setExistingForm] = useState({ patientName: '' });
    // New patient tab
    const [newPatientForm, setNewPatientForm] = useState({ name: '', contact: '', age: '', gender: 'Male' });

    // ─── Derived ─────────────────────────────────────────────────────────────
    const dateKey = useMemo(() => selectedDate.toISOString().split('T')[0], [selectedDate]);
    const monthKey = useMemo(() => {
        const y = viewMonth.getFullYear();
        const m = String(viewMonth.getMonth() + 1).padStart(2, '0');
        return `${y}-${m}`;
    }, [viewMonth]);

    // Calendar grid
    const calendarDays = useMemo(() => {
        const year = viewMonth.getFullYear();
        const month = viewMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
        return days;
    }, [viewMonth]);

    // ─── Data loading ─────────────────────────────────────────────────────────
    const loadDayAppointments = async (key) => {
        setLoading(true);
        setError('');
        try {
            const result = await fetchAppointments({ date: key });
            setAppointments(result.appointments || []);
            // Update dot for this day
            setMonthDots(prev => ({ ...prev, [key]: (result.appointments || []).length }));
        } catch (err) {
            setError(err.message || 'Failed to load appointments.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadDayAppointments(dateKey); }, [dateKey]);

    // ─── Handlers ─────────────────────────────────────────────────────────────
    const prevMonth = () => setViewMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    const nextMonth = () => setViewMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
    const goToday = () => { const t = new Date(); setSelectedDate(t); setViewMonth(new Date(t.getFullYear(), t.getMonth(), 1)); };

    const selectDay = (date) => {
        if (!date) return;
        setSelectedDate(date);
        // Keep viewMonth in sync if user clicks a day in a different month (shouldn't happen with current grid, but safe)
        setViewMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    };

    const openModal = () => {
        setModalError('');
        setSharedForm({ type: '', doctor: '', time: '', notes: '' });
        setExistingForm({ patientName: '' });
        setNewPatientForm({ fullName: '', phone: '', age: '', gender: 'male' });
        setModalTab('existing');
        setShowModal(true);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setModalError('');

        if (modalTab === 'new' && !selectedClinicId) {
            setModalError('Please select a clinic first before creating a new patient.');
            return;
        }

        setSubmitting(true);
        try {
            let patientName = existingForm.patientName;

            if (modalTab === 'new') {
                // Create patient first — use same schema as Patients.jsx
                await createPatient({
                    name: newPatientForm.name,
                    contact: newPatientForm.contact,
                    age: newPatientForm.age || '',
                    gender: newPatientForm.gender,
                    medicalHistory: [],
                    clinicId: selectedClinicId,
                    organizationId: session?.role === 'super_admin' ? selectedOrganizationId : undefined,
                    lastVisit: dateKey,
                });
                patientName = newPatientForm.name;
            }

            await createAppointment({
                patientName,
                type: sharedForm.type,
                doctor: sharedForm.doctor,
                time: sharedForm.time,
                notes: sharedForm.notes,
                date: dateKey,
                status: 'scheduled',
            });

            setShowModal(false);
            await loadDayAppointments(dateKey);
        } catch (err) {
            setModalError(err.message || 'Failed to create appointment.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await updateAppointmentStatus(id, status);
            setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
        } catch (err) {
            setError(err.message || 'Failed to update status.');
        }
    };

    const openEditApt = (apt) => {
        setEditApt({
            id: apt.id,
            patient: apt.patient || '',
            type: apt.type || '',
            doctor: apt.doctor || '',
            time: apt.time || '',
            notes: apt.notes || '',
        });
        setEditError('');
        setShowEditModal(true);
    };

    const handleEditApt = async (e) => {
        e.preventDefault();
        setEditError('');
        setEditSubmitting(true);
        try {
            await updateAppointment(editApt.id, {
                patientName: editApt.patient,
                type: editApt.type,
                doctor: editApt.doctor,
                time: editApt.time,
                notes: editApt.notes,
            });
            setShowEditModal(false);
            setEditApt(null);
            await loadDayAppointments(dateKey);
        } catch (err) {
            setEditError(err.message || 'Failed to update appointment.');
        } finally {
            setEditSubmitting(false);
        }
    };

    // ─── Helpers ──────────────────────────────────────────────────────────────
    const today = new Date();
    const isToday = (d) => d && d.toDateString() === today.toDateString();
    const isSelected = (d) => d && d.toDateString() === selectedDate.toDateString();
    const hasDot = (d) => d && monthDots[d.toISOString().split('T')[0]] > 0;

    const inputCls = cn(
        'w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors',
        isDark
            ? 'bg-[#0f0f0f] border-gray-800 text-white placeholder-gray-600 focus:border-[#ff7a6b]'
            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#ff7a6b] focus:bg-white'
    );
    const labelCls = cn('block text-xs font-semibold uppercase tracking-wide mb-1.5', isDark ? 'text-gray-500' : 'text-gray-400');

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className={cn('text-xl sm:text-2xl font-bold', isDark ? 'text-white' : 'text-gray-900')}>Appointments</h1>
                    <p className={cn('text-sm mt-0.5', isDark ? 'text-gray-400' : 'text-gray-500')}>
                        {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>
                <button
                    onClick={openModal}
                    className="w-full sm:w-auto bg-[#ff7a6b] text-white px-4 py-2.5 rounded-xl hover:bg-[#ff6b5b] flex items-center justify-center gap-2 text-sm font-medium transition-all active:scale-95 shadow-lg shadow-[#ff7a6b]/20"
                >
                    <Plus className="w-4 h-4" /> New Appointment
                </button>
            </div>

            {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                </div>
            )}

            {/* Main grid: Calendar + Day Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 sm:gap-6 items-start">

                {/* ── Month Calendar ── */}
                <div className={cn('rounded-2xl border overflow-hidden', isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-100 shadow-sm')}>
                    {/* Calendar header */}
                    <div className={cn('flex items-center justify-between px-4 py-3 border-b', isDark ? 'border-gray-800' : 'border-gray-100')}>
                        <button onClick={prevMonth} className={cn('p-1.5 rounded-lg transition-colors', isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500')}>
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-2">
                            <span className={cn('font-semibold text-sm', isDark ? 'text-white' : 'text-gray-900')}>
                                {viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                            <button
                                onClick={goToday}
                                className={cn('text-xs px-2 py-0.5 rounded-md font-medium transition-colors', isDark ? 'bg-white/10 text-gray-300 hover:bg-white/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}
                            >
                                Today
                            </button>
                        </div>
                        <button onClick={nextMonth} className={cn('p-1.5 rounded-lg transition-colors', isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500')}>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Day-of-week headers */}
                    <div className="grid grid-cols-7 px-3 pt-3 pb-1">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                            <div key={d} className={cn('text-center text-[10px] font-bold uppercase tracking-wider pb-2', isDark ? 'text-gray-600' : 'text-gray-400')}>
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-y-1 px-3 pb-3">
                        {calendarDays.map((date, idx) => {
                            if (!date) return <div key={`empty-${idx}`} />;
                            const _isToday = isToday(date);
                            const _isSelected = isSelected(date);
                            const _hasDot = hasDot(date);
                            return (
                                <button
                                    key={idx}
                                    onClick={() => selectDay(date)}
                                    className={cn(
                                        'relative flex flex-col items-center justify-center aspect-square rounded-xl text-sm font-medium transition-all duration-150 mx-0.5',
                                        _isSelected
                                            ? 'bg-[#ff7a6b] text-white shadow-md shadow-[#ff7a6b]/30'
                                            : _isToday
                                                ? isDark
                                                    ? 'ring-1 ring-[#ff7a6b] text-[#ff7a6b] hover:bg-[#ff7a6b]/10'
                                                    : 'ring-1 ring-[#ff7a6b] text-[#ff7a6b] hover:bg-[#ff7a6b]/5'
                                                : isDark
                                                    ? 'text-gray-300 hover:bg-white/[0.07]'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                    )}
                                >
                                    {date.getDate()}
                                    {/* Appointment dot */}
                                    {_hasDot && (
                                        <span className={cn(
                                            'absolute bottom-1 w-1 h-1 rounded-full',
                                            _isSelected ? 'bg-white/70' : 'bg-[#ff7a6b]'
                                        )} />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className={cn('flex items-center gap-4 px-4 py-3 border-t text-xs', isDark ? 'border-gray-800 text-gray-500' : 'border-gray-100 text-gray-400')}>
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#ff7a6b] inline-block" /> Has appointments</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md ring-1 ring-[#ff7a6b] inline-block" /> Today</span>
                    </div>
                </div>

                {/* ── Day Panel ── */}
                <div className={cn('rounded-2xl border', isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-100 shadow-sm')}>
                    {/* Day panel header */}
                    <div className={cn('flex items-center justify-between px-5 py-4 border-b', isDark ? 'border-gray-800' : 'border-gray-100')}>
                        <div className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-[#ff7a6b]" />
                            <span className={cn('font-semibold text-sm', isDark ? 'text-white' : 'text-gray-900')}>
                                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                        {!loading && (
                            <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600')}>
                                {appointments.length} {appointments.length === 1 ? 'appointment' : 'appointments'}
                            </span>
                        )}
                    </div>

                    <div className="p-4 sm:p-5 space-y-3 min-h-[300px]">
                        {loading ? (
                            // Skeleton
                            [...Array(3)].map((_, i) => (
                                <div key={i} className={cn('rounded-xl p-4 flex items-center gap-4', isDark ? 'bg-[#141414]' : 'bg-gray-50')}>
                                    <div className="skeleton-shimmer w-10 h-10 rounded-full flex-shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="skeleton-shimmer h-4 w-2/5" />
                                        <div className="skeleton-shimmer h-3 w-1/3" />
                                    </div>
                                    <div className="skeleton-shimmer h-5 w-20 rounded-full" />
                                </div>
                            ))
                        ) : appointments.length === 0 ? (
                            // Empty state
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center mb-4', isDark ? 'bg-white/5' : 'bg-gray-100')}>
                                    <Calendar className={cn('w-8 h-8', isDark ? 'text-gray-600' : 'text-gray-300')} />
                                </div>
                                <p className={cn('font-medium text-sm', isDark ? 'text-gray-400' : 'text-gray-500')}>No appointments</p>
                                <p className={cn('text-xs mt-1', isDark ? 'text-gray-600' : 'text-gray-400')}>Click "New Appointment" to schedule one</p>
                            </div>
                        ) : (
                            // Appointment cards
                            appointments.map((apt) => (
                                <div
                                    key={apt.id}
                                    className={cn(
                                        'group rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 transition-all border',
                                        isDark
                                            ? 'bg-[#141414] border-gray-800/60 hover:border-gray-700'
                                            : 'bg-gray-50 border-transparent hover:border-gray-200 hover:bg-white'
                                    )}
                                >
                                    {/* Time + avatar */}
                                    <div className="flex items-center gap-3 sm:w-[120px] flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#60a5fa] to-[#8b5cf6] flex items-center justify-center flex-shrink-0">
                                            <User className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className={cn('w-3 h-3 flex-shrink-0', isDark ? 'text-gray-500' : 'text-gray-400')} />
                                            <span className={cn('text-sm font-semibold tabular-nums', isDark ? 'text-white' : 'text-gray-900')}>{apt.time}</span>
                                        </div>
                                    </div>

                                    {/* Patient info */}
                                    <div className="flex-1 min-w-0">
                                        <p className={cn('font-semibold text-sm truncate', isDark ? 'text-white' : 'text-gray-900')}>{apt.patient}</p>
                                        <p className={cn('text-xs flex items-center gap-1 mt-0.5', isDark ? 'text-gray-500' : 'text-gray-400')}>
                                            <Stethoscope className="w-3 h-3" /> {apt.type}
                                            {apt.doctor && <> · <User className="w-3 h-3" /> {apt.doctor}</>}
                                        </p>
                                    </div>

                                    {/* Status + actions */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <StatusBadge status={apt.status} />
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openEditApt(apt)}
                                                title="Edit appointment"
                                                className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            {apt.status !== 'completed' && (
                                                <button
                                                    onClick={() => handleStatusChange(apt.id, 'completed')}
                                                    title="Mark complete"
                                                    className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                                                >
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                            {apt.status !== 'cancelled' && (
                                                <button
                                                    onClick={() => handleStatusChange(apt.id, 'cancelled')}
                                                    title="Cancel"
                                                    className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                                >
                                                    <XCircle className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* ── New Appointment Modal ── */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
                    <div className={cn(
                        'w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl border shadow-2xl transition-colors flex flex-col max-h-[92dvh]',
                        isDark ? 'bg-[#161616] border-gray-800' : 'bg-white border-gray-200'
                    )}>
                        {/* Modal header */}
                        <div className={cn('flex items-center justify-between px-5 pt-5 pb-4 border-b flex-shrink-0', isDark ? 'border-gray-800' : 'border-gray-100')}>
                            <div>
                                <h2 className={cn('text-base font-bold', isDark ? 'text-white' : 'text-gray-900')}>New Appointment</h2>
                                <p className={cn('text-xs mt-0.5', isDark ? 'text-gray-500' : 'text-gray-400')}>
                                    {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className={cn('p-2 rounded-xl transition-colors', isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500')}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className={cn('flex gap-1 px-5 pt-4 flex-shrink-0')}>
                            {[
                                { key: 'existing', label: 'Existing Patient', icon: Search },
                                { key: 'new', label: 'New Patient', icon: UserPlus },
                            ].map(({ key, label, icon: Icon }) => (
                                <button
                                    key={key}
                                    onClick={() => setModalTab(key)}
                                    className={cn(
                                        'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all flex-1 justify-center',
                                        modalTab === key
                                            ? 'bg-[#ff7a6b] text-white shadow-md shadow-[#ff7a6b]/20'
                                            : isDark
                                                ? 'text-gray-400 hover:bg-white/[0.06]'
                                                : 'text-gray-500 hover:bg-gray-100'
                                    )}
                                >
                                    <Icon className="w-3.5 h-3.5" /> {label}
                                </button>
                            ))}
                        </div>

                        {/* Form */}
                        <form onSubmit={handleCreate} className="overflow-y-auto flex-1">
                            <div className="px-5 py-4 space-y-4">
                                {modalError && (
                                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-300 flex items-center gap-2">
                                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {modalError}
                                    </div>
                                )}

                                {/* ── Existing patient tab ── */}
                                {modalTab === 'existing' && (
                                    <div>
                                        <label className={labelCls}>Patient Name</label>
                                        <div className="relative">
                                            <Search className={cn('absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4', isDark ? 'text-gray-600' : 'text-gray-400')} />
                                            <input
                                                required
                                                value={existingForm.patientName}
                                                onChange={e => setExistingForm({ patientName: e.target.value })}
                                                className={cn(inputCls, 'pl-9')}
                                                placeholder="Type patient name…"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* ── New patient tab ── */}
                                {modalTab === 'new' && (
                                    <div className="space-y-3">
                                        <div className={cn('rounded-xl p-3 border', isDark ? 'bg-[#ff7a6b]/5 border-[#ff7a6b]/20' : 'bg-[#ff7a6b]/5 border-[#ff7a6b]/20')}>
                                            <p className="text-xs text-[#ff7a6b] font-medium">A new patient record will be created automatically.</p>
                                        </div>
                                        <div>
                                            <label className={labelCls}>Full Name</label>
                                            <input
                                                required
                                                value={newPatientForm.name}
                                                onChange={e => setNewPatientForm(f => ({ ...f, name: e.target.value }))}
                                                className={inputCls}
                                                placeholder="Patient's full name"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className={labelCls}>Phone</label>
                                                <div className="relative">
                                                    <Phone className={cn('absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5', isDark ? 'text-gray-600' : 'text-gray-400')} />
                                                    <input
                                                        value={newPatientForm.contact}
                                                        onChange={e => setNewPatientForm(f => ({ ...f, contact: e.target.value }))}
                                                        className={cn(inputCls, 'pl-8')}
                                                        placeholder="Phone number"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className={labelCls}>Age</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="150"
                                                    value={newPatientForm.age}
                                                    onChange={e => setNewPatientForm(f => ({ ...f, age: e.target.value }))}
                                                    className={inputCls}
                                                    placeholder="Age"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelCls}>Gender</label>
                                            <div className="flex gap-2">
                                                {['Male', 'Female', 'Other'].map(g => (
                                                    <button
                                                        key={g}
                                                        type="button"
                                                        onClick={() => setNewPatientForm(f => ({ ...f, gender: g }))}
                                                        className={cn(
                                                            'flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all border',
                                                            newPatientForm.gender === g
                                                                ? 'bg-[#ff7a6b] text-white border-[#ff7a6b] shadow-md shadow-[#ff7a6b]/20'
                                                                : isDark
                                                                    ? 'border-gray-800 text-gray-400 hover:border-gray-700'
                                                                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                                        )}
                                                    >
                                                        {g}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── Shared appointment fields ── */}
                                <div className={cn('h-px', isDark ? 'bg-gray-800' : 'bg-gray-100')} />

                                <div>
                                    <label className={labelCls}>Visit Type</label>
                                    <select
                                        required
                                        value={sharedForm.type}
                                        onChange={e => setSharedForm(f => ({ ...f, type: e.target.value }))}
                                        className={cn(inputCls, 'cursor-pointer')}
                                    >
                                        <option value="">Select visit type…</option>
                                        {VISIT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelCls}>Doctor</label>
                                        <input
                                            value={sharedForm.doctor}
                                            onChange={e => setSharedForm(f => ({ ...f, doctor: e.target.value }))}
                                            className={inputCls}
                                            placeholder="Doctor's name"
                                        />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Time</label>
                                        <input
                                            required
                                            type="time"
                                            value={sharedForm.time}
                                            onChange={e => setSharedForm(f => ({ ...f, time: e.target.value }))}
                                            className={inputCls}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={labelCls}>Notes <span className={isDark ? 'text-gray-700' : 'text-gray-300'}>(optional)</span></label>
                                    <textarea
                                        value={sharedForm.notes}
                                        onChange={e => setSharedForm(f => ({ ...f, notes: e.target.value }))}
                                        className={cn(inputCls, 'resize-none')}
                                        rows={2}
                                        placeholder="Any special notes…"
                                    />
                                </div>
                            </div>

                            {/* Submit */}
                            <div className={cn('px-5 pb-5 pt-2 flex-shrink-0 border-t', isDark ? 'border-gray-800' : 'border-gray-100')}>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full rounded-xl bg-[#ff7a6b] py-3 text-white font-semibold text-sm hover:bg-[#ff6b5b] transition-all active:scale-[0.98] shadow-lg shadow-[#ff7a6b]/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating…</>
                                    ) : (
                                        <><Plus className="w-4 h-4" /> {modalTab === 'new' ? 'Create Patient & Appointment' : 'Create Appointment'}</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Edit Appointment Modal ── */}
            {showEditModal && editApt && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
                    <div className={cn(
                        'w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border shadow-2xl flex flex-col max-h-[92dvh]',
                        isDark ? 'bg-[#161616] border-gray-800' : 'bg-white border-gray-200'
                    )}>
                        <div className={cn('flex items-center justify-between px-5 pt-5 pb-4 border-b flex-shrink-0', isDark ? 'border-gray-800' : 'border-gray-100')}>
                            <div>
                                <h2 className={cn('text-base font-bold', isDark ? 'text-white' : 'text-gray-900')}>Edit Appointment</h2>
                                <p className={cn('text-xs mt-0.5', isDark ? 'text-gray-500' : 'text-gray-400')}>
                                    {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                            <button onClick={() => setShowEditModal(false)} className={cn('p-2 rounded-xl transition-colors', isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500')}>
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleEditApt} className="overflow-y-auto flex-1">
                            <div className="px-5 py-4 space-y-4">
                                {editError && (
                                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-300 flex items-center gap-2">
                                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {editError}
                                    </div>
                                )}
                                <div>
                                    <label className={labelCls}>Patient Name</label>
                                    <input
                                        required
                                        value={editApt.patient}
                                        onChange={e => setEditApt(f => ({ ...f, patient: e.target.value }))}
                                        className={inputCls}
                                        placeholder="Patient name"
                                    />
                                </div>
                                <div>
                                    <label className={labelCls}>Visit Type</label>
                                    <select
                                        required
                                        value={editApt.type}
                                        onChange={e => setEditApt(f => ({ ...f, type: e.target.value }))}
                                        className={cn(inputCls, 'cursor-pointer')}
                                    >
                                        <option value="">Select visit type…</option>
                                        {VISIT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelCls}>Doctor</label>
                                        <input
                                            value={editApt.doctor}
                                            onChange={e => setEditApt(f => ({ ...f, doctor: e.target.value }))}
                                            className={inputCls}
                                            placeholder="Doctor's name"
                                        />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Time</label>
                                        <input
                                            required
                                            type="time"
                                            value={editApt.time}
                                            onChange={e => setEditApt(f => ({ ...f, time: e.target.value }))}
                                            className={inputCls}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelCls}>Notes <span className={isDark ? 'text-gray-700' : 'text-gray-300'}>(optional)</span></label>
                                    <textarea
                                        value={editApt.notes}
                                        onChange={e => setEditApt(f => ({ ...f, notes: e.target.value }))}
                                        className={cn(inputCls, 'resize-none')}
                                        rows={2}
                                        placeholder="Any special notes…"
                                    />
                                </div>
                            </div>
                            <div className={cn('px-5 pb-5 pt-2 flex-shrink-0 border-t', isDark ? 'border-gray-800' : 'border-gray-100')}>
                                <button
                                    type="submit"
                                    disabled={editSubmitting}
                                    className="w-full rounded-xl bg-[#ff7a6b] py-3 text-white font-semibold text-sm hover:bg-[#ff6b5b] transition-all active:scale-[0.98] shadow-lg shadow-[#ff7a6b]/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {editSubmitting ? (
                                        <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                                    ) : (
                                        <><Pencil className="w-4 h-4" /> Save Changes</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
