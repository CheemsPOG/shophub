import { useState } from 'react';
import { Search, Plus, Ticket, Copy, Edit2, Trash2 } from 'lucide-react';
import { COUPONS } from '@/lib/data';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDate } from '@/lib/format';

export function AdminCouponsPage() {
  const [search, setSearch] = useState('');

  const filtered = COUPONS.filter(c => !search || c.code.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Coupons</h1>
          <p className="text-sm text-ink-500">Manage discount codes and promotions</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-brand hover:bg-brand-600">
          <Plus className="h-4 w-4" /> Create coupon
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-ink-100 bg-white p-4"><p className="text-xs text-ink-500">Active</p><p className="mt-1 text-xl font-bold text-success-600">{COUPONS.filter(c => c.status === 'active').length}</p></div>
        <div className="rounded-xl border border-ink-100 bg-white p-4"><p className="text-xs text-ink-500">Expired</p><p className="mt-1 text-xl font-bold text-ink-600">{COUPONS.filter(c => c.status === 'expired').length}</p></div>
        <div className="rounded-xl border border-ink-100 bg-white p-4"><p className="text-xs text-ink-500">Total redemptions</p><p className="mt-1 text-xl font-bold text-ink-900">{COUPONS.reduce((s, c) => s + c.used, 0).toLocaleString()}</p></div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search coupons..." className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 sm:w-72" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-ink-100 bg-ink-50/50 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Value</th>
                <th className="px-5 py-3">Usage</th>
                <th className="px-5 py-3">Expires</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {filtered.map(c => (
                <tr key={c.id} className="transition-colors hover:bg-ink-50/30">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Ticket className="h-4 w-4" /></div>
                      <div>
                        <p className="font-mono font-semibold text-ink-900">{c.code}</p>
                      </div>
                      <button className="text-ink-400 hover:text-ink-700"><Copy className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ink-600 capitalize">{c.type}</td>
                  <td className="px-5 py-3 font-semibold text-ink-900">{c.type === 'percent' ? `${c.value}%` : `$${c.value}`}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-ink-100">
                        <div className="h-full rounded-full bg-brand-500" style={{ width: `${(c.used / c.usageLimit) * 100}%` }} />
                      </div>
                      <span className="text-xs text-ink-500">{c.used}/{c.usageLimit}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ink-500">{formatDate(c.expiresAt, { short: true })}</td>
                  <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-50 hover:text-brand-600"><Edit2 className="h-3.5 w-3.5" /></button>
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-error-50 hover:text-error-600"><Trash2 className="h-3.5 w-3.5" /></button>
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
