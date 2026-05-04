import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock, LogIn, LogOut, RefreshCw, UserCheck, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { useTenant } from '../context/TenantContext';
import { checkInAttendance, checkOutAttendance, fetchAttendance } from '../lib/clinicApi';
import { cn, getLocalDateString } from '../lib/utils';

const PAGE_SIZE = 25;

function formatDate(value) {
    if (!value) return '-';
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function getDuration(record) {
    if (!record?.checkInAt || !record?.checkOutAt) return 'In office';
    const start = new Date(record.checkInAt).getTime();
    const end = new Date(record.checkOutAt).getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return '-';
    const minutes = Math.round((end - start) / 60000);
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return `${hours}h ${rest}m`;
}

export function Attendance() {
    const { session } = useAuth();
    const { theme } = useStore();
    const { selectedClinic } = useTenant();
    const isDark = theme === 'dark';
    const today = getLocalDateString();

    const [records, setRecords] = useState([]);
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const loadAttendance = async () => {
        setLoading(true);
        setError('');
        try {
            const result = await fetchAttendance({ to: today });
            setRecords(Array.isArray(result.attendance) ? result.attendance : []);
        } catch (loadError) {
            setError(loadError.message || 'Failed to load attendance.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAttendance();
    }, [session?.userId]);

    const myTodayRecord = useMemo(
        () => records.find((record) => record.userId === session?.userId && record.attendanceDate === today),
        [records, session?.userId, today]
    );

    const checkedInToday = Boolean(myTodayRecord);
    const checkedOutToday = Boolean(myTodayRecord?.checkOutAt);
    const presentTodayCount = records.filter((record) => record.attendanceDate === today).length;
    const inOfficeCount = records.filter((record) => record.attendanceDate === today && !record.checkOutAt).length;
    const visibleRecords = records.slice(0, visibleCount);

    const handleCheckIn = async () => {
        setSubmitting(true);
        setError('');
        setSuccess('');
        try {
            await checkInAttendance({ attendanceDate: today });
            setSuccess('Attendance marked for today.');
            await loadAttendance();
        } catch (checkInError) {
            setError(checkInError.message || 'Failed to mark attendance.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCheckOut = async () => {
        if (!myTodayRecord) return;
        setSubmitting(true);
        setError('');
        setSuccess('');
        try {
            await checkOutAttendance(myTodayRecord.id);
            setSuccess('Leaving time marked.');
            await loadAttendance();
        } catch (checkOutError) {
            setError(checkOutError.message || 'Failed to mark leaving time.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className={cn("text-2xl sm:text-4xl font-black tracking-tight", isDark ? "text-white" : "text-[#512c31]")}>Attendance</h1>
                    <p className={cn("text-sm sm:text-base font-bold uppercase tracking-widest mt-1", isDark ? "text-white/40" : "text-[#512c31]/60")}>
                        {session?.role === 'admin' ? 'All staff attendance for your organization' : 'Your own attendance history'}
                    </p>
                </div>
                <button
                    onClick={loadAttendance}
                    className={cn("inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-widest transition-all", isDark ? "bg-white/5 text-gray-300 hover:bg-white/10" : "bg-white text-[#512c31] shadow-sm hover:bg-[#fef9f3]")}
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
            {success && <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{success}</div>}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_1.9fr]">
                <div className={cn("rounded-[2rem] border-4 p-6 shadow-2xl", isDark ? "bg-[#1e1e1e] border-white/5" : "bg-white border-gray-50")}>
                    <div className="flex items-center gap-3">
                        <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl", isDark ? "bg-[#0f0f0f]" : "bg-[#fef9f3]")}>
                            <UserCheck className="h-7 w-7 text-[#e8919a]" />
                        </div>
                        <div>
                            <p className={cn("text-xs font-black uppercase tracking-widest", isDark ? "text-gray-500" : "text-[#512c31]/60")}>Today</p>
                            <h2 className={cn("text-xl font-black", isDark ? "text-white" : "text-[#512c31]")}>{formatDate(today)}</h2>
                        </div>
                    </div>

                    <div className={cn("mt-6 rounded-2xl p-4", isDark ? "bg-[#0f0f0f]" : "bg-[#fef9f3]")}>
                        <p className={cn("text-xs font-black uppercase tracking-widest", isDark ? "text-gray-500" : "text-[#512c31]/60")}>Selected Clinic</p>
                        <p className={cn("mt-1 text-lg font-black", isDark ? "text-white" : "text-[#512c31]")}>{selectedClinic?.name || 'Select a clinic'}</p>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <div className={cn("rounded-2xl p-4", isDark ? "bg-white/5" : "bg-gray-50")}>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Check In</p>
                            <p className={cn("mt-2 text-lg font-black", isDark ? "text-white" : "text-[#512c31]")}>{formatTime(myTodayRecord?.checkInAt)}</p>
                        </div>
                        <div className={cn("rounded-2xl p-4", isDark ? "bg-white/5" : "bg-gray-50")}>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Check Out</p>
                            <p className={cn("mt-2 text-lg font-black", isDark ? "text-white" : "text-[#512c31]")}>{formatTime(myTodayRecord?.checkOutAt)}</p>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-3">
                        <button
                            onClick={handleCheckIn}
                            disabled={submitting || checkedInToday || !selectedClinic}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#512c31] px-5 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-[#512c31]/20 transition-all hover:bg-[#e8919a] disabled:opacity-50 disabled:hover:bg-[#512c31]"
                        >
                            <LogIn className="w-4 h-4" />
                            {checkedInToday ? 'Attendance Marked' : 'Mark Attendance'}
                        </button>
                        <button
                            onClick={handleCheckOut}
                            disabled={submitting || !checkedInToday || checkedOutToday}
                            className={cn("inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-black uppercase tracking-widest transition-all disabled:opacity-50", isDark ? "bg-white/5 text-white hover:bg-white/10" : "bg-[#fef9f3] text-[#512c31] hover:bg-[#f4e5df]")}
                        >
                            <LogOut className="w-4 h-4" />
                            {checkedOutToday ? 'Leaving Marked' : 'Mark Leaving Time'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className={cn("rounded-[2rem] border-4 p-6 shadow-xl", isDark ? "bg-[#1e1e1e] border-white/5" : "bg-white border-gray-50")}>
                        <Users className="mb-5 h-7 w-7 text-[#e8919a]" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Present Today</p>
                        <p className={cn("mt-2 text-4xl font-black", isDark ? "text-white" : "text-[#512c31]")}>{presentTodayCount}</p>
                    </div>
                    <div className={cn("rounded-[2rem] border-4 p-6 shadow-xl", isDark ? "bg-[#1e1e1e] border-white/5" : "bg-white border-gray-50")}>
                        <Clock className="mb-5 h-7 w-7 text-[#e8919a]" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">In Office</p>
                        <p className={cn("mt-2 text-4xl font-black", isDark ? "text-white" : "text-[#512c31]")}>{inOfficeCount}</p>
                    </div>
                    <div className={cn("col-span-2 rounded-[2rem] border-4 p-6 shadow-xl", isDark ? "bg-[#1e1e1e] border-white/5" : "bg-white border-gray-50")}>
                        <CalendarDays className="mb-5 h-7 w-7 text-[#e8919a]" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Recent Records</p>
                        <p className={cn("mt-2 text-4xl font-black", isDark ? "text-white" : "text-[#512c31]")}>{records.length}</p>
                    </div>
                </div>
            </div>

            <div className={cn("rounded-[2.5rem] border-4 overflow-hidden shadow-2xl", isDark ? "bg-[#1e1e1e] border-white/5" : "bg-white border-white/50")}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className={cn("font-black uppercase tracking-widest text-[10px] sm:text-xs", isDark ? "bg-[#0f0f0f] text-gray-400" : "bg-[#fef9f3] text-[#512c31]/60")}>
                            <tr>
                                <th className="px-5 sm:px-6 py-5">Date</th>
                                {session?.role === 'admin' && <th className="px-5 sm:px-6 py-5">Staff</th>}
                                <th className="px-5 sm:px-6 py-5">Clinic</th>
                                <th className="px-5 sm:px-6 py-5">Check In</th>
                                <th className="px-5 sm:px-6 py-5">Check Out</th>
                                <th className="px-5 sm:px-6 py-5">Duration</th>
                            </tr>
                        </thead>
                        <tbody className={cn("divide-y", isDark ? "divide-gray-800" : "divide-gray-50")}>
                            {loading ? (
                                <tr><td colSpan={session?.role === 'admin' ? 6 : 5} className="px-6 py-10 text-center text-gray-500">Loading attendance...</td></tr>
                            ) : visibleRecords.length === 0 ? (
                                <tr><td colSpan={session?.role === 'admin' ? 6 : 5} className="px-6 py-10 text-center text-gray-500">No attendance records yet.</td></tr>
                            ) : visibleRecords.map((record) => (
                                <tr key={record.id} className={cn("transition-colors", isDark ? "hover:bg-[#252525]" : "hover:bg-[#fef9f3]")}>
                                    <td className={cn("px-5 sm:px-6 py-5 font-black", isDark ? "text-white" : "text-[#512c31]")}>{formatDate(record.attendanceDate)}</td>
                                    {session?.role === 'admin' && <td className="px-5 sm:px-6 py-5 font-bold text-gray-400">{record.staffName}</td>}
                                    <td className="px-5 sm:px-6 py-5 font-bold text-gray-400">{record.clinicName}</td>
                                    <td className="px-5 sm:px-6 py-5 font-bold text-emerald-400">{formatTime(record.checkInAt)}</td>
                                    <td className="px-5 sm:px-6 py-5 font-bold text-amber-300">{formatTime(record.checkOutAt)}</td>
                                    <td className="px-5 sm:px-6 py-5 font-bold text-gray-400">{getDuration(record)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {visibleCount < records.length && (
                <div className="flex justify-center">
                    <button
                        onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                        className="rounded-2xl bg-[#512c31] px-6 py-3 text-sm font-black uppercase tracking-widest text-white shadow-lg transition hover:bg-[#e8919a]"
                    >
                        Load More
                    </button>
                </div>
            )}
        </div>
    );
}
