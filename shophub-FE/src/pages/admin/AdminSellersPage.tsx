import { useState } from 'react';
import { Search, Store, Check, X, Eye, Star } from 'lucide-react';
import { SELLER_APPLICATIONS } from '@/lib/data';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDate } from '@/lib/format';

const SELLERS = [
  { id: 's1', name: 'Soundwave Store', email: 'support@soundwave.store', category: 'Electronics', products: 54, sales: 12847, rating: 4.8, status: 'verified', joinedAt: '2019-03-20' },
  { id: 's2', name: 'Northwind Apparel', email: 'hello@northwind.com', category: 'Fashion', products: 120, sales: 8932, rating: 4.6, status: 'verified', joinedAt: '2020-01-15' },
  { id: 's3', name: 'Glow Lab Beauty', email: 'team@glowlab.com', category: 'Beauty', products: 78, sales: 6541, rating: 4.7, status: 'verified', joinedAt: '2020-06-10' },
  { id: 's4', name: 'EcoBags Co', email: 'nina@ecobags.co', category: 'Fashion', products: 0, sales: 0, rating: 0, status: 'pending', joinedAt: '2024-08-10' },
  { id: 's5', name: 'Toy Universe', email: 'bob@toyuniverse.com', category: 'Toys & Games', products: 0, sales: 0, rating: 0, status: 'rejected', joinedAt: '2024-07-25' },
];

const FILTERS = ['all', 'verified', 'pending', 'rejected'];

export function AdminSellersPage() {
  const [tab, setTab] = useState<'sellers' | 'applications'>('sellers');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredSellers = SELLERS.filter(s => {
    if (filter !== 'all' && s.status !== filter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const filteredApps = SELLER_APPLICATIONS.filter(a => {
    if (filter !== 'all' && a.status !== filter) return false;
    if (search && !a.businessName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Sellers</h1>
        <p className="text-sm text-ink-500">Manage sellers and applications</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-ink-100 p-1">
        <button onClick={() => setTab('sellers')} className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${tab === 'sellers' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500'}`}>
          All sellers ({SELLERS.length})
        </button>
        <button onClick={() => setTab('applications')} className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${tab === 'applications' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500'}`}>
          Applications ({SELLER_APPLICATIONS.filter(a => a.status === 'pending').length} pending)
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 sm:w-72" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium capitalize transition-all ${filter === f ? 'bg-ink-900 text-white' : 'border border-ink-200 bg-white text-ink-600 hover:bg-ink-50'}`}>{f}</button>
          ))}
        </div>
      </div>

      {tab === 'sellers' ? (
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-ink-100 bg-ink-50/50 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-5 py-3">Seller</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Products</th>
                  <th className="px-5 py-3">Sales</th>
                  <th className="px-5 py-3">Rating</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {filteredSellers.map(s => (
                  <tr key={s.id} className="transition-colors hover:bg-ink-50/30">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Store className="h-4 w-4" /></div>
                        <div>
                          <p className="font-medium text-ink-900">{s.name}</p>
                          <p className="text-xs text-ink-500">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-ink-600">{s.category}</td>
                    <td className="px-5 py-3 text-ink-700">{s.products}</td>
                    <td className="px-5 py-3 font-medium text-ink-900">{s.sales.toLocaleString()}</td>
                    <td className="px-5 py-3">
                      {s.rating > 0 ? <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-accent-400 text-accent-400" />{s.rating}</span> : <span className="text-ink-300">—</span>}
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={s.status} /></td>
                    <td className="px-5 py-3 text-right">
                      <button className="rounded-lg border border-ink-200 px-2.5 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApps.map(a => (
            <div key={a.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-ink-100 bg-white p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Store className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink-900">{a.businessName}</p>
                <p className="text-sm text-ink-500">{a.applicant} · {a.email}</p>
                <p className="text-xs text-ink-400">Category: {a.category} · Submitted {formatDate(a.submittedAt)}</p>
              </div>
              <StatusBadge status={a.status} size="md" />
              {a.status === 'pending' && (
                <div className="flex gap-2">
                  <button className="flex items-center gap-1.5 rounded-xl bg-success-500 px-4 py-2 text-sm font-semibold text-white hover:bg-success-600"><Check className="h-4 w-4" /> Approve</button>
                  <button className="flex items-center gap-1.5 rounded-xl border border-error-200 px-4 py-2 text-sm font-medium text-error-600 hover:bg-error-50"><X className="h-4 w-4" /> Reject</button>
                </div>
              )}
              {a.status !== 'pending' && (
                <button className="flex items-center gap-1.5 rounded-xl border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"><Eye className="h-4 w-4" /> View</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
