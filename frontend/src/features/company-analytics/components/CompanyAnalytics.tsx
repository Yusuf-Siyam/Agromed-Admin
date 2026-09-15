import { useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Award, Building2, TrendingUp } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { DistributionChart } from '@/components/shared/AnalyticsCharts';
import { useApi } from '@/lib/useApi';
import { formatMinor, getCompanyPerformance, listOrganisations } from '@/lib/superadmin-api';
import type { CompanyPerformance } from '@/lib/superadmin-api';
import { cn } from '@/lib/utils';

export default function CompanyAnalytics() {
  const [months, setMonths] = useState(3);
  const [selected, setSelected] = useState<string | null>(null);

  const performance = useApi((token) => getCompanyPerformance(token, months, 50), [months]);
  const organisations = useApi((token) => listOrganisations(token, { kind: 'seller', limit: 100 }), []);

  const rows = useMemo(() => performance.data ?? [], [performance.data]);
  const totalGmv = useMemo(() => rows.reduce((t, c) => t + c.gmvMinor, 0), [rows]);

  const leader = rows[0];
  const growing = useMemo(
    () => rows.filter((c) => c.previousGmvMinor > 0 && c.gmvMinor > c.previousGmvMinor).length,
    [rows]
  );
  const detail = organisations.data?.items.find((o) => o.id === selected);

  const columns: Column<CompanyPerformance>[] = [
    {
      key: 'legalName',
      label: 'Company',
      render: (row) => (
        <button
          onClick={() => setSelected(row.organisationId)}
          className={cn('cursor-pointer text-left', row.organisationId === selected ? 'text-primary' : 'text-foreground hover:text-primary')}
        >
          <span className="block font-semibold">{row.legalName}</span>
          <span className="block text-xs text-muted-foreground">
            {row.kind === 'manufacturer' ? 'Manufacturer' : 'Importer / supplier'}
            {row.sellerTier ? ` · ${row.sellerTier}` : ''}
          </span>
        </button>
      )
    },
    { key: 'verificationStatus', label: 'Verification', render: (row) => <StatusBadge status={row.verificationStatus} /> },
    { key: 'orderCount', label: 'Orders', align: 'center' },
    { key: 'gmvMinor', label: 'Sales', align: 'right', render: (row) => <span className="font-semibold text-foreground">{formatMinor(row.gmvMinor)}</span> },
    { key: 'commissionMinor', label: 'Commission', align: 'right', render: (row) => formatMinor(row.commissionMinor) },
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
      label: 'Share',
      align: 'right',
      render: (row) => <span className="text-muted-foreground">{totalGmv === 0 ? '—' : `${((row.gmvMinor / totalGmv) * 100).toFixed(1)}%`}</span>
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Analytics"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Company Analytics' }]}
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
        <StatCard title="Companies trading" value={rows.filter((c) => c.orderCount > 0).length} icon={Building2} />
        <StatCard title="Combined sales" value={formatMinor(totalGmv)} icon={TrendingUp} />
        <StatCard title="Top seller" value={leader?.legalName ?? '—'} icon={Award} />
        <StatCard title="Growing" value={growing} icon={ArrowUpRight} />
      </div>

      <section className="space-y-4 rounded-xl border border-border/80 bg-card p-5 shadow-sm" aria-labelledby="company-concentration">
        <div>
          <h3 id="company-concentration" className="text-sm font-bold text-foreground">Sales concentration</h3>
          <p className="text-xs text-muted-foreground">The five companies contributing the most gross merchandise value in this period.</p>
        </div>
        {performance.loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading company performance…</p>
        ) : performance.error ? (
          <p className="py-8 text-center text-sm text-destructive">{performance.error}</p>
        ) : (
          <DistributionChart
            ariaLabel="Top companies by gross merchandise value"
            emptyLabel="No company sales in this period yet."
            items={rows.slice(0, 5).map((company) => ({
              label: company.legalName,
              value: company.gmvMinor,
              detail: `${formatMinor(company.gmvMinor)} · ${totalGmv === 0 ? '0' : ((company.gmvMinor / totalGmv) * 100).toFixed(1)}%`
            }))}
          />
        )}
      </section>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={performance.loading}
        error={performance.error}
        onRetry={performance.reload}
      />

      {detail && (
        <div className="space-y-3 rounded-xl border border-border/80 bg-card p-5 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">{detail.legalName}</h3>
          <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div><dt className="text-muted-foreground">Listings</dt><dd className="font-semibold text-foreground">{detail.listingCount}</dd></div>
            <div><dt className="text-muted-foreground">Team</dt><dd className="font-semibold text-foreground">{detail.memberCount}</dd></div>
            <div><dt className="text-muted-foreground">Reviews</dt><dd className="font-semibold text-foreground">{detail.reviewCount}</dd></div>
            <div>
              <dt className="text-muted-foreground">Rating</dt>
              <dd className="font-semibold text-foreground">{detail.averageRating == null ? '—' : `★ ${Number(detail.averageRating).toFixed(1)}`}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
