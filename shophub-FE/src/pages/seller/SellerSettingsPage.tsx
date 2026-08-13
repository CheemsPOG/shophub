import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Store, Package, ShoppingBag, Wallet, BarChart3, Star, MapPin, Mail, Phone, Calendar, Edit2, Save } from 'lucide-react';
import { SELLER_PROFILE, SELLER_STATS } from '@/lib/data';
import { formatCurrency, formatDate } from '@/lib/format';
import { ProductImage } from '@/components/ProductImage';
import { Avatar } from '@/components/Avatar';

const TABS = [
  { to: '/seller/settings', label: 'Store profile', icon: Store, end: true },
  { to: '/seller/settings/billing', label: 'Billing', icon: Wallet },
  { to: '/seller/settings/security', label: 'Security', icon: Package },
];

export function SellerSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Settings</h1>
        <p className="text-sm text-ink-500">Manage your store and account preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <nav className="space-y-1 rounded-2xl border border-ink-100 bg-white p-2">
            {TABS.map(t => (
              <NavLink key={t.to} to={t.to} end={t.end} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-50'}`}>
                <t.icon className="h-4 w-4" /> {t.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div className="lg:col-span-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export function SellerStoreProfile() {
  const [editing, setEditing] = useState(false);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
        <div className="relative h-32 sm:h-40">
          <ProductImage src={SELLER_PROFILE.banner} className="h-full w-full" />
          <button className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-ink-700 backdrop-blur hover:bg-white">
            <Edit2 className="h-3.5 w-3.5" /> Change banner
          </button>
        </div>
        <div className="px-5 pb-5">
          <div className="flex flex-wrap items-end justify-between gap-4 -mt-8">
            <div className="flex items-end gap-4">
              <Avatar src={SELLER_PROFILE.logo} className="h-20 w-20 rounded-2xl border-4 border-white" />
              <div className="pb-1">
                <h2 className="font-display text-xl font-bold text-ink-900">{SELLER_PROFILE.businessName}</h2>
                <p className="text-sm text-ink-500">{SELLER_PROFILE.tagline}</p>
              </div>
            </div>
            <button onClick={() => setEditing(!editing)} className="flex items-center gap-2 rounded-xl border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50">
              {editing ? <><Save className="h-4 w-4" /> Save</> : <><Edit2 className="h-4 w-4" /> Edit profile</>}
            </button>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-ink-50 p-3 text-center">
              <p className="text-lg font-bold text-ink-900">{SELLER_PROFILE.totalSales.toLocaleString()}</p>
              <p className="text-xs text-ink-500">Total sales</p>
            </div>
            <div className="rounded-xl bg-ink-50 p-3 text-center">
              <p className="text-lg font-bold text-ink-900">{SELLER_PROFILE.rating} ★</p>
              <p className="text-xs text-ink-500">Rating</p>
            </div>
            <div className="rounded-xl bg-ink-50 p-3 text-center">
              <p className="text-lg font-bold text-ink-900">{SELLER_PROFILE.productCount}</p>
              <p className="text-xs text-ink-500">Products</p>
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="rounded-2xl border border-ink-100 bg-white p-5">
        <h3 className="font-semibold text-ink-900">Store details</h3>
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-ink-700">Store name</label>
            <input defaultValue={SELLER_PROFILE.businessName} disabled={!editing} className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 disabled:bg-ink-50 disabled:text-ink-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700">Tagline</label>
            <input defaultValue={SELLER_PROFILE.tagline} disabled={!editing} className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 disabled:bg-ink-50 disabled:text-ink-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700">Description</label>
            <textarea rows={3} defaultValue={SELLER_PROFILE.description} disabled={!editing} className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100 disabled:bg-ink-50 disabled:text-ink-500" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-ink-700">Email</label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input defaultValue={SELLER_PROFILE.email} disabled={!editing} className="w-full rounded-xl border border-ink-200 pl-10 pr-4 py-2.5 text-sm disabled:bg-ink-50 disabled:text-ink-500" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-ink-700">Phone</label>
              <div className="relative mt-1.5">
                <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input defaultValue={SELLER_PROFILE.phone} disabled={!editing} className="w-full rounded-xl border border-ink-200 pl-10 pr-4 py-2.5 text-sm disabled:bg-ink-50 disabled:text-ink-500" />
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700">Business address</label>
            <div className="relative mt-1.5">
              <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input defaultValue={SELLER_PROFILE.address} disabled={!editing} className="w-full rounded-xl border border-ink-200 pl-10 pr-4 py-2.5 text-sm disabled:bg-ink-50 disabled:text-ink-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
