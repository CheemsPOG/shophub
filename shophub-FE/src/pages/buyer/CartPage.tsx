import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, Tag, Truck, ShieldCheck, ChevronRight, Home, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { formatCurrency } from '@/lib/format';
import { ProductImage } from '@/components/ProductImage';
import { api, ApiError } from '@/lib/api';
import { useCart } from '@/lib/cart';

export function CartPage() {
  const { cart, refreshCart, loading } = useCart();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [coupon, setCoupon] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponBusy, setCouponBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, { sellerId: string; sellerName: string; items: typeof cart.items }>();
    for (const item of cart.items) {
      const group = map.get(item.sellerId) ?? { sellerId: item.sellerId, sellerName: item.sellerName, items: [] };
      group.items.push(item);
      map.set(item.sellerId, group);
    }
    return Array.from(map.values());
  }, [cart.items]);

  const updateQty = async (itemId: string, productId: string, variant: string | null, nextQty: number) => {
    setError('');
    setBusyId(itemId);
    try {
      await api('/cart/items', { method: 'PUT', body: JSON.stringify({ productId, qty: Math.max(0, nextQty), variant }) });
      await refreshCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update cart');
    } finally {
      setBusyId(null);
    }
  };

  const removeItem = async (itemId: string) => {
    setError('');
    setBusyId(itemId);
    try {
      await api(`/cart/items/${itemId}`, { method: 'DELETE' });
      await refreshCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove item');
    } finally {
      setBusyId(null);
    }
  };

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setCouponError('');
    setCouponBusy(true);
    try {
      await api('/cart/coupon', { method: 'POST', body: JSON.stringify({ code: coupon.trim() }) });
      await refreshCart();
      setCoupon('');
    } catch (err) {
      setCouponError(err instanceof ApiError ? err.message : 'Could not apply coupon');
    } finally {
      setCouponBusy(false);
    }
  };

  const clearCoupon = async () => {
    setCouponBusy(true);
    try {
      await api('/cart/coupon', { method: 'DELETE' });
      await refreshCart();
    } finally {
      setCouponBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1.5 text-sm text-ink-500">
        <Link to="/" className="flex items-center gap-1 hover:text-ink-900"><Home className="h-3.5 w-3.5" /> Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-ink-900">Cart</span>
      </nav>

      <h1 className="mt-4 font-display text-2xl font-bold text-ink-900">Shopping cart</h1>
      <p className="text-sm text-ink-500">{cart.items.length} items in your cart</p>

      {error && <p className="mt-3 rounded-xl bg-error-50 px-3 py-2 text-sm text-error-600">{error}</p>}

      {!loading && cart.items.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-12 text-center">
          <ShoppingCart className="mx-auto h-12 w-12 text-ink-300" />
          <h3 className="mt-4 text-lg font-semibold text-ink-900">Your cart is empty</h3>
          <p className="mt-1 text-sm text-ink-500">Browse our catalog and find something you love.</p>
          <Link to="/shop" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">Start shopping <ArrowRight className="h-4 w-4" /></Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {groups.map(group => (
              <div key={group.sellerId} className="rounded-2xl border border-ink-100 bg-white p-4">
                <p className="text-sm font-semibold text-ink-900">{group.sellerName || 'Shop'}</p>
                <div className="mt-3 space-y-3">
                  {group.items.map(item => (
                    <div key={item.id} className="flex gap-4 border-t border-ink-50 pt-3 first:border-0 first:pt-0">
                      <Link to={`/product/${item.productId}`} className="shrink-0">
                        <ProductImage src={item.image} alt="" className="h-24 w-24 rounded-xl" />
                      </Link>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <Link to={`/product/${item.productId}`} className="line-clamp-2 text-sm font-medium text-ink-900 hover:text-brand-600">{item.title}</Link>
                            {item.variant && <p className="mt-0.5 text-xs text-ink-400">{item.variant}</p>}
                          </div>
                          <button
                            onClick={() => void removeItem(item.id)}
                            disabled={busyId === item.id}
                            className="shrink-0 text-ink-400 hover:text-error-600 disabled:opacity-40"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-auto flex items-end justify-between">
                          <div className="flex items-center rounded-lg border border-ink-200">
                            <button
                              onClick={() => void updateQty(item.id, item.productId, item.variant, item.qty - 1)}
                              disabled={busyId === item.id}
                              className="flex h-8 w-8 items-center justify-center text-ink-600 hover:bg-ink-50 rounded-l-lg disabled:opacity-40"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-10 text-center text-sm font-semibold">{item.qty}</span>
                            <button
                              onClick={() => void updateQty(item.id, item.productId, item.variant, item.qty + 1)}
                              disabled={busyId === item.id}
                              className="flex h-8 w-8 items-center justify-center text-ink-600 hover:bg-ink-50 rounded-r-lg disabled:opacity-40"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p className="font-bold text-ink-900">{formatCurrency(item.price * item.qty, { decimals: true })}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <Link to="/shop" className="flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700">
              <ArrowRight className="h-4 w-4 rotate-180" /> Continue shopping
            </Link>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-ink-100 bg-white p-5">
              <h2 className="font-display text-lg font-bold text-ink-900">Summary</h2>

              <div className="mt-4">
                {cart.couponCode ? (
                  <div className="flex items-center justify-between rounded-xl bg-success-50 px-3 py-2 text-sm text-success-700">
                    <span className="flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" /> {cart.couponCode} applied</span>
                    <button onClick={() => void clearCoupon()} disabled={couponBusy} className="text-success-600 hover:text-success-800"><X className="h-3.5 w-3.5" /></button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={coupon}
                      onChange={e => setCoupon(e.target.value)}
                      placeholder="Coupon code"
                      className="w-full rounded-xl border border-ink-200 px-3 py-2 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                    />
                    <button onClick={() => void applyCoupon()} disabled={couponBusy} className="shrink-0 rounded-xl border border-ink-200 px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-50">Apply</button>
                  </div>
                )}
                {couponError && <p className="mt-1.5 text-xs text-error-600">{couponError}</p>}
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-ink-600"><span>Subtotal ({cart.items.length} items)</span><span className="font-medium text-ink-900">{formatCurrency(cart.subtotal, { decimals: true })}</span></div>
                {cart.discount > 0 && (
                  <div className="flex justify-between text-success-600"><span>Discount</span><span className="font-medium">-{formatCurrency(cart.discount, { decimals: true })}</span></div>
                )}
                <div className="flex justify-between text-ink-600"><span>Tax</span><span className="font-medium text-ink-900">{formatCurrency(cart.tax, { decimals: true })}</span></div>
                <div className="flex justify-between text-ink-600"><span>Shipping</span><span className="font-medium text-ink-900">Calculated at checkout</span></div>
              </div>
              <div className="mt-4 flex justify-between border-t border-ink-100 pt-4">
                <span className="font-display text-lg font-bold text-ink-900">Total</span>
                <span className="font-display text-lg font-bold text-brand-600">{formatCurrency(cart.total, { decimals: true })}</span>
              </div>

              <Link to="/checkout" className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-brand-500 py-3.5 text-sm font-semibold text-white shadow-brand transition-all hover:bg-brand-600 active:scale-[0.98]">
                Proceed to checkout <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="mt-4 flex items-center gap-2 text-xs text-ink-500">
                <ShieldCheck className="h-4 w-4 text-success-500" /> Buyer protection included
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-ink-500">
                <Truck className="h-4 w-4 text-ink-400" /> Free shipping on standard delivery
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
