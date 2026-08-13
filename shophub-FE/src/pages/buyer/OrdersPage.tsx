import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home, Search, Package, Truck, CheckCircle2, XCircle, Clock, Eye } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency, formatDate } from '@/lib/format';
import { ProductImage } from '@/components/ProductImage';
import { api } from '@/lib/api';
import type { Order } from '@/lib/data';

const FILTERS = ['all', 'processing', 'shipped', 'delivered', 'cancelled'];

function normalizeOrder(o: Order): Order {
  return { ...o, total: Number(o.total), subtotal: Number(o.subtotal), shipping: Number(o.shipping), tax: Number(o.tax) };
}

export function OrdersPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Order[]>('/orders')
      .then(data => setOrders((data ?? []).map(normalizeOrder)))
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load orders'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter(o => {
    if (filter !== 'all' && o.status !== filter) return false;
    if (search && !o.orderNumber.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const statusIcon = (s: string) => {
    if (s === 'delivered') return <CheckCircle2 className="h-4 w-4 text-success-600" />;
    if (s === 'cancelled' || s === 'refunded') return <XCircle className="h-4 w-4 text-error-600" />;
    if (s === 'shipped') return <Truck className="h-4 w-4 text-blue-600" />;
    return <Clock className="h-4 w-4 text-warning-600" />;
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1.5 text-sm text-ink-500">
        <Link to="/" className="flex items-center gap-1 hover:text-ink-900"><Home className="h-3.5 w-3.5" /> Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-ink-900">My orders</span>
      </nav>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">My orders</h1>
          <p className="text-sm text-ink-500">{orders.length} total orders</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by order number..."
            className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 sm:w-64"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium capitalize transition-all ${
              filter === f ? 'bg-ink-900 text-white' : 'bg-white border border-ink-200 text-ink-600 hover:bg-ink-50'
            }`}
          >
            {f} {f !== 'all' && `(${orders.filter(o => o.status === f).length})`}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 rounded-xl bg-error-50 px-3 py-2 text-sm text-error-600">{error}</p>}

      {/* Orders list */}
      {!loading && filtered.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-ink-100 bg-white">
          <EmptyState icon={<Package className="h-7 w-7" />} title="No orders found" description="When you place orders, they'll appear here." action={{ label: 'Start shopping', to: '/shop' }} />
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {filtered.map(order => (
            <div key={order.id} className="rounded-2xl border border-ink-100 bg-white overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 bg-ink-50/50 px-5 py-3">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-ink-500">Order</p>
                    <p className="text-sm font-semibold text-ink-900">{order.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-500">Placed</p>
                    <p className="text-sm font-medium text-ink-700">{formatDate(order.placedAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-500">Total</p>
                    <p className="text-sm font-semibold text-ink-900">{formatCurrency(order.total, { decimals: true })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {statusIcon(order.status)}
                  <StatusBadge status={order.status} />
                  <Link to={`/orders/${order.id}`} className="flex items-center gap-1 rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-white">
                    <Eye className="h-3.5 w-3.5" /> Details
                  </Link>
                </div>
              </div>

              <div className="p-5">
                <div className="flex flex-wrap gap-4">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Link to={`/product/${item.productId}`}>
                        <ProductImage src={item.image} alt="" className="h-16 w-16 rounded-xl" />
                      </Link>
                      <div>
                        <Link to={`/product/${item.productId}`} className="line-clamp-1 text-sm font-medium text-ink-900 hover:text-brand-600">{item.title}</Link>
                        <p className="text-xs text-ink-500">Qty: {item.qty}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tracking */}
                {order.trackingNumber && (
                  <div className="mt-4 flex items-center justify-between rounded-xl bg-blue-50 px-4 py-2.5">
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <Truck className="h-4 w-4" />
                      <span>Tracking: {order.trackingNumber}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
