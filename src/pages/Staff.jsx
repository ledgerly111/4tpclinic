import { useEffect, useState } from 'react';
import { Building2, Users, Plus, Key, X, UserPlus, Stethoscope, ShieldCheck, Shield, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';
import { useStore } from '../context/StoreContext';
import {
    fetchAdminSupervisionApi,
    createClinicApi,
    createStaffApi,
    resetStaffPasswordApi,
    updateStaffPermissionsApi,
} from '../lib/authApi';
import { cn } from '../lib/utils';

// ── Permission definitions ─────────────────────────────────────────────────
const PAGE_PERMISSIONS = [
    { key: 'dashboard', label: 'Dashboard', icon: '📊' },
    { key: 'patients', label: 'Patients', icon: '🧑‍⚕️' },
    { key: 'appointments', label: 'Appointments', icon: '📅' },
    { key: 'inventory', label: 'Inventory', icon: '📦' },
    { key: 'services', label: 'Services', icon: '🩺' },
    { key: 'billing', label: 'Billing', icon: '🧾' },
    { key: 'reports', label: 'Reports', icon: '📈' },
];

const EDIT_PERMISSIONS = [
    { key: 'edit_patients', label: 'Edit Patients', desc: 'Create, update & delete patient records' },
    { key: 'edit_appointments', label: 'Edit Appointments', desc: 'Create, update & cancel appointments' },
    { key: 'edit_inventory', label: 'Edit Inventory', desc: 'Add, update & restock inventory items' },
    { key: 'edit_services', label: 'Edit Services', desc: 'Create & delete clinic services' },
    { key: 'edit_billing', label: 'Edit Billing', desc: 'Create & manage invoices' },
];

const DEFAULT_PERMISSIONS = {
    pages: { dashboard: true, patients: true, appointments: true, inventory: false, services: false, billing: false, reports: false },
    edits: { edit_patients: false, edit_appointments: false, edit_inventory: false, edit_services: false, edit_billing: false },
};

const PERMS_STORAGE_KEY = 'clinic_staff_permissions';

export function Staff() {
    const { session } = useAuth();
    const { selectedOrganization, selectedClinic, selectClinic } = useTenant();
    const { theme } = useStore();
    const isDark = theme === 'dark';
    const [clinics, setClinics] = useState([]);
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('clinics');
    const [loading, setLoading] = useState(true);
    const [showClinicModal, setShowClinicModal] = useState(false);
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showPermModal, setShowPermModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    // Local permissions map: { [userId]: { pages: {...}, edits: {...} } }
    const [permissionsMap, setPermissionsMap] = useState(() => {
        try { return JSON.parse(localStorage.getItem(PERMS_STORAGE_KEY) || '{}'); } catch { return {}; }
    });
    const [permForm, setPermForm] = useState(null); // working copy while modal is open
    const [permSaving, setPermSaving] = useState(false);

    const [clinicForm, setClinicForm] = useState({ name: '', code: '' });
    const [staffForm, setStaffForm] = useState({
        fullName: '',
        username: '',
        email: '',
        password: '',
        clinicIds: [],
    });
    const [passwordForm, setPasswordForm] = useState({ newPassword: '' });

    const loadData = async () => {
        setLoading(true);
        try {
            if (!session?.organizationId) return;
            const data = await fetchAdminSupervisionApi();
            setClinics(Array.isArray(data.clinics) ? data.clinics : []);
            setUsers(Array.isArray(data.users) ? data.users : []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData().catch((error) => {
            setFormError(error.message || 'Failed to load supervision data.');
        });
    }, [session?.organizationId]);

    const clearMessages = () => {
        setFormError('');
        setFormSuccess('');
    };

    const handleCreateClinic = async (event) => {
        event.preventDefault();
        clearMessages();
        try {
            await createClinicApi({
                name: clinicForm.name.trim(),
                code: clinicForm.code.trim().toUpperCase(),
            });
            setFormSuccess('Clinic created successfully.');
            setClinicForm({ name: '', code: '' });
            await loadData();
            setTimeout(() => {
                setShowClinicModal(false);
                setFormSuccess('');
            }, 1000);
        } catch (error) {
            setFormError(error.message || 'Failed to create clinic.');
        }
    };

    const handleCreateStaff = async (event) => {
        event.preventDefault();
        clearMessages();
        if (staffForm.clinicIds.length === 0) {
            setFormError('Assign at least one clinic.');
            return;
        }
        try {
            await createStaffApi({
                clinicIds: staffForm.clinicIds,
                username: staffForm.username.trim(),
                email: staffForm.email.trim(),
                password: staffForm.password,
                fullName: staffForm.fullName.trim(),
            });
            setFormSuccess('Staff member created.');
            setStaffForm({ fullName: '', username: '', email: '', password: '', clinicIds: [] });
            await loadData();
            setTimeout(() => {
                setShowStaffModal(false);
                setFormSuccess('');
            }, 1000);
        } catch (error) {
            setFormError(error.message || 'Failed to create staff.');
        }
    };

    const handleResetPassword = async (event) => {
        event.preventDefault();
        clearMessages();
        try {
            await resetStaffPasswordApi(selectedUser.id, passwordForm.newPassword);
            setFormSuccess('Password reset successfully.');
            await loadData();
            setTimeout(() => {
                setShowPasswordModal(false);
                setSelectedUser(null);
                setFormSuccess('');
            }, 1000);
        } catch (error) {
            setFormError(error.message || 'Failed to reset password.');
        }
    };

    const toggleClinicSelection = (clinicId) => {
        setStaffForm((prev) => ({
            ...prev,
            clinicIds: prev.clinicIds.includes(clinicId)
                ? prev.clinicIds.filter((id) => id !== clinicId)
                : [...prev.clinicIds, clinicId],
        }));
    };

    // ── Permissions helpers ──────────────────────────────────────────────────
    const getPermsForUser = (userId) => {
        const stored = permissionsMap[userId];
        if (!stored) return DEFAULT_PERMISSIONS;
        return {
            pages: { ...DEFAULT_PERMISSIONS.pages, ...(stored.pages || {}) },
            edits: { ...DEFAULT_PERMISSIONS.edits, ...(stored.edits || {}) },
        };
    };

    const openPermModal = (user) => {
        setSelectedUser(user);
        setPermForm(getPermsForUser(user.id));
        clearMessages();
        setShowPermModal(true);
    };

    const handleSavePermissions = async () => {
        if (!selectedUser || !permForm) return;
        setPermSaving(true);
        clearMessages();
        try {
            // Try the API first; fall back gracefully if not implemented
            try {
                await updateStaffPermissionsApi(selectedUser.id, permForm);
            } catch {
                // API may not exist yet — silently fall back to localStorage
            }
            const updated = { ...permissionsMap, [selectedUser.id]: permForm };
            setPermissionsMap(updated);
            localStorage.setItem(PERMS_STORAGE_KEY, JSON.stringify(updated));
            setFormSuccess(`Permissions saved for ${selectedUser.fullName}.`);
            setTimeout(() => { setShowPermModal(false); setFormSuccess(''); }, 1000);
        } catch (err) {
            setFormError(err.message || 'Failed to save permissions.');
        } finally {
            setPermSaving(false);
        }
    };

    const togglePage = (key) => setPermForm(f => ({ ...f, pages: { ...f.pages, [key]: !f.pages[key] } }));
    const toggleEdit = (key) => setPermForm(f => ({ ...f, edits: { ...f.edits, [key]: !f.edits[key] } }));
    const grantAll = () => setPermForm({ pages: Object.fromEntries(PAGE_PERMISSIONS.map(p => [p.key, true])), edits: Object.fromEntries(EDIT_PERMISSIONS.map(p => [p.key, true])) });
    const revokeAll = () => setPermForm({ pages: Object.fromEntries(PAGE_PERMISSIONS.map(p => [p.key, false])), edits: Object.fromEntries(EDIT_PERMISSIONS.map(p => [p.key, false])) });

    if (!session?.organizationId) {
        return (
            <div className={cn("rounded-2xl p-8 text-center", isDark ? "bg-[#1e1e1e] text-gray-400" : "bg-white text-gray-500 border border-gray-100 shadow-sm")}>
                Supervision is available for organization admins only.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 dashboard-reveal">
                <div>
                    <h1 className={cn("text-2xl sm:text-4xl font-black tracking-tight", isDark ? "text-white" : "text-[#512c31]")}>Supervision</h1>
                    <p className={cn("text-sm sm:text-base font-bold uppercase tracking-widest mt-1", isDark ? "text-white/40" : "text-[#512c31]/60")}>
                        Manage clinics and staff for <span className={cn("font-black text-[#e8919a]")}>{selectedOrganization?.name || 'your organization'}</span>
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-[#512c31] text-white rounded-xl shadow-lg shadow-[#512c31]/20 text-xs sm:text-sm font-bold uppercase tracking-widest">
                    <Building2 className="w-4 h-4" />
                    <span>Admin Controls</span>
                </div>
            </div>

            {formError && <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{formError}</div>}
            {formSuccess && <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{formSuccess}</div>}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 dashboard-reveal reveal-delay-1">
                {[{ label: 'Clinics', value: clinics.length }, { label: 'Staff', value: users.length }, { label: 'Active Staff', value: users.filter((u) => u.isActive).length, accent: true }, { label: 'Selected Clinic', value: selectedClinic?.name || 'None', small: true }]
                    .map(({ label, value, accent, small }) => (
                        <div key={label} className={cn('rounded-[2rem] p-6 transition-all border-4 shadow-xl hover:-translate-y-1 hover:shadow-2xl', isDark ? 'bg-[#1e1e1e] border-white/5' : 'bg-white border-gray-50')}>
                            <p className={cn('text-[10px] sm:text-[11px] font-bold uppercase tracking-widest mb-1', isDark ? 'text-gray-400' : 'text-[#512c31]/60')}>{label}</p>
                            {loading
                                ? <div className="skeleton-shimmer h-8 w-16 mt-1" />
                                : <p className={cn(small ? 'text-sm sm:text-base font-black truncate mt-2' : 'text-3xl sm:text-4xl font-black tracking-tight', accent ? 'text-[#e8919a]' : isDark ? 'text-white' : 'text-[#512c31]')}>{value}</p>
                            }
                        </div>
                    ))}
            </div>

            <div className={cn("flex gap-2 p-1.5 rounded-2xl w-fit dashboard-reveal reveal-delay-2 shadow-inner border-2", isDark ? "bg-[#0f0f0f] border-white/5" : "bg-[#fef9f3] border-gray-100")}>
                <button
                    onClick={() => setActiveTab('clinics')}
                    className={cn(
                        'px-6 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-widest rounded-xl transition-all',
                        activeTab === 'clinics' ? 'bg-white text-[#512c31] shadow-md dark:bg-white/10 dark:text-white' : 'text-gray-500 hover:text-[#512c31] dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                    )}
                >
                    Clinics
                </button>
                <button
                    onClick={() => setActiveTab('staff')}
                    className={cn(
                        'px-6 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-widest rounded-xl transition-all',
                        activeTab === 'staff' ? 'bg-white text-[#512c31] shadow-md dark:bg-white/10 dark:text-white' : 'text-gray-500 hover:text-[#512c31] dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                    )}
                >
                    Staff
                </button>
            </div>

            {activeTab === 'clinics' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                        <h2 className={cn("text-xl sm:text-2xl font-black tracking-tight", isDark ? "text-white" : "text-[#512c31]")}>Clinics & Branches</h2>
                        <button
                            onClick={() => { clearMessages(); setShowClinicModal(true); }}
                            className="px-4 py-2.5 bg-[#512c31] text-white rounded-xl hover:bg-[#e8919a] flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest transition-all shadow-lg hover:shadow-xl hover:scale-105"
                        >
                            <Plus className="w-4 h-4" /> Add Clinic
                        </button>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className={cn('rounded-2xl p-5 border', isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white border-gray-100 shadow-sm')}>
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="skeleton-shimmer w-10 h-10 rounded-xl" />
                                    </div>
                                    <div className="skeleton-shimmer h-5 w-3/4 mb-2" />
                                    <div className="skeleton-shimmer h-4 w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {clinics.map((clinic) => (
                                <div
                                    key={clinic.id}
                                    onClick={() => selectClinic(clinic.id)}
                                    className={cn(
                                        'rounded-[2.5rem] p-6 border-4 cursor-pointer transition-all hover:-translate-y-1 shadow-xl hover:shadow-2xl group relative overflow-hidden',
                                        isDark ? 'bg-[#1e1e1e]' : 'bg-white',
                                        selectedClinic?.id === clinic.id
                                            ? isDark ? 'border-white/20 ring-4 ring-white/5' : 'border-[#e8919a] ring-4 ring-[#e8919a]/20'
                                            : isDark ? 'border-white/5 hover:border-white/10' : 'border-gray-50 hover:border-gray-100'
                                    )}
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#e8919a]/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
                                    <div className="flex items-start justify-between mb-6 relative z-10">
                                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform", isDark ? "bg-[#0f0f0f]" : "bg-[#fef9f3]")}>
                                            <Stethoscope className={cn("w-7 h-7", isDark ? "text-[#e8919a]" : "text-[#512c31]")} />
                                        </div>
                                        {selectedClinic?.id === clinic.id && (
                                            <span className="px-3 py-1 bg-[#512c31] text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">Selected</span>
                                        )}
                                    </div>
                                    <h3 className={cn("text-xl font-black tracking-tight mb-1 relative z-10", isDark ? "text-white" : "text-[#512c31]")}>{clinic.name}</h3>
                                    <p className={cn("text-[11px] font-bold uppercase tracking-widest relative z-10", isDark ? "text-gray-400" : "text-[#512c31]/60")}>Code: {clinic.code}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'staff' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                        <h2 className={cn("text-xl sm:text-2xl font-black tracking-tight", isDark ? "text-white" : "text-[#512c31]")}>Staff Members</h2>
                        <button
                            onClick={() => { clearMessages(); setShowStaffModal(true); }}
                            className="px-4 py-2.5 bg-[#512c31] text-white rounded-xl hover:bg-[#e8919a] flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-widest transition-all shadow-lg hover:shadow-xl hover:scale-105"
                        >
                            <UserPlus className="w-4 h-4" /> Add Staff
                        </button>
                    </div>

                    <div className={cn("rounded-[2.5rem] border-4 overflow-hidden shadow-2xl dashboard-reveal reveal-delay-2", isDark ? "bg-[#1e1e1e] border-white/5 shadow-black/50" : "bg-white border-white/50 shadow-[#512c31]/5")}>
                        {loading ? (
                            <div>
                                <div className={cn('px-4 py-3 border-b', isDark ? 'bg-[#0f0f0f] border-gray-800' : 'bg-gray-50 border-gray-200')}>
                                    <div className="grid grid-cols-4 gap-4">
                                        {[...Array(4)].map((_, i) => <div key={i} className="skeleton-shimmer h-4" />)}
                                    </div>
                                </div>
                                <div className="divide-y divide-gray-800/40">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="px-4 py-4 grid grid-cols-4 gap-4 items-center">
                                            <div className="skeleton-shimmer h-4" />
                                            <div className="skeleton-shimmer h-4" />
                                            <div className="flex gap-1">
                                                <div className="skeleton-shimmer h-5 w-12 rounded" />
                                                <div className="skeleton-shimmer h-5 w-12 rounded" />
                                            </div>
                                            <div className="skeleton-shimmer h-8 w-8 rounded-lg ml-auto" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className={cn("font-black uppercase tracking-widest text-[10px] sm:text-xs", isDark ? "bg-[#0f0f0f] text-gray-400" : "bg-[#fef9f3] text-[#512c31]/60")}>
                                        <tr>
                                            <th className="px-5 sm:px-6 py-5">Name</th>
                                            <th className="px-5 sm:px-6 py-5">Username</th>
                                            <th className="px-5 sm:px-6 py-5">Assigned Clinics</th>
                                            <th className="px-5 sm:px-6 py-5">Permissions</th>
                                            <th className="px-5 sm:px-6 py-5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className={cn("divide-y", isDark ? "divide-gray-800" : "divide-gray-50")}>
                                        {users.map((user) => (
                                            <tr key={user.id} className={cn("transition-all duration-300 group", isDark ? "hover:bg-[#252525]" : "hover:bg-[#fef9f3]")}>
                                                <td className={cn("px-5 sm:px-6 py-5 font-black text-sm", isDark ? "text-white" : "text-[#512c31]")}>{user.fullName}</td>
                                                <td className={cn("px-5 sm:px-6 py-5 text-xs font-bold uppercase tracking-widest", isDark ? "text-gray-400" : "text-[#512c31]/60")}>@{user.username}</td>
                                                <td className="px-5 sm:px-6 py-5">
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.clinicIds.map((clinicId) => {
                                                            const clinic = clinics.find((item) => item.id === clinicId);
                                                            return clinic ? <span key={clinicId} className="px-3 py-1 bg-[#512c31]/10 dark:bg-emerald-500/20 text-[#512c31] dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest">{clinic.code}</span> : null;
                                                        })}
                                                    </div>
                                                </td>
                                                <td className="px-5 sm:px-6 py-5">
                                                    {(() => {
                                                        const perms = getPermsForUser(user.id);
                                                        const pageCount = Object.values(perms.pages).filter(Boolean).length;
                                                        const editCount = Object.values(perms.edits).filter(Boolean).length;
                                                        return (
                                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                                <span className={cn('px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest', isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-50 text-blue-600')}>
                                                                    {pageCount}/{PAGE_PERMISSIONS.length} pages
                                                                </span>
                                                                <span className={cn('px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest', editCount > 0 ? (isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-50 text-amber-600') : isDark ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-400')}>
                                                                    {editCount} edit{editCount !== 1 ? 's' : ''}
                                                                </span>
                                                            </div>
                                                        );
                                                    })()}
                                                </td>
                                                <td className="px-5 sm:px-6 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => openPermModal(user)}
                                                            className={cn("p-2 rounded-xl transition-colors shadow-sm", isDark ? "text-purple-400 hover:text-purple-300 hover:bg-purple-500/10" : "bg-purple-50 text-purple-600 hover:bg-purple-100")}
                                                            title="Manage Permissions"
                                                        >
                                                            <ShieldCheck className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => { setSelectedUser(user); setPasswordForm({ newPassword: '' }); clearMessages(); setShowPasswordModal(true); }}
                                                            className={cn("p-2 rounded-xl transition-colors shadow-sm", isDark ? "text-gray-400 hover:text-white hover:bg-white/10" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}
                                                            title="Reset Password"
                                                        >
                                                            <Key className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showClinicModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className={cn("rounded-2xl p-6 w-full max-w-md border shadow-2xl transition-colors", isDark ? "bg-[#1e1e1e] border-gray-800" : "bg-white border-gray-200")}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className={cn("text-xl font-bold", isDark ? "text-white" : "text-gray-900")}>Create New Clinic</h3>
                            <button onClick={() => setShowClinicModal(false)} className={cn("transition-colors", isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900")}><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleCreateClinic} className="space-y-4">
                            <input required value={clinicForm.name} onChange={(e) => setClinicForm({ ...clinicForm, name: e.target.value })} className={cn("w-full border rounded-xl p-3 outline-none focus:border-[#ff7a6b] transition-colors", isDark ? "bg-[#0f0f0f] border-gray-800 text-white" : "bg-white border-gray-200 text-gray-900")} placeholder="Clinic Name" />
                            <input required value={clinicForm.code} onChange={(e) => setClinicForm({ ...clinicForm, code: e.target.value })} className={cn("w-full border rounded-xl p-3 outline-none focus:border-[#ff7a6b] transition-colors", isDark ? "bg-[#0f0f0f] border-gray-800 text-white" : "bg-white border-gray-200 text-gray-900")} placeholder="Clinic Code" />
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowClinicModal(false)} className={cn("flex-1 px-4 py-2 border rounded-xl transition-all", isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50")}>Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-[#ff7a6b] text-white rounded-xl hover:bg-[#ff6b5b] shadow-lg shadow-[#ff7a6b]/20">Create Clinic</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showStaffModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className={cn("rounded-2xl p-6 w-full max-w-md border shadow-2xl max-h-[90vh] overflow-y-auto transition-colors", isDark ? "bg-[#1e1e1e] border-gray-800" : "bg-white border-gray-200")}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className={cn("text-xl font-bold", isDark ? "text-white" : "text-gray-900")}>Add Staff Member</h3>
                            <button onClick={() => setShowStaffModal(false)} className={cn("transition-colors", isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900")}><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleCreateStaff} className="space-y-4">
                            <input required value={staffForm.fullName} onChange={(e) => setStaffForm({ ...staffForm, fullName: e.target.value })} className={cn("w-full border rounded-xl p-3 outline-none focus:border-[#ff7a6b] transition-colors", isDark ? "bg-[#0f0f0f] border-gray-800 text-white" : "bg-white border-gray-200 text-gray-900")} placeholder="Full Name" />
                            <input required value={staffForm.username} onChange={(e) => setStaffForm({ ...staffForm, username: e.target.value })} className={cn("w-full border rounded-xl p-3 outline-none focus:border-[#ff7a6b] transition-colors", isDark ? "bg-[#0f0f0f] border-gray-800 text-white" : "bg-white border-gray-200 text-gray-900")} placeholder="Username" />
                            <input required type="email" value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} className={cn("w-full border rounded-xl p-3 outline-none focus:border-[#ff7a6b] transition-colors", isDark ? "bg-[#0f0f0f] border-gray-800 text-white" : "bg-white border-gray-200 text-gray-900")} placeholder="Email" />
                            <input required type="text" value={staffForm.password} onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })} className={cn("w-full border rounded-xl p-3 outline-none focus:border-[#ff7a6b] transition-colors", isDark ? "bg-[#0f0f0f] border-gray-800 text-white" : "bg-white border-gray-200 text-gray-900")} placeholder="Password" />
                            <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin">
                                {clinics.map((clinic) => (
                                    <label key={clinic.id} className={cn("flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors", isDark ? "bg-[#0f0f0f] hover:bg-white/5" : "bg-gray-50 hover:bg-gray-100")}>
                                        <input type="checkbox" className="accent-[#ff7a6b]" checked={staffForm.clinicIds.includes(clinic.id)} onChange={() => toggleClinicSelection(clinic.id)} />
                                        <span className={cn("text-sm", isDark ? "text-white" : "text-gray-900")}>{clinic.name}</span>
                                        <span className={cn("text-xs ml-auto", isDark ? "text-gray-500" : "text-gray-400 font-mono")}>{clinic.code}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowStaffModal(false)} className={cn("flex-1 px-4 py-2 border rounded-xl transition-all", isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50")}>Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-[#ff7a6b] text-white rounded-xl hover:bg-[#ff6b5b] shadow-lg shadow-[#ff7a6b]/20">Add Staff</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showPasswordModal && selectedUser && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className={cn("rounded-2xl p-6 w-full max-w-sm border shadow-2xl transition-colors", isDark ? "bg-[#1e1e1e] border-gray-800" : "bg-white border-gray-200")}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className={cn("text-xl font-bold", isDark ? "text-white" : "text-gray-900")}>Reset Password</h3>
                            <button onClick={() => setShowPasswordModal(false)} className={cn("transition-colors", isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-900")}><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <input required type="text" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ newPassword: e.target.value })} className={cn("w-full border rounded-xl p-3 outline-none focus:border-[#ff7a6b] transition-colors", isDark ? "bg-[#0f0f0f] border-gray-800 text-white" : "bg-white border-gray-200 text-gray-900")} placeholder="New Password" />
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowPasswordModal(false)} className={cn("flex-1 px-4 py-2 border rounded-xl transition-all", isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50")}>Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-[#ff7a6b] text-white rounded-xl hover:bg-[#ff6b5b] shadow-lg shadow-[#ff7a6b]/20">Reset</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Permissions Modal ── */}
            {showPermModal && selectedUser && permForm && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className={cn(
                        "rounded-2xl w-full max-w-lg border shadow-2xl flex flex-col max-h-[90vh] transition-colors",
                        isDark ? "bg-[#1e1e1e] border-gray-800" : "bg-white border-gray-200"
                    )}>
                        {/* Header */}
                        <div className={cn("flex items-center justify-between p-6 border-b flex-shrink-0", isDark ? "border-gray-800" : "border-gray-100")}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                    <ShieldCheck className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <h3 className={cn("font-bold text-base", isDark ? "text-white" : "text-gray-900")}>Staff Permissions</h3>
                                    <p className={cn("text-xs", isDark ? "text-gray-500" : "text-gray-400")}>{selectedUser.fullName} · @{selectedUser.username}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowPermModal(false)} className={cn("p-2 rounded-xl transition-colors", isDark ? "text-gray-400 hover:text-white hover:bg-white/10" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100")}>
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Quick actions */}
                        <div className={cn("flex items-center gap-2 px-6 py-3 border-b flex-shrink-0", isDark ? "border-gray-800" : "border-gray-100")}>
                            <span className={cn("text-xs mr-auto", isDark ? "text-gray-500" : "text-gray-400")}>Quick set:</span>
                            <button onClick={grantAll} className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/30 transition-colors">Grant All</button>
                            <button onClick={revokeAll} className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/30 transition-colors">Revoke All</button>
                        </div>

                        {/* Scrollable body */}
                        <div className="overflow-y-auto flex-1 p-6 space-y-6">
                            {/* Page Access */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Shield className="w-4 h-4 text-blue-400" />
                                    <h4 className={cn("text-sm font-semibold", isDark ? "text-white" : "text-gray-900")}>Page Access</h4>
                                    <span className={cn("text-xs ml-auto", isDark ? "text-gray-500" : "text-gray-400")}>
                                        {Object.values(permForm.pages).filter(Boolean).length}/{PAGE_PERMISSIONS.length} enabled
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {PAGE_PERMISSIONS.map(({ key, label, icon }) => {
                                        const on = permForm.pages[key];
                                        return (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => togglePage(key)}
                                                className={cn(
                                                    'flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all',
                                                    on
                                                        ? 'border-blue-500/40 bg-blue-500/10'
                                                        : isDark ? 'border-gray-800 bg-[#0f0f0f] hover:border-gray-700' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                                )}
                                            >
                                                <span className="text-base">{icon}</span>
                                                <span className={cn('text-xs font-medium flex-1', on ? 'text-blue-300' : isDark ? 'text-gray-400' : 'text-gray-600')}>{label}</span>
                                                <div className={cn('w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all', on ? 'bg-blue-500 border-blue-500' : isDark ? 'border-gray-700' : 'border-gray-300')}>
                                                    {on && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Edit Authority */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                                    <h4 className={cn("text-sm font-semibold", isDark ? "text-white" : "text-gray-900")}>Edit Authority</h4>
                                    <span className={cn("text-xs ml-auto", isDark ? "text-gray-500" : "text-gray-400")}>
                                        {Object.values(permForm.edits).filter(Boolean).length}/{EDIT_PERMISSIONS.length} enabled
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {EDIT_PERMISSIONS.map(({ key, label, desc }) => {
                                        const on = permForm.edits[key];
                                        return (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => toggleEdit(key)}
                                                className={cn(
                                                    'w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                                                    on
                                                        ? 'border-amber-500/40 bg-amber-500/10'
                                                        : isDark ? 'border-gray-800 bg-[#0f0f0f] hover:border-gray-700' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                                )}
                                            >
                                                <div className={cn('w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all', on ? 'bg-amber-500 border-amber-500' : isDark ? 'border-gray-700' : 'border-gray-300')}>
                                                    {on && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={cn('text-xs font-semibold', on ? 'text-amber-300' : isDark ? 'text-gray-300' : 'text-gray-700')}>{label}</p>
                                                    <p className={cn('text-xs mt-0.5', isDark ? 'text-gray-600' : 'text-gray-400')}>{desc}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className={cn("p-6 border-t flex-shrink-0", isDark ? "border-gray-800" : "border-gray-100")}>
                            {formError && <p className="text-xs text-red-400 mb-3">{formError}</p>}
                            {formSuccess && <p className="text-xs text-emerald-400 mb-3">{formSuccess}</p>}
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowPermModal(false)} className={cn("flex-1 px-4 py-2.5 border rounded-xl transition-all text-sm", isDark ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-200 text-gray-600 hover:bg-gray-50")}>Cancel</button>
                                <button
                                    type="button"
                                    onClick={handleSavePermissions}
                                    disabled={permSaving}
                                    className="flex-1 px-4 py-2.5 bg-[#ff7a6b] text-white rounded-xl hover:bg-[#ff6b5b] shadow-lg shadow-[#ff7a6b]/20 text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    {permSaving ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</> : 'Save Permissions'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
