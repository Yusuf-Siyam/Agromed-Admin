import { useMemo, useState } from 'react';
import { Activity, Building2, TrendingDown, TrendingUp } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import FinancialSummaryCard from '@/components/shared/FinancialSummaryCard';
import { useApi } from '@/lib/useApi';
import { formatMinor, getCompanyPerformance } from '@/lib/superadmin-api';
import type { CompanyPerformance as CompanyPerformanceRow } from '@/lib/superadmin-api';
import { cn } from '@/lib/utils';

export default function CompanyPerformance() {
  const [search, setSearch] = useState('');
  const [months, setMonths] = useState(3);

  const performance = useApi((token) => getCompanyPerformance(token, months, 50), [months]);
  const all = useMemo(() => performance.data ?? [], [performance.data]);

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return needle ? all.filter((c) => c.legalName.toLowerCase().includes(needle)) : all;
  }, [all, search]);

  const totalGmv = useMemo(() => all.reduce((t, c) => t + c.gmvMinor, 0), [all]);
  const totalCommission = useMemo(() => all.reduce((t, c) => t + c.commissionMinor, 0), [all]);
  const growing = useMemo(() => all.filter((c) => c.previousGmvMinor > 0 && c.gmvMinor > c.previousGmvMinor).length, [all]);
  const shrinking = useMemo(() => all.filter((c) => c.previousGmvMinor > 0 && c.gmvMinor < c.previousGmvMinor).length, [all]);

  const columns: Column<CompanyPerformanceRow>[] = [
    {
      key: 'rank',
      label: '#',
      align: 'center',
      render: (_row, index) => <span className="font-bold text-muted-foreground">{index + 1}</span>
    },
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
    { key: 'gmvMinor', label: 'Total sales', align: 'right', render: (row) => <span className="font-semibold text-foreground">{formatMinor(row.gmvMinor)}</span> },
    {
      key: 'rate',
      label: 'Effective rate',
      align: 'right',
      render: (row) => (
        <span className="text-muted-foreground">
          {row.gmvMinor === 0 ? '—' : `${((row.commissionMinor / row.gmvMinor) * 100).toFixed(2)}%`}
        </span>
      )
    },
    { key: 'commissionMinor', label: 'Platform earnings', align: 'right', render: (row) => formatMinor(row.commissionMinor) },
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
            {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {Math.abs(pct).toFixed(1)}%
          </span>
        );
      }
    },
    {
      key: 'contribution',
      label: 'Contribution',
      align: 'right',
      render: (row) => <span className="text-muted-foreground">{totalGmv === 0 ? '—' : `${((row.gmvMinor / totalGmv) * 100).toFixed(1)}%`}</span>
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Performance"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Companies', href: '/companies' }, { label: 'Performance' }]}
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
        <FinancialSummaryCard label="Combined sales" amount={formatMinor(totalGmv)} variant="info" />
        <FinancialSummaryCard label="Platform earnings" amount={formatMinor(totalCommission)} variant="success" />
        <FinancialSummaryCard label="Growing" amount={String(growing)} />
        <FinancialSummaryCard label="Shrinking" amount={String(shrinking)} variant={shrinking > 0 ? 'warning' : 'default'} />
      </div>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={performance.loading}
        error={performance.error}
        onRetry={performance.reload}
        searchPlaceholder="Search company..."
        searchValue={search}
        onSearchChange={setSearch}
      />

      <p className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
        <Building2 className="h-3.5 w-3.5" />
        <Activity className="h-3.5 w-3.5" />
        Growth compares this window with the one immediately before it. A company with no sales in
        the earlier window shows as new rather than as an infinite percentage.
      </p>
    </div>
  );
}
