import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star, Heart, ShoppingBag, ShoppingCart, Minus, Plus, Truck, ShieldCheck, RotateCcw,
  ChevronRight, Home, Check, Share2, MessageSquare, Store,
} from 'lucide-react';
import type { Product, Review } from '@/lib/data';
import { Stars } from '@/components/Stars';
import { StatusBadge } from '@/components/StatusBadge';
import { ProductCard } from '@/components/ProductCard';
import { ProductImage, isProductImageUrl } from '@/components/ProductImage';
import { Avatar } from '@/components/Avatar';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency, discountPercent, formatDate } from '@/lib/format';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';

function asProduct(data: Product): Product {
  return {
    ...data,
    price: Number(data.price),
    compareAt: data.compareAt == null ? undefined : Number(data.compareAt),
    rating: Number(data.rating),
    reviews: Number(data.reviews),
    stock: Number(data.stock),
    sales: Number(data.sales),
    images: data.images?.length ? data.images : [],
    tags: Array.isArray(data.tags) ? data.tags : [],
  };
}

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toggleWishlist, isWishlisted, refreshCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<'description' | 'reviews' | 'shipping'>('description');
  const [cartError, setCartError] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);
  const [added, setAdded] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSaving, setReviewSaving] = useState(false);

  const handleAddToCart = async (): Promise<boolean> => {
    if (!product) return false;
    if (!user) {
      navigate('/login/buyer');
      return false;
    }
    setCartError('');
    setAddingToCart(true);
    try {
      const variantLabel = Object.entries(selectedVariant)
        .map(([name, value]) => `${name}: ${value}`)
        .join(', ');
      await api('/cart/items', {
        method: 'PUT',
        body: JSON.stringify({ productId: product.id, qty, variant: variantLabel || null }),
      });
      await refreshCart();
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
      return true;
    } catch (err) {
      setCartError(err instanceof Error ? err.message : 'Could not add to cart');
      return false;
    } finally {
      setAddingToCart(false);
    }
  };

  const submitReview = async () => {
    if (!product) return;
    if (!user) {
      navigate('/login/buyer');
      return;
    }
    if (!reviewTitle.trim() || !reviewBody.trim()) {
      setReviewError('Please fill in a title and your review');
      return;
    }
    setReviewSaving(true);
    setReviewError('');
    try {
      await api(`/catalog/products/${product.id}/reviews`, {
        method: 'POST',
        body: JSON.stringify({ rating: reviewRating, title: reviewTitle.trim(), body: reviewBody.trim() }),
      });
      const [updatedProduct, updatedReviews] = await Promise.all([
        api<Product>(`/catalog/products/${product.id}`),
        api<Review[]>(`/catalog/products/${product.id}/reviews`),
      ]);
      setProduct(asProduct(updatedProduct));
      setReviews(updatedReviews ?? []);
      setShowReviewForm(false);
      setReviewTitle('');
      setReviewBody('');
      setReviewRating(5);
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : 'Could not submit review');
    } finally {
      setReviewSaving(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    if (!user) {
      navigate('/login/buyer');
      return;
    }
    setWishlistBusy(true);
    try {
      await toggleWishlist(product.id);
    } finally {
      setWishlistBusy(false);
    }
  };

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setLoadError('');
    api<Product & { reviewList?: Review[] }>(`/catalog/products/${id}`)
      .then(data => {
        if (cancelled) return;
        const next = asProduct(data);
        setProduct(next);
        setReviews(data.reviewList?.length ? data.reviewList : []);
        setActiveImg(0);
      })
      .catch(err => {
        if (cancelled) return;
        setProduct(null);
        setReviews([]);
        setLoadError(err instanceof Error ? err.message : 'Product not found');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    api<{ content?: Product[] }>('/catalog/products?size=8')
      .then(data => {
        if (!cancelled) setRelated((data.content || []).filter(p => p.id !== id).slice(0, 4).map(asProduct));
      })
      .catch(() => {
        if (!cancelled) setRelated([]);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading && !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-sm text-ink-500">Loading product…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <EmptyState
          icon={<ShoppingBag className="h-7 w-7" />}
          title="Product not found"
          description="This listing may have been removed or is no longer available."
          action={{ label: 'Back to shop', to: '/shop' }}
        />
      </div>
    );
  }

  const discount = discountPercent(product.price, product.compareAt);
  const images = (product.images ?? []).filter(isProductImageUrl);
  const tags = product.tags ?? [];
  const outOfStock = product.stock === 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-ink-500">
        <Link to="/" className="flex items-center gap-1 hover:text-ink-900"><Home className="h-3.5 w-3.5" /> Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to={`/shop?category=${product.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="hover:text-ink-900">{product.category}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="line-clamp-1 font-medium text-ink-900">{product.title}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-ink-100 bg-white">
            <ProductImage src={images[activeImg]} alt={product.title} className="h-full w-full" />
            {discount > 0 && <span className="absolute left-4 top-4 rounded-full bg-brand-500 px-3 py-1 text-sm font-bold text-white">-{discount}%</span>}
            <button className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink-600 backdrop-blur transition-colors hover:text-brand-600">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
          {images.length > 0 && (
          <div className="flex gap-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`h-20 w-20 overflow-hidden rounded-xl border-2 transition-all ${activeImg === i ? 'border-brand-500' : 'border-ink-100 hover:border-ink-300'}`}
              >
                <ProductImage src={img} alt="" className="h-full w-full" />
              </button>
            ))}
          </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Link to={`/seller`} className="text-sm font-medium text-brand-600 hover:underline">{product.brand}</Link>
            <span className="text-ink-300">•</span>
            <Link to={`/shop?category=${product.category.toLowerCase()}`} className="text-sm text-ink-500 hover:text-ink-900">{product.category}</Link>
          </div>

          <h1 className="mt-2 font-display text-2xl font-bold text-ink-900 sm:text-3xl">{product.title}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-4">
            <Stars rating={product.rating} size={18} showValue />
            <span className="text-sm text-ink-500">{product.reviews} reviews</span>
            <span className="text-ink-300">•</span>
            <span className="text-sm text-ink-500">{product.sales} sold</span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-3xl font-bold text-ink-900">{formatCurrency(product.price, { decimals: true })}</span>
            {product.compareAt && <span className="text-lg text-ink-400 line-through">{formatCurrency(product.compareAt, { decimals: true })}</span>}
            {discount > 0 && <span className="rounded-md bg-brand-50 px-2 py-0.5 text-sm font-bold text-brand-700">Save {discount}%</span>}
          </div>

          <p className="mt-1 text-sm text-ink-500">Inclusive of all taxes</p>

          {/* Variants */}
          {product.variants && product.variants.map(v => (
            <div key={v.name} className="mt-5">
              <p className="text-sm font-semibold text-ink-900">{v.name}: <span className="font-normal text-ink-600">{selectedVariant[v.name] || 'Select'}</span></p>
              <div className="mt-2 flex flex-wrap gap-2">
                {v.options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setSelectedVariant(s => ({ ...s, [v.name]: opt }))}
                    className={`rounded-xl border-2 px-4 py-2 text-sm font-medium transition-all ${
                      selectedVariant[v.name] === opt ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-ink-200 text-ink-700 hover:border-ink-300'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Stock + Qty */}
          <div className="mt-5 flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm">
              {outOfStock ? (
                <span className="text-error-600 font-medium">Out of stock</span>
              ) : product.stock <= 10 ? (
                <span className="text-warning-600 font-medium">Only {product.stock} left!</span>
              ) : (
                <span className="flex items-center gap-1 text-success-600 font-medium"><Check className="h-4 w-4" /> In stock</span>
              )}
            </div>
          </div>

          {cartError && <p className="mt-4 rounded-xl bg-error-50 px-3 py-2 text-sm text-error-600">{cartError}</p>}

          <div className="mt-5 flex items-center gap-3">
            <div className="flex items-center rounded-xl border border-ink-200">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="flex h-11 w-11 items-center justify-center text-ink-600 hover:bg-ink-50 rounded-l-xl"><Minus className="h-4 w-4" /></button>
              <span className="w-12 text-center text-sm font-semibold text-ink-900">{qty}</span>
              <button onClick={() => setQty(q => q + 1)} className="flex h-11 w-11 items-center justify-center text-ink-600 hover:bg-ink-50 rounded-r-xl"><Plus className="h-4 w-4" /></button>
            </div>

            <button
              disabled={outOfStock || addingToCart}
              onClick={() => void handleAddToCart()}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-500 py-3.5 text-sm font-semibold text-white shadow-brand transition-all hover:bg-brand-600 active:scale-[0.98] disabled:opacity-50"
            >
              {added ? <><Check className="h-4 w-4" /> Added!</> : <><ShoppingCart className="h-4 w-4" /> Add to cart</>}
            </button>
            <button
              onClick={() => void handleToggleWishlist()}
              disabled={wishlistBusy}
              aria-label={isWishlisted(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
              className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 transition-colors disabled:opacity-50 ${
                isWishlisted(product.id) ? 'border-brand-300 bg-brand-50 text-brand-600' : 'border-ink-200 text-ink-600 hover:border-brand-300 hover:text-brand-600'
              }`}
            >
              <Heart className={`h-5 w-5 ${isWishlisted(product.id) ? 'fill-brand-500' : ''}`} />
            </button>
          </div>

          {/* Buy now */}
          <button
            onClick={() => void handleAddToCart().then(ok => { if (ok) navigate('/checkout'); })}
            disabled={outOfStock || addingToCart}
            className="mt-3 flex w-full items-center justify-center rounded-xl bg-ink-900 py-3.5 text-sm font-semibold text-white transition-all hover:bg-ink-800 active:scale-[0.98] disabled:opacity-50"
          >
            Buy now
          </button>

          {/* Seller card */}
          <Link to="/seller" className="mt-5 flex items-center gap-3 rounded-2xl border border-ink-100 bg-white p-4 transition-colors hover:border-ink-200">
            <Avatar className="h-11 w-11 rounded-xl" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink-900">{product.sellerName}</p>
              <p className="text-xs text-ink-500">★ 4.8 · 50K+ sales · Verified</p>
            </div>
            <Store className="h-5 w-5 text-ink-400" />
          </Link>

          {/* Trust */}
          <div className="mt-5 grid grid-cols-3 gap-3 rounded-2xl border border-ink-100 bg-white p-4">
            {[
              { icon: Truck, label: 'Free shipping', sub: 'Over $50' },
              { icon: ShieldCheck, label: 'Buyer protection', sub: 'Secure' },
              { icon: RotateCcw, label: '30-day returns', sub: 'Hassle-free' },
            ].map(t => (
              <div key={t.label} className="flex flex-col items-center text-center gap-1">
                <t.icon className="h-5 w-5 text-brand-600" />
                <p className="text-xs font-semibold text-ink-900">{t.label}</p>
                <p className="text-xs text-ink-400">{t.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-10 rounded-2xl border border-ink-100 bg-white">
        <div className="flex border-b border-ink-100">
          {([
            { key: 'description', label: 'Description' },
            { key: 'reviews', label: `Reviews (${reviews.length})` },
            { key: 'shipping', label: 'Shipping & Returns' },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`relative px-5 py-3.5 text-sm font-medium transition-colors ${tab === t.key ? 'text-brand-600' : 'text-ink-500 hover:text-ink-900'}`}
            >
              {t.label}
              {tab === t.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-brand-500" />}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'description' && (
            <div className="prose prose-sm max-w-none">
              <p className="text-ink-700 leading-relaxed">{product.description}</p>
              <h4 className="mt-4 font-semibold text-ink-900">Key features</h4>
              <ul className="mt-2 space-y-1.5 text-ink-600">
                {tags.map(t => <li key={t} className="flex items-center gap-2"><Check className="h-4 w-4 text-success-500" /> {t.charAt(0).toUpperCase() + t.slice(1)}</li>)}
              </ul>
            </div>
          )}

          {tab === 'reviews' && (
            <div>
              {/* Summary */}
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="text-center">
                  <p className="font-display text-4xl font-bold text-ink-900">{reviews.length > 0 ? product.rating.toFixed(1) : '—'}</p>
                  <Stars rating={product.rating} size={16} />
                  <p className="mt-1 text-xs text-ink-500">{reviews.length} review{reviews.length === 1 ? '' : 's'}</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map(r => {
                    const count = reviews.filter(review => review.rating === r).length;
                    const pct = reviews.length === 0 ? 0 : Math.round((count / reviews.length) * 100);
                    return (
                      <div key={r} className="flex items-center gap-2">
                        <span className="flex w-12 items-center gap-0.5 text-xs text-ink-500">{r} <Star className="h-3 w-3 fill-accent-400 text-accent-400" /></span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                          <div className="h-full rounded-full bg-accent-400" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-8 text-right text-xs text-ink-500">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
                <button onClick={() => setShowReviewForm(v => !v)} className="rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50">Write a review</button>
              </div>

              {showReviewForm && (
                <div className="mt-6 rounded-2xl border border-ink-100 bg-ink-50/50 p-5">
                  <h3 className="font-semibold text-ink-900">Write your review</h3>
                  {reviewError && <p className="mt-2 rounded-lg bg-error-50 px-3 py-2 text-sm text-error-600">{reviewError}</p>}
                  <div className="mt-3">
                    <label className="text-xs font-medium text-ink-600">Your rating</label>
                    <div className="mt-1 flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(r => (
                        <button key={r} type="button" onClick={() => setReviewRating(r)}>
                          <Star className={`h-6 w-6 ${r <= reviewRating ? 'fill-accent-400 text-accent-400' : 'text-ink-200'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="text-xs font-medium text-ink-600">Title</label>
                    <input value={reviewTitle} onChange={e => setReviewTitle(e.target.value)} placeholder="Summarize your experience" className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
                  </div>
                  <div className="mt-3">
                    <label className="text-xs font-medium text-ink-600">Review</label>
                    <textarea value={reviewBody} onChange={e => setReviewBody(e.target.value)} rows={3} placeholder="What did you like or dislike?" className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <button type="button" onClick={() => setShowReviewForm(false)} className="rounded-xl border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-white">Cancel</button>
                    <button type="button" onClick={() => void submitReview()} disabled={reviewSaving} className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50">{reviewSaving ? 'Submitting…' : 'Submit review'}</button>
                  </div>
                </div>
              )}

              {reviews.length === 0 && !showReviewForm && (
                <p className="mt-6 rounded-xl border border-dashed border-ink-200 py-8 text-center text-sm text-ink-400">No reviews yet. Be the first to review this product.</p>
              )}

              <div className="mt-6 space-y-4">
                {reviews.map(r => (
                  <div key={r.id} className="border-t border-ink-100 pt-4">
                    <div className="flex items-start gap-3">
                      <Avatar src={r.avatar} className="h-10 w-10 rounded-full" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-ink-900">{r.author}</p>
                          {r.verified && <StatusBadge status="verified" label="Verified" />}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2">
                          <Stars rating={r.rating} size={12} />
                          <span className="text-xs text-ink-400">{r.date ? formatDate(r.date) : ''}</span>
                        </div>
                        <p className="mt-2 text-sm font-medium text-ink-900">{r.title}</p>
                        <p className="mt-1 text-sm text-ink-600">{r.body}</p>
                        <div className="mt-2 flex items-center gap-3 text-xs text-ink-400">
                          <button className="flex items-center gap-1 hover:text-ink-700"><MessageSquare className="h-3.5 w-3.5" /> Helpful ({r.helpful})</button>
                          <button className="hover:text-ink-700">Reply</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'shipping' && (
            <div className="space-y-4 text-sm text-ink-600">
              <div className="flex gap-3"><Truck className="h-5 w-5 text-brand-600" /><div><p className="font-semibold text-ink-900">Free standard shipping</p><p>On all orders over $50. Delivery in 3-5 business days.</p></div></div>
              <div className="flex gap-3"><RotateCcw className="h-5 w-5 text-brand-600" /><div><p className="font-semibold text-ink-900">30-day returns</p><p>Return items in original condition within 30 days for a full refund.</p></div></div>
              <div className="flex gap-3"><ShieldCheck className="h-5 w-5 text-brand-600" /><div><p className="font-semibold text-ink-900">Buyer protection</p><p>Get a full refund if your item doesn't arrive or doesn't match the description.</p></div></div>
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold text-ink-900">Related products</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
