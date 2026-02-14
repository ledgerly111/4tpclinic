import { useEffect, useMemo, useState } from 'react';
import { Building2, Shield, UserPlus, Users } from 'lucide-react';
import { mockAuthStore } from '../../lib/mockAuthStore';
import { cn } from '../../lib/utils';

const initialOrgAdminForm = {
  orgName: '',
  adminFullName: '',
  adminUsername: '',
  adminEmail: '',
  adminPassword: '',
};

const initialAdminForm = {
  organizationId: '',
  adminFullName: '',
  adminUsername: '',
  adminEmail: '',
  adminPassword: '',
};

export function SuperAdminPanel() {
  const [organizations, setOrganizations] = useState([]);
  const [users, setUsers] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [orgAdminForm, setOrgAdminForm] = useState(initialOrgAdminForm);
  const [adminForm, setAdminForm] = useState(initialAdminForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const reload = () => {
    setOrganizations(mockAuthStore.getOrganizations());
    setUsers(mockAuthStore.getUsers());
    setClinics(mockAuthStore.getClinics());
  };

  useEffect(() => {
    reload();
  }, []);

  const adminUsers = useMemo(() => users.filter((u) => u.role === 'admin'), [users]);
  const staffUsers = useMemo(() => users.filter((u) => u.role === 'staff'), [users]);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleCreateOrganizationWithAdmin = (event) => {
    event.preventDefault();
    clearMessages();
    try {
      const result = mockAuthStore.createOrganizationWithAdmin(
        orgAdminForm.orgName.trim(),
        {
          username: orgAdminForm.adminUsername.trim(),
          email: orgAdminForm.adminEmail.trim(),
          password: orgAdminForm.adminPassword,
          fullName: orgAdminForm.adminFullName.trim(),
        }
      );

      setSuccess(
        `Created org "${result.organization.name}" and admin login: ${result.admin.email} / ${result.admin.password}`
      );
      setOrgAdminForm(initialOrgAdminForm);
      reload();
    } catch (createError) {
      setError(createError.message || 'Failed to create organization admin.');
    }
  };

  const handleCreateAdminInOrg = (event) => {
    event.preventDefault();
    clearMessages();
    try {
      const admin = mockAuthStore.createAdminForOrganization(
        adminForm.organizationId,
        {
          username: adminForm.adminUsername.trim(),
          email: adminForm.adminEmail.trim(),
          password: adminForm.adminPassword,
          fullName: adminForm.adminFullName.trim(),
        }
      );
      setSuccess(`Created admin login: ${admin.email} / ${admin.password}`);
      setAdminForm(initialAdminForm);
      reload();
    } catch (createError) {
      setError(createError.message || 'Failed to create admin user.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Super Admin Panel</h1>
          <p className="text-gray-400">Developer-only control panel</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-full text-sm">
          <Shield className="w-4 h-4" />
          <span>Super Admin</span>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#1e1e1e] rounded-2xl p-5 border border-gray-800">
          <p className="text-gray-400 text-sm">Organizations</p>
          <p className="text-3xl font-bold text-white">{organizations.length}</p>
        </div>
        <div className="bg-[#1e1e1e] rounded-2xl p-5 border border-gray-800">
          <p className="text-gray-400 text-sm">Clinics</p>
          <p className="text-3xl font-bold text-white">{clinics.length}</p>
        </div>
        <div className="bg-[#1e1e1e] rounded-2xl p-5 border border-gray-800">
          <p className="text-gray-400 text-sm">Admins</p>
          <p className="text-3xl font-bold text-white">{adminUsers.length}</p>
        </div>
        <div className="bg-[#1e1e1e] rounded-2xl p-5 border border-gray-800">
          <p className="text-gray-400 text-sm">Staff</p>
          <p className="text-3xl font-bold text-white">{staffUsers.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-[#1e1e1e] rounded-2xl p-5 border border-gray-800">
          <h2 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            Create Organization + Admin
          </h2>
          <form onSubmit={handleCreateOrganizationWithAdmin} className="space-y-3">
            <input
              required
              value={orgAdminForm.orgName}
              onChange={(e) => setOrgAdminForm((prev) => ({ ...prev, orgName: e.target.value }))}
              className="w-full rounded-xl bg-[#0f0f0f] border border-gray-800 p-3 text-white"
              placeholder="Organization Name"
            />
            <input
              required
              value={orgAdminForm.adminFullName}
              onChange={(e) => setOrgAdminForm((prev) => ({ ...prev, adminFullName: e.target.value }))}
              className="w-full rounded-xl bg-[#0f0f0f] border border-gray-800 p-3 text-white"
              placeholder="Admin Full Name"
            />
            <input
              required
              value={orgAdminForm.adminUsername}
              onChange={(e) => setOrgAdminForm((prev) => ({ ...prev, adminUsername: e.target.value }))}
              className="w-full rounded-xl bg-[#0f0f0f] border border-gray-800 p-3 text-white"
              placeholder="Admin Username"
            />
            <input
              required
              type="email"
              value={orgAdminForm.adminEmail}
              onChange={(e) => setOrgAdminForm((prev) => ({ ...prev, adminEmail: e.target.value }))}
              className="w-full rounded-xl bg-[#0f0f0f] border border-gray-800 p-3 text-white"
              placeholder="Admin Email"
            />
            <input
              required
              type="text"
              value={orgAdminForm.adminPassword}
              onChange={(e) => setOrgAdminForm((prev) => ({ ...prev, adminPassword: e.target.value }))}
              className="w-full rounded-xl bg-[#0f0f0f] border border-gray-800 p-3 text-white"
              placeholder="Admin Password"
            />
            <button className="w-full rounded-xl bg-[#ff7a6b] py-2.5 text-white hover:bg-[#ff6b5b] transition-colors">
              Create Organization Admin
            </button>
          </form>
        </div>

        <div className="bg-[#1e1e1e] rounded-2xl p-5 border border-gray-800">
          <h2 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-400" />
            Create Admin In Existing Organization
          </h2>
          <form onSubmit={handleCreateAdminInOrg} className="space-y-3">
            <select
              required
              value={adminForm.organizationId}
              onChange={(e) => setAdminForm((prev) => ({ ...prev, organizationId: e.target.value }))}
              className="w-full rounded-xl bg-[#0f0f0f] border border-gray-800 p-3 text-white"
            >
              <option value="">Select Organization</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
            <input
              required
              value={adminForm.adminFullName}
              onChange={(e) => setAdminForm((prev) => ({ ...prev, adminFullName: e.target.value }))}
              className="w-full rounded-xl bg-[#0f0f0f] border border-gray-800 p-3 text-white"
              placeholder="Admin Full Name"
            />
            <input
              required
              value={adminForm.adminUsername}
              onChange={(e) => setAdminForm((prev) => ({ ...prev, adminUsername: e.target.value }))}
              className="w-full rounded-xl bg-[#0f0f0f] border border-gray-800 p-3 text-white"
              placeholder="Admin Username"
            />
            <input
              required
              type="email"
              value={adminForm.adminEmail}
              onChange={(e) => setAdminForm((prev) => ({ ...prev, adminEmail: e.target.value }))}
              className="w-full rounded-xl bg-[#0f0f0f] border border-gray-800 p-3 text-white"
              placeholder="Admin Email"
            />
            <input
              required
              type="text"
              value={adminForm.adminPassword}
              onChange={(e) => setAdminForm((prev) => ({ ...prev, adminPassword: e.target.value }))}
              className="w-full rounded-xl bg-[#0f0f0f] border border-gray-800 p-3 text-white"
              placeholder="Admin Password"
            />
            <button className="w-full rounded-xl bg-emerald-600 py-2.5 text-white hover:bg-emerald-500 transition-colors">
              Create Admin User
            </button>
          </form>
        </div>
      </div>

      <div className="bg-[#1e1e1e] rounded-2xl border border-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800">
          <h2 className="text-white text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-400" />
            All Users With Login Details
          </h2>
          <p className="text-gray-500 text-sm">Super admin can view all users and credentials</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#0f0f0f] text-gray-400 text-left">
              <tr>
                <th className="p-3">Role</th>
                <th className="p-3">Organization</th>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Username</th>
                <th className="p-3">Password</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.map((user) => {
                const org = organizations.find((item) => item.id === user.organizationId);
                return (
                  <tr key={user.id} className="hover:bg-[#252525]">
                    <td className="p-3">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-xs',
                          user.role === 'super_admin' && 'bg-purple-500/20 text-purple-400',
                          user.role === 'admin' && 'bg-blue-500/20 text-blue-400',
                          user.role === 'staff' && 'bg-emerald-500/20 text-emerald-400'
                        )}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3 text-gray-300">{org ? org.name : '-'}</td>
                    <td className="p-3 text-white">{user.fullName}</td>
                    <td className="p-3 text-gray-300">{user.email}</td>
                    <td className="p-3 text-gray-300">{user.username}</td>
                    <td className="p-3 text-yellow-300 font-mono">{user.password}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
