import { useMemo, useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import { useToast } from '@/components/shared/Toast';
import { useApi } from '@/lib/useApi';
import {
  formatDate, formatMinor, getCompanyPerformance, getRevenueSeries,
  listOrders, listPayouts, listSettlements
} from '@/lib/superadmin-api';
import { cn } from '@/lib/utils';

type Row = Record<string, string>;

const REPORTS = [
  {
    id: 'sales',
    name: 'Sales Report',
    description: 'Every order in the window with its value and the commission it earned.'
  },
  {
    id: 'company',
    name: 'Company Report',
    description: 'Seller performance: orders, sales, commission and share of the platform.'
  },
  {
    id: 'revenue',
    name: 'Revenue Report',
    description: 'Month by month gross merchandise value, commission and platform-funded discount.'
  },
  {
    id: 'settlement',
    name: 'Settlement Report',
    description: 'Settlement runs with their totals and the period each one covers.'
  },
  {
    id: 'payout',
    name: 'Payout Report',
    description: 'Every payout, its destination and where it got to.'
  }
] as const;

type ReportId = (typeof REPORTS)[number]['id'];

function toCsv(rows: Row[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return [headers.map(escape).join(','), ...rows.map((r) => headers.map((h) => escape(r[h] ?? '')).join(','))].join('\n');
}

export default function ReportsHub() {
  const { success, error: toastError } = useToast();
  const [selected, setSelected] = useState<ReportId>('sales');
  const [months, setMonths] = useState(12);

  const orders = useApi((token) => listOrders(token, { limit: 100 }), []);
  const companies = useApi((token) => getCompanyPerformance(token, months, 50), [months]);
  const revenue = useApi((token) => getRevenueSeries(token, months), [months]);
  const settlements = useApi((token) => listSettlements(token, { limit: 50 }), []);
  const payouts = useApi((token) => listPayouts(token, { limit: 100 }), []);

  const active = {
    sales: orders,
    company: companies,
    revenue,
    settlement: settlements,
    payout: payouts
  }[selected];

  const rows: Row[] = useMemo(() => {
    switch (selected) {
      case 'sales':
        return (orders.data?.items ?? []).map((o) => ({
          'Order': o.orderNumber,
          'Placed': formatDate(o.placedAt),
          'Company': o.sellerName,
          'Buyer': o.buyerName,
          'Order value': formatMinor(o.grandTotalMinor, o.currency),
          'Commission': formatMinor(o.commissionMinor, o.currency),
          'Status': o.status
        }));
      case 'company': {
        const total = (companies.data ?? []).reduce((t, c) => t + c.gmvMinor, 0);
        return (companies.data ?? []).map((c) => ({
          'Company': c.legalName,
          'Kind': c.kind,
          'Verification': c.verificationStatus,
          'Orders': String(c.orderCount),
          'Sales': formatMinor(c.gmvMinor),
          'Commission': formatMinor(c.commissionMinor),
          'Share': total === 0 ? '—' : `${((c.gmvMinor / total) * 100).toFixed(1)}%`
        }));
      }
      case 'revenue':
        return (revenue.data ?? []).map((p) => ({
          'Month': formatDate(p.period),
          'Orders': String(p.orderCount),
          'Gross merchandise value': formatMinor(p.gmvMinor),
          'Commission': formatMinor(p.commissionMinor),
          'Platform-funded discount': formatMinor(p.subsidyMinor),
          'Buyers': String(p.buyerCount),
          'Sellers': String(p.sellerCount)
        }));
      case 'settlement':
        return (settlements.data?.items ?? []).map((s) => ({
          'Run': s.runReference,
          'Period': `${formatDate(s.periodStart)} – ${formatDate(s.periodEnd)}`,
          'Status': s.status,
          'Gross': formatMinor(s.totalGrossMinor, s.currency),
          'Commission': formatMinor(s.totalCommissionMinor, s.currency),
          'Payable': formatMinor(s.totalPayableMinor, s.currency),
          'Executed': formatDate(s.executedAt)
        }));
      case 'payout':
        return (payouts.data?.items ?? []).map((p) => ({
          'Company': p.organisationName,
          'Run': p.runReference ?? '—',
          'Amount': formatMinor(p.amountMinor, p.currency),
          'Method': p.method,
          'Destination': p.destinationName ?? '—',
          'Reference': p.providerReference ?? '—',
          'Status': p.status,
          'Paid': formatDate(p.paidAt)
        }));
    }
  }, [selected, orders.data, companies.data, revenue.data, settlements.data, payouts.data]);

  const columns: Column<Row>[] = useMemo(
    () => (rows[0] ? Object.keys(rows[0]).map((key) => ({ key, label: key })) : []),
    [rows]
  );

  function exportCsv() {
    if (rows.length === 0) {
      toastError('There is nothing to export yet.');
      return;
    }
    const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agromed-${selected}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    success(`${REPORTS.find((r) => r.id === selected)?.name} exported.`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports Hub"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Reports Hub' }]}
        action={
          <button
            onClick={exportCsv}
            disabled={active.loading || rows.length === 0}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/95 disabled:opacity-60"
          >
            {active.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export CSV
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="space-y-3 lg:col-span-1">
          <h3 className="px-1 text-xs font-bold uppercase tracking-wider text-foreground">Reports</h3>
          <div className="space-y-2.5">
            {REPORTS.map((rep) => (
              <button
                key={rep.id}
                onClick={() => setSelected(rep.id)}
                className={cn(
                  'w-full cursor-pointer rounded-xl border p-4 text-left transition-all',
                  selected === rep.id
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30'
                )}
              >
                <span className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <FileText className="h-4 w-4 text-primary" />
                  {rep.name}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{rep.description}</span>
              </button>
            ))}
          </div>

          <div className="space-y-1 rounded-xl border border-border bg-card p-4">
            <label className="text-[11px] font-bold text-foreground/80" htmlFor="report-window">Window</label>
            <select
              id="report-window"
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground"
            >
              <option value={3}>Last 3 months</option>
              <option value={6}>Last 6 months</option>
              <option value={12}>Last 12 months</option>
            </select>
            <p className="pt-1 text-[11px] text-muted-foreground">
              Applies to the company and revenue reports; the others show the most recent records.
            </p>
          </div>
        </div>

        <div className="lg:col-span-3">
          <DataTable
            columns={columns}
            data={rows}
            isLoading={active.loading}
            error={active.error}
            onRetry={active.reload}
          />
        </div>
      </div>
    </div>
  );
}
