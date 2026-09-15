import { useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Award, BarChart3, ShoppingCart, TrendingUp } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import StatCard from '@/components/shared/StatCard';
import { useApi } from '@/lib/useApi';
import { formatMinor, getCompanyPerformance, getRevenueSeries } from '@/lib/superadmin-api';
import type { CompanyPerformance } from '@/lib/superadmin-api';
import { cn } from '@/lib/utils';

type ActiveSection = 'platform' | 'company';

const WINDOWS = [
  { label: '3 months', months: 3 },
  { label: '6 months', months: 6 },
  { label: '12 months', months: 12 }
] as const;

const MONTH = new Intl.DateTimeFormat('en-GB', { month: 'short', year: '2-digit' });

export default function SalesAnalytics() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('platform');
  const [months, setMonths] = useState<number>(12);

  const revenue = useApi((token) => getRevenueSeries(token, months), [months]);
  const companies = useApi((token) => getCompanyPerformance(token, months, 20), [months]);

  const series = useMemo(() => revenue.data ?? [], [revenue.data]);
  const currency = 'BDT';

  const totals = useMemo(() => ({
    gmv: series.reduce((t, p) => t + p.gmvMinor, 0),
    commission: series.reduce((t, p) => t + p.commissionMinor, 0),
    orders: series.reduce((t, p) => t + p.orderCount, 0),
    subsidy: series.reduce((t, p) => t + p.subsidyMinor, 0)
  }), [series]);

  const chart = useMemo(() => {
    const width = 600;
    const height = 220;
    const pad = 24;
    if (series.length === 0) return { width, height, points: '', peak: 0 };
    const peak = Math.max(...series.map((p) => p.gmvMinor)) * 1.15 || 1;
    const step = series.length === 1 ? 0 : (width - pad * 2) / (series.length - 1);
    const points = series
      .map((p, i) => `${pad + i * step},${height - pad - (p.gmvMinor / peak) * (height - pad * 2)}`)
      .join(' ');
    return { width, height, points, peak };
  }, [series]);

  const columns: Column<CompanyPerformance>[] = [
    {
      key: 'legalName',
      label: 'Company',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.legalName}</span>
          <span className="text-xs text-muted-foreground">
            {row.kind === 'manufacturer' ? 'Manufacturer' : 'Importer / supplier'}
            {row.sellerTier ? ` · ${row.sellerTier}` : ''}
          </span>
        </div>
      )
    },
    { key: 'orderCount', label: 'Orders', align: 'center' },
    {
      key: 'gmvMinor',
      label: 'Sales',
      align: 'right',
      render: (row) => <span className="font-semibold text-foreground">{formatMinor(row.gmvMinor, currency)}</span>
    },
    {
      key: 'commissionMinor',
      label: 'Commission',
      align: 'right',
      render: (row) => <span className="text-muted-foreground">{formatMinor(row.commissionMinor, currency)}</span>
    },
    {
      key: 'growth',
      label: 'Growth',
      align: 'right',
      render: (row) => {

        if (row.previousGmvMinor === 0) {
          return <span className="text-xs font-semibold text-success">{row.gmvMinor > 0 ? 'New' : '—'}</span>;
        }
        const pct = ((row.gmvMinor - row.previousGmvMinor) / row.previousGmvMinor) * 100;
        const up = pct >= 0;
        return (
          <span className={cn('inline-flex items-center gap-1 text-xs font-semibold', up ? 'text-success' : 'text-destructive')}>
            {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {Math.abs(pct).toFixed(1)}%
          </span>
        );
      }
    },
    {
      key: 'share',
      label: 'Share of platform',
      align: 'right',
      render: (row) => {
        const total = (companies.data ?? []).reduce((t, c) => t + c.gmvMinor, 0);
        return <span className="text-muted-foreground">{total === 0 ? '—' : `${((row.gmvMinor / total) * 100).toFixed(1)}%`}</span>;
      }
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Analytics"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Sales' }]}
        action={
          <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
            {WINDOWS.map((w) => (
              <button
                key={w.months}
                onClick={() => setMonths(w.months)}
                className={cn(
                  'cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                  months === w.months ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                )}
              >
                {w.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Gross merchandise value" value={formatMinor(totals.gmv, currency)} icon={TrendingUp} />
        <StatCard title="Platform commission" value={formatMinor(totals.commission, currency)} icon={Award} />
        <StatCard title="Orders" value={totals.orders.toLocaleString()} icon={ShoppingCart} />
        <StatCard title="Platform-funded discount" value={formatMinor(totals.subsidy, currency)} icon={BarChart3} />
      </div>

      <div className="flex rounded-t-xl border-b border-border/60 bg-card shadow-sm">
        {(['platform', 'company'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className={cn(
              'cursor-pointer border-b-2 px-5 py-3.5 text-xs font-bold transition-all',
              activeSection === s ? 'border-primary bg-muted/10 text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {s === 'platform' ? 'Platform trend' : 'By company'}
          </button>
        ))}
      </div>

      {activeSection === 'platform' ? (
        <div className="space-y-4 rounded-xl border border-border/80 bg-card p-5 shadow-sm">
          {revenue.loading ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Loading trend…</p>
          ) : revenue.error ? (
            <p className="py-12 text-center text-sm text-destructive">{revenue.error}</p>
          ) : series.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No trade in this window yet.</p>
          ) : (
            <>
              <svg viewBox={`0 0 ${chart.width} ${chart.height}`} className="h-56 w-full" role="img" aria-label="Monthly gross merchandise value">
                <polyline
                  points={chart.points}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-primary"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
              <div className="grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {series.map((p) => (
                  <div key={p.period} className="rounded-lg border border-border bg-background px-3 py-2">
                    <p className="font-semibold text-foreground">{MONTH.format(new Date(p.period))}</p>
                    <p className="text-muted-foreground">{formatMinor(p.gmvMinor, currency)} · {p.orderCount} orders</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={companies.data ?? []}
          isLoading={companies.loading}
          error={companies.error}
          onRetry={companies.reload}
        />
      )}
    </div>
  );
}
