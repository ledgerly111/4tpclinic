import { useEffect, useState } from 'react';
import { Building2, Users, Plus, Key, X, UserPlus, Stethoscope } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';
import { useStore } from '../context/StoreContext';
import {
    fetchAdminSupervisionApi,
    createClinicApi,
    createStaffApi,
    resetStaffPasswordApi,
} from '../lib/authApi';
import { cn } from '../lib/utils';

export function Staff() {
    const { session } = useAuth();
    const { selectedOrganization, selectedClinic, selectClinic } = useTenant();
    const { theme } = useStore();
    const isDark = theme === 'dark';
    const [clinics, setClinics] = useState([]);
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('clinics');
    const [showClinicModal, setShowClinicModal] = useState(false);
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

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
        if (!session?.organizationId) return;
        const data = await fetchAdminSupervisionApi();
        setClinics(Array.isArray(data.clinics) ? data.clinics : []);
        setUsers(Array.isArray(data.users) ? data.users : []);
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

    if (!session?.organizationId) {
        return (
            <div className={cn("rounded-2xl p-8 text-center", isDark ? "bg-[#1e1e1e] text-gray-400" : "bg-white text-gray-500 border border-gray-100 shadow-sm")}>
                Supervision is available for organization admins only.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-gray-900")}>Supervision</h1>
                    <p className={cn(isDark ? "text-gray-400" : "text-gray-600")}>
                        Manage clinics and staff for <span className={cn(isDark ? "text-white" : "text-gray-900 font-semibold")}>{selectedOrganization?.name || 'your organization'}</span>
                    </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                    <Building2 className="w-4 h-4" />
                    <span>Admin Controls</span>
                </div>
            </div>

            {formError && <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{formError}</div>}
            {formSuccess && <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{formSuccess}</div>}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className={cn("rounded-2xl p-4 border transition-colors", isDark ? "bg-[#1e1e1e] border-gray-800" : "bg-white border-gray-100 shadow-sm")}>
                    <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>Clinics</p>
                    <p className={cn("text-2xl font-bold", isDark ? "text-white" : "text-gray-900")}>{clinics.length}</p>
                </div>
                <div className={cn("rounded-2xl p-4 border transition-colors", isDark ? "bg-[#1e1e1e] border-gray-800" : "bg-white border-gray-100 shadow-sm")}>
                    <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>Staff</p>
                    <p className={cn("text-2xl font-bold", isDark ? "text-white" : "text-gray-900")}>{users.length}</p>
                </div>
                <div className={cn("rounded-2xl p-4 border transition-colors", isDark ? "bg-[#1e1e1e] border-gray-800" : "bg-white border-gray-100 shadow-sm")}>
                    <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>Active Staff</p>
                    <p className="text-2xl font-bold text-emerald-400">{users.filter((u) => u.isActive).length}</p>
                </div>
                <div className={cn("rounded-2xl p-4 border transition-colors", isDark ? "bg-[#1e1e1e] border-gray-800" : "bg-white border-gray-100 shadow-sm")}>
                    <p className={cn("text-sm", isDark ? "text-gray-400" : "text-gray-500")}>Selected Clinic</p>
                    <p className={cn("text-sm font-medium truncate", isDark ? "text-white" : "text-gray-900")}>{selectedClinic?.name || 'None'}</p>
                </div>
            </div>

            <div className={cn("flex gap-2 border-b", isDark ? "border-gray-800" : "border-gray-200")}>
                <button
                    onClick={() => setActiveTab('clinics')}
                    className={cn(
                        'px-4 py-3 text-sm font-medium transition-colors border-b-2',
                        activeTab === 'clinics' ? 'text-[#ff7a6b] border-[#ff7a6b]' : 'text-gray-400 border-transparent hover:text-white'
                    )}
                >
                    Clinics
                </button>
                <button
                    onClick={() => setActiveTab('staff')}
                    className={cn(
                        'px-4 py-3 text-sm font-medium transition-colors border-b-2',
                        activeTab === 'staff' ? 'text-[#ff7a6b] border-[#ff7a6b]' : 'text-gray-400 border-transparent hover:text-white'
                    )}
                >
                    Staff
                </button>
            </div>

            {activeTab === 'clinics' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className={cn("text-lg font-bold", isDark ? "text-white" : "text-gray-900")}>Clinics & Branches</h2>
                        <button
                            onClick={() => { clearMessages(); setShowClinicModal(true); }}
                            className="px-3 py-2 bg-[#ff7a6b] text-white rounded-xl hover:bg-[#ff6b5b] flex items-center gap-2 text-sm transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Add Clinic
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {clinics.map((clinic) => (
                            <div
                                key={clinic.id}
                                onClick={() => selectClinic(clinic.id)}
                                className={cn(
                                    'rounded-2xl p-5 border cursor-pointer transition-all',
                                    isDark ? 'bg-[#1e1e1e]' : 'bg-white shadow-sm hover:shadow-md',
                                    selectedClinic?.id === clinic.id
                                        ? 'border-[#ff7a6b] ring-1 ring-[#ff7a6b]/20'
                                        : isDark ? 'border-gray-800 hover:border-gray-700' : 'border-gray-100 hover:border-gray-200'
                                )}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                        <Stethoscope className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    {selectedClinic?.id === clinic.id && (
                                        <span className="px-2 py-0.5 bg-[#ff7a6b]/20 text-[#ff7a6b] rounded-full text-xs font-medium">Selected</span>
                                    )}
                                </div>
                                <h3 className={cn("font-semibold mb-1", isDark ? "text-white" : "text-gray-900")}>{clinic.name}</h3>
                                <p className={cn("text-sm", isDark ? "text-gray-500" : "text-gray-600")}>Code: {clinic.code}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'staff' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className={cn("text-lg font-bold", isDark ? "text-white" : "text-gray-900")}>Staff Members</h2>
                        <button
                            onClick={() => { clearMessages(); setShowStaffModal(true); }}
                            className="px-3 py-2 bg-[#ff7a6b] text-white rounded-xl hover:bg-[#ff6b5b] flex items-center gap-2 text-sm transition-colors"
                        >
                            <UserPlus className="w-4 h-4" /> Add Staff
                        </button>
                    </div>

                    <div className={cn("rounded-2xl border overflow-hidden", isDark ? "bg-[#1e1e1e] border-gray-800" : "bg-white border-gray-100 shadow-sm")}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className={cn(isDark ? "bg-[#0f0f0f] text-gray-400" : "bg-gray-50 text-gray-600")}>
                                    <tr>
                                        <th className="p-4 font-medium">Name</th>
                                        <th className="p-4 font-medium">Username</th>
                                        <th className="p-4 font-medium">Assigned Clinics</th>
                                        <th className="p-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className={cn("divide-y", isDark ? "divide-gray-800" : "divide-gray-100")}>
                                    {users.map((user) => (
                                        <tr key={user.id} className={cn("transition-colors", isDark ? "hover:bg-[#252525]" : "hover:bg-gray-50")}>
                                            <td className={cn("p-4 font-medium", isDark ? "text-white" : "text-gray-900")}>{user.fullName}</td>
                                            <td className={cn("p-4", isDark ? "text-gray-400" : "text-gray-600")}>@{user.username}</td>
                                            <td className="p-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {user.clinicIds.map((clinicId) => {
                                                        const clinic = clinics.find((item) => item.id === clinicId);
                                                        return clinic ? <span key={clinicId} className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-xs">{clinic.code}</span> : null;
                                                    })}
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => { setSelectedUser(user); setPasswordForm({ newPassword: '' }); clearMessages(); setShowPasswordModal(true); }}
                                                    className={cn("p-2 rounded-lg transition-colors", isDark ? "text-gray-400 hover:text-white hover:bg-white/10" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100")}
                                                    title="Reset Password"
                                                >
                                                    <Key className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
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
        </div>
    );
}
