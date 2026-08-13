import { Shield, Globe, Mail, CreditCard, Bell, Lock, Server, Percent } from 'lucide-react';

export function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Settings</h1>
        <p className="text-sm text-ink-500">Platform configuration</p>
      </div>

      {/* General */}
      <div className="rounded-2xl border border-ink-100 bg-white p-6">
        <div className="flex items-center gap-2"><Globe className="h-5 w-5 text-brand-600" /><h2 className="font-semibold text-ink-900">General</h2></div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-ink-700">Platform name</label>
            <input defaultValue="ShopHub" className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700">Support email</label>
            <input defaultValue="support@shophub.com" className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700">Default currency</label>
            <select className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100">
              <option>USD ($)</option><option>EUR (€)</option><option>GBP (£)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700">Timezone</label>
            <select className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100">
              <option>UTC-08:00 (Pacific)</option><option>UTC-05:00 (Eastern)</option><option>UTC+00:00 (GMT)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Commission */}
      <div className="rounded-2xl border border-ink-100 bg-white p-6">
        <div className="flex items-center gap-2"><Percent className="h-5 w-5 text-brand-600" /><h2 className="font-semibold text-ink-900">Commission & fees</h2></div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-ink-700">Default commission (%)</label>
            <input type="number" defaultValue="8" className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700">Pro seller commission (%)</label>
            <input type="number" defaultValue="5" className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700">Minimum payout ($)</label>
            <input type="number" defaultValue="50" className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl border border-ink-100 bg-white p-6">
        <div className="flex items-center gap-2"><Bell className="h-5 w-5 text-brand-600" /><h2 className="font-semibold text-ink-900">Admin notifications</h2></div>
        <div className="mt-4 space-y-3">
          {[
            { label: 'New seller applications', desc: 'Email when a seller applies', on: true },
            { label: 'New disputes', desc: 'Alert when a dispute is opened', on: true },
            { label: 'Large orders', desc: 'Notify for orders over $500', on: false },
            { label: 'Daily revenue summary', desc: 'Daily email with revenue stats', on: true },
          ].map(n => (
            <div key={n.label} className="flex items-center justify-between border-b border-ink-50 pb-3 last:border-0">
              <div>
                <p className="text-sm font-medium text-ink-900">{n.label}</p>
                <p className="text-xs text-ink-500">{n.desc}</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" defaultChecked={n.on} className="peer sr-only" />
                <div className="h-6 w-11 rounded-full bg-ink-200 transition-colors peer-checked:bg-brand-500 peer-focus:ring-2 peer-focus:ring-brand-100" />
                <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="rounded-2xl border border-ink-100 bg-white p-6">
        <div className="flex items-center gap-2"><Lock className="h-5 w-5 text-brand-600" /><h2 className="font-semibold text-ink-900">Security</h2></div>
        <div className="mt-4 space-y-3">
          <button className="flex w-full items-center justify-between rounded-xl border border-ink-200 px-4 py-3 text-sm font-medium text-ink-700 hover:bg-ink-50">
            <span className="flex items-center gap-2"><Shield className="h-4 w-4 text-ink-400" /> Require 2FA for all admins</span>
            <span className="rounded-md bg-success-50 px-2 py-0.5 text-xs font-medium text-success-700">Enabled</span>
          </button>
          <button className="flex w-full items-center justify-between rounded-xl border border-ink-200 px-4 py-3 text-sm font-medium text-ink-700 hover:bg-ink-50">
            <span className="flex items-center gap-2"><Server className="h-4 w-4 text-ink-400" /> API access & webhooks</span>
            <span className="text-xs text-ink-400">Configure →</span>
          </button>
          <button className="flex w-full items-center justify-between rounded-xl border border-error-200 px-4 py-3 text-sm font-medium text-error-600 hover:bg-error-50">
            <span className="flex items-center gap-2"><Lock className="h-4 w-4" /> Audit log</span>
            <span className="text-xs">View →</span>
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white shadow-brand hover:bg-brand-600">Save settings</button>
      </div>
    </div>
  );
}
