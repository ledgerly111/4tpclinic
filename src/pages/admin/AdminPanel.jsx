import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTenant } from '../../context/TenantContext';
import { mockAuthStore } from '../../lib/mockAuthStore';
import { Building2, Users, Plus, Search, Trash2, Edit2, Key, X, UserPlus, Stethoscope } from 'lucide-react';
import { cn } from '../../lib/utils';

export function AdminPanel() {
  const { session } = useAuth();
  const { selectedOrganization, selectedClinic, selectClinic, getClinicsBySelectedOrg } = useTenant();
  
  const [clinics, setClinics] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('clinics');
  
  // Modal states
  const [showClinicModal, setShowClinicModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [clinicForm, setClinicForm] = useState({ name: '', code: '' });
  const [staffForm, setStaffForm] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    clinicIds: [],
  });
  const [passwordForm, setPasswordForm] = useState({ newPassword: '' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    if (session?.organizationId) {
      loadData();
    }
  }, [session]);

  const loadData = () => {
    setIsLoading(true);
    // Load only data from admin's organization
    const allClinics = mockAuthStore.getClinicsByOrganization(session.organizationId);
    const allUsers = mockAuthStore.getUsersByOrganization(session.organizationId);
    
    setClinics(allClinics);
    setUsers(allUsers.filter(u => u.role === 'staff'));
    setIsLoading(false);
  };

  const handleCreateClinic = (e) => {
    e.preventDefault();
    setFormError('');
    
    try {
      mockAuthStore.createClinic({
        organizationId: session.organizationId,
        name: clinicForm.name,
        code: clinicForm.code.toUpperCase(),
      });
      
      setFormSuccess('Clinic created successfully');
      setClinicForm({ name: '', code: '' });
      loadData();
      
      setTimeout(() => {
        setShowClinicModal(false);
        setFormSuccess('');
      }, 1500);
    } catch (err) {
      setFormError(err.message || 'Failed to create clinic');
    }
  };

  const handleCreateStaff = (e) => {
    e.preventDefault();
    setFormError('');
    
    if (staffForm.clinicIds.length === 0) {
      setFormError('Please select at least one clinic');
      return;
    }
    
    try {
      mockAuthStore.createUser({
        role: 'staff',
        organizationId: session.organizationId,
        clinicIds: staffForm.clinicIds,
        username: staffForm.username,
        email: staffForm.email,
        password: staffForm.password,
        fullName: staffForm.fullName,
      });
      
      setFormSuccess('Staff member created successfully');
      setStaffForm({ fullName: '', username: '', email: '', password: '', clinicIds: [] });
      loadData();
      
      setTimeout(() => {
        setShowStaffModal(false);
        setFormSuccess('');
      }, 1500);
    } catch (err) {
      setFormError(err.message || 'Failed to create staff');
    }
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setFormError('');
    
    try {
      mockAuthStore.resetPassword(selectedUser.id, passwordForm.newPassword);
      setFormSuccess('Password reset successfully');
      setPasswordForm({ newPassword: '' });
      
      setTimeout(() => {
        setShowPasswordModal(false);
        setSelectedUser(null);
        setFormSuccess('');
      }, 1500);
    } catch (err) {
      setFormError(err.message || 'Failed to reset password');
    }
  };

  const openPasswordModal = (user) => {
    setSelectedUser(user);
    setPasswordForm({ newPassword: '' });
    setFormError('');
    setFormSuccess('');
    setShowPasswordModal(true);
  };

  const toggleClinicSelection = (clinicId) => {
    setStaffForm(prev => ({
      ...prev,
      clinicIds: prev.clinicIds.includes(clinicId)
        ? prev.clinicIds.filter(id => id !== clinicId)
        : [...prev.clinicIds, clinicId]
    }));
  };

  if (!session?.organizationId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No organization assigned</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-400">
            Managing: <span className="text-white font-medium">{selectedOrganization?.name || 'Your Organization'}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-sm">
          <Building2 className="w-4 h-4" />
          <span>Organization Admin</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">Clinics</p>
          <p className="text-2xl font-bold text-white">{clinics.length}</p>
        </div>
        <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">Staff</p>
          <p className="text-2xl font-bold text-white">{users.length}</p>
        </div>
        <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">Active Staff</p>
          <p className="text-2xl font-bold text-emerald-400">
            {users.filter(u => u.isActive).length}
          </p>
        </div>
        <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">Selected Clinic</p>
          <p className="text-sm font-medium text-white truncate">
            {selectedClinic?.name || 'None'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800">
        <button
          onClick={() => setActiveTab('clinics')}
          className={cn(
            "px-4 py-3 text-sm font-medium transition-colors border-b-2",
            activeTab === 'clinics'
              ? "text-[#ff7a6b] border-[#ff7a6b]"
              : "text-gray-400 border-transparent hover:text-white"
          )}
        >
          <span className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Clinics
          </span>
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={cn(
            "px-4 py-3 text-sm font-medium transition-colors border-b-2",
            activeTab === 'staff'
              ? "text-[#ff7a6b] border-[#ff7a6b]"
              : "text-gray-400 border-transparent hover:text-white"
          )}
        >
          <span className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Staff
          </span>
        </button>
      </div>

      {/* Clinics Tab */}
      {activeTab === 'clinics' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Clinics & Branches</h2>
            <button
              onClick={() => {
                setClinicForm({ name: '', code: '' });
                setFormError('');
                setShowClinicModal(true);
              }}
              className="px-3 py-2 bg-[#ff7a6b] text-white rounded-xl hover:bg-[#ff6b5b] flex items-center gap-2 text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Clinic
            </button>
          </div>

          {clinics.length === 0 ? (
            <div className="text-center py-12 bg-[#1e1e1e] rounded-2xl border border-gray-800">
              <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No clinics yet</p>
              <button
                onClick={() => setShowClinicModal(true)}
                className="mt-3 text-[#ff7a6b] hover:underline text-sm"
              >
                Create your first clinic
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {clinics.map((clinic) => (
                <div
                  key={clinic.id}
                  onClick={() => selectClinic(clinic.id)}
                  className={cn(
                    "bg-[#1e1e1e] rounded-2xl p-5 border cursor-pointer transition-all",
                    selectedClinic?.id === clinic.id
                      ? "border-[#ff7a6b] ring-1 ring-[#ff7a6b]/20"
                      : "border-gray-800 hover:border-gray-700"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                      <Stethoscope className="w-5 h-5 text-emerald-400" />
                    </div>
                    {selectedClinic?.id === clinic.id && (
                      <span className="px-2 py-0.5 bg-[#ff7a6b]/20 text-[#ff7a6b] rounded-full text-xs">
                        Selected
                      </span>
                    )}
                  </div>
                  <h3 className="text-white font-semibold mb-1">{clinic.name}</h3>
                  <p className="text-gray-500 text-sm">Code: {clinic.code}</p>
                  <p className="text-gray-600 text-xs mt-2">
                    Created {new Date(clinic.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Staff Tab */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Staff Members</h2>
            <button
              onClick={() => {
                setStaffForm({ fullName: '', username: '', email: '', password: '', clinicIds: [] });
                setFormError('');
                setShowStaffModal(true);
              }}
              className="px-3 py-2 bg-[#ff7a6b] text-white rounded-xl hover:bg-[#ff6b5b] flex items-center gap-2 text-sm transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Add Staff
            </button>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-12 bg-[#1e1e1e] rounded-2xl border border-gray-800">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No staff members yet</p>
              <button
                onClick={() => setShowStaffModal(true)}
                className="mt-3 text-[#ff7a6b] hover:underline text-sm"
              >
                Add your first staff member
              </button>
            </div>
          ) : (
            <div className="bg-[#1e1e1e] rounded-2xl border border-gray-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#0f0f0f] text-gray-400">
                    <tr>
                      <th className="p-4 font-medium">Name</th>
                      <th className="p-4 font-medium">Username</th>
                      <th className="p-4 font-medium">Assigned Clinics</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-[#252525]">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                              <span className="text-blue-400 text-xs font-bold">
                                {user.fullName.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className="text-white font-medium">{user.fullName}</p>
                              <p className="text-gray-500 text-xs">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-gray-400">@{user.username}</td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {user.clinicIds.map(clinicId => {
                              const clinic = clinics.find(c => c.id === clinicId);
                              return clinic ? (
                                <span
                                  key={clinicId}
                                  className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-xs"
                                >
                                  {clinic.code}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs",
                            user.isActive 
                              ? "bg-emerald-500/20 text-emerald-400" 
                              : "bg-red-500/20 text-red-400"
                          )}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => openPasswordModal(user)}
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
          )}
        </div>
      )}

      {/* Create Clinic Modal */}
      {showClinicModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e1e1e] rounded-2xl p-6 w-full max-w-md border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Create New Clinic</h3>
              <button
                onClick={() => setShowClinicModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {formError && (
              <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <p className="text-red-400 text-sm">{formError}</p>
              </div>
            )}
            {formSuccess && (
              <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                <p className="text-emerald-400 text-sm">{formSuccess}</p>
              </div>
            )}

            <form onSubmit={handleCreateClinic} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Clinic Name *</label>
                <input
                  type="text"
                  required
                  value={clinicForm.name}
                  onChange={(e) => setClinicForm({ ...clinicForm, name: e.target.value })}
                  className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-[#ff7a6b]"
                  placeholder="e.g., Downtown Branch"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Clinic Code *</label>
                <input
                  type="text"
                  required
                  value={clinicForm.code}
                  onChange={(e) => setClinicForm({ ...clinicForm, code: e.target.value })}
                  className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-[#ff7a6b]"
                  placeholder="e.g., DTB"
                />
                <p className="text-gray-500 text-xs mt-1">Short code for identification</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClinicModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#ff7a6b] text-white rounded-xl hover:bg-[#ff6b5b] transition-colors"
                >
                  Create Clinic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Staff Modal */}
      {showStaffModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e1e1e] rounded-2xl p-6 w-full max-w-md border border-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Add Staff Member</h3>
              <button
                onClick={() => setShowStaffModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {formError && (
              <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <p className="text-red-400 text-sm">{formError}</p>
              </div>
            )}
            {formSuccess && (
              <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                <p className="text-emerald-400 text-sm">{formSuccess}</p>
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  value={staffForm.fullName}
                  onChange={(e) => setStaffForm({ ...staffForm, fullName: e.target.value })}
                  className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-[#ff7a6b]"
                  placeholder="e.g., Dr. Jane Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Username *</label>
                <input
                  type="text"
                  required
                  value={staffForm.username}
                  onChange={(e) => setStaffForm({ ...staffForm, username: e.target.value })}
                  className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-[#ff7a6b]"
                  placeholder="e.g., jane_smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-[#ff7a6b]"
                  placeholder="e.g., jane@clinic.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={staffForm.password}
                  onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                  className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-[#ff7a6b]"
                  placeholder="Minimum 6 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Assign Clinics *</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {clinics.map((clinic) => (
                    <label
                      key={clinic.id}
                      className="flex items-center gap-3 p-3 bg-[#0f0f0f] rounded-xl cursor-pointer hover:bg-[#252525] transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={staffForm.clinicIds.includes(clinic.id)}
                        onChange={() => toggleClinicSelection(clinic.id)}
                        className="w-4 h-4 rounded border-gray-600 bg-[#1e1e1e] text-[#ff7a6b] focus:ring-[#ff7a6b]"
                      />
                      <span className="text-white text-sm">{clinic.name}</span>
                      <span className="text-gray-500 text-xs ml-auto">{clinic.code}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#ff7a6b] text-white rounded-xl hover:bg-[#ff6b5b] transition-colors"
                >
                  Add Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e1e1e] rounded-2xl p-6 w-full max-w-sm border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Reset Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-400 text-sm mb-4">
              Reset password for <span className="text-white">{selectedUser.fullName}</span>
            </p>
            
            {formError && (
              <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <p className="text-red-400 text-sm">{formError}</p>
              </div>
            )}
            {formSuccess && (
              <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                <p className="text-emerald-400 text-sm">{formSuccess}</p>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">New Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ newPassword: e.target.value })}
                  className="w-full bg-[#0f0f0f] border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-[#ff7a6b]"
                  placeholder="Minimum 6 characters"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#ff7a6b] text-white rounded-xl hover:bg-[#ff6b5b] transition-colors"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
