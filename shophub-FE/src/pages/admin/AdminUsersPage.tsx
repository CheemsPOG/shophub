import { FormEvent, useEffect, useState } from 'react';
import { Search, Ban, CheckCircle, Users } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { formatDate } from '@/lib/format';
import { api, ApiError } from '@/lib/api';

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean;
  joinedAt?: string;
};

const FILTERS = ['all', 'buyer', 'seller', 'admin', 'banned'] as const;

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const load = () => {
    setLoading(true);
    api<{ content: AdminUser[] }>('/admin/users?size=100')
      .then(data => setUsers(data.content ?? []))
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleBan = async (user: AdminUser) => {
    setBusyId(user.id);
    setError('');
    try {
      const path = user.banned ? `/admin/users/${user.id}/unban` : `/admin/users/${user.id}/ban`;
      const updated = await api<AdminUser>(path, { method: 'POST' });
      setUsers(list => list.map(u => u.id === user.id ? { ...u, ...updated } : u));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update user');
    } finally {
      setBusyId('');
    }
  };

  const filtered = users.filter(u => {
    if (filter === 'banned' && !u.banned) return false;
    if (filter !== 'all' && filter !== 'banned' && u.role !== filter) return false;
    if (search && !u.name?.toLowerCase().includes(search.toLowerCase()) && !u.email?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Customers</h1>
        <p className="text-sm text-ink-500">{loading ? 'Loading…' : `${users.length} registered accounts`}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl border border-ink-100 bg-white p-4"><p className="text-xs text-ink-500">Buyers</p><p className="mt-1 text-xl font-bold text-ink-900">{users.filter(u => u.role === 'buyer').length}</p></div>
        <div className="rounded-xl border border-ink-100 bg-white p-4"><p className="text-xs text-ink-500">Sellers</p><p className="mt-1 text-xl font-bold text-ink-900">{users.filter(u => u.role === 'seller').length}</p></div>
        <div className="rounded-xl border border-ink-100 bg-white p-4"><p className="text-xs text-ink-500">Admins</p><p className="mt-1 text-xl font-bold text-ink-900">{users.filter(u => u.role === 'admin').length}</p></div>
        <div className="rounded-xl border border-ink-100 bg-white p-4"><p className="text-xs text-ink-500">Banned</p><p className="mt-1 text-xl font-bold text-error-600">{users.filter(u => u.banned).length}</p></div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 sm:w-72" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium capitalize transition-all ${filter === f ? 'bg-ink-900 text-white' : 'border border-ink-200 bg-white text-ink-600 hover:bg-ink-50'}`}>{f}</button>
          ))}
        </div>
      </div>

      {error && <p className="rounded-xl bg-error-50 px-3 py-2 text-sm text-error-600">{error}</p>}

      {!loading && filtered.length === 0 ? (
        <div className="rounded-2xl border border-ink-100 bg-white">
          <EmptyState icon={<Users className="h-7 w-7" />} title="No users found" description="Registered buyer, seller, and admin accounts appear here." />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-ink-100 bg-ink-50/50 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Joined</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {filtered.map(u => (
                  <tr key={u.id} className="transition-colors hover:bg-ink-50/30">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-100 text-xs font-bold text-ink-600">{(u.name || '?')[0].toUpperCase()}</div>
                        <div>
                          <p className="font-medium text-ink-900">{u.name}</p>
                          <p className="text-xs text-ink-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${u.role === 'seller' ? 'bg-brand-50 text-brand-700' : u.role === 'admin' ? 'bg-ink-100 text-ink-700' : 'bg-blue-50 text-blue-700'}`}>{u.role}</span>
                    </td>
                    <td className="px-5 py-3 text-ink-500">{u.joinedAt ? formatDate(u.joinedAt, { short: true }) : '—'}</td>
                    <td className="px-5 py-3"><StatusBadge status={u.banned ? 'rejected' : 'active'} label={u.banned ? 'banned' : 'active'} /></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end">
                        {u.role === 'admin' ? (
                          <span className="text-xs text-ink-400">—</span>
                        ) : u.banned ? (
                          <button disabled={busyId === u.id} onClick={() => void toggleBan(u)} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-success-50 hover:text-success-600 disabled:opacity-50" aria-label="Unban user"><CheckCircle className="h-3.5 w-3.5" /></button>
                        ) : (
                          <button disabled={busyId === u.id} onClick={() => void toggleBan(u)} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-error-50 hover:text-error-600 disabled:opacity-50" aria-label="Ban user"><Ban className="h-3.5 w-3.5" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
