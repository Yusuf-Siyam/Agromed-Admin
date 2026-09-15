import { useMemo, useState } from 'react';
import { Calendar, Percent, RefreshCw, Settings } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import FinancialSummaryCard from '@/components/shared/FinancialSummaryCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { useApi } from '@/lib/useApi';
import {
  formatDate, formatMinor, getCommissionSettings,
  getCompanyPerformance, listOrders
} from '@/lib/superadmin-api';
import type { CommissionRule, CompanyPerformance } from '@/lib/superadmin-api';

export default function CommissionDashboard() {
  const [months, setMonths] = useState(12);

  const settings = useApi((token) => getCommissionSettings(token), []);
  const companies = useApi((token) => getCompanyPerformance(token, months, 50), [months]);
  const orders = useApi((token) => listOrders(token, { limit: 100 }), []);

  const earned = useMemo(() => {
    const rows = (orders.data?.items ?? []).filter((o) => !['cancelled', 'pending_payment'].includes(o.status));
    const gross = rows.reduce((t, o) => t + o.grandTotalMinor, 0);
    const commission = rows.reduce((t, o) => t + o.commissionMinor, 0);
    return {
      gross,
      commission,
      effective: gross === 0 ? null : (commission / gross) * 100,
      settled: rows.filter((o) => ['delivered', 'completed'].includes(o.status)).reduce((t, o) => t + o.commissionMinor, 0)
    };
  }, [orders.data]);

  const ruleColumns: Column<CommissionRule>[] = [
    {
      key: 'code',
      label: 'Rule',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.code}</span>
          <span className="text-xs text-muted-foreground">
            {row.isDefault ? 'Platform default' : `Specificity ${row.specificity} · priority ${row.priority}`}
          </span>
        </div>
      )
    },
    {
      key: 'scope',
      label: 'Applies to',
      render: (row) => {
        const parts = [
          row.categoryName && `category ${row.categoryName}`,
          row.sellerTier && `tier ${row.sellerTier}`,
          row.orderType && `${row.orderType} orders`,
          row.deliveryType && `${row.deliveryType} delivery`,
          row.priceBandMinMinor != null && `from ${formatMinor(row.priceBandMinMinor)}`,
          row.priceBandMaxMinor != null && `to ${formatMinor(row.priceBandMaxMinor)}`
        ].filter(Boolean) as string[];
        return parts.length === 0
          ? <span className="text-xs text-muted-foreground">Everything</span>
          : <span className="text-xs text-foreground">{parts.join(' · ')}</span>;
      }
    },
    {
      key: 'rate',
      label: 'Rate',
      align: 'right',
      render: (row) => (
        <span className="font-semibold text-foreground">
          {row.rateBasis === 'percentage' && row.ratePercent != null
            ? `${Number(row.ratePercent).toFixed(2)}%`
            : row.flatFeeMinor != null ? formatMinor(row.flatFeeMinor) : '—'}
        </span>
      )
    },
    {
      key: 'bounds',
      label: 'Floor / cap',
      align: 'right',
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {row.minFeeMinor == null ? '—' : formatMinor(row.minFeeMinor)} / {row.maxFeeMinor == null ? '—' : formatMinor(row.maxFeeMinor)}
        </span>
      )
    },
    {
      key: 'campaign',
      label: 'Window',
      render: (row) =>
        row.campaignFrom == null
          ? <span className="text-xs text-muted-foreground">Always</span>
          : <span className="text-xs text-foreground">{formatDate(row.campaignFrom)} – {row.campaignTo ? formatDate(row.campaignTo) : 'open'}</span>
    }
  ];

  const companyColumns: Column<CompanyPerformance>[] = [
    { key: 'legalName', label: 'Company', render: (row) => <span className="font-semibold text-foreground">{row.legalName}</span> },
    { key: 'orderCount', label: 'Orders', align: 'center' },
    { key: 'gmvMinor', label: 'Sales', align: 'right', render: (row) => formatMinor(row.gmvMinor) },
    {
      key: 'commissionMinor',
      label: 'Commission earned',
      align: 'right',
      render: (row) => <span className="font-semibold text-foreground">{formatMinor(row.commissionMinor)}</span>
    },
    {
      key: 'effective',
      label: 'Effective rate',
      align: 'right',
      render: (row) => (
        <span className="text-muted-foreground">
          {row.gmvMinor === 0 ? '—' : `${((row.commissionMinor / row.gmvMinor) * 100).toFixed(2)}%`}
        </span>
      )
    }
  ];

  const active = settings.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commission Management"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Commission' }]}
        action={
          <button
            onClick={() => { settings.reload(); companies.reload(); orders.reload(); }}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold hover:bg-muted"
          >
            <RefreshCw className="h-3.5 w-3.5" />Refresh
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <FinancialSummaryCard
          label="Default rate"
          amount={active ? `${Number(active.defaultRatePercent).toFixed(2)}%` : '—'}
          subtext={active ? `Rule set v${active.versionNumber}` : undefined}
          variant="info"
        />
        <FinancialSummaryCard
          label="Effective rate"
          amount={earned.effective == null ? '—' : `${earned.effective.toFixed(2)}%`}
          subtext="Across recent orders"
        />
        <FinancialSummaryCard label="Commission charged" amount={formatMinor(earned.commission)} variant="success" />
        <FinancialSummaryCard label="On delivered orders" amount={formatMinor(earned.settled)} />
      </div>

      {active && (
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border/80 bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm">
            <Settings className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">Version {active.versionNumber}</span>
            <StatusBadge status={active.status} />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Effective {formatDate(active.effectiveFrom)}
            {active.activatedAt ? ` · activated ${formatDate(active.activatedAt)}` : ''}
          </div>
          {active.note && <p className="text-sm text-muted-foreground">“{active.note}”</p>}
        </div>
      )}

      <div className="space-y-3">
        <h3 className="flex items-center gap-2 px-1 text-base font-bold text-foreground">
          <Percent className="h-4 w-4 text-primary" />Rules in the active set
        </h3>
        <DataTable
          columns={ruleColumns}
          data={active?.rules ?? []}
          isLoading={settings.loading}
          error={settings.error}
          onRetry={settings.reload}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-bold text-foreground">Commission by company</h3>
          <select
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground"
          >
            <option value={3}>Last 3 months</option>
            <option value={6}>Last 6 months</option>
            <option value={12}>Last 12 months</option>
          </select>
        </div>
        <DataTable
          columns={companyColumns}
          data={companies.data ?? []}
          isLoading={companies.loading}
          error={companies.error}
          onRetry={companies.reload}
        />
      </div>
    </div>
  );
}
