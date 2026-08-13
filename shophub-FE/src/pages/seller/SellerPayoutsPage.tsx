import { useEffect, useState } from 'react';
import { Wallet, Clock, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency, formatDate } from '@/lib/format';
import { api, ApiError } from '@/lib/api';
import type { Payout } from '@/lib/data';

type PayoutsResponse = { available: number; pending: number; minPayout: number; payouts: Payout[] };

export function SellerPayoutsPage() {
  const [data, setData] = useState<PayoutsResponse>({ available: 0, pending: 0, minPayout: 0, payouts: [] });
  const [error, setError] = useState('');
  const load = () => api<PayoutsResponse>('/seller/payouts').then(setData).catch(() => undefined);
  useEffect(() => { void load(); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Payouts</h1>
        <p className="text-sm text-ink-500">Earnings from delivered orders</p>
      </div>
      {error && <p className="text-sm text-error-600">{error}</p>}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-white">
          <Wallet className="h-7 w-7" />
          <p className="mt-4 text-sm text-white/80">Available balance</p>
          <p className="mt-1 font-display text-3xl font-bold">{formatCurrency(Number(data.available), { decimals: true })}</p>
          <button
            type="button"
            onClick={async () => {
              setError('');
              try {
                await api('/seller/payouts/withdraw', { method: 'POST', body: JSON.stringify({ amount: data.available }) });
                await load();
              } catch (err) {
                setError(err instanceof ApiError ? err.message : 'Withdrawal failed');
              }
            }}
            className="mt-4 w-full rounded-xl bg-white py-2.5 text-sm font-semibold text-brand-700"
          >Withdraw funds</button>
        </div>
        <div className="rounded-2xl border border-ink-100 bg-white p-6">
          <Clock className="h-7 w-7 text-warning-500" />
          <p className="mt-4 text-sm text-ink-500">Pending</p>
          <p className="mt-1 font-display text-3xl font-bold">{formatCurrency(Number(data.pending), { decimals: true })}</p>
        </div>
        <div className="rounded-2xl border border-ink-100 bg-white p-6">
          <CheckCircle2 className="h-7 w-7 text-success-500" />
          <p className="mt-4 text-sm text-ink-500">Payouts</p>
          <p className="mt-1 font-display text-3xl font-bold">{data.payouts.length}</p>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
        {data.payouts.length === 0 ? (
          <EmptyState icon={<Wallet className="h-7 w-7" />} title="No payouts yet" description="Withdrawals will list here after you request them." />
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-ink-100 bg-ink-50/50 text-left text-xs uppercase text-ink-500"><tr><th className="px-5 py-3">Amount</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Date</th></tr></thead>
            <tbody>
              {data.payouts.map(p => (
                <tr key={p.id} className="border-t border-ink-50">
                  <td className="px-5 py-3 font-semibold">{formatCurrency(Number(p.amount), { decimals: true })}</td>
                  <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-5 py-3 text-ink-500">{p.date ? formatDate(p.date) : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
