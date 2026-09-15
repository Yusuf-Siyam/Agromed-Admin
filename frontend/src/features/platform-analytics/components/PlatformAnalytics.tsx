import { useMemo, useState } from 'react';
import { Activity, Building2, ShoppingCart, Users } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import { DistributionChart, TrendChart } from '@/components/shared/AnalyticsCharts';
import { useApi } from '@/lib/useApi';
import {
  formatDate, formatMinor, getRevenueSeries, getSuperAdminDashboard,
  listOrders, listOrganisations
} from '@/lib/superadmin-api';
import type { RevenuePoint } from '@/lib/superadmin-api';

export default function PlatformAnalytics() {
  const [months, setMonths] = useState(12);

  const dashboard = useApi((token) => getSuperAdminDashboard(token), []);
  const revenue = useApi((token) => getRevenueSeries(token, months), [months]);
  const orders = useApi((token) => listOrders(token, { limit: 100 }), []);
  const sellers = useApi((token) => listOrganisations(token, { kind: 'seller', limit: 100 }), []);

  const series = useMemo(() => revenue.data ?? [], [revenue.data]);
  const tradeTrend = useMemo(() => series.map((point) => ({
    label: formatDate(point.period).slice(0, 6),
    value: point.gmvMinor,
    detail: formatMinor(point.gmvMinor)
  })), [series]);

  const mix = useMemo(() => {
    const rows = orders.data?.items ?? [];
    const counts = new Map<string, number>();
    for (const o of rows) counts.set(o.status, (counts.get(o.status) ?? 0) + 1);
    const total = rows.length || 1;
    return [...counts.entries()]
      .map(([status, count]) => ({ status, count, share: (count / total) * 100 }))
      .sort((a, b) => b.count - a.count);
  }, [orders.data]);

  const verification = useMemo(() => {
    const rows = sellers.data?.items ?? [];
    const counts = new Map<string, number>();
    for (const o of rows) counts.set(o.verificationStatus, (counts.get(o.verificationStatus) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [sellers.data]);

  const columns: Column<RevenuePoint>[] = [
    { key: 'period', label: 'Month', render: (row) => formatDate(row.period) },
    { key: 'orderCount', label: 'Orders', align: 'center' },
    { key: 'buyerCount', label: 'Active buyers', align: 'center' },
    { key: 'sellerCount', label: 'Active sellers', align: 'center' },
    { key: 'gmvMinor', label: 'Trade', align: 'right', render: (row) => formatMinor(row.gmvMinor) },
    {
      key: 'average',
      label: 'Average order',
      align: 'right',
      render: (row) => formatMinor(row.orderCount === 0 ? 0 : Math.round(row.gmvMinor / row.orderCount))
    }
  ];

  const m = dashboard.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Analytics"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Platform Analytics' }]}
        action={
          <select
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground"
          >
            <option value={3}>Last 3 months</option>
            <option value={6}>Last 6 months</option>
            <option value={12}>Last 12 months</option>
          </select>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Active users" value={m?.activeUsers ?? '—'} icon={Users} />
        <StatCard title="Verified companies" value={m?.verifiedCompanies ?? '—'} icon={Building2} />
        <StatCard title="Active listings" value={m?.activeListings ?? '—'} icon={Activity} />
        <StatCard title="Orders" value={m?.orderCount ?? '—'} icon={ShoppingCart} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Order status mix</h3>
          {orders.loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <DistributionChart
              ariaLabel="Order status distribution"
              emptyLabel="No orders yet."
              items={mix.map((row) => ({
                label: row.status.replace(/_/g, ' '),
                value: row.count,
                detail: `${row.count} · ${row.share.toFixed(0)}%`,
                tone: row.status === 'cancelled' ? 'danger' : undefined
              }))}
            />
          )}
        </div>

        <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Seller verification</h3>
          {sellers.loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <DistributionChart
              ariaLabel="Seller verification distribution"
              items={verification.map(([status, count]) => ({
                label: status,
                value: count,
                tone: status === 'rejected' || status === 'expired' ? 'danger' : status === 'pending' ? 'secondary' : undefined
              }))}
            />
          )}
          <div className="space-y-2 border-t border-border pt-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Pending verifications</span><span className="font-semibold text-foreground">{m?.pendingVerifications ?? '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Open disputes</span><span className="font-semibold text-foreground">{m?.openDisputes ?? '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Open returns</span><span className="font-semibold text-foreground">{m?.openReturns ?? '—'}</span></div>
          </div>
        </div>
      </div>

      <section className="space-y-4 rounded-xl border border-border/80 bg-card p-5 shadow-sm" aria-labelledby="trade-by-month">
        <div>
          <h3 id="trade-by-month" className="text-base font-bold text-foreground">Trade by month</h3>
          <p className="text-xs text-muted-foreground">The direction of platform sales before the detailed monthly figures.</p>
        </div>
        {revenue.loading ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Loading trade trend…</p>
        ) : revenue.error ? (
          <p className="py-10 text-center text-sm text-destructive">{revenue.error}</p>
        ) : (
          <TrendChart
            points={tradeTrend}
            valueLabel="GMV"
            valueFormatter={(value) => formatMinor(value)}
            ariaLabel="Monthly platform gross merchandise value"
          />
        )}
      </section>

      <div className="space-y-3">
        <h3 className="px-1 text-base font-bold text-foreground">Monthly figures</h3>
        <DataTable
          columns={columns}
          data={series}
          isLoading={revenue.loading}
          error={revenue.error}
          onRetry={revenue.reload}
        />
      </div>
    </div>
  );
}
