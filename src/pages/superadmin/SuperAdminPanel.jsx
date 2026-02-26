import { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  Shield,
  UserPlus,
  Users,
  Activity,
  Building,
  CheckCircle2,
  AlertCircle,
  UsersRound,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  fetchSuperAdminOverviewApi,
  createOrganizationWithAdminApi,
  createAdminForOrganizationApi,
} from '../../lib/authApi';
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
  const [isSubmittingOrg, setIsSubmittingOrg] = useState(false);
  const [isSubmittingAdmin, setIsSubmittingAdmin] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const reload = async () => {
    const data = await fetchSuperAdminOverviewApi();
    setOrganizations(Array.isArray(data.organizations) ? data.organizations : []);
    setUsers(Array.isArray(data.users) ? data.users : []);
    setClinics(Array.isArray(data.clinics) ? data.clinics : []);
  };

  useEffect(() => {
    reload().catch((loadError) => {
      setError(loadError.message || 'Failed to load super admin data.');
    });
  }, []);

  const adminUsers = useMemo(() => users.filter((u) => u.role === 'admin'), [users]);
  const staffUsers = useMemo(() => users.filter((u) => u.role === 'staff'), [users]);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleCreateOrganizationWithAdmin = async (event) => {
    event.preventDefault();
    clearMessages();
    setIsSubmittingOrg(true);
    try {
      const result = await createOrganizationWithAdminApi({
        orgName: orgAdminForm.orgName.trim(),
        adminUsername: orgAdminForm.adminUsername.trim(),
        adminEmail: orgAdminForm.adminEmail.trim(),
        adminPassword: orgAdminForm.adminPassword,
        adminFullName: orgAdminForm.adminFullName.trim(),
      });

      setSuccess(
        `Created org "${result.organization.name}" and admin login: ${result.admin.email} / ${result.admin.password}`
      );
      setOrgAdminForm(initialOrgAdminForm);
      await reload();
    } catch (createError) {
      setError(createError.message || 'Failed to create organization admin.');
    } finally {
      setIsSubmittingOrg(false);
    }
  };

  const handleCreateAdminInOrg = async (event) => {
    event.preventDefault();
    clearMessages();
    setIsSubmittingAdmin(true);
    try {
      const result = await createAdminForOrganizationApi({
        organizationId: adminForm.organizationId,
        adminUsername: adminForm.adminUsername.trim(),
        adminEmail: adminForm.adminEmail.trim(),
        adminPassword: adminForm.adminPassword,
        adminFullName: adminForm.adminFullName.trim(),
      });
      const admin = result.admin;
      setSuccess(`Created admin login: ${admin.email} / ${admin.password}`);
      setAdminForm(initialAdminForm);
      await reload();
    } catch (createError) {
      setError(createError.message || 'Failed to create admin user.');
    } finally {
      setIsSubmittingAdmin(false);
    }
  };

  const statCards = [
    {
      title: 'Organizations',
      value: organizations.length,
      icon: Building2,
      color: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'text-cyan-400',
      borderColor: 'group-hover:border-cyan-500/50'
    },
    {
      title: 'Clinics',
      value: clinics.length,
      icon: Building,
      color: 'from-emerald-500/20 to-green-500/20',
      iconColor: 'text-emerald-400',
      borderColor: 'group-hover:border-emerald-500/50'
    },
    {
      title: 'Admins',
      value: adminUsers.length,
      icon: UsersRound,
      color: 'from-purple-500/20 to-pink-500/20',
      iconColor: 'text-purple-400',
      borderColor: 'group-hover:border-purple-500/50'
    },
    {
      title: 'Staff',
      value: staffUsers.length,
      icon: Users,
      color: 'from-orange-500/20 to-amber-500/20',
      iconColor: 'text-orange-400',
      borderColor: 'group-hover:border-orange-500/50'
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Super Admin Panel</h1>
          <p className="text-gray-400 mt-1 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#ff7a6b]" />
            Developer-only control center
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/30 text-purple-300 rounded-2xl shadow-lg shadow-purple-500/10 backdrop-blur-sm">
          <Shield className="w-5 h-5" />
          <span className="font-semibold tracking-wide">SysAdmin Access</span>
        </div>
      </div>

      {/* Alerts */}
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        (error || success) ? "opacity-100 max-h-40" : "opacity-0 max-h-0 overflow-hidden"
      )}>
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 flex items-start gap-3 shadow-lg shadow-red-500/5">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-red-200">{error}</p>
          </div>
        )}
        {success && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 flex items-start gap-3 shadow-lg shadow-emerald-500/5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-emerald-200">{success}</p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className={cn(
              "group relative bg-[#1a1a1a]/80 backdrop-blur-xl rounded-3xl p-6 border border-white/[0.05] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
              stat.borderColor
            )}
          >
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-5 rounded-3xl transition-opacity duration-300 group-hover:opacity-10",
              stat.color
            )} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400 text-sm font-medium tracking-wide">{stat.title}</p>
                <div className={cn("p-2 rounded-xl bg-white/5", stat.iconColor)}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-4xl font-black text-white tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {/* Create Org Form */}
        <div className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/[0.05] shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-20 pointer-events-none transition-all duration-500 group-hover:bg-blue-500/10" />

          <h2 className="text-white text-xl font-bold mb-6 flex items-center gap-3 relative z-10">
            <div className="p-2.5 bg-blue-500/10 rounded-2xl border border-blue-500/20">
              <Building2 className="w-6 h-6 text-blue-400" />
            </div>
            Create Organization Hub
          </h2>

          <form onSubmit={handleCreateOrganizationWithAdmin} className="space-y-4 relative z-10">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block ml-1">Company Details</label>
                <input
                  required
                  value={orgAdminForm.orgName}
                  onChange={(e) => setOrgAdminForm((prev) => ({ ...prev, orgName: e.target.value }))}
                  className="w-full rounded-2xl bg-[#0f0f0f]/80 border border-white/[0.08] px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
                  placeholder="Organization or Clinic Network Name"
                />
              </div>

              <div className="pt-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block ml-1">Admin Account</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    required
                    value={orgAdminForm.adminFullName}
                    onChange={(e) => setOrgAdminForm((prev) => ({ ...prev, adminFullName: e.target.value }))}
                    className="w-full rounded-2xl bg-[#0f0f0f]/80 border border-white/[0.08] px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
                    placeholder="Full Name"
                  />
                  <input
                    required
                    value={orgAdminForm.adminUsername}
                    onChange={(e) => setOrgAdminForm((prev) => ({ ...prev, adminUsername: e.target.value }))}
                    className="w-full rounded-2xl bg-[#0f0f0f]/80 border border-white/[0.08] px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
                    placeholder="Username"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  required
                  type="email"
                  value={orgAdminForm.adminEmail}
                  onChange={(e) => setOrgAdminForm((prev) => ({ ...prev, adminEmail: e.target.value }))}
                  className="w-full rounded-2xl bg-[#0f0f0f]/80 border border-white/[0.08] px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
                  placeholder="Email Address"
                />
                <input
                  required
                  type="text"
                  value={orgAdminForm.adminPassword}
                  onChange={(e) => setOrgAdminForm((prev) => ({ ...prev, adminPassword: e.target.value }))}
                  className="w-full rounded-2xl bg-[#0f0f0f]/80 border border-white/[0.08] px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium font-mono"
                  placeholder="Password"
                />
              </div>
            </div>

            <button
              disabled={isSubmittingOrg}
              className="w-full mt-6 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 py-4 font-bold text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isSubmittingOrg ? 'Provisioning...' : 'Provision Organization & Admin'}
            </button>
          </form>
        </div>

        {/* Create Admin Form */}
        <div className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/[0.05] shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-20 pointer-events-none transition-all duration-500 group-hover:bg-emerald-500/10" />

          <h2 className="text-white text-xl font-bold mb-6 flex items-center gap-3 relative z-10">
            <div className="p-2.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
              <UserPlus className="w-6 h-6 text-emerald-400" />
            </div>
            Add Admin to Organization
          </h2>

          <form onSubmit={handleCreateAdminInOrg} className="space-y-4 relative z-10">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block ml-1">Select Target</label>
              <div className="relative">
                <select
                  required
                  value={adminForm.organizationId}
                  onChange={(e) => setAdminForm((prev) => ({ ...prev, organizationId: e.target.value }))}
                  className="w-full appearance-none rounded-2xl bg-[#0f0f0f]/80 border border-white/[0.08] px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-medium"
                >
                  <option value="" disabled className="text-gray-500">Choose Organization...</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id} className="bg-[#1a1a1a]">
                      {org.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block ml-1">Admin Profile</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  required
                  value={adminForm.adminFullName}
                  onChange={(e) => setAdminForm((prev) => ({ ...prev, adminFullName: e.target.value }))}
                  className="w-full rounded-2xl bg-[#0f0f0f]/80 border border-white/[0.08] px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-medium"
                  placeholder="Full Name"
                />
                <input
                  required
                  value={adminForm.adminUsername}
                  onChange={(e) => setAdminForm((prev) => ({ ...prev, adminUsername: e.target.value }))}
                  className="w-full rounded-2xl bg-[#0f0f0f]/80 border border-white/[0.08] px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-medium"
                  placeholder="Username"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                required
                type="email"
                value={adminForm.adminEmail}
                onChange={(e) => setAdminForm((prev) => ({ ...prev, adminEmail: e.target.value }))}
                className="w-full rounded-2xl bg-[#0f0f0f]/80 border border-white/[0.08] px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-medium"
                placeholder="Email Address"
              />
              <input
                required
                type="text"
                value={adminForm.adminPassword}
                onChange={(e) => setAdminForm((prev) => ({ ...prev, adminPassword: e.target.value }))}
                className="w-full rounded-2xl bg-[#0f0f0f]/80 border border-white/[0.08] px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-medium font-mono"
                placeholder="Password"
              />
            </div>

            <button
              disabled={isSubmittingAdmin}
              className="w-full mt-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 py-4 font-bold text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isSubmittingAdmin ? 'Creating...' : 'Create Admin Account'}
            </button>
          </form>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#1a1a1a]/80 backdrop-blur-xl rounded-3xl border border-white/[0.05] overflow-hidden shadow-xl mt-6">
        <div className="px-6 py-5 border-b border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.02]">
          <div>
            <h2 className="text-white text-xl font-bold flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/20">
                <Users className="w-5 h-5 text-orange-400" />
              </div>
              Global Users Directory
            </h2>
            <p className="text-gray-400 text-sm mt-1 ml-11">Complete overview of all configured users in the system</p>
          </div>
          <button
            onClick={() => setShowPasswords(!showPasswords)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-sm font-medium transition-colors border border-white/5"
          >
            {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPasswords ? "Hide Passwords" : "Reveal Passwords"}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#0f0f0f]/50 text-gray-400 text-left text-xs uppercase tracking-wider font-semibold border-b border-white/[0.05]">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Role</th>
                <th className="px-6 py-4">Organization</th>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4 whitespace-nowrap">Credentials</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {users.map((user) => {
                const org = organizations.find((item) => item.id === user.organizationId);
                return (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={cn(
                          'px-3 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5',
                          user.role === 'super_admin' && 'bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]',
                          user.role === 'admin' && 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
                          user.role === 'staff' && 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        )}
                      >
                        {user.role === 'super_admin' && <Shield className="w-3 h-3" />}
                        {user.role === 'admin' && <UserPlus className="w-3 h-3" />}
                        {user.role === 'staff' && <Users className="w-3 h-3" />}
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300 font-medium inline-flex items-center gap-2">
                        {org ? (
                          <>
                            <Building2 className="w-4 h-4 text-gray-500" />
                            {org.name}
                          </>
                        ) : (
                          <span className="text-gray-600 italic">System</span>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-white font-medium">{user.fullName}</span>
                        <span className="text-gray-500 text-xs mt-0.5">@{user.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.role === 'super_admin' ? (
                        <span className="text-gray-600 italic px-2 py-1 rounded-lg bg-white/5 border border-white/5 text-xs">Proteced</span>
                      ) : (
                        <span className={cn(
                          "font-mono text-xs px-2.5 py-1.5 rounded-lg border transition-all",
                          showPasswords
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-[#0f0f0f] text-gray-500 border-white/5 blur-[3px] select-none hover:blur-none cursor-pointer"
                        )}>
                          {user.password || '••••••••'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <UsersRound className="w-12 h-12 text-gray-600 mb-3" />
                      <p className="text-lg font-medium text-gray-400">No users found</p>
                      <p className="text-sm mt-1">Start by creating an organization and admin</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
