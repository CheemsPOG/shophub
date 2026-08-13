import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Home, Truck, CheckCircle2, Package, MapPin, CreditCard, ArrowLeft } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/format';
import { ProductImage } from '@/components/ProductImage';
import { api } from '@/lib/api';
import { useNotifications } from '@/lib/notifications';
import type { Order } from '@/lib/data';

function normalizeOrder(o: Order): Order {
  return { ...o, total: Number(o.total), subtotal: Number(o.subtotal), shipping: Number(o.shipping), tax: Number(o.tax) };
}

export function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refresh: refreshNotifications } = useNotifications();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api<Order>(`/orders/${id}`)
      .then(data => setOrder(normalizeOrder(data)))
      .catch(err => setError(err instanceof Error ? err.message : 'Order not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const cancelOrder = async () => {
    if (!id || !window.confirm('Cancel this order?')) return;
    setCancelling(true);
    try {
      const data = await api<Order>(`/orders/${id}/cancel`, { method: 'POST' });
      setOrder(normalizeOrder(data));
      void refreshNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6"><p className="text-sm text-ink-500">Loading order…</p></div>;
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <Package className="mx-auto h-12 w-12 text-ink-300" />
        <h1 className="mt-4 font-display text-2xl font-bold text-ink-900">Order not found</h1>
        {error && <p className="mt-2 text-sm text-error-600">{error}</p>}
        <Link to="/orders" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600">Back to orders</Link>
      </div>
    );
  }

  const steps = [
    { key: 'pending', label: 'Order placed', icon: CheckCircle2 },
    { key: 'processing', label: 'Processing', icon: Package },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: MapPin },
  ];
  const currentStep = steps.findIndex(s => s.key === order.status);
  const activeIndex = currentStep === -1 ? 0 : currentStep;
  const address = order.shippingAddress ?? ({} as Order['shippingAddress']);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1.5 text-sm text-ink-500">
        <Link to="/" className="flex items-center gap-1 hover:text-ink-900"><Home className="h-3.5 w-3.5" /> Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/orders" className="hover:text-ink-900">Orders</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-ink-900">{order.orderNumber}</span>
      </nav>

      <Link to="/orders" className="mt-4 flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      {error && <p className="mt-4 rounded-xl bg-error-50 px-3 py-2 text-sm text-error-600">{error}</p>}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">{order.orderNumber}</h1>
          <p className="text-sm text-ink-500">Placed on {formatDate(order.placedAt)} · Sold by {order.sellerName}</p>
        </div>
        <StatusBadge status={order.status} size="md" />
      </div>

      {/* Tracking */}
      {order.status !== 'cancelled' && order.status !== 'refunded' && (
        <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-6">
          <h2 className="font-semibold text-ink-900">Order tracking</h2>
          <div className="mt-5 flex items-center justify-between">
            {steps.map((s, i) => (
              <div key={s.key} className="flex flex-1 flex-col items-center">
                <div className="flex items-center w-full">
                  {i > 0 && <div className={`h-0.5 flex-1 ${i <= activeIndex ? 'bg-success-500' : 'bg-ink-200'}`} />}
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all ${
                    i <= activeIndex ? 'bg-success-500 text-white' : 'bg-ink-100 text-ink-400'
                  }`}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  {i < steps.length - 1 && <div className={`h-0.5 flex-1 ${i < activeIndex ? 'bg-success-500' : 'bg-ink-200'}`} />}
                </div>
                <p className={`mt-2 text-xs font-medium ${i <= activeIndex ? 'text-ink-900' : 'text-ink-400'}`}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="rounded-2xl border border-ink-100 bg-white p-6">
            <h2 className="font-semibold text-ink-900">Items in this order</h2>
            <div className="mt-4 space-y-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-4 border-b border-ink-50 pb-4 last:border-0">
                  <Link to={`/product/${item.productId}`}><ProductImage src={item.image} alt="" className="h-20 w-20 rounded-xl" /></Link>
                  <div className="flex-1">
                    <Link to={`/product/${item.productId}`} className="text-sm font-medium text-ink-900 hover:text-brand-600">{item.title}</Link>
                    <p className="mt-1 text-xs text-ink-500">Sold by {order.sellerName}</p>
                    <p className="mt-1 text-sm text-ink-700">Qty: {item.qty} × {formatCurrency(item.price, { decimals: true })}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-ink-900">{formatCurrency(item.price * item.qty, { decimals: true })}</p>
                    {order.status === 'delivered' && (
                      <button onClick={() => navigate(`/product/${item.productId}`)} className="mt-2 rounded-lg bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100">Buy again</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping address */}
          <div className="rounded-2xl border border-ink-100 bg-white p-6">
            <div className="flex items-center gap-2"><MapPin className="h-5 w-5 text-brand-600" /><h2 className="font-semibold text-ink-900">Shipping address</h2></div>
            <div className="mt-3 text-sm text-ink-600">
              <p className="font-medium text-ink-900">{address.name}</p>
              <p>{address.line1}</p>
              <p>{address.city}, {address.state} {address.zip}</p>
              <p>{address.country}</p>
              <p className="mt-1 text-ink-500">{address.phone}</p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-ink-100 bg-white p-6">
            <div className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-brand-600" /><h2 className="font-semibold text-ink-900">Payment</h2></div>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between text-ink-600"><span>Subtotal</span><span className="font-medium text-ink-900">{formatCurrency(order.subtotal, { decimals: true })}</span></div>
              <div className="flex justify-between text-ink-600"><span>Shipping</span><span className="font-medium text-ink-900">{formatCurrency(order.shipping, { decimals: true })}</span></div>
              <div className="flex justify-between text-ink-600"><span>Tax</span><span className="font-medium text-ink-900">{formatCurrency(order.tax, { decimals: true })}</span></div>
              <div className="flex justify-between border-t border-ink-100 pt-2"><span className="font-bold text-ink-900">Total</span><span className="font-bold text-ink-900">{formatCurrency(order.total, { decimals: true })}</span></div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl bg-ink-50 px-3 py-2.5 text-sm">
              <span className="text-ink-600">Payment status</span>
              <StatusBadge status={order.paymentStatus} />
            </div>
          </div>

          {(order.status === 'shipped' || order.status === 'delivered') && order.trackingNumber ? (
            <div className="rounded-2xl border border-ink-100 bg-white p-6">
              <div className="flex items-center gap-2"><Truck className="h-5 w-5 text-brand-600" /><h2 className="font-semibold text-ink-900">Delivery</h2></div>
              <div className="mt-3 rounded-xl bg-blue-50 px-4 py-3 text-sm">
                <p className="text-blue-700">Tracking number</p>
                <p className="font-semibold text-blue-900">{order.trackingNumber}</p>
              </div>
            </div>
          ) : null}

          {(order.status === 'processing' || order.status === 'pending') && (
            <button
              onClick={() => void cancelOrder()}
              disabled={cancelling}
              className="w-full rounded-xl border border-error-200 py-2.5 text-sm font-medium text-error-600 hover:bg-error-50 disabled:opacity-50"
            >
              {cancelling ? 'Cancelling…' : 'Cancel order'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
