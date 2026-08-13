import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, ChevronRight, Home, CreditCard, Truck, MapPin, Package, Lock, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import { ProductImage } from '@/components/ProductImage';
import { api, ApiError } from '@/lib/api';
import { useCart } from '@/lib/cart';
import { useNotifications } from '@/lib/notifications';

const STEPS = ['Shipping', 'Delivery', 'Payment', 'Review'];

type AddressDto = {
  id: string;
  label: string;
  name: string;
  line1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  default: boolean;
};

type CheckoutResponse = {
  checkoutNumber: string;
  total: number;
  orders: Array<{ id: string }>;
};

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, refreshCart } = useCart();
  const { refresh: refreshNotifications } = useNotifications();
  const [step, setStep] = useState(0);
  const [delivery, setDelivery] = useState('standard');
  const [payment, setPayment] = useState('card');
  const [addresses, setAddresses] = useState<AddressDto[]>([]);
  const [addressId, setAddressId] = useState<string>('');
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<CheckoutResponse | null>(null);

  useEffect(() => {
    void refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    api<AddressDto[]>('/addresses')
      .then(data => {
        setAddresses(data ?? []);
        const defaultAddress = data?.find(a => a.default) ?? data?.[0];
        if (defaultAddress) setAddressId(defaultAddress.id);
      })
      .catch(() => setAddresses([]))
      .finally(() => setAddressesLoading(false));
  }, []);

  const subtotal = cart.subtotal;
  const discount = cart.discount;
  const shipping = delivery === 'express' ? 15 : delivery === 'pickup' ? 5 : 0;
  const taxable = Math.max(subtotal - discount, 0);
  const tax = Math.round(taxable * 0.08 * 100) / 100;
  const total = taxable + tax + shipping;
  const selectedAddress = addresses.find(a => a.id === addressId);

  const placeOrder = async () => {
    if (!addressId) {
      setError('Please select a shipping address');
      setStep(0);
      return;
    }
    setError('');
    setPlacing(true);
    try {
      const idempotencyKey = crypto.randomUUID();
      const data = await api<CheckoutResponse>('/checkout', {
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey },
        body: JSON.stringify({ addressId, deliveryMethod: delivery, paymentMethod: payment }),
      });
      setResult({ ...data, total: Number(data.total) });
      await refreshCart();
      void refreshNotifications();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (result) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success-50 animate-scale-in">
          <Check className="h-10 w-10 text-success-600" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold text-ink-900">Order placed!</h1>
        <p className="mt-2 text-ink-500">Thank you for your purchase. A confirmation has been sent to your email.</p>
        <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-6 text-left">
          <div className="flex items-center justify-between border-b border-ink-100 pb-4">
            <div>
              <p className="text-sm text-ink-500">Checkout number</p>
              <p className="font-display text-lg font-bold text-ink-900">{result.checkoutNumber}</p>
            </div>
            <Package className="h-8 w-8 text-brand-500" />
          </div>
          <div className="mt-4 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-ink-500">Orders placed</span><span className="font-medium text-ink-900">{result.orders.length}</span></div>
            <div className="flex justify-between"><span className="text-ink-500">Total</span><span className="font-medium text-ink-900">{formatCurrency(result.total, { decimals: true })}</span></div>
            <div className="flex justify-between"><span className="text-ink-500">Estimated delivery</span><span className="font-medium text-ink-900">3-5 business days</span></div>
          </div>
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/orders" className="rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600">Track order</Link>
          <Link to="/shop" className="rounded-xl border border-ink-200 px-6 py-3 text-sm font-semibold text-ink-700 hover:bg-ink-50">Continue shopping</Link>
        </div>
      </div>
    );
  }

  if (!addressesLoading && cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <Package className="mx-auto h-12 w-12 text-ink-300" />
        <h1 className="mt-4 font-display text-2xl font-bold text-ink-900">Your cart is empty</h1>
        <p className="mt-2 text-ink-500">Add items to your cart before checking out.</p>
        <Link to="/shop" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600">Start shopping</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1.5 text-sm text-ink-500">
        <Link to="/" className="flex items-center gap-1 hover:text-ink-900"><Home className="h-3.5 w-3.5" /> Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/cart" className="hover:text-ink-900">Cart</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-ink-900">Checkout</span>
      </nav>

      {/* Stepper */}
      <div className="mt-6 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all ${
              i < step ? 'bg-success-500 text-white' : i === step ? 'bg-brand-500 text-white' : 'bg-ink-100 text-ink-400'
            }`}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-sm font-medium ${i === step ? 'text-ink-900' : 'text-ink-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`mx-1 h-0.5 w-8 rounded ${i < step ? 'bg-success-500' : 'bg-ink-200'}`} />}
          </div>
        ))}
      </div>

      {error && <p className="mt-4 rounded-xl bg-error-50 px-3 py-2 text-sm text-error-600">{error}</p>}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Step 0: Shipping */}
          {step === 0 && (
            <div className="animate-fade-in rounded-2xl border border-ink-100 bg-white p-6">
              <div className="flex items-center gap-2"><MapPin className="h-5 w-5 text-brand-600" /><h2 className="font-display text-lg font-bold text-ink-900">Shipping address</h2></div>
              <div className="mt-4 space-y-3">
                {addressesLoading && <p className="text-sm text-ink-500">Loading addresses…</p>}
                {!addressesLoading && addresses.length === 0 && (
                  <p className="text-sm text-ink-500">You have no saved addresses yet.</p>
                )}
                {addresses.map(a => (
                  <label key={a.id} className="flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all hover:border-ink-200 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50/30">
                    <input type="radio" name="address" checked={addressId === a.id} onChange={() => setAddressId(a.id)} className="mt-1 h-4 w-4 text-brand-500" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-ink-900">{a.label}</p>
                        {a.default && <span className="rounded-md bg-success-50 px-2 py-0.5 text-xs font-medium text-success-700">Default</span>}
                      </div>
                      <p className="mt-1 text-sm text-ink-600">{a.name} · {a.phone}</p>
                      <p className="text-sm text-ink-500">{a.line1}, {a.city}, {a.state} {a.zip}, {a.country}</p>
                    </div>
                  </label>
                ))}
                <Link to="/addresses" className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-200 py-3 text-sm font-medium text-ink-600 hover:border-brand-300 hover:text-brand-600">
                  + Add new address
                </Link>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => { if (!addressId) { setError('Please select a shipping address'); return; } setError(''); setStep(1); }}
                  className="flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600"
                >
                  Continue <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Delivery */}
          {step === 1 && (
            <div className="animate-fade-in rounded-2xl border border-ink-100 bg-white p-6">
              <div className="flex items-center gap-2"><Truck className="h-5 w-5 text-brand-600" /><h2 className="font-display text-lg font-bold text-ink-900">Delivery method</h2></div>
              <div className="mt-4 space-y-3">
                {[
                  { id: 'standard', name: 'Standard Shipping', desc: '3-5 business days', price: 'Free', icon: Truck },
                  { id: 'express', name: 'Express Shipping', desc: '1-2 business days', price: '$15.00', icon: Truck },
                  { id: 'pickup', name: 'Store Pickup', desc: 'Ready in 2 hours', price: '$5.00', icon: Package },
                ].map(o => (
                  <label key={o.id} className="flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all hover:border-ink-200 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50/30">
                    <input type="radio" name="delivery" checked={delivery === o.id} onChange={() => setDelivery(o.id)} className="h-4 w-4 text-brand-500" />
                    <o.icon className="h-5 w-5 text-ink-400" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-ink-900">{o.name}</p>
                      <p className="text-xs text-ink-500">{o.desc}</p>
                    </div>
                    <span className="text-sm font-bold text-ink-900">{o.price}</span>
                  </label>
                ))}
              </div>
              <div className="mt-6 flex justify-between">
                <button onClick={() => setStep(0)} className="rounded-xl border border-ink-200 px-6 py-3 text-sm font-semibold text-ink-700 hover:bg-ink-50">Back</button>
                <button onClick={() => setStep(2)} className="flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600">Continue <ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="animate-fade-in rounded-2xl border border-ink-100 bg-white p-6">
              <div className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-brand-600" /><h2 className="font-display text-lg font-bold text-ink-900">Payment method</h2></div>
              <div className="mt-4 space-y-3">
                {[
                  { id: 'card', name: 'Credit / Debit Card', desc: 'Visa, Mastercard, Amex' },
                  { id: 'paypal', name: 'PayPal', desc: 'Pay with your PayPal balance' },
                  { id: 'cod', name: 'Cash on Delivery', desc: 'Pay when you receive' },
                ].map(o => (
                  <label key={o.id} className="flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all hover:border-ink-200 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50/30">
                    <input type="radio" name="payment" checked={payment === o.id} onChange={() => setPayment(o.id)} className="h-4 w-4 text-brand-500" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-ink-900">{o.name}</p>
                      <p className="text-xs text-ink-500">{o.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {payment === 'card' && (
                <div className="mt-4 space-y-3 rounded-xl border border-ink-100 bg-ink-50 p-4 animate-scale-in">
                  <div>
                    <label className="text-xs font-medium text-ink-600">Card number</label>
                    <input placeholder="1234 5678 9012 3456" className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-ink-600">Expiry</label>
                      <input placeholder="MM / YY" className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-ink-600">CVC</label>
                      <input placeholder="123" className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
                    </div>
                  </div>
                  <p className="text-xs text-ink-400">This is a mock payment form — no real card is charged.</p>
                </div>
              )}

              <div className="mt-4 flex items-center gap-2 text-xs text-ink-500">
                <Lock className="h-3.5 w-3.5" /> Your payment is encrypted and secure.
              </div>

              <div className="mt-6 flex justify-between">
                <button onClick={() => setStep(1)} className="rounded-xl border border-ink-200 px-6 py-3 text-sm font-semibold text-ink-700 hover:bg-ink-50">Back</button>
                <button onClick={() => setStep(3)} className="flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600">Review order <ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="animate-fade-in space-y-4">
              <div className="rounded-2xl border border-ink-100 bg-white p-6">
                <h2 className="font-display text-lg font-bold text-ink-900">Review your order</h2>
                <div className="mt-4 space-y-3">
                  {cart.items.map(item => (
                    <div key={item.id} className="flex gap-3 rounded-xl border border-ink-100 p-3">
                      <ProductImage src={item.image} alt="" className="h-16 w-16 rounded-lg" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-ink-900 line-clamp-1">{item.title}</p>
                        <p className="text-xs text-ink-500">Qty: {item.qty} · {item.sellerName}</p>
                      </div>
                      <span className="text-sm font-bold text-ink-900">{formatCurrency(item.price * item.qty, { decimals: true })}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-ink-100 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-ink-900">Ship to</p>
                    <button onClick={() => setStep(0)} className="text-xs text-brand-600">Edit</button>
                  </div>
                  {selectedAddress && (
                    <>
                      <p className="mt-2 text-sm text-ink-600">{selectedAddress.name}</p>
                      <p className="text-xs text-ink-500">{selectedAddress.line1}, {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zip}</p>
                    </>
                  )}
                </div>
                <div className="rounded-2xl border border-ink-100 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-ink-900">Payment</p>
                    <button onClick={() => setStep(2)} className="text-xs text-brand-600">Edit</button>
                  </div>
                  <p className="mt-2 text-sm text-ink-600">{payment === 'card' ? 'Credit / Debit Card' : payment === 'paypal' ? 'PayPal' : 'Cash on Delivery'}</p>
                </div>
              </div>

              <div className="flex justify-between">
                <button onClick={() => setStep(2)} className="rounded-xl border border-ink-200 px-6 py-3 text-sm font-semibold text-ink-700 hover:bg-ink-50">Back</button>
                <button
                  onClick={() => void placeOrder()}
                  disabled={placing}
                  className="flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-brand hover:bg-brand-600 disabled:opacity-50"
                >
                  <Lock className="h-4 w-4" /> {placing ? 'Placing order…' : 'Place order'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-ink-100 bg-white p-5">
            <h2 className="font-display text-lg font-bold text-ink-900">Summary</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-ink-600"><span>Subtotal ({cart.items.length} items)</span><span className="font-medium text-ink-900">{formatCurrency(subtotal, { decimals: true })}</span></div>
              {discount > 0 && (
                <div className="flex justify-between text-success-600"><span>Discount</span><span className="font-medium">-{formatCurrency(discount, { decimals: true })}</span></div>
              )}
              <div className="flex justify-between text-ink-600"><span>Shipping</span><span className="font-medium text-ink-900">{shipping === 0 ? 'Free' : formatCurrency(shipping, { decimals: true })}</span></div>
              <div className="flex justify-between text-ink-600"><span>Tax</span><span className="font-medium text-ink-900">{formatCurrency(tax, { decimals: true })}</span></div>
            </div>
            <div className="mt-4 flex justify-between border-t border-ink-100 pt-4">
              <span className="font-display text-lg font-bold text-ink-900">Total</span>
              <span className="font-display text-lg font-bold text-brand-600">{formatCurrency(total, { decimals: true })}</span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-ink-500">
              <ShieldCheck className="h-4 w-4 text-success-500" /> Buyer protection included
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
