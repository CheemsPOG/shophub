import { useState } from 'react';
import { Search, Flag, Eye, MessageSquare } from 'lucide-react';
import { DISPUTES } from '@/lib/data';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/format';

const FILTERS = ['all', 'open', 'under_review', 'resolved', 'rejected'];

export function AdminDisputesPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = DISPUTES.filter(d => {
    if (filter !== 'all' && d.status !== filter) return false;
    if (search && !d.orderNumber.toLowerCase().includes(search.toLowerCase()) && !d.buyerName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Disputes</h1>
        <p className="text-sm text-ink-500">Resolve buyer-seller disputes</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl border border-ink-100 bg-white p-4"><p className="text-xs text-ink-500">Open</p><p className="mt-1 text-xl font-bold text-warning-600">{DISPUTES.filter(d => d.status === 'open').length}</p></div>
        <div className="rounded-xl border border-ink-100 bg-white p-4"><p className="text-xs text-ink-500">Under review</p><p className="mt-1 text-xl font-bold text-blue-600">{DISPUTES.filter(d => d.status === 'under_review').length}</p></div>
        <div className="rounded-xl border border-ink-100 bg-white p-4"><p className="text-xs text-ink-500">Resolved</p><p className="mt-1 text-xl font-bold text-success-600">{DISPUTES.filter(d => d.status === 'resolved').length}</p></div>
        <div className="rounded-xl border border-ink-100 bg-white p-4"><p className="text-xs text-ink-500">Rejected</p><p className="mt-1 text-xl font-bold text-ink-600">{DISPUTES.filter(d => d.status === 'rejected').length}</p></div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search disputes..." className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 sm:w-72" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium capitalize transition-all ${filter === f ? 'bg-ink-900 text-white' : 'border border-ink-200 bg-white text-ink-600 hover:bg-ink-50'}`}>{f.replace(/_/g, ' ')}</button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(d => (
          <div key={d.id} className="rounded-2xl border border-ink-100 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${d.status === 'open' ? 'bg-warning-50 text-warning-600' : d.status === 'resolved' ? 'bg-success-50 text-success-600' : d.status === 'rejected' ? 'bg-ink-100 text-ink-500' : 'bg-blue-50 text-blue-600'}`}>
                  <Flag className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-ink-900">Dispute #{d.id.toUpperCase()}</p>
                  <p className="text-sm text-ink-500">Order {d.orderNumber} · {formatDate(d.openedAt)}</p>
                </div>
              </div>
              <StatusBadge status={d.status} size="md" />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-ink-50 p-3">
                <p className="text-xs text-ink-500">Buyer</p>
                <p className="text-sm font-medium text-ink-900">{d.buyerName}</p>
              </div>
              <div className="rounded-xl bg-ink-50 p-3">
                <p className="text-xs text-ink-500">Seller</p>
                <p className="text-sm font-medium text-ink-900">{d.sellerName}</p>
              </div>
              <div className="rounded-xl bg-ink-50 p-3">
                <p className="text-xs text-ink-500">Amount in dispute</p>
                <p className="text-sm font-bold text-ink-900">{formatCurrency(d.amount, { decimals: true })}</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-ink-100 p-3">
              <p className="text-xs font-semibold text-ink-500">Reason</p>
              <p className="mt-1 text-sm text-ink-700">{d.reason}</p>
            </div>

            {d.status === 'open' || d.status === 'under_review' ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="rounded-xl bg-success-500 px-4 py-2 text-sm font-semibold text-white hover:bg-success-600">Resolve in buyer's favor</button>
                <button className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600">Resolve in seller's favor</button>
                <button className="rounded-xl border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50">Request more info</button>
                <button className="flex items-center gap-1.5 rounded-xl border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"><MessageSquare className="h-4 w-4" /> Contact parties</button>
              </div>
            ) : (
              <div className="mt-4">
                <button className="flex items-center gap-1.5 rounded-xl border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"><Eye className="h-4 w-4" /> View resolution</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
