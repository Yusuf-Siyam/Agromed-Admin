import { useMemo, useState } from 'react';
import { Banknote, Percent, TrendingUp, Users } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import FinancialSummaryCard from '@/components/shared/FinancialSummaryCard';
import { TrendChart } from '@/components/shared/AnalyticsCharts';
import { useApi } from '@/lib/useApi';
import { formatDate, formatMinor, getRevenueSeries, listSettlements } from '@/lib/superadmin-api';
import type { RevenuePoint } from '@/lib/superadmin-api';

export default function RevenueDashboard() {
  const [months, setMonths] = useState(12);

  const revenue = useApi((token) => getRevenueSeries(token, months), [months]);
  const settlements = useApi((token) => listSettlements(token, { limit: 20 }), []);

  const series = useMemo(() => revenue.data ?? [], [revenue.data]);

  const totals = useMemo(() => ({
    gmv: series.reduce((t, p) => t + p.gmvMinor, 0),
    commission: series.reduce((t, p) => t + p.commissionMinor, 0),
    subsidy: series.reduce((t, p) => t + p.subsidyMinor, 0),
    orders: series.reduce((t, p) => t + p.orderCount, 0)
  }), [series]);

  const net = totals.commission - totals.subsidy;
  const take = totals.gmv === 0 ? null : (totals.commission / totals.gmv) * 100;
  const commissionTrend = useMemo(() => series.map((point) => ({
    label: formatDate(point.period).slice(0, 6),
    value: point.commissionMinor,
    detail: formatMinor(point.commissionMinor)
  })), [series]);

  const columns: Column<RevenuePoint>[] = [
    { key: 'period', label: 'Month', render: (row) => formatDate(row.period) },
    { key: 'orderCount', label: 'Orders', align: 'center' },
    { key: 'gmvMinor', label: 'Gross merchandise value', align: 'right', render: (row) => formatMinor(row.gmvMinor) },
    {
      key: 'commissionMinor',
      label: 'Commission',
      align: 'right',
      render: (row) => <span className="font-semibold text-foreground">{formatMinor(row.commissionMinor)}</span>
    },
    {
      key: 'subsidyMinor',
      label: 'Platform-funded discount',
      align: 'right',
      render: (row) => <span className="text-destructive">−{formatMinor(row.subsidyMinor)}</span>
    },
    {
      key: 'net',
      label: 'Net to platform',
      align: 'right',
      render: (row) => (
        <span className="font-semibold text-foreground">{formatMinor(row.commissionMinor - row.subsidyMinor)}</span>
      )
    },
    {
      key: 'participants',
      label: 'Active parties',
      align: 'center',
      render: (row) => <span className="text-xs text-muted-foreground">{row.buyerCount} buyers · {row.sellerCount} sellers</span>
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Revenue"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Revenue' }]}
        action={
          <select
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-foreground"
          >
            <option value={3}>Last 3 months</option>
            <option value={6}>Last 6 months</option>
            <option value={12}>Last 12 months</option>
            <option value={24}>Last 24 months</option>
          </select>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <FinancialSummaryCard label="Commission earned" amount={formatMinor(totals.commission)} variant="success" subtext="The platform's own revenue" />
        <FinancialSummaryCard label="Discount funded" amount={formatMinor(totals.subsidy)} variant="danger" subtext="Paid out of platform revenue" />
        <FinancialSummaryCard label="Net" amount={formatMinor(net)} variant={net >= 0 ? 'info' : 'danger'} />
        <FinancialSummaryCard label="Take rate" amount={take == null ? '—' : `${take.toFixed(2)}%`} subtext={`On ${formatMinor(totals.gmv)} of trade`} />
      </div>

      <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5 shadow-sm">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
          <TrendingUp className="h-4 w-4 text-primary" />Commission by month
        </h3>
        {revenue.loading ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>
        ) : series.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No trade in this window yet.</p>
        ) : (
          <TrendChart
            points={commissionTrend}
            valueLabel="Commission"
            valueFormatter={(value) => formatMinor(value)}
            ariaLabel="Monthly platform commission revenue"
          />
        )}
      </div>

      <div className="space-y-3">
        <h3 className="px-1 text-base font-bold text-foreground">Month by month</h3>
        <DataTable
          columns={columns}
          data={series}
          isLoading={revenue.loading}
          error={revenue.error}
          onRetry={revenue.reload}
        />
      </div>

      <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5 shadow-sm">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
          <Banknote className="h-4 w-4 text-primary" />Settled through
        </h3>
        {settlements.loading ? (
          <p className="text-sm text-muted-foreground">Loading settlement runs…</p>
        ) : (settlements.data?.items.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">No settlement run has been executed yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {(settlements.data?.items ?? []).slice(0, 5).map((r) => (
              <li key={r.id} className="flex items-center justify-between">
                <span className="text-foreground">{r.runReference}</span>
                <span className="text-muted-foreground">
                  {formatMinor(r.totalCommissionMinor, r.currency)} commission · {r.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Users className="h-3.5 w-3.5" />
        <Percent className="h-3.5 w-3.5" />
        Gross merchandise value is what buyers paid sellers. Only the commission column is the
        platform&rsquo;s own income.
      </p>
    </div>
  );
}
