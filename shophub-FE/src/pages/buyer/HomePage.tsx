import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  ArrowRight, Truck, ShieldCheck, RotateCcw, Headphones, Sparkles, TrendingUp,
} from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { ProductImage } from '@/components/ProductImage';
import type { Product, Category } from '@/lib/data';
import { formatNumber } from '@/lib/format';
import * as Icons from 'lucide-react';
import { api } from '@/lib/api';

type HomeStats = { buyers: number; sellers: number; products: number };

export function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [trending, setTrending] = useState<Product[]>([]);
  const [deals, setDeals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<HomeStats>({ buyers: 0, sellers: 0, products: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api<{ featured: Product[]; trending: Product[]; deals: Product[]; categories: Category[]; stats: HomeStats }>('/catalog/home')
      .then(data => {
        setFeatured(data.featured?.slice(0, 8) ?? []);
        setTrending(data.trending?.slice(0, 4) ?? []);
        setDeals(data.deals?.slice(0, 4) ?? []);
        setCategories((data.categories ?? []).map(c => ({ ...c, subcategories: c.subcategories ?? [] })));
        setStats(data.stats ?? { buyers: 0, sellers: 0, products: 0 });
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load the storefront'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {error && (
        <div className="bg-error-50 px-4 py-2 text-center text-sm text-error-600">{error} — showing what's currently available.</div>
      )}
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ink-900 via-ink-800 to-brand-900">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="absolute right-10 top-40 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24 lg:px-8">
          <div className="animate-slide-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-accent-400" />
              {stats.products} product{stats.products === 1 ? '' : 's'} from {stats.sellers} seller{stats.sellers === 1 ? '' : 's'}
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              Discover products you'll love, from sellers you can trust.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-white/70">
              Shop unique items from independent sellers across the globe. Enjoy secure payments, fast shipping, and buyer protection on every order.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="group flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3.5 text-sm font-semibold text-white shadow-brand transition-all hover:bg-brand-600 active:scale-95">
                Start shopping
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link to="/register" className="rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition-all hover:bg-white/20">
                Become a seller
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-6">
              {[
                { label: 'Buyers', value: stats.buyers },
                { label: 'Active sellers', value: stats.sellers },
                { label: 'Products', value: stats.products },
              ].map(s => (
                <div key={s.label}>
                  <p className="font-display text-2xl font-bold text-white">{formatNumber(s.value)}</p>
                  <p className="text-xs text-white/60">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:block">
            {featured.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {featured.slice(0, 4).map((p, i) => (
                  <Link
                    key={p.id}
                    to={`/product/${p.id}`}
                    className={`group overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur transition-all hover:scale-[1.02] ${i % 2 === 1 ? 'mt-8' : ''}`}
                  >
                    <ProductImage src={p.images?.[0]} alt={p.title} className="aspect-square w-full" />
                    <div className="p-3">
                      <p className="truncate text-xs font-medium text-white">{p.title}</p>
                      <p className="text-sm font-bold text-brand-400">${p.price}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-b border-ink-100 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            { icon: Truck, title: 'Free shipping', desc: 'On orders over $50' },
            { icon: ShieldCheck, title: 'Secure payments', desc: 'Buyer protection' },
            { icon: RotateCcw, title: 'Easy returns', desc: '30-day return policy' },
            { icon: Headphones, title: '24/7 support', desc: 'Always here to help' },
          ].map(f => (
            <div key={f.title} className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <f.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-900">{f.title}</p>
                <p className="text-xs text-ink-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {(loading || categories.length > 0) && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-ink-900">Shop by category</h2>
              <p className="mt-1 text-sm text-ink-500">Find exactly what you're looking for</p>
            </div>
            <Link to="/shop" className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
            {categories.map(cat => {
              const Icon = (Icons as any)[cat.icon] || Icons.Package;
              return (
                <Link
                  key={cat.id}
                  to={`/shop?category=${cat.slug}`}
                  className="group flex flex-col items-center gap-3 rounded-2xl border border-ink-100 bg-white p-5 text-center shadow-card transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-soft"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink-50 text-ink-600 transition-colors group-hover:bg-brand-50 group-hover:text-brand-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{cat.name}</p>
                    <p className="text-xs text-ink-400">{cat.productCount.toLocaleString()} items</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Deals banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 to-brand-800 p-8 lg:p-12">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                <TrendingUp className="h-3.5 w-3.5" /> Limited time
              </span>
              <h2 className="mt-3 font-display text-3xl font-extrabold text-white">End of Summer Sale</h2>
              <p className="mt-2 text-white/80">Up to 40% off on selected items. Hurry, ends soon!</p>
            </div>
            <Link to="/shop?deals=true" className="flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-brand-700 transition-transform hover:scale-105">
              Shop deals <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured products */}
      {(loading || featured.length > 0) && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-ink-900">Featured products</h2>
              <p className="mt-1 text-sm text-ink-500">Handpicked just for you</p>
            </div>
            <Link to="/shop" className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Trending */}
      {(loading || trending.length > 0) && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-ink-900">Trending now</h2>
          <p className="mt-1 text-sm text-ink-500">What everyone's buying this week</p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-4">
            {trending.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Deals */}
      {(loading || deals.length > 0) && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-ink-900">Today's deals</h2>
          <p className="mt-1 text-sm text-ink-500">Save big while stocks last</p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {deals.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="overflow-hidden rounded-3xl border border-ink-100 bg-white p-8 shadow-card">
            <StoreIcon />
            <h3 className="mt-4 font-display text-xl font-bold text-ink-900">Start your store</h3>
            <p className="mt-1 text-sm text-ink-500">Reach millions of buyers. No listing fees, only pay when you sell.</p>
            <Link to="/register" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-ink-900 px-5 py-3 text-sm font-semibold text-white hover:bg-ink-800">
              Become a seller <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="overflow-hidden rounded-3xl border border-ink-100 bg-white p-8 shadow-card">
            <NewsletterIcon />
            <h3 className="mt-4 font-display text-xl font-bold text-ink-900">Join our newsletter</h3>
            <p className="mt-1 text-sm text-ink-500">Get exclusive deals and early access to new arrivals.</p>
            <div className="mt-4 flex gap-2">
              <input type="email" placeholder="Your email" className="flex-1 rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
              <button className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600">Subscribe</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StoreIcon() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
      <TrendingUp className="h-6 w-6" />
    </div>
  );
}
function NewsletterIcon() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
      <Sparkles className="h-6 w-6" />
    </div>
  );
}
