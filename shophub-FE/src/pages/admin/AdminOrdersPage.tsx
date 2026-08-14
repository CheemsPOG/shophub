import { useEffect, useState } from 'react';
import { Search, CreditCard } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency, formatDate } from '@/lib/format';
import { api } from '@/lib/api';
import type { Order } from '@/lib/data';

const FILTERS = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

function normalize(o: Order): Order {
  return { ...o, total: Number(o.total), subtotal: Number(o.subtotal), shipping: Number(o.shipping), tax: Number(o.tax) };
}

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api<{ content: Order[] }>('/admin/orders?size=100')
      .then(data => setOrders((data.content ?? []).map(normalize)))
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load orders'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter(o => {
    if (filter !== 'all' && o.status !== filter) return false;
    if (search && !o.orderNumber.toLowerCase().includes(search.toLowerCase()) && !o.buyerName?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Orders</h1>
        <p className="text-sm text-ink-500">{loading ? 'Loading…' : `${orders.length} orders across the platform`}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {FILTERS.slice(1).map(f => (
          <div key={f} className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="text-xs capitalize text-ink-500">{f}</p>
            <p className="mt-1 text-xl font-bold text-ink-900">{orders.filter(o => o.status === f).length}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..." className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 sm:w-72" />
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
          <EmptyState icon={<CreditCard className="h-7 w-7" />} title="No orders found" description="Placed orders from buyers appear here." />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-ink-100 bg-ink-50/50 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Buyer</th>
                  <th className="px-5 py-3">Seller</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Payment</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {filtered.map(o => (
                  <tr key={o.id} className="transition-colors hover:bg-ink-50/30">
                    <td className="px-5 py-3 font-medium text-ink-900">{o.orderNumber}</td>
                    <td className="px-5 py-3 text-ink-700">{o.buyerName}</td>
                    <td className="px-5 py-3 text-ink-600">{o.sellerName}</td>
                    <td className="px-5 py-3 text-ink-500">{o.placedAt ? formatDate(o.placedAt, { short: true }) : '—'}</td>
                    <td className="px-5 py-3 font-semibold text-ink-900">{formatCurrency(o.total, { decimals: true })}</td>
                    <td className="px-5 py-3"><StatusBadge status={o.paymentStatus} /></td>
                    <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
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
