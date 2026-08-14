import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Store, Check, X, Star } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { formatDate, formatNumber } from '@/lib/format';
import { api, ApiError } from '@/lib/api';
import type { SellerApplication } from '@/lib/data';

type AdminShop = {
  id: string;
  name: string;
  businessName?: string;
  email: string;
  category: string;
  productCount: number;
  sales: number;
  rating: number;
  status: string;
  joinedAt?: string;
};

const FILTERS = ['all', 'verified', 'pending', 'rejected'];

export function AdminSellersPage() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'applications' ? 'applications' : 'sellers';
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [shops, setShops] = useState<AdminShop[]>([]);
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([
      api<AdminShop[]>('/admin/shops'),
      api<SellerApplication[]>('/admin/applications'),
    ])
      .then(([shopRows, appRows]) => {
        setShops((shopRows ?? []).map(s => ({ ...s, productCount: Number(s.productCount), sales: Number(s.sales), rating: Number(s.rating) })));
        setApplications(appRows ?? []);
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load sellers'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const setTab = (next: 'sellers' | 'applications') => {
    const copy = new URLSearchParams(params);
    if (next === 'applications') copy.set('tab', 'applications'); else copy.delete('tab');
    setParams(copy, { replace: true });
  };

  const decide = async (id: string, action: 'approve' | 'reject') => {
    setBusyId(id);
    setError('');
    try {
      await api(`/admin/applications/${id}/${action}`, { method: 'POST', body: action === 'reject' ? JSON.stringify({ reason: '' }) : undefined });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `Could not ${action} application`);
    } finally {
      setBusyId('');
    }
  };

  const filteredSellers = shops.filter(s => {
    if (filter !== 'all' && s.status !== filter) return false;
    const name = s.name || s.businessName || '';
    if (search && !name.toLowerCase().includes(search.toLowerCase()) && !s.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const filteredApps = applications.filter(a => {
    if (filter !== 'all' && a.status !== filter) return false;
    if (search && !a.businessName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const pendingCount = applications.filter(a => a.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Sellers</h1>
        <p className="text-sm text-ink-500">Approve or reject seller accounts. Verified sellers list their own products — you do not moderate individual listings.</p>
      </div>

      <div className="flex gap-1 rounded-xl bg-ink-100 p-1">
        <button onClick={() => setTab('sellers')} className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${tab === 'sellers' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500'}`}>
          All sellers ({shops.length})
        </button>
        <button onClick={() => setTab('applications')} className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${tab === 'applications' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500'}`}>
          Applications ({pendingCount} pending)
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

      {error && <p className="rounded-xl bg-error-50 px-3 py-2 text-sm text-error-600">{error}</p>}

      {tab === 'sellers' ? (
        !loading && filteredSellers.length === 0 ? (
          <div className="rounded-2xl border border-ink-100 bg-white">
            <EmptyState icon={<Store className="h-7 w-7" />} title="No sellers found" description="Shops appear here after a seller registers." />
          </div>
        ) : (
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-50">
                  {filteredSellers.map(s => (
                    <tr key={s.id} className="transition-colors hover:bg-ink-50/30">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Store className="h-4 w-4" /></div>
                          <div>
                            <p className="font-medium text-ink-900">{s.name || s.businessName}</p>
                            <p className="text-xs text-ink-500">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-ink-600">{s.category || '—'}</td>
                      <td className="px-5 py-3 text-ink-700">{s.productCount}</td>
                      <td className="px-5 py-3 font-medium text-ink-900">{formatNumber(s.sales)}</td>
                      <td className="px-5 py-3">
                        {s.rating > 0 ? <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-accent-400 text-accent-400" />{s.rating}</span> : <span className="text-ink-300">—</span>}
                      </td>
                      <td className="px-5 py-3"><StatusBadge status={s.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        !loading && filteredApps.length === 0 ? (
          <div className="rounded-2xl border border-ink-100 bg-white">
            <EmptyState icon={<Store className="h-7 w-7" />} title="No applications" description="New seller registrations show up here for approval." />
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApps.map(a => (
              <div key={a.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-ink-100 bg-white p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Store className="h-5 w-5" /></div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink-900">{a.businessName}</p>
                  <p className="text-sm text-ink-500">{a.applicant} · {a.email}</p>
                  <p className="text-xs text-ink-400">Category: {a.category || '—'}{a.submittedAt ? ` · Submitted ${formatDate(a.submittedAt)}` : ''}</p>
                </div>
                <StatusBadge status={a.status} size="md" />
                {a.status === 'pending' && (
                  <div className="flex gap-2">
                    <button disabled={busyId === a.id} onClick={() => void decide(a.id, 'approve')} className="flex items-center gap-1.5 rounded-xl bg-success-500 px-4 py-2 text-sm font-semibold text-white hover:bg-success-600 disabled:opacity-50"><Check className="h-4 w-4" /> Approve</button>
                    <button disabled={busyId === a.id} onClick={() => void decide(a.id, 'reject')} className="flex items-center gap-1.5 rounded-xl border border-error-200 px-4 py-2 text-sm font-medium text-error-600 hover:bg-error-50 disabled:opacity-50"><X className="h-4 w-4" /> Reject</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
