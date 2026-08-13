import { useState } from 'react';
import { Search, Eye, Ban, CheckCircle, Users, Store } from 'lucide-react';
import { ADMIN_STATS } from '@/lib/data';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDate } from '@/lib/format';

const USERS = [
  ...ADMIN_STATS.recentSignups.map((u, i) => ({ id: `u${i}`, name: u.email.split('@')[0], email: u.email, role: u.role, status: 'active', joinedAt: u.date, orders: Math.floor(Math.random() * 50), spent: Math.floor(Math.random() * 5000) })),
  { id: 'u5', name: 'Alice Cooper', email: 'alice@email.com', role: 'buyer', status: 'banned', joinedAt: '2024-06-01', orders: 3, spent: 120 },
  { id: 'u6', name: 'Bob Dylan', email: 'bob@email.com', role: 'buyer', status: 'active', joinedAt: '2024-05-15', orders: 28, spent: 2400 },
  { id: 'u7', name: 'Soundwave Store', email: 'support@soundwave.store', role: 'seller', status: 'active', joinedAt: '2019-03-20', orders: 12847, spent: 0 },
];

const FILTERS = ['all', 'buyer', 'seller', 'banned'];

export function AdminUsersPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = USERS.filter(u => {
    if (filter === 'banned' && u.status !== 'banned') return false;
    if (filter === 'buyer' && u.role !== 'buyer') return false;
    if (filter === 'seller' && u.role !== 'seller') return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Customers</h1>
        <p className="text-sm text-ink-500">{USERS.length} registered users</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl border border-ink-100 bg-white p-4"><p className="text-xs text-ink-500">Total buyers</p><p className="mt-1 text-xl font-bold text-ink-900">{USERS.filter(u => u.role === 'buyer').length}</p></div>
        <div className="rounded-xl border border-ink-100 bg-white p-4"><p className="text-xs text-ink-500">Total sellers</p><p className="mt-1 text-xl font-bold text-ink-900">{USERS.filter(u => u.role === 'seller').length}</p></div>
        <div className="rounded-xl border border-ink-100 bg-white p-4"><p className="text-xs text-ink-500">Active</p><p className="mt-1 text-xl font-bold text-success-600">{USERS.filter(u => u.status === 'active').length}</p></div>
        <div className="rounded-xl border border-ink-100 bg-white p-4"><p className="text-xs text-ink-500">Banned</p><p className="mt-1 text-xl font-bold text-error-600">{USERS.filter(u => u.status === 'banned').length}</p></div>
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

      <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-ink-100 bg-ink-50/50 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3">Orders</th>
                <th className="px-5 py-3">Spent</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {filtered.map(u => (
                <tr key={u.id} className="transition-colors hover:bg-ink-50/30">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-100 text-xs font-bold text-ink-600">{u.name[0].toUpperCase()}</div>
                      <div>
                        <p className="font-medium text-ink-900">{u.name}</p>
                        <p className="text-xs text-ink-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${u.role === 'seller' ? 'bg-brand-50 text-brand-700' : 'bg-blue-50 text-blue-700'}`}>{u.role}</span>
                  </td>
                  <td className="px-5 py-3 text-ink-500">{formatDate(u.joinedAt, { short: true })}</td>
                  <td className="px-5 py-3 text-ink-700">{u.orders}</td>
                  <td className="px-5 py-3 font-medium text-ink-900">${u.spent}</td>
                  <td className="px-5 py-3"><StatusBadge status={u.status === 'banned' ? 'rejected' : 'active'} label={u.status} /></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-50 hover:text-ink-700"><Eye className="h-3.5 w-3.5" /></button>
                      {u.status === 'active' ? (
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-error-50 hover:text-error-600"><Ban className="h-3.5 w-3.5" /></button>
                      ) : (
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-success-50 hover:text-success-600"><CheckCircle className="h-3.5 w-3.5" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
