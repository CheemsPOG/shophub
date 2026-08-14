import { FormEvent, useEffect, useState } from 'react';
import { Globe, Bell, Percent } from 'lucide-react';
import { api, ApiError } from '@/lib/api';

type Settings = {
  platform_name?: string;
  support_email?: string;
  currency?: string;
  timezone?: string;
  commission_default?: number;
  commission_pro?: number;
  min_payout?: number;
  notify_seller_applications?: boolean;
  notify_disputes?: boolean;
  notify_large_orders?: boolean;
  notify_daily_revenue?: boolean;
};

export function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api<Settings>('/admin/settings')
      .then(data => setSettings(data ?? {}))
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load settings'))
      .finally(() => setLoading(false));
  }, []);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(s => ({ ...s, [key]: value }));
    setSaved(false);
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const next = await api<Settings>('/admin/settings', { method: 'PUT', body: JSON.stringify(settings) });
      setSettings(next);
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save settings');
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({ settingKey, label, desc }: { settingKey: keyof Settings; label: string; desc: string }) => (
    <div className="flex items-center justify-between border-b border-ink-50 pb-3 last:border-0">
      <div>
        <p className="text-sm font-medium text-ink-900">{label}</p>
        <p className="text-xs text-ink-500">{desc}</p>
      </div>
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          checked={Boolean(settings[settingKey])}
          onChange={e => update(settingKey, e.target.checked)}
          className="peer sr-only"
        />
        <div className="h-6 w-11 rounded-full bg-ink-200 transition-colors peer-checked:bg-brand-500 peer-focus:ring-2 peer-focus:ring-brand-100" />
        <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </label>
    </div>
  );

  return (
    <form onSubmit={save} className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Settings</h1>
        <p className="text-sm text-ink-500">Platform configuration stored in the database</p>
      </div>

      {error && <p className="rounded-xl bg-error-50 px-3 py-2 text-sm text-error-600">{error}</p>}
      {saved && <p className="rounded-xl bg-success-50 px-3 py-2 text-sm text-success-700">Settings saved.</p>}
      {loading && <p className="text-sm text-ink-500">Loading settings…</p>}

      <div className="rounded-2xl border border-ink-100 bg-white p-6">
        <div className="flex items-center gap-2"><Globe className="h-5 w-5 text-brand-600" /><h2 className="font-semibold text-ink-900">General</h2></div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-ink-700">Platform name</label>
            <input value={settings.platform_name ?? ''} onChange={e => update('platform_name', e.target.value)} className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700">Support email</label>
            <input type="email" value={settings.support_email ?? ''} onChange={e => update('support_email', e.target.value)} className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700">Default currency</label>
            <select value={settings.currency ?? 'USD'} onChange={e => update('currency', e.target.value)} className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100">
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700">Timezone</label>
            <select value={settings.timezone ?? 'UTC-08:00 (Pacific)'} onChange={e => update('timezone', e.target.value)} className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100">
              <option>UTC-08:00 (Pacific)</option>
              <option>UTC-05:00 (Eastern)</option>
              <option>UTC+00:00 (GMT)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white p-6">
        <div className="flex items-center gap-2"><Percent className="h-5 w-5 text-brand-600" /><h2 className="font-semibold text-ink-900">Commission & fees</h2></div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-ink-700">Default commission (%)</label>
            <input type="number" value={settings.commission_default ?? 8} onChange={e => update('commission_default', Number(e.target.value))} className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700">Pro seller commission (%)</label>
            <input type="number" value={settings.commission_pro ?? 5} onChange={e => update('commission_pro', Number(e.target.value))} className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700">Minimum payout ($)</label>
            <input type="number" value={settings.min_payout ?? 50} onChange={e => update('min_payout', Number(e.target.value))} className="mt-1.5 w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white p-6">
        <div className="flex items-center gap-2"><Bell className="h-5 w-5 text-brand-600" /><h2 className="font-semibold text-ink-900">Admin notifications</h2></div>
        <div className="mt-4 space-y-3">
          <Toggle settingKey="notify_seller_applications" label="New seller applications" desc="Email when a seller applies" />
          <Toggle settingKey="notify_disputes" label="New disputes" desc="Alert when a dispute is opened" />
          <Toggle settingKey="notify_large_orders" label="Large orders" desc="Notify for orders over $500" />
          <Toggle settingKey="notify_daily_revenue" label="Daily revenue summary" desc="Daily email with revenue stats" />
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={saving || loading} className="rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white shadow-brand hover:bg-brand-600 disabled:opacity-50">{saving ? 'Saving…' : 'Save settings'}</button>
      </div>
    </form>
  );
}
