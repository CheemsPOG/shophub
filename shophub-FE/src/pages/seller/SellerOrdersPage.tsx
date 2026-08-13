import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Search, Eye, Package, ArrowLeft, Truck, MapPin } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency, formatDate } from '@/lib/format';
import { ProductImage } from '@/components/ProductImage';
import { api, ApiError } from '@/lib/api';
import type { Order } from '@/lib/data';

const FILTERS = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

function normalize(o: Order): Order {
  return { ...o, total: Number(o.total), subtotal: Number(o.subtotal), shipping: Number(o.shipping), tax: Number(o.tax), commissionRate: o.commissionRate == null ? 8 : Number(o.commissionRate) };
}

export function SellerOrdersPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api<{ content: Order[] }>('/seller/orders?size=100')
      .then(data => setOrders((data.content ?? []).map(normalize)))
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load orders'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter(o => {
    if (filter !== 'all' && o.status !== filter) return false;
    if (search && !o.orderNumber.toLowerCase().includes(search.toLowerCase()) && !o.buyerName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Orders</h1>
        <p className="text-sm text-ink-500">{orders.length} total orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, color: 'text-warning-600' },
          { label: 'Processing', value: orders.filter(o => o.status === 'processing').length, color: 'text-blue-600' },
          { label: 'Shipped', value: orders.filter(o => o.status === 'shipped').length, color: 'text-blue-600' },
          { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, color: 'text-success-600' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-ink-100 bg-white p-4">
            <p className="text-xs text-ink-500">{s.label}</p>
            <p className={`mt-1 text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by order or customer..." className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 sm:w-72" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium capitalize transition-all ${filter === f ? 'bg-ink-900 text-white' : 'border border-ink-200 bg-white text-ink-600 hover:bg-ink-50'}`}>{f}</button>
          ))}
        </div>
      </div>

      {error && <p className="rounded-xl bg-error-50 px-3 py-2 text-sm text-error-600">{error}</p>}

      {/* Table */}
      {!loading && filtered.length === 0 ? (
        <div className="rounded-2xl border border-ink-100 bg-white">
          <EmptyState icon={<Package className="h-7 w-7" />} title="No orders found" description="Orders from buyers will appear here." />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-ink-100 bg-ink-50/50 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {filtered.map(o => (
                  <tr key={o.id} className="transition-colors hover:bg-ink-50/30">
                    <td className="px-5 py-3 font-medium text-ink-900">{o.orderNumber}</td>
                    <td className="px-5 py-3 text-ink-700">{o.buyerName}</td>
                    <td className="px-5 py-3 text-ink-500">{formatDate(o.placedAt, { short: true })}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        {o.items.slice(0, 2).map((item, i) => (
                          <ProductImage key={i} src={item.image} alt="" className="h-8 w-8 rounded-md" />
                        ))}
                        {o.items.length > 2 && <span className="text-xs text-ink-400">+{o.items.length - 2}</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3 font-semibold text-ink-900">{formatCurrency(o.total, { decimals: true })}</td>
                    <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-5 py-3 text-right">
                      <Link to={`/seller/orders/${o.id}`} className="inline-flex items-center gap-1 rounded-lg border border-ink-200 px-2.5 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50">
                        <Eye className="h-3.5 w-3.5" /> View
                      </Link>
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

export function SellerOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showShipForm, setShowShipForm] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');

  const load = () => {
    if (!id) return;
    api<Order>(`/seller/orders/${id}`)
      .then(data => setOrder(normalize(data)))
      .catch(err => setError(err instanceof Error ? err.message : 'Order not found'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const confirm = async () => {
    if (!id) return;
    setBusy(true);
    setError('');
    try {
      const data = await api<Order>(`/seller/orders/${id}/confirm`, { method: 'POST' });
      setOrder(normalize(data));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not confirm order');
    } finally {
      setBusy(false);
    }
  };

  const ship = async () => {
    if (!id) return;
    setBusy(true);
    setError('');
    try {
      const data = await api<Order>(`/seller/orders/${id}/ship`, { method: 'POST', body: JSON.stringify({ trackingNumber: trackingNumber.trim() || undefined }) });
      setOrder(normalize(data));
      setShowShipForm(false);
      setTrackingNumber('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not mark as shipped');
    } finally {
      setBusy(false);
    }
  };

  const deliver = async () => {
    if (!id) return;
    setBusy(true);
    setError('');
    try {
      const data = await api<Order>(`/seller/orders/${id}/deliver`, { method: 'POST' });
      setOrder(normalize(data));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not mark as delivered');
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    if (!id || !window.confirm('Cancel this order?')) return;
    setBusy(true);
    setError('');
    try {
      const data = await api<Order>(`/seller/orders/${id}/cancel`, { method: 'POST' });
      setOrder(normalize(data));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not cancel order');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-4xl py-16 text-center text-sm text-ink-500">Loading order…</div>;
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-4xl py-16 text-center">
        <Package className="mx-auto h-12 w-12 text-ink-300" />
        <h1 className="mt-4 font-display text-xl font-bold text-ink-900">Order not found</h1>
        {error && <p className="mt-2 text-sm text-error-600">{error}</p>}
        <button onClick={() => navigate('/seller/orders')} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600">Back to orders</button>
      </div>
    );
  }

  const address = order.shippingAddress ?? ({} as Order['shippingAddress']);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link to="/seller/orders" className="flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900">
          <ArrowLeft className="h-4 w-4" /> Back to orders
        </Link>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-900">{order.orderNumber}</h1>
            <p className="text-sm text-ink-500">Placed by {order.buyerName} on {formatDate(order.placedAt)}</p>
          </div>
          <StatusBadge status={order.status} size="md" />
        </div>
      </div>

      {error && <p className="rounded-xl bg-error-50 px-3 py-2 text-sm text-error-600">{error}</p>}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {order.status === 'pending' && (
          <>
            <button onClick={() => void confirm()} disabled={busy} className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50">Confirm order</button>
            <button onClick={() => void cancel()} disabled={busy} className="rounded-xl border border-error-200 px-4 py-2.5 text-sm font-medium text-error-600 hover:bg-error-50 disabled:opacity-50">Cancel order</button>
          </>
        )}
        {order.status === 'processing' && (
          <>
            <button onClick={() => setShowShipForm(v => !v)} disabled={busy} className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50">Mark as shipped</button>
            <button onClick={() => void cancel()} disabled={busy} className="rounded-xl border border-error-200 px-4 py-2.5 text-sm font-medium text-error-600 hover:bg-error-50 disabled:opacity-50">Cancel order</button>
          </>
        )}
        {order.status === 'shipped' && (
          <button onClick={() => void deliver()} disabled={busy} className="rounded-xl bg-success-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-success-600 disabled:opacity-50">Mark as delivered</button>
        )}
      </div>

      {showShipForm && order.status === 'processing' && (
        <div className="rounded-2xl border border-ink-100 bg-white p-5">
          <h2 className="font-semibold text-ink-900">Shipping details</h2>
          <div className="mt-3">
            <label className="text-xs font-medium text-ink-600">Tracking number (optional)</label>
            <input
              value={trackingNumber}
              onChange={e => setTrackingNumber(e.target.value)}
              placeholder="e.g. 1Z999AA10123456784"
              className="mt-1 w-full max-w-sm rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
            <p className="mt-1 text-xs text-ink-400">This is a demo — type anything, or leave it blank. It isn't validated against a real carrier.</p>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={() => void ship()} disabled={busy} className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50">{busy ? 'Shipping…' : 'Confirm shipment'}</button>
            <button onClick={() => setShowShipForm(false)} className="rounded-xl border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="rounded-2xl border border-ink-100 bg-white p-5">
            <h2 className="font-semibold text-ink-900">Items</h2>
            <div className="mt-4 space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-4 border-b border-ink-50 pb-3 last:border-0">
                  <ProductImage src={item.image} alt="" className="h-16 w-16 rounded-xl" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink-900">{item.title}</p>
                    <p className="text-xs text-ink-500">Qty: {item.qty} × {formatCurrency(item.price, { decimals: true })}</p>
                  </div>
                  <p className="font-bold text-ink-900">{formatCurrency(item.price * item.qty, { decimals: true })}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping */}
          <div className="rounded-2xl border border-ink-100 bg-white p-5">
            <div className="flex items-center gap-2"><MapPin className="h-5 w-5 text-brand-600" /><h2 className="font-semibold text-ink-900">Shipping address</h2></div>
            <div className="mt-3 text-sm text-ink-600">
              <p className="font-medium text-ink-900">{address.name}</p>
              <p>{address.line1}</p>
              <p>{address.city}, {address.state} {address.zip}</p>
              <p>{address.country}</p>
              <p className="mt-1 text-ink-500">{address.phone}</p>
            </div>
            {order.trackingNumber && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm text-blue-700">
                <Truck className="h-4 w-4" /> Tracking: {order.trackingNumber}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-ink-100 bg-white p-5">
            <h2 className="font-semibold text-ink-900">Payment summary</h2>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between text-ink-600"><span>Subtotal</span><span className="font-medium text-ink-900">{formatCurrency(order.subtotal, { decimals: true })}</span></div>
              <div className="flex justify-between text-ink-600"><span>Shipping</span><span className="font-medium text-ink-900">{formatCurrency(order.shipping, { decimals: true })}</span></div>
              <div className="flex justify-between text-ink-600"><span>Tax</span><span className="font-medium text-ink-900">{formatCurrency(order.tax, { decimals: true })}</span></div>
              <div className="flex justify-between border-t border-ink-100 pt-2"><span className="font-bold text-ink-900">Total</span><span className="font-bold text-ink-900">{formatCurrency(order.total, { decimals: true })}</span></div>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-xl bg-ink-50 px-3 py-2.5 text-sm">
              <span className="text-ink-600">Your earnings</span>
              <span className="font-bold text-success-600">{formatCurrency(order.subtotal * (1 - (order.commissionRate ?? 8) / 100), { decimals: true })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
