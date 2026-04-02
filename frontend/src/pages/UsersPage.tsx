import { useState, useEffect } from 'react';
import { usersApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { User, UserRole, UserStats } from '../types';

const ROLE_STYLES: Record<string, string> = {
  admin: 'bg-primary-fixed text-on-primary-fixed',
  analyst: 'bg-surface-container-high text-on-primary-fixed-variant',
  viewer: 'bg-surface-container-highest text-on-surface-variant',
};

const ROLE_INFO: Record<string, { title: string; description: string; permissions: string[] }> = {
  admin: {
    title: 'Admin Privileges',
    description: 'Administrators have full read/write access to the vault, including the ability to manage user tiers and sensitive transaction logs.',
    permissions: ['Audit Log Visibility', 'Master Key Access', 'User Management', 'Record CRUD'],
  },
  analyst: {
    title: 'Analyst Access',
    description: 'Analysts can view all financial records and access dashboard insights and summaries for reporting.',
    permissions: ['View Records', 'Access Insights', 'Dashboard Analytics'],
  },
  viewer: {
    title: 'Viewer Access',
    description: 'Viewers have read-only access to the dashboard overview and basic financial summaries.',
    permissions: ['View Dashboard', 'View Summaries'],
  },
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('admin');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', password: 'password123', role: 'viewer' as UserRole });
  const [inviteError, setInviteError] = useState('');
  const [inviting, setInviting] = useState(false);

  const fetchUsers = async () => {
    try {
      const result = await usersApi.getAll();
      setUsers(result.users);
      setStats(result.stats);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleStatusToggle = async (userId: number, currentStatus: string) => {
    if (userId === currentUser?.id) return;
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await usersApi.update(userId, { status: newStatus });
      fetchUsers();
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError('');
    setInviting(true);
    try {
      await usersApi.create(inviteForm);
      setShowInvite(false);
      setInviteForm({ name: '', email: '', password: 'password123', role: 'viewer' });
      fetchUsers();
    } catch (err: any) {
      setInviteError(err.response?.data?.error || 'Failed to create user');
    } finally {
      setInviting(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const roleInfo = ROLE_INFO[selectedRole] || ROLE_INFO.admin;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-[Manrope] font-extrabold text-primary tracking-tight">Users & Permissions</h1>
          <p className="text-on-surface-variant">Manage individual access levels and security protocols for your workspace.</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-semibold shadow-lg shadow-primary/10 hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 600" }}>person_add</span>
          <span className="font-[Inter] tracking-wide uppercase text-xs">Invite User</span>
        </button>
      </div>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* User Table */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-xl shadow-[0px_20px_40px_rgba(13,28,46,0.04)] overflow-hidden">
            {/* Search */}
            <div className="px-6 py-4 bg-surface-container-low flex items-center justify-between">
              <div className="flex items-center gap-4 w-full max-w-md">
                <span className="material-symbols-outlined text-outline">search</span>
                <input
                  className="bg-transparent border-none focus:ring-0 text-sm w-full focus:outline-none"
                  placeholder="Search members..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <span className="text-xs font-[Inter] font-bold text-primary uppercase tracking-widest px-3 py-1 bg-primary-fixed rounded-full">
                {stats?.active || 0} Active
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/15">
                    <th className="px-6 py-4 text-[10px] font-[Inter] font-bold text-outline uppercase tracking-widest">User Profile</th>
                    <th className="px-6 py-4 text-[10px] font-[Inter] font-bold text-outline uppercase tracking-widest">Role</th>
                    <th className="px-6 py-4 text-[10px] font-[Inter] font-bold text-outline uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-right text-[10px] font-[Inter] font-bold text-outline uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="group hover:bg-surface-container-low transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-surface-container-high overflow-hidden">
                            {user.avatar_url ? (
                              <img alt={user.name} className="w-full h-full object-cover" src={user.avatar_url} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-on-surface-variant font-bold text-sm">
                                {user.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-on-surface font-[Manrope]">{user.name}</span>
                            <span className="text-xs text-on-surface-variant">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${ROLE_STYLES[user.role]}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <button
                          onClick={() => handleStatusToggle(user.id, user.status)}
                          disabled={user.id === currentUser?.id}
                          className={`relative w-11 h-6 rounded-full transition-colors ${
                            user.status === 'active' ? 'bg-secondary' : 'bg-surface-container-highest'
                          } ${user.id === currentUser?.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <div
                            className={`absolute top-[2px] w-5 h-5 bg-white border border-gray-300 rounded-full transition-transform ${
                              user.status === 'active' ? 'translate-x-[22px]' : 'translate-x-[2px]'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => setSelectedRole(user.role)}
                          className="p-2 text-outline hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Role Info Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          {/* Role Card */}
          <div className="p-8 rounded-xl bg-primary text-white space-y-6 shadow-xl shadow-primary/20 relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            <div className="space-y-2">
              <span className="text-[10px] font-[Inter] font-bold uppercase tracking-widest text-primary-fixed">Security Level</span>
              <h3 className="text-2xl font-[Manrope] font-bold">{roleInfo.title}</h3>
            </div>
            <p className="text-sm text-primary-fixed leading-relaxed">{roleInfo.description}</p>
            <div className="pt-4 border-t border-white/10">
              <ul className="space-y-3">
                {roleInfo.permissions.map((perm, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs font-[Inter]">
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {i === 0 ? 'verified_user' : i === 1 ? 'lock_open' : 'check_circle'}
                    </span>
                    {perm}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-xl bg-surface-container-low">
              <span className="text-[10px] font-[Inter] font-bold text-outline uppercase tracking-wider block mb-1">Inactive</span>
              <span className="text-3xl font-[Manrope] font-bold text-primary">
                {String(stats?.inactive || 0).padStart(2, '0')}
              </span>
            </div>
            <div className="p-6 rounded-xl bg-surface-container-low">
              <span className="text-[10px] font-[Inter] font-bold text-outline uppercase tracking-wider block mb-1">Total</span>
              <span className="text-3xl font-[Manrope] font-bold text-on-surface">
                {String(stats?.total || 0).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Invite User Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[100] px-4" onClick={() => setShowInvite(false)}>
          <div className="bg-white rounded-xl p-8 max-w-md w-full animate-scale-in shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-[Manrope] font-bold text-xl text-primary mb-6">Invite New User</h3>
            {inviteError && (
              <div className="mb-4 p-3 bg-error-container/30 border border-error/20 rounded-xl">
                <p className="text-sm text-error font-medium">{inviteError}</p>
              </div>
            )}
            <form onSubmit={handleInvite} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Name</label>
                <input
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  className="w-full bg-surface-container-high border-0 py-3 px-4 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Email</label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full bg-surface-container-high border-0 py-3 px-4 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Password</label>
                <input
                  type="password"
                  value={inviteForm.password}
                  onChange={(e) => setInviteForm({ ...inviteForm, password: e.target.value })}
                  className="w-full bg-surface-container-high border-0 py-3 px-4 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Role</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as UserRole })}
                  className="w-full bg-surface-container-high border-0 py-3 px-4 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary appearance-none"
                >
                  <option value="viewer">Viewer</option>
                  <option value="analyst">Analyst</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInvite(false)}
                  className="flex-1 py-3 border-2 border-outline-variant text-on-surface font-bold rounded-xl hover:bg-surface-container-low transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {inviting ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
