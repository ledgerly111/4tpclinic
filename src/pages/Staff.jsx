import { useEffect, useState } from 'react';
import { Building2, Users, Plus, Key, X, UserPlus, Stethoscope } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';
import { mockAuthStore } from '../lib/mockAuthStore';
import { cn } from '../lib/utils';

export function Staff() {
    const { session } = useAuth();
    const { selectedOrganization, selectedClinic, selectClinic } = useTenant();
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

    const loadData = () => {
        if (!session?.organizationId) return;
        setClinics(mockAuthStore.getClinicsByOrganization(session.organizationId));
        setUsers(mockAuthStore.getUsersByOrganization(session.organizationId).filter((u) => u.role === 'staff'));
    };

    useEffect(() => {
        loadData();
    }, [session?.organizationId]);

    const clearMessages = () => {
        setFormError('');
        setFormSuccess('');
    };

    const handleCreateClinic = (event) => {
        event.preventDefault();
        clearMessages();
        try {
            mockAuthStore.createClinic({
                organizationId: session.organizationId,
                name: clinicForm.name.trim(),
                code: clinicForm.code.trim().toUpperCase(),
            });
            setFormSuccess('Clinic created successfully.');
            setClinicForm({ name: '', code: '' });
            loadData();
            setTimeout(() => {
                setShowClinicModal(false);
                setFormSuccess('');
            }, 1000);
        } catch (error) {
            setFormError(error.message || 'Failed to create clinic.');
        }
    };

    const handleCreateStaff = (event) => {
        event.preventDefault();
        clearMessages();
        if (staffForm.clinicIds.length === 0) {
            setFormError('Assign at least one clinic.');
            return;
        }
        try {
            mockAuthStore.createUser({
                role: 'staff',
                organizationId: session.organizationId,
                clinicIds: staffForm.clinicIds,
                username: staffForm.username.trim(),
                email: staffForm.email.trim(),
                password: staffForm.password,
                fullName: staffForm.fullName.trim(),
            });
            setFormSuccess('Staff member created.');
            setStaffForm({ fullName: '', username: '', email: '', password: '', clinicIds: [] });
            loadData();
            setTimeout(() => {
                setShowStaffModal(false);
                setFormSuccess('');
            }, 1000);
        } catch (error) {
            setFormError(error.message || 'Failed to create staff.');
        }
    };

    const handleResetPassword = (event) => {
        event.preventDefault();
        clearMessages();
        try {
            mockAuthStore.resetPassword(selectedUser.id, passwordForm.newPassword);
            setFormSuccess('Password reset successfully.');
            loadData();
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
            <div className="rounded-2xl p-8 bg-[#1e1e1e] text-gray-400 text-center">
                Supervision is available for organization admins only.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Supervision</h1>
                    <p className="text-gray-400">
                        Manage clinics and staff for <span className="text-white">{selectedOrganization?.name || 'your organization'}</span>
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
                <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-gray-800">
                    <p className="text-gray-400 text-sm">Clinics</p>
                    <p className="text-2xl font-bold text-white">{clinics.length}</p>
                </div>
                <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-gray-800">
                    <p className="text-gray-400 text-sm">Staff</p>
                    <p className="text-2xl font-bold text-white">{users.length}</p>
                </div>
                <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-gray-800">
                    <p className="text-gray-400 text-sm">Active Staff</p>
                    <p className="text-2xl font-bold text-emerald-400">{users.filter((u) => u.isActive).length}</p>
                </div>
                <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-gray-800">
                    <p className="text-gray-400 text-sm">Selected Clinic</p>
                    <p className="text-sm font-medium text-white truncate">{selectedClinic?.name || 'None'}</p>
                </div>
            </div>

            <div className="flex gap-2 border-b border-gray-800">
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
                        <h2 className="text-lg font-bold text-white">Clinics & Branches</h2>
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
                                    'bg-[#1e1e1e] rounded-2xl p-5 border cursor-pointer transition-all',
                                    selectedClinic?.id === clinic.id ? 'border-[#ff7a6b] ring-1 ring-[#ff7a6b]/20' : 'border-gray-800 hover:border-gray-700'
                                )}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                        <Stethoscope className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    {selectedClinic?.id === clinic.id && (
                                        <span className="px-2 py-0.5 bg-[#ff7a6b]/20 text-[#ff7a6b] rounded-full text-xs">Selected</span>
                                    )}
                                </div>
                                <h3 className="text-white font-semibold mb-1">{clinic.name}</h3>
                                <p className="text-gray-500 text-sm">Code: {clinic.code}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'staff' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold text-white">Staff Members</h2>
                        <button
                            onClick={() => { clearMessages(); setShowStaffModal(true); }}
                            className="px-3 py-2 bg-[#ff7a6b] text-white rounded-xl hover:bg-[#ff6b5b] flex items-center gap-2 text-sm transition-colors"
                        >
                            <UserPlus className="w-4 h-4" /> Add Staff
                        </button>
                    </div>

                    <div className="bg-[#1e1e1e] rounded-2xl border border-gray-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-[#0f0f0f] text-gray-400">
                                    <tr>
                                        <th className="p-4 font-medium">Name</th>
                                        <th className="p-4 font-medium">Username</th>
                                        <th className="p-4 font-medium">Assigned Clinics</th>
                                        <th className="p-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-[#252525]">
                                            <td className="p-4 text-white">{user.fullName}</td>
                                            <td className="p-4 text-gray-400">@{user.username}</td>
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
                                                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
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
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1e1e1e] rounded-2xl p-6 w-full max-w-md border border-gray-800">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">Create New Clinic</h3>
                            <button onClick={() => setShowClinicModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleCreateClinic} className="space-y-4">
                            <input required value={clinicForm.name} onChange={(e) => setClinicForm({ ...clinicForm, name: e.target.value })} className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl p-3 text-white" placeholder="Clinic Name" />
                            <input required value={clinicForm.code} onChange={(e) => setClinicForm({ ...clinicForm, code: e.target.value })} className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl p-3 text-white" placeholder="Clinic Code" />
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowClinicModal(false)} className="flex-1 px-4 py-2 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-[#ff7a6b] text-white rounded-xl hover:bg-[#ff6b5b]">Create Clinic</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showStaffModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1e1e1e] rounded-2xl p-6 w-full max-w-md border border-gray-800 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">Add Staff Member</h3>
                            <button onClick={() => setShowStaffModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleCreateStaff} className="space-y-4">
                            <input required value={staffForm.fullName} onChange={(e) => setStaffForm({ ...staffForm, fullName: e.target.value })} className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl p-3 text-white" placeholder="Full Name" />
                            <input required value={staffForm.username} onChange={(e) => setStaffForm({ ...staffForm, username: e.target.value })} className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl p-3 text-white" placeholder="Username" />
                            <input required type="email" value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl p-3 text-white" placeholder="Email" />
                            <input required type="text" value={staffForm.password} onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })} className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl p-3 text-white" placeholder="Password" />
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {clinics.map((clinic) => (
                                    <label key={clinic.id} className="flex items-center gap-3 p-3 bg-[#0f0f0f] rounded-xl cursor-pointer">
                                        <input type="checkbox" checked={staffForm.clinicIds.includes(clinic.id)} onChange={() => toggleClinicSelection(clinic.id)} />
                                        <span className="text-white text-sm">{clinic.name}</span>
                                        <span className="text-gray-500 text-xs ml-auto">{clinic.code}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowStaffModal(false)} className="flex-1 px-4 py-2 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-[#ff7a6b] text-white rounded-xl hover:bg-[#ff6b5b]">Add Staff</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showPasswordModal && selectedUser && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1e1e1e] rounded-2xl p-6 w-full max-w-sm border border-gray-800">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">Reset Password</h3>
                            <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <input required type="text" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ newPassword: e.target.value })} className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl p-3 text-white" placeholder="New Password" />
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 px-4 py-2 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-[#ff7a6b] text-white rounded-xl hover:bg-[#ff6b5b]">Reset</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
